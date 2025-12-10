#!/bin/bash

# フロントエンドテスト実行スクリプト

set -e

echo "========================================="
echo "  フロントエンドテスト実行"
echo "========================================="
echo ""

# プロジェクトのフロントエンドディレクトリに移動
cd "$(dirname "$0")/../frontend"

# node_modulesの確認
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules が見つかりません。npm install を実行してください。"
    exit 1
fi

echo "📦 依存関係の確認..."
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest axios-mock-adapter

echo ""
echo "🧪 テスト実行中..."
echo ""

# Jestの実行
if [ "$1" == "--coverage" ]; then
    echo "📊 カバレッジレポート付きでテストを実行..."
    npm run test:coverage
    echo ""
    echo "✅ カバレッジレポートが coverage/index.html に生成されました"
elif [ "$1" == "--watch" ]; then
    echo "👀 ウォッチモードでテストを実行..."
    npm run test:watch
else
    npm test
fi

echo ""
echo "========================================="
echo "  テスト完了"
echo "========================================="

