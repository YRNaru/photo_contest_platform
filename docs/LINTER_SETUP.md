# Linter/Type Checker 設定ガイド

このプロジェクトでは、Dockerコンテナ内でDjangoが動作しているため、IDEの型チェッカー（Pyright/Basedpyright）がパッケージを認識できません。

## 🔧 設定ファイル

以下の設定ファイルが追加されています：

### 1. `backend/pyrightconfig.json`

Pyright/Basedpyrightの設定ファイル。インポートエラーを抑制します。

### 2. `.vscode/settings.json`

VS Codeの設定ファイル。Basedpyrightの診断設定を含みます。

### 3. `backend/.pyrightignore`

型チェックから除外するファイルパターン（migrations等）。

## ⚠️ Linterエラーについて

表示されている「インポートを解決できませんでした」という警告は、以下の理由で発生します：

1. **Dockerコンテナ内での実行**
   - Djangoはコンテナ内にインストールされている
   - ホストマシンのIDEからは直接アクセスできない

2. **実際のコードは正常**
   - コンテナ内では完全に動作している
   - これらは型チェッカーの警告のみ

## ✅ 警告を消す方法

### 方法1: VS Codeウィンドウの再読み込み（推奨）

1. `Ctrl+Shift+P` (または `Cmd+Shift+P`)
2. 「Developer: Reload Window」を選択
3. ウィンドウが再読み込みされ、新しい設定が適用される

### 方法2: Basedpyrightを無効化

VS Code設定（`settings.json`）で：

```json
{
  "basedpyright.disableLanguageServices": true
}
```

### 方法3: ローカルに仮想環境を作成（高度）

ホストマシンにPython環境を作成して、IDEに認識させる：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

その後、VS Codeで`.venv`を選択します。

## 💡 推奨アプローチ

**開発効率を優先する場合**:
- 型チェッカーの警告は無視する
- コードはDockerコンテナ内で正常に動作している
- VS Code設定で警告レベルを調整済み

**型チェックが必要な場合**:
- ローカルに仮想環境を作成
- IDEで`.venv`を選択
- ただし、実行は引き続きDockerコンテナで行う

## 📝 注意事項

- ✅ これらの警告はコードの品質に影響しません
- ✅ Dockerコンテナ内では全て正常にインポートされています
- ✅ テスト、実行、デプロイには全く問題ありません

---

**結論**: これらの警告は安全に無視できます。VS Codeを再読み込みすると、多くの警告が抑制されるはずです。

