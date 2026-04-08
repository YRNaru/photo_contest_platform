---
description: photo_contest_platform のNext.jsビルドを実行して、ビルドエラーがないことを確認する
---

# photo_contest_platform ビルドワークフロー

## 説明
フロントエンド（Next.js）のプロダクションビルドを実行し、ビルドエラーがないことを確認します。

// turbo-all

## ステップ

### ステップ1: TypeScript型チェック

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run type-check
```

- 型エラーがないことを確認

### ステップ2: Next.jsビルド

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run build
```

- ビルドエラーがないことを確認
- ページルートの自動検出結果を確認
