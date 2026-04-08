---
description: photo_contest_platform の未コミット変更に対してコードレビューを実行する
---

# photo_contest_platform コードレビューワークフロー

## 説明
Git差分を取得し、code-review スキルに基づいてコードレビューを実行します。

## ステップ

### ステップ1: 変更差分の取得

// turbo

```bash
cd /home/yamamoto/photo_contest_platform && git diff --stat
```

- 変更されたファイルの概要を確認

### ステップ2: 詳細差分の確認

// turbo

```bash
cd /home/yamamoto/photo_contest_platform && git diff
```

### ステップ3: コードレビューの実施

code-review スキル（`.agent/skills/code-review/SKILL.md`）を読み込み、以下の観点でレビューを行う:

1. TypeScript型安全性
2. Next.js App Router規約（Server/Client分離）
3. Tailwind CSS 3.4の使い方
4. API通信パターン（React Query + lib/api.ts）
5. Django / DRF 規約（Backend変更時）
6. セキュリティ

### ステップ4: レビュー結果の報告

レビュー結果をアーティファクトとして出力する。
