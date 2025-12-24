#!/usr/bin/env python
"""Django Siteモデルのドメインを更新するスクリプト"""
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.sites.models import Site  # noqa: E402

# コマンドライン引数または環境変数から取得
if len(sys.argv) >= 2:
    domain = sys.argv[1]
elif os.environ.get("BACKEND_DOMAIN"):
    domain = os.environ.get("BACKEND_DOMAIN")
elif os.environ.get("ALLOWED_HOSTS"):
    # ALLOWED_HOSTSから最初のドメインを取得
    hosts = os.environ.get("ALLOWED_HOSTS", "").split(",")
    domain = hosts[0].strip() if hosts else None
    if not domain or domain in ["localhost", "127.0.0.1"]:
        domain = None
else:
    domain = None

if not domain:
    print("=" * 60)
    print("使用方法:")
    print("  python update_site_domain.py <DOMAIN>")
    print("  または環境変数 BACKEND_DOMAIN を設定")
    print("  例: python update_site_domain.py photo-contest-platform.onrender.com")
    print("=" * 60)
    sys.exit(1)

print("=" * 60)
print("Django Siteドメインの更新")
print("=" * 60)

try:
    # SITE_ID=1のSiteを取得または作成
    site, created = Site.objects.get_or_create(
        id=1,
        defaults={"name": "VRChat Photo Contest", "domain": domain}
    )
    
    if not created:
        # 既存のSiteを更新
        old_domain = site.domain
        site.domain = domain
        site.name = "VRChat Photo Contest"
        site.save()
        print(f"\n✅ Siteドメインを更新しました")
        print(f"  旧ドメイン: {old_domain}")
        print(f"  新ドメイン: {domain}")
    else:
        print(f"\n✅ 新しいSiteを作成しました")
        print(f"  ドメイン: {domain}")

    print("\n" + "=" * 60)
    print("設定完了！")
    print("=" * 60)
    print("\n⚠️  注意:")
    print("  - Google Cloud Consoleの承認済みリダイレクトURIに以下を追加してください:")
    print(f"    https://{domain}/accounts/google/login/callback/")
    print("  - Twitter Developer PortalのCallback URIにも以下を追加してください:")
    print(f"    https://{domain}/accounts/twitter_oauth2/login/callback/")
    print("=" * 60)

except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
    sys.exit(1)

