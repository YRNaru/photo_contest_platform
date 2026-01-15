#!/usr/bin/env python
"""OAuth設定を確認するスクリプト"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.sites.models import Site  # noqa: E402
from allauth.socialaccount.models import SocialApp  # noqa: E402
from django.conf import settings  # noqa: E402

print("=" * 80)
print("OAuth設定確認")
print("=" * 80)

# 環境変数の確認
print("\n[環境変数]")
print("-" * 80)

env_vars = [
    "DEBUG",
    "FRONTEND_URL",
    "ALLOWED_HOSTS",
    "CORS_ALLOWED_ORIGINS",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "TWITTER_OAUTH_CLIENT_ID",
    "TWITTER_OAUTH_CLIENT_SECRET",
]

for var in env_vars:
    value = os.environ.get(var, "")
    if "SECRET" in var or "CLIENT_SECRET" in var:
        # シークレットは一部のみ表示
        if value:
            display_value = f"{value[:10]}...{value[-5:]}" if len(value) > 15 else "***"
        else:
            display_value = "(未設定)"
    elif "CLIENT_ID" in var:
        # Client IDは一部のみ表示
        if value:
            display_value = f"{value[:20]}..." if len(value) > 20 else value
        else:
            display_value = "(未設定)"
    else:
        display_value = value if value else "(未設定)"
    
    status = "✅" if value else "❌"
    print(f"{status} {var}: {display_value}")

# Django設定の確認
print("\n[Django設定]")
print("-" * 80)
print(f"DEBUG: {settings.DEBUG}")
print(f"SITE_ID: {settings.SITE_ID}")
print(f"ALLOWED_HOSTS: {', '.join(settings.ALLOWED_HOSTS)}")
print(f"LOGIN_REDIRECT_URL: {settings.LOGIN_REDIRECT_URL}")
print(f"LOGOUT_REDIRECT_URL: {settings.LOGOUT_REDIRECT_URL}")

# Siteの確認
print("\n[Django Sites]")
print("-" * 80)

sites = Site.objects.all()
if sites.exists():
    for site in sites:
        print(f"✅ Site ID {site.pk}: {site.domain} ({site.name})")
else:
    print("❌ Siteが設定されていません")

# SocialAppの確認
print("\n[Social Apps]")
print("-" * 80)

# Google
google_apps = SocialApp.objects.filter(provider="google")
if google_apps.exists():
    for app in google_apps:
        print(f"\n✅ Google OAuth: {app.name}")
        print(f"   Client ID: {app.client_id[:20]}..." if app.client_id else "   Client ID: (未設定)")
        print(f"   Secret: {'*' * 20}..." if app.secret else "   Secret: (未設定)")
        print(f"   Sites: {', '.join([s.domain for s in app.sites.all()])}")
else:
    print("\n❌ Google OAuth: 未設定")

# Twitter
twitter_apps = SocialApp.objects.filter(provider="twitter_oauth2")
if twitter_apps.exists():
    for app in twitter_apps:
        print(f"\n✅ Twitter OAuth: {app.name}")
        print(f"   Client ID: {app.client_id[:20]}..." if app.client_id else "   Client ID: (未設定)")
        print(f"   Secret: {'*' * 20}..." if app.secret else "   Secret: (未設定)")
        print(f"   Sites: {', '.join([s.domain for s in app.sites.all()])}")
else:
    print("\n❌ Twitter OAuth: 未設定")

# CORS設定の確認
print("\n[CORS設定]")
print("-" * 80)
if hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
    for origin in settings.CORS_ALLOWED_ORIGINS:
        print(f"✅ {origin}")
else:
    print("❌ CORS_ALLOWED_ORIGINSが設定されていません")

# リダイレクトURIの確認
print("\n[推奨リダイレクトURI]")
print("-" * 80)

for site in sites:
    if not site.domain.startswith("127.0.0.1") and not site.domain.startswith("localhost"):
        print(f"\nSite: {site.domain}")
        print("Google Cloud Console:")
        print(f"  https://{site.domain}/accounts/google/login/callback/")
        print("Twitter Developer Portal:")
        print(f"  https://{site.domain}/accounts/twitter_oauth2/login/callback/")

# 問題の診断
print("\n" + "=" * 80)
print("診断結果")
print("=" * 80)

issues = []

# 必須環境変数のチェック
if not os.environ.get("FRONTEND_URL"):
    issues.append("❌ FRONTEND_URLが設定されていません")
    
if not settings.DEBUG:
    # 本番環境の場合の追加チェック
    if not os.environ.get("GOOGLE_OAUTH_CLIENT_ID") and not os.environ.get("GOOGLE_CLIENT_ID"):
        issues.append("⚠️  GOOGLE_OAUTH_CLIENT_IDが設定されていません（Googleログインが使えません）")
    if not os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET") and not os.environ.get("GOOGLE_CLIENT_SECRET"):
        issues.append("⚠️  GOOGLE_OAUTH_CLIENT_SECRETが設定されていません（Googleログインが使えません）")
    if not os.environ.get("TWITTER_OAUTH_CLIENT_ID"):
        issues.append("⚠️  TWITTER_OAUTH_CLIENT_IDが設定されていません（Twitterログインが使えません）")
    if not os.environ.get("TWITTER_OAUTH_CLIENT_SECRET"):
        issues.append("⚠️  TWITTER_OAUTH_CLIENT_SECRETが設定されていません（Twitterログインが使えません）")

# SocialAppのチェック
if not google_apps.exists():
    issues.append("❌ Google OAuthがデータベースに設定されていません")
else:
    for app in google_apps:
        if not app.client_id or not app.secret:
            issues.append("❌ Google OAuthのClient IDまたはSecretが空です")
        if not app.sites.exists():
            issues.append("❌ Google OAuthにSiteが関連付けられていません")

if not twitter_apps.exists():
    issues.append("❌ Twitter OAuthがデータベースに設定されていません")
else:
    for app in twitter_apps:
        if not app.client_id or not app.secret:
            issues.append("❌ Twitter OAuthのClient IDまたはSecretが空です")
        if not app.sites.exists():
            issues.append("❌ Twitter OAuthにSiteが関連付けられていません")

# Siteのチェック
if not sites.exists():
    issues.append("❌ Siteが設定されていません")

if issues:
    print("\n問題が見つかりました：")
    for issue in issues:
        print(f"  {issue}")
    print("\n対処法：")
    print("  1. scripts/setup_production_oauth.py を実行")
    print("  2. 環境変数を設定")
    print("  3. バックエンドを再起動")
else:
    print("\n✅ OAuth設定は正常です")

print("\n" + "=" * 80)
