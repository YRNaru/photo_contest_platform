"""
環境変数からOAuth設定を行う管理コマンド
"""

import os

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Setup OAuth from environment variables"

    def handle(self, *args, **options):
        """環境変数からOAuth設定を実行"""

        # 環境変数から取得
        # PRODUCTION_DOMAINが未設定の場合はALLOWED_HOSTSから取得
        production_domain = os.environ.get("PRODUCTION_DOMAIN", "")
        if not production_domain:
            # ALLOWED_HOSTSから最初のドメインを取得
            allowed_hosts = os.environ.get("ALLOWED_HOSTS", "")
            if allowed_hosts:
                # カンマ区切りから最初のドメインを取得（.onrender.comは除外）
                domains = [d.strip() for d in allowed_hosts.split(",")]
                production_domain = next((d for d in domains if d and not d.startswith(".")), "")

        production_domain = production_domain or "photo-contest-platform.onrender.com"

        # 実際の環境変数名に合わせる
        google_client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", os.environ.get("GOOGLE_CLIENT_ID", ""))
        google_client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", os.environ.get("GOOGLE_CLIENT_SECRET", ""))
        twitter_client_id = os.environ.get("TWITTER_OAUTH_CLIENT_ID", "")
        twitter_client_secret = os.environ.get("TWITTER_OAUTH_CLIENT_SECRET", "")

        # 1. Siteの設定
        self.stdout.write(f"Setting up Site: {production_domain}")
        site, created = Site.objects.get_or_create(
            pk=1,  # SITE_ID = 1
            defaults={
                "domain": production_domain,
                "name": "VRChat Photo Contest (Production)",
            },
        )

        if not created:
            # 既存のSiteを更新
            site.domain = production_domain
            site.name = "VRChat Photo Contest (Production)"
            site.save()
            self.stdout.write(self.style.SUCCESS(f"✅ Site updated: {site.domain}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"✅ Site created: {site.domain}"))

        # 2. Google OAuthの設定
        if google_client_id and google_client_secret:
            self.stdout.write("Setting up Google OAuth...")
            google_app, created = SocialApp.objects.get_or_create(
                provider="google",
                defaults={
                    "name": "Google OAuth2 (Production)",
                    "client_id": google_client_id,
                    "secret": google_client_secret,
                },
            )

            if not created:
                google_app.name = "Google OAuth2 (Production)"
                google_app.client_id = google_client_id
                google_app.secret = google_client_secret
                google_app.save()
                self.stdout.write(self.style.SUCCESS("✅ Google OAuth updated"))
            else:
                self.stdout.write(self.style.SUCCESS("✅ Google OAuth created"))

            # Siteを関連付け
            if site not in google_app.sites.all():
                google_app.sites.add(site)
                self.stdout.write(self.style.SUCCESS("✅ Google OAuth - Site linked"))
            else:
                self.stdout.write("✅ Google OAuth - Site already linked")
        else:
            self.stdout.write(
                self.style.WARNING(
                    "⚠️  GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET not set. Skipping Google OAuth setup."
                )
            )

        # 3. Twitter OAuthの設定
        if twitter_client_id and twitter_client_secret:
            self.stdout.write("Setting up Twitter OAuth...")
            twitter_app, created = SocialApp.objects.get_or_create(
                provider="twitter_oauth2",
                defaults={
                    "name": "Twitter OAuth2 (Production)",
                    "client_id": twitter_client_id,
                    "secret": twitter_client_secret,
                },
            )

            if not created:
                twitter_app.name = "Twitter OAuth2 (Production)"
                twitter_app.client_id = twitter_client_id
                twitter_app.secret = twitter_client_secret
                twitter_app.save()
                self.stdout.write(self.style.SUCCESS("✅ Twitter OAuth updated"))
            else:
                self.stdout.write(self.style.SUCCESS("✅ Twitter OAuth created"))

            # Siteを関連付け
            if site not in twitter_app.sites.all():
                twitter_app.sites.add(site)
                self.stdout.write(self.style.SUCCESS("✅ Twitter OAuth - Site linked"))
            else:
                self.stdout.write("✅ Twitter OAuth - Site already linked")
        else:
            self.stdout.write(
                self.style.WARNING(
                    "⚠️  TWITTER_OAUTH_CLIENT_ID or TWITTER_OAUTH_CLIENT_SECRET not set. Skipping Twitter OAuth setup."
                )
            )

        self.stdout.write(self.style.SUCCESS("\n✅ OAuth setup completed!"))
