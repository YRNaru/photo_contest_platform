#!/bin/bash
# pre-commit hook — コミット前に lint + 型チェックを実行
# セットアップ: ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
set -e

echo "🔍 Pre-commit checks..."

# Backend checks
echo "  🐍 Backend: flake8..."
cd "$(git rev-parse --show-toplevel)/backend"
if [ -d ".venv" ]; then
    source .venv/bin/activate 2>/dev/null || true
elif [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null || true
fi
python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics 2>/dev/null || {
    echo "  ❌ Backend flake8 failed"
    exit 1
}
echo "  ✅ Backend: OK"

# Frontend checks
echo "  📦 Frontend: type-check + lint..."
cd "$(git rev-parse --show-toplevel)/frontend"
npx tsc --noEmit 2>/dev/null || {
    echo "  ❌ Frontend type-check failed"
    exit 1
}
npx next lint 2>/dev/null || {
    echo "  ❌ Frontend lint failed"
    exit 1
}
echo "  ✅ Frontend: OK"

echo "✅ All pre-commit checks passed!"
