#!/usr/bin/env python
"""Google OAuth認証情報を設定するスクリプト"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from allauth.socialaccount.models import SocialApp  # noqa: E402

# コマンドライン引数から取得
if len(sys.argv) < 3:
    print("=" * 60)
    print("使用方法:")
    print("  python set_google_oauth.py <CLIENT_ID> <CLIENT_SECRET>")
    print("=" * 60)
    sys.exit(1)

client_id = sys.argv[1]
client_secret = sys.argv[2]

print("=" * 60)
print("Google OAuth認証情報の更新")
print("=" * 60)

try:
    google_app = SocialApp.objects.get(provider='google')
    google_app.client_id = client_id
    google_app.secret = client_secret
    google_app.save()

    print(f"\n✅ Google OAuth認証情報を更新しました")
    print(f"  Client ID: {client_id}")
    print(f"  Client Secret: {client_secret[:20]}...")

    print(f"\n【関連付けられているSites】")
    for site in google_app.sites.all():
        print(f"  • {site.domain}")

    print("\n" + "=" * 60)
    print("設定完了！バックエンドを再起動してください：")
    print("  docker-compose restart backend")
    print("=" * 60)

except SocialApp.DoesNotExist:
    print("❌ Google SocialAppが見つかりません")
    sys.exit(1)
