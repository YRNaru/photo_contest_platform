# コンテスト審査システム機能ガイド

## 概要

このシステムでは、コンテストに2つの審査方式を選択できます：

### 1. 投票方式（Vote Mode）
- 審査員が気に入った作品に投票
- 審査員ごとに投票できる数を制限可能
- 部門ごとに投票数を設定可能

### 2. 点数方式（Score Mode）
- 審査員が各作品に点数をつける
- 審査基準（評価項目）を設定可能
- 各基準に対して点数を配分
- 自動的に合計点を計算

## モデル構造

### Contest（コンテスト）
- `judging_type`: 審査方式（'vote' または 'score'）
- `max_votes_per_judge`: 投票方式の場合の最大投票数

### Category（部門）
- コンテスト内で複数の部門を作成可能
- 各部門に独自の投票数制限を設定可能（オプション）
- 例：風景部門、人物部門、グランプリ

### JudgingCriteria（審査基準）
- 点数方式で使用
- 評価項目を定義（例：構図、色彩、独創性）
- 各項目の最大点数を設定
- 部門ごとに異なる基準を設定可能

### Vote（投票）
- 投票方式で使用
- 審査員が作品に投票
- 部門ごとに投票

### JudgeScore（審査員スコア）
- 点数方式で使用
- 総合点を保存
- 部門ごとにスコアを付ける

### DetailedScore（詳細スコア）
- 点数方式で使用
- 各審査基準に対する点数
- 自動的に合計して総合点を計算

## API エンドポイント

### コンテスト管理
```
GET    /api/contests/                    # コンテスト一覧
POST   /api/contests/                    # コンテスト作成
GET    /api/contests/{slug}/             # コンテスト詳細
PUT    /api/contests/{slug}/             # コンテスト更新
DELETE /api/contests/{slug}/             # コンテスト削除
GET    /api/contests/my_contests/        # 自分のコンテスト
GET    /api/contests/judging_contests/   # 審査中のコンテスト
```

### 部門管理
```
GET    /api/categories/                  # 部門一覧
POST   /api/categories/                  # 部門作成
GET    /api/categories/{id}/             # 部門詳細
PUT    /api/categories/{id}/             # 部門更新
DELETE /api/categories/{id}/             # 部門削除
```

### 審査基準管理
```
GET    /api/judging-criteria/            # 審査基準一覧
POST   /api/judging-criteria/            # 審査基準作成
GET    /api/judging-criteria/{id}/       # 審査基準詳細
PUT    /api/judging-criteria/{id}/       # 審査基準更新
DELETE /api/judging-criteria/{id}/       # 審査基準削除
```

### 投票（投票方式）
```
GET    /api/votes/                       # 投票一覧
POST   /api/votes/                       # 投票作成
GET    /api/votes/my_votes/              # 自分の投票
DELETE /api/votes/{id}/                  # 投票削除
```

### スコア付け（点数方式）
```
GET    /api/judge-scores/                # スコア一覧
POST   /api/judge-scores/                # スコア作成
GET    /api/judge-scores/{id}/           # スコア詳細
PUT    /api/judge-scores/{id}/           # スコア更新
DELETE /api/judge-scores/{id}/           # スコア削除
GET    /api/judge-scores/my_scores/      # 自分のスコア
```

## 使用例

### 1. 投票方式のコンテストを作成

```json
POST /api/contests/
{
  "slug": "photo-contest-2025",
  "title": "フォトコンテスト2025",
  "description": "...",
  "judging_type": "vote",
  "max_votes_per_judge": 3,
  "start_at": "2025-01-01T00:00:00Z",
  "end_at": "2025-01-31T23:59:59Z",
  "voting_end_at": "2025-02-07T23:59:59Z"
}
```

### 2. 部門を作成

```json
POST /api/categories/
{
  "contest": 1,
  "name": "風景部門",
  "description": "美しい風景写真",
  "order": 1,
  "max_votes_per_judge": 2
}
```

### 3. 投票方式で投票

```json
POST /api/votes/
{
  "entry": "entry-uuid",
  "category": 1
}
```

### 4. 点数方式のコンテストを作成

```json
POST /api/contests/
{
  "slug": "photo-contest-score-2025",
  "title": "フォトコンテスト（点数方式）2025",
  "judging_type": "score",
  ...
}
```

### 5. 審査基準を作成

```json
POST /api/judging-criteria/
{
  "contest": 2,
  "category": 1,
  "name": "構図",
  "description": "写真の構図の美しさ",
  "max_score": 10,
  "order": 1
}
```

### 6. 点数を付ける

```json
POST /api/judge-scores/
{
  "entry": "entry-uuid",
  "category": 1,
  "comment": "素晴らしい作品です",
  "detailed_scores": [
    {
      "criteria": 1,
      "score": 9.5,
      "comment": "構図が美しい"
    },
    {
      "criteria": 2,
      "score": 8.0,
      "comment": "色彩も良い"
    }
  ]
}
```

## フロントエンド実装のポイント

### コンテスト作成画面
1. 審査方式を選択（ラジオボタン：投票 / 点数）
2. 投票方式の場合：
   - 最大投票数の入力フィールド
3. 点数方式の場合：
   - 審査基準の追加フォーム
   - 各基準の最大点数設定

### 部門管理画面
- 部門の追加・編集・削除
- ドラッグ&ドロップで表示順変更
- 部門ごとの投票数設定

### 審査画面（投票方式）
1. 部門選択
2. 作品一覧表示
3. 投票ボタン（残り投票数表示）
4. 投票済み作品の表示

### 審査画面（点数方式）
1. 部門選択
2. 作品詳細表示
3. 各審査基準に対する点数入力フォーム
4. コメント入力欄
5. 総合点の自動計算・表示

### 結果表示画面
- 投票方式：投票数順のランキング
- 点数方式：総合点順のランキング
- 部門別の結果表示
- 詳細スコアの内訳表示（点数方式）

## データベースマイグレーション

マイグレーションは既に実行済みです：
```bash
python manage.py migrate contest
```

## 次のステップ

1. フロントエンドのReactコンポーネント作成
   - `ContestForm.tsx` - コンテスト作成/編集
   - `CategoryManager.tsx` - 部門管理
   - `JudgingCriteriaManager.tsx` - 審査基準管理
   - `VotingPanel.tsx` - 投票画面
   - `ScoringPanel.tsx` - 点数付け画面
   - `ResultsDisplay.tsx` - 結果表示

2. APIクライアントの実装
   - `api/contests.ts`
   - `api/categories.ts`
   - `api/votes.ts`
   - `api/scores.ts`

3. 状態管理
   - Zustandまたはcontextを使用
   - 現在の部門、審査基準を管理

4. バリデーション
   - 投票数制限のチェック
   - 点数範囲のチェック
   - フェーズに応じた操作制限

