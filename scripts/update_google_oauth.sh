#!/bin/bash

# Google OAuth認証情報を更新するスクリプト

echo "======================================================"
echo "Google OAuth認証情報の更新"
echo "======================================================"
echo ""
echo "Google Cloud Consoleから取得したClient IDとClient Secretを入力してください。"
echo ""

read -p "Google OAuth Client ID: " CLIENT_ID
read -p "Google OAuth Client Secret: " CLIENT_SECRET

echo ""
echo "======================================================"
echo "データベースを更新しています..."
echo "======================================================"

docker-compose exec -T backend python manage.py shell << EOF
from allauth.socialaccount.models import SocialApp

try:
    google_app = SocialApp.objects.get(provider='google')
    google_app.client_id = '${CLIENT_ID}'
    google_app.secret = '${CLIENT_SECRET}'
    google_app.save()
    
    print("\n✅ Google OAuth認証情報を更新しました")
    print(f"Client ID: ${CLIENT_ID}")
    print(f"Client Secret: ${CLIENT_SECRET[:20]}...")
except SocialApp.DoesNotExist:
    print("❌ Google SocialAppが見つかりません")
EOF

echo ""
echo "======================================================"
echo "バックエンドを再起動しています..."
echo "======================================================"

docker-compose restart backend

echo ""
echo "✅ 完了しました！"
echo ""
echo "Googleログインを試してください:"
echo "http://localhost:18000/accounts/google/login/"

