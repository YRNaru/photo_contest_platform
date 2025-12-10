#!/bin/bash

# バックエンドテスト実行スクリプト

set -e

echo "========================================="
echo "  バックエンドテスト実行"
echo "========================================="
echo ""

# プロジェクトのバックエンドディレクトリに移動
cd "$(dirname "$0")/../backend"

# 仮想環境の確認
if [ ! -d "venv" ]; then
    echo "⚠️  仮想環境が見つかりません。セットアップを実行してください。"
    exit 1
fi

# 仮想環境をアクティベート
source venv/bin/activate

echo "📦 依存関係の確認..."
pip install -q pytest pytest-django pytest-cov

echo ""
echo "🧪 テスト実行中..."
echo ""

# pytestの実行
if [ "$1" == "--coverage" ]; then
    echo "📊 カバレッジレポート付きでテストを実行..."
    pytest --cov=. --cov-report=html --cov-report=term -v
    echo ""
    echo "✅ カバレッジレポートが htmlcov/index.html に生成されました"
elif [ "$1" == "--verbose" ]; then
    pytest -vv
elif [ "$1" == "--failed" ]; then
    echo "❌ 前回失敗したテストのみ実行..."
    pytest --lf -v
else
    pytest -v
fi

echo ""
echo "========================================="
echo "  テスト完了"
echo "========================================="

