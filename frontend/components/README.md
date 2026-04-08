# Frontend Components

## 概要

React コンポーネントの構成。ルートレベルに共通コンポーネント、サブディレクトリに機能別コンポーネントを配置。

## ディレクトリ構成

```
components/
├── ContestCard.tsx       # コンテストカード（一覧表示用）
├── ContestList.tsx       # コンテスト一覧
├── EntryCard.tsx         # エントリーカード（一覧表示用）
├── EntryGrid.tsx         # エントリーグリッド表示
├── Footer.tsx            # フッター
├── Header.tsx            # ヘッダー
├── LeftSidebar.tsx       # 左サイドバー（ナビゲーション）
├── LoginButton.tsx       # ログインボタン（Google / Twitter）
├── RightSidebar.tsx      # 右サイドバー（情報表示）
├── UserMenu.tsx          # ユーザーメニュー（ドロップダウン）
├── __tests__/            # コンポーネントテスト
├── calendar/             # カレンダー関連コンポーネント
├── card/                 # カード系 UI
├── contest/              # コンテスト詳細・管理画面
├── header/               # ヘッダー関連
├── judging/              # 審査画面コンポーネント
├── profile/              # プロフィール関連
├── submit/               # エントリー投稿フォーム
└── ui/                   # 汎用 UI コンポーネント（Button, Dialog, Toast 等）
```

## 使用ライブラリ

- **Radix UI**: ダイアログ、ドロップダウン、タブ、トースト等のアクセシブルなプリミティブ
- **Framer Motion**: アニメーション（`lib/motion.ts` にプリセット定義）
- **Tailwind CSS**: スタイリング
- **Lucide React / Hero Icons / React Icons**: アイコン

## コーディング規約

- named export のみ（`export default` 禁止）
- コンポーネントファイル名は PascalCase
- 型定義は `lib/types.ts` または `types/` ディレクトリに集約
- API 呼び出しは `lib/api.ts` の関数を使用（直接 axios を呼ばない）
- 状態管理: `@tanstack/react-query` でサーバー状態、`zustand` でクライアント状態
