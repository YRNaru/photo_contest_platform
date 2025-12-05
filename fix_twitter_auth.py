#!/usr/bin/env python
"""
Twitter OAuth2認証の設定を修正するスクリプト
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

def fix_site():
    """Siteの設定を修正"""
    print("=" * 60)
    print("1. Site設定の確認・修正")
    print("=" * 60)
    
    site = Site.objects.get_current()
    print(f"現在のSite: domain={site.domain}, name={site.name}")
    
    if site.domain != '127.0.0.1:18000':
        print(f"Siteドメインを更新: {site.domain} -> 127.0.0.1:18000")
        site.domain = '127.0.0.1:18000'
        site.name = 'VRChat Photo Contest'
        site.save()
        print("✅ Site更新完了")
    else:
        print("✅ Siteは正しく設定されています")
    
    return site

def fix_twitter_social_app(site):
    """Twitter OAuth2のSocialアプリを設定"""
    print("\n" + "=" * 60)
    print("2. Twitter OAuth2 SocialApp設定")
    print("=" * 60)
    
    client_id = os.environ.get('TWITTER_OAUTH_CLIENT_ID', '')
    client_secret = os.environ.get('TWITTER_OAUTH_CLIENT_SECRET', '')
    
    print(f"Client ID: {client_id[:20]}..." if len(client_id) > 20 else f"Client ID: {client_id}")
    print(f"Client Secret: {client_secret[:20]}..." if len(client_secret) > 20 else f"Client Secret: {client_secret}")
    
    if not client_id or not client_secret:
        print("❌ エラー: TWITTER_OAUTH_CLIENT_IDまたはTWITTER_OAUTH_CLIENT_SECRETが設定されていません")
        return None
    
    # 既存のTwitter OAuth2アプリを検索
    twitter_app = SocialApp.objects.filter(provider='twitter_oauth2').first()
    
    if twitter_app:
        print(f"既存のTwitter OAuth2アプリを更新: {twitter_app.name}")
        twitter_app.client_id = client_id
        twitter_app.secret = client_secret
        twitter_app.save()
        
        # Siteを追加
        if site not in twitter_app.sites.all():
            twitter_app.sites.add(site)
            print(f"✅ Site '{site.domain}' を追加")
    else:
        print("新しいTwitter OAuth2アプリを作成")
        twitter_app = SocialApp.objects.create(
            provider='twitter_oauth2',
            name='Twitter OAuth2',
            client_id=client_id,
            secret=client_secret,
        )
        twitter_app.sites.add(site)
        print("✅ Twitter OAuth2アプリを作成")
    
    return twitter_app

def check_google_social_app(site):
    """Google OAuthのSocialアプリを確認（オプション）"""
    print("\n" + "=" * 60)
    print("3. Google OAuth SocialApp確認")
    print("=" * 60)
    
    client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '')
    client_secret = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', '')
    
    if not client_id or not client_secret or client_id == 'dummy':
        print("⚠️  Google OAuth認証情報が設定されていません（スキップ）")
        return None
    
    google_app = SocialApp.objects.filter(provider='google').first()
    
    if google_app:
        print(f"既存のGoogle OAuthアプリを更新: {google_app.name}")
        google_app.client_id = client_id
        google_app.secret = client_secret
        google_app.save()
        
        if site not in google_app.sites.all():
            google_app.sites.add(site)
            print(f"✅ Site '{site.domain}' を追加")
    else:
        print("新しいGoogle OAuthアプリを作成")
        google_app = SocialApp.objects.create(
            provider='google',
            name='Google OAuth2',
            client_id=client_id,
            secret=client_secret,
        )
        google_app.sites.add(site)
        print("✅ Google OAuthアプリを作成")
    
    return google_app

def main():
    print("\n" + "=" * 60)
    print("Twitter OAuth2認証設定の自動修正")
    print("=" * 60 + "\n")
    
    try:
        # 1. Siteを修正
        site = fix_site()
        
        # 2. Twitter OAuth2アプリを設定
        twitter_app = fix_twitter_social_app(site)
        
        # 3. Google OAuthアプリを確認（オプション）
        google_app = check_google_social_app(site)
        
        print("\n" + "=" * 60)
        print("設定完了！")
        print("=" * 60)
        print("\n次のステップ:")
        print("1. Twitter Developer Portalで以下のCallback URIを設定:")
        print("   - http://127.0.0.1:18000/accounts/twitter_oauth2/callback/")
        print("   - http://localhost:18000/accounts/twitter_oauth2/callback/")
        print("\n2. ブラウザで http://localhost:13000 にアクセス")
        print("3. 「ログイン」→「Twitterでログイン」をクリック")
        print("\n管理画面で確認: http://localhost:18000/admin/socialaccount/socialapp/")
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
