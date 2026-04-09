#!/bin/bash
# pre-commit hook — コミット前に lint + 型チェックを実行
# セットアップ: ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
set -e

echo "🔍 Pre-commit checks..."

# Backend checks
echo "  🐍 Backend: flake8..."
cd "$(git rev-parse --show-toplevel)/backend"
BACKEND_PY="python3"
if [ -x ".venv/bin/python" ]; then
    BACKEND_PY=".venv/bin/python"
elif [ -x "venv/bin/python" ]; then
    BACKEND_PY="venv/bin/python"
fi
if ! "$BACKEND_PY" -m flake8 --version >/dev/null 2>&1; then
    echo "  ❌ flake8 が見つかりません。次でインストールしてください:"
    echo "     cd backend && $BACKEND_PY -m pip install flake8"
    exit 1
fi
if ! "$BACKEND_PY" -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics; then
    echo "  ❌ Backend flake8 failed（上の出力を参照）"
    exit 1
fi
echo "  ✅ Backend: OK"

# Frontend checks
echo "  📦 Frontend: type-check + lint..."
cd "$(git rev-parse --show-toplevel)/frontend"

# GUIクライアント（VS Codeなど）から実行された場合、Windows側のnpx.exeが呼ばれるのを防ぐため、
# 明示的にNVMなどのLinux上のNodeパスを最優先にロードする
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.volta/bin:$HOME/.local/share/fnm:$PATH"

npx tsc --noEmit || {
    echo "  ❌ Frontend type-check failed"
    exit 1
}
npx next lint || {
    echo "  ❌ Frontend lint failed"
    exit 1
}
echo "  ✅ Frontend: OK"

echo "✅ All pre-commit checks passed!"
