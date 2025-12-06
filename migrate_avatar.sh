#!/bin/bash

echo "🚀 プロフィール画像機能のセットアップを開始します..."
echo ""

# バックエンドコンテナでマイグレーションを実行
echo "📦 マイグレーションを実行中..."
docker-compose exec -T backend python manage.py migrate accounts

if [ $? -eq 0 ]; then
    echo "✅ マイグレーション完了！"
    echo ""
    echo "📁 メディアディレクトリを作成中..."
    docker-compose exec -T backend mkdir -p media/avatars
    docker-compose exec -T backend chmod -R 755 media
    echo "✅ メディアディレクトリ作成完了！"
    echo ""
    echo "🎉 セットアップ完了！"
    echo ""
    echo "次のことができるようになりました："
    echo "  - プロフィール画像のアップロード"
    echo "  - Twitterアイコンの使用"
    echo ""
    echo "http://localhost:13000/profile にアクセスして試してください！"
else
    echo "❌ マイグレーションに失敗しました"
    echo ""
    echo "手動で実行する場合："
    echo "  docker-compose exec backend python manage.py migrate accounts"
fi
