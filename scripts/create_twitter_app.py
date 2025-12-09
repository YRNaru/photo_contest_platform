#!/usr/bin/env python
"""Twitter OAuth2のSocialAppを直接作成"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.sites.models import Site  # noqa: E402
from allauth.socialaccount.models import SocialApp  # noqa: E402

print("=" * 60)
print("Twitter OAuth2 SocialAppの作成")
print("=" * 60)

# Siteを取得または作成
site, created = Site.objects.get_or_create(
    domain='127.0.0.1:18000',
    defaults={'name': 'VRChat Photo Contest'}
)
if created:
    print(f"✅ 新しいSiteを作成: {site.domain}")
else:
    print(f"✅ 既存のSiteを使用: {site.domain}")

# 環境変数から認証情報を取得
client_id = os.environ.get(
    'TWITTER_OAUTH_CLIENT_ID',
    'T09GVEFkUVljOFlSTFBveHN5eE46MTpjaQ'
)
client_secret = os.environ.get(
    'TWITTER_OAUTH_CLIENT_SECRET',
    '2lS85HZbV-nFliK0wFvkxz6BgQm0oqBniPSTf_aVz-VdImkaMe'
)

print(f"\nClient ID: {client_id}")
print(f"Client Secret: {client_secret[:20]}...")

# Twitter OAuth2アプリを取得または作成
twitter_app, created = SocialApp.objects.get_or_create(
    provider='twitter_oauth2',
    defaults={
        'name': 'Twitter OAuth2',
        'client_id': client_id,
        'secret': client_secret,
    }
)

if not created:
    # 既存のアプリを更新
    twitter_app.client_id = client_id
    twitter_app.secret = client_secret
    twitter_app.save()
    print(f"\n✅ 既存のTwitter OAuth2アプリを更新: {twitter_app.name}")
else:
    print(f"\n✅ 新しいTwitter OAuth2アプリを作成: {twitter_app.name}")

# Siteを追加
if site not in twitter_app.sites.all():
    twitter_app.sites.add(site)
    print(f"✅ Site '{site.domain}' を追加")
else:
    print(f"✅ Site '{site.domain}' は既に設定済み")

print("\n" + "=" * 60)
print("設定完了！")
print("=" * 60)
print("\n管理画面で確認:")
print("http://localhost:18000/admin/socialaccount/socialapp/")
print("\nTwitterログインをテスト:")
print("http://localhost:13000")