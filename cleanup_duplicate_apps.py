#!/usr/bin/env python
"""重複したSocialAppを削除"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

print("=" * 60)
print("重複したSocialAppの確認と削除")
print("=" * 60)

# Twitter OAuth2アプリを全て取得
twitter_apps = SocialApp.objects.filter(provider='twitter_oauth2')
print(f"\nTwitter OAuth2アプリの数: {twitter_apps.count()}")

if twitter_apps.count() > 1:
    print("\n⚠️  重複が見つかりました！")
    
    # 全てのTwitterアプリを表示
    for i, app in enumerate(twitter_apps, 1):
        sites = list(app.sites.values_list('domain', flat=True))
        print(f"\n{i}. {app.name} (ID: {app.id})")
        print(f"   Client ID: {app.client_id}")
        print(f"   Sites: {sites}")
    
    # 最初のアプリ以外を削除
    keep_app = twitter_apps.first()
    delete_apps = twitter_apps.exclude(id=keep_app.id)
    
    print(f"\n✅ 保持: {keep_app.name} (ID: {keep_app.id})")
    print(f"❌ 削除: {delete_apps.count()}個のアプリ")
    
    for app in delete_apps:
        print(f"   - 削除: {app.name} (ID: {app.id})")
        app.delete()
    
    print("\n✅ 重複を削除しました")
    
    # 保持したアプリの情報を更新
    site, _ = Site.objects.get_or_create(
        domain='127.0.0.1:18000',
        defaults={'name': 'VRChat Photo Contest'}
    )
    
    keep_app.client_id = 'T09GVEFkUVljOFlSTFBveHN5eE46MTpjaQ'
    keep_app.secret = '2lS85HZbV-nFliK0wFvkxz6BgQm0oqBniPSTf_aVz-VdImkaMe'
    keep_app.save()
    
    if site not in keep_app.sites.all():
        keep_app.sites.add(site)
    
    print(f"\n✅ 残ったアプリを更新しました")
    
elif twitter_apps.count() == 1:
    app = twitter_apps.first()
    print(f"\n✅ Twitter OAuth2アプリは1つだけです: {app.name}")
    print(f"   Client ID: {app.client_id}")
    print(f"   Sites: {list(app.sites.values_list('domain', flat=True))}")
else:
    print("\n⚠️  Twitter OAuth2アプリが見つかりません")
    print("create_twitter_app.py を実行してください")

print("\n" + "=" * 60)
print("確認:")
print("=" * 60)
print("管理画面: http://localhost:18000/admin/socialaccount/socialapp/")
print("テスト: http://localhost:13000")
