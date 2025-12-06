#!/bin/bash

# マイグレーション実行スクリプト

echo "🔄 マイグレーションを実行します..."

# Dockerコンテナが起動しているか確認
if docker-compose ps backend | grep -q "Up"; then
    echo "✅ Dockerコンテナが起動しています"
    docker-compose exec backend python manage.py migrate accounts
else
    echo "⚠️  Dockerコンテナが起動していません。起動します..."
    docker-compose up -d backend
    sleep 5
    docker-compose exec backend python manage.py migrate accounts
fi

echo "✨ マイグレーション完了！"
