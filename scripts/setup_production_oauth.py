#!/usr/bin/env python
"""本番環境用のOAuth設定スクリプト"""
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.sites.models import Site  # noqa: E402
from allauth.socialaccount.models import SocialApp  # noqa: E402

print("=" * 80)
print("本番環境用OAuth設定")
print("=" * 80)

# 環境変数から取得
# PRODUCTION_DOMAINが未設定の場合はALLOWED_HOSTSから取得
production_domain_env = os.environ.get("PRODUCTION_DOMAIN", "")
if not production_domain_env:
    # ALLOWED_HOSTSから最初のドメインを取得
    allowed_hosts = os.environ.get("ALLOWED_HOSTS", "")
    if allowed_hosts:
        # カンマ区切りから最初のドメインを取得（.onrender.comは除外）
        domains = [d.strip() for d in allowed_hosts.split(",")]
        production_domain_env = next((d for d in domains if d and not d.startswith(".")), "")
PRODUCTION_DOMAIN = production_domain_env or "photo-contest-platform.onrender.com"

# 実際の環境変数名に合わせる
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", os.environ.get("GOOGLE_CLIENT_ID", ""))
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", os.environ.get("GOOGLE_CLIENT_SECRET", ""))
TWITTER_CLIENT_ID = os.environ.get("TWITTER_OAUTH_CLIENT_ID", "")
TWITTER_CLIENT_SECRET = os.environ.get("TWITTER_OAUTH_CLIENT_SECRET", "")

# 1. Siteの設定
print(f"\n[1/3] Siteの設定: {PRODUCTION_DOMAIN}")
print("-" * 80)

site, created = Site.objects.get_or_create(
    pk=1,  # SITE_ID = 1
    defaults={
        "domain": PRODUCTION_DOMAIN,
        "name": "VRChat Photo Contest (Production)",
    }
)

if not created:
    # 既存のSiteを更新
    site.domain = PRODUCTION_DOMAIN
    site.name = "VRChat Photo Contest (Production)"
    site.save()
    print(f"✅ Site更新: {site.domain}")
else:
    print(f"✅ Site作成: {site.domain}")

# 2. Google OAuthの設定
print(f"\n[2/3] Google OAuthの設定")
print("-" * 80)

if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    google_app, created = SocialApp.objects.get_or_create(
        provider="google",
        defaults={
            "name": "Google OAuth2 (Production)",
            "client_id": GOOGLE_CLIENT_ID,
            "secret": GOOGLE_CLIENT_SECRET,
        },
    )

    if not created:
        google_app.name = "Google OAuth2 (Production)"
        google_app.client_id = GOOGLE_CLIENT_ID
        google_app.secret = GOOGLE_CLIENT_SECRET
        google_app.save()
        print(f"✅ Google OAuth更新")
    else:
        print(f"✅ Google OAuth作成")

    # Siteを関連付け
    if site not in google_app.sites.all():
        google_app.sites.add(site)
        print(f"✅ Google OAuth - Site関連付け完了")
    else:
        print(f"✅ Google OAuth - Site既に関連付け済み")

    print(f"   Client ID: {GOOGLE_CLIENT_ID[:20]}...")
else:
    print("⚠️  GOOGLE_OAUTH_CLIENT_IDまたはGOOGLE_OAUTH_CLIENT_SECRETが設定されていません")
    print("   環境変数を設定してください")

# 3. Twitter OAuthの設定
print(f"\n[3/3] Twitter OAuthの設定")
print("-" * 80)

if TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET:
    twitter_app, created = SocialApp.objects.get_or_create(
        provider="twitter_oauth2",
        defaults={
            "name": "Twitter OAuth2 (Production)",
            "client_id": TWITTER_CLIENT_ID,
            "secret": TWITTER_CLIENT_SECRET,
        },
    )

    if not created:
        twitter_app.name = "Twitter OAuth2 (Production)"
        twitter_app.client_id = TWITTER_CLIENT_ID
        twitter_app.secret = TWITTER_CLIENT_SECRET
        twitter_app.save()
        print(f"✅ Twitter OAuth更新")
    else:
        print(f"✅ Twitter OAuth作成")

    # Siteを関連付け
    if site not in twitter_app.sites.all():
        twitter_app.sites.add(site)
        print(f"✅ Twitter OAuth - Site関連付け完了")
    else:
        print(f"✅ Twitter OAuth - Site既に関連付け済み")

    print(f"   Client ID: {TWITTER_CLIENT_ID[:20]}...")
else:
    print("⚠️  TWITTER_OAUTH_CLIENT_IDまたはTWITTER_OAUTH_CLIENT_SECRETが設定されていません")
    print("   環境変数を設定してください")

print("\n" + "=" * 80)
print("設定完了確認")
print("=" * 80)

print(f"\n✅ Site: {site.domain}")

google_apps = SocialApp.objects.filter(provider="google")
if google_apps.exists():
    print(f"✅ Google OAuth: 設定済み ({google_apps.count()}件)")
    for app in google_apps:
        print(f"   - {app.name} (Sites: {', '.join([s.domain for s in app.sites.all()])})")
else:
    print(f"❌ Google OAuth: 未設定")

twitter_apps = SocialApp.objects.filter(provider="twitter_oauth2")
if twitter_apps.exists():
    print(f"✅ Twitter OAuth: 設定済み ({twitter_apps.count()}件)")
    for app in twitter_apps:
        print(f"   - {app.name} (Sites: {', '.join([s.domain for s in app.sites.all()])})")
else:
    print(f"❌ Twitter OAuth: 未設定")

print("\n" + "=" * 80)
print("次のステップ")
print("=" * 80)
print("\n1. 以下の環境変数がRender.comに設定されているか確認：")
print("   - FRONTEND_URL")
print("   - ALLOWED_HOSTS (PRODUCTION_DOMAINが未設定の場合)")
print("   - GOOGLE_OAUTH_CLIENT_ID")
print("   - GOOGLE_OAUTH_CLIENT_SECRET")
print("   - TWITTER_OAUTH_CLIENT_ID")
print("   - TWITTER_OAUTH_CLIENT_SECRET")
print("\n2. Google Cloud ConsoleでリダイレクトURIを追加：")
print(f"   https://{PRODUCTION_DOMAIN}/accounts/google/login/callback/")
print("\n3. Twitter Developer PortalでリダイレクトURIを追加：")
print(f"   https://{PRODUCTION_DOMAIN}/accounts/twitter_oauth2/login/callback/")
print("\n4. バックエンドを再起動")
print("=" * 80)
