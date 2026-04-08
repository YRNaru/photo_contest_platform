---
description: photo_contest_platform のテスト（型チェック + lint + フロントエンドテスト + バックエンドテスト）を実行する
---

# photo_contest_platform テストワークフロー

## 説明
フロントエンドの型チェック・ESLint・Prettierチェック・Jestテスト、およびバックエンドの pytest を順番に実行します。

// turbo-all

## ステップ

### ステップ1: フロントエンド TypeScript型チェック

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run type-check
```

### ステップ2: フロントエンド ESLintチェック

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run lint
```

### ステップ3: フロントエンド Prettierフォーマットチェック

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run format:check
```

### ステップ4: フロントエンド ユニットテスト実行

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run test -- --passWithNoTests
```

- Jest でテストを実行
- テスト結果を確認

### ステップ5: バックエンド テスト実行

```bash
cd /home/yamamoto/photo_contest_platform/backend && source .venv/bin/activate 2>/dev/null || source venv/bin/activate 2>/dev/null || true && python -m pytest --tb=short -q
```

- pytest でバックエンドテストを実行
- テスト結果を確認
