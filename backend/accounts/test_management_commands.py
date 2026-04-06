"""管理コマンド create_superuser_from_env / setup_oauth_from_env のカバレッジ用テスト"""

import os
from io import StringIO
from unittest.mock import patch

from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from django.core.management import call_command
from django.test import TestCase, override_settings

User = get_user_model()


class CreateSuperuserFromEnvCommandTest(TestCase):
    def test_skips_when_env_missing(self):
        out = StringIO()
        with patch.dict(
            os.environ,
            {
                "DJANGO_SUPERUSER_EMAIL": "",
                "DJANGO_SUPERUSER_PASSWORD": "",
            },
        ):
            call_command("create_superuser_from_env", stdout=out)
        self.assertIn("Skipping", out.getvalue())

    @patch.dict(os.environ, {"DJANGO_SUPERUSER_EMAIL": "admin@example.com", "DJANGO_SUPERUSER_PASSWORD": "secret123"})
    def test_creates_superuser(self):
        out = StringIO()
        call_command("create_superuser_from_env", stdout=out)
        self.assertTrue(User.objects.filter(email="admin@example.com", is_superuser=True).exists())
        self.assertIn("Successfully created", out.getvalue())

    @patch.dict(
        os.environ,
        {
            "DJANGO_SUPERUSER_EMAIL": "admin2@example.com",
            "DJANGO_SUPERUSER_PASSWORD": "secret123",
            "DJANGO_SUPERUSER_USERNAME": "customadmin",
        },
    )
    def test_uses_custom_username(self):
        call_command("create_superuser_from_env", stdout=StringIO())
        u = User.objects.get(email="admin2@example.com")
        self.assertEqual(u.username, "customadmin")

    @patch.dict(os.environ, {"DJANGO_SUPERUSER_EMAIL": "dup@example.com", "DJANGO_SUPERUSER_PASSWORD": "x"})
    def test_skips_when_already_exists(self):
        User.objects.create_superuser(email="dup@example.com", username="dup", password="x")
        out = StringIO()
        call_command("create_superuser_from_env", stdout=out)
        self.assertIn("already exists", out.getvalue())
        self.assertEqual(User.objects.filter(email="dup@example.com").count(), 1)


class SetupOauthFromEnvCommandTest(TestCase):
    @override_settings(SITE_ID=1)
    def test_errors_without_domain(self):
        out = StringIO()
        with patch.dict(
            os.environ,
            {"PRODUCTION_DOMAIN": "", "ALLOWED_HOSTS": ""},
        ):
            call_command("setup_oauth_from_env", stdout=out)
        self.assertIn("PRODUCTION_DOMAIN", out.getvalue())

    @override_settings(SITE_ID=1)
    @patch.dict(
        os.environ,
        {
            "PRODUCTION_DOMAIN": "api.example.com",
            "GOOGLE_OAUTH_CLIENT_ID": "g-id",
            "GOOGLE_OAUTH_CLIENT_SECRET": "g-secret",
            "TWITTER_OAUTH_CLIENT_ID": "t-id",
            "TWITTER_OAUTH_CLIENT_SECRET": "t-secret",
        },
    )
    def test_full_setup_creates_and_links(self):
        out = StringIO()
        call_command("setup_oauth_from_env", stdout=out)
        site = Site.objects.get(pk=1)
        self.assertEqual(site.domain, "api.example.com")
        google = SocialApp.objects.get(provider="google")
        self.assertEqual(google.client_id, "g-id")
        twitter = SocialApp.objects.get(provider="twitter_oauth2")
        self.assertIn(site, twitter.sites.all())
        self.assertIn("OAuth setup completed", out.getvalue())

    @override_settings(SITE_ID=1)
    def test_domain_from_allowed_hosts_skips_wildcard(self):
        out = StringIO()
        with patch.dict(
            os.environ,
            {
                "PRODUCTION_DOMAIN": "",
                "ALLOWED_HOSTS": ".wildcard.com,realhost.org",
                "GOOGLE_OAUTH_CLIENT_ID": "",
                "GOOGLE_OAUTH_CLIENT_SECRET": "",
            },
        ):
            call_command("setup_oauth_from_env", stdout=out)
        site = Site.objects.get(pk=1)
        self.assertEqual(site.domain, "realhost.org")
        self.assertIn("Skipping Google", out.getvalue())

    @override_settings(SITE_ID=1)
    @patch.dict(
        os.environ,
        {
            "PRODUCTION_DOMAIN": "x.example.com",
            "GOOGLE_CLIENT_ID": "legacy-g",
            "GOOGLE_CLIENT_SECRET": "legacy-gs",
        },
    )
    def test_google_legacy_env_names(self):
        SocialApp.objects.filter(provider="google").delete()
        call_command("setup_oauth_from_env", stdout=StringIO())
        app = SocialApp.objects.get(provider="google")
        self.assertEqual(app.client_id, "legacy-g")

    @override_settings(SITE_ID=1)
    @patch.dict(
        os.environ,
        {
            "PRODUCTION_DOMAIN": "upd.example.com",
            "GOOGLE_OAUTH_CLIENT_ID": "ng",
            "GOOGLE_OAUTH_CLIENT_SECRET": "ns",
        },
    )
    def test_updates_existing_google_and_site_already_linked(self):
        site = Site.objects.get(pk=1)
        site.domain = "old.com"
        site.save()
        app, _ = SocialApp.objects.get_or_create(
            provider="google",
            defaults={"name": "G", "client_id": "old", "secret": "old"},
        )
        app.sites.add(site)
        out = StringIO()
        call_command("setup_oauth_from_env", stdout=out)
        app.refresh_from_db()
        self.assertEqual(app.client_id, "ng")
        self.assertIn("already linked", out.getvalue())

    @override_settings(SITE_ID=1)
    @patch.dict(
        os.environ,
        {
            "PRODUCTION_DOMAIN": "tw.example.com",
            "TWITTER_OAUTH_CLIENT_ID": "t1",
            "TWITTER_OAUTH_CLIENT_SECRET": "t2",
        },
    )
    def test_twitter_update_branch(self):
        site = Site.objects.get(pk=1)
        app, _ = SocialApp.objects.get_or_create(
            provider="twitter_oauth2",
            defaults={"name": "T", "client_id": "oldt", "secret": "oldt"},
        )
        call_command("setup_oauth_from_env", stdout=StringIO())
        app.refresh_from_db()
        self.assertEqual(app.client_id, "t1")
        self.assertIn(site, app.sites.all())
