---
description: photo_contest_platform の品質チェック（TypeScript型チェック + ESLint + Prettierフォーマット確認）を実行する
---

# photo_contest_platform 品質チェックワークフロー

## 説明
TypeScript型チェック、ESLint静的解析、Prettierフォーマット確認を実行して、コード品質を確認します。
テスト実行は含まず、静的チェックのみ行います。

// turbo-all

## ステップ

### ステップ1: TypeScript型チェック

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run type-check
```

- 型エラーがないことを確認

### ステップ2: ESLint静的解析

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run lint
```

- ルール違反がないことを確認

### ステップ3: Prettierフォーマット確認

```bash
cd /home/yamamoto/photo_contest_platform/frontend && npm run format:check
```

- コードフォーマットが統一されていることを確認
- 問題がある場合は `npm run format` で自動修正可能
