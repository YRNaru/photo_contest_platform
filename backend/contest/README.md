# Contest Feature

## 概要

コンテスト・エントリー・審査の中核機能を管理するアプリ。

## モデル

| モデル | 役割 |
|--------|------|
| `Contest` | コンテスト本体。フェーズ管理（upcoming → submission → voting → closed） |
| `Entry` | エントリー（応募作品）。承認制（`approved=False` で作成、モデレーターが承認） |
| `EntryImage` | エントリーに紐づく画像。サムネイルは Celery タスクで非同期生成 |
| `Category` | 賞（グランプリ、風景賞など）。段階審査にも対応 |
| `Vote` | 投票（投票方式用）。カテゴリー × 段階ごとに一意 |
| `JudgeScore` | 審査員スコア（点数方式用の総合スコア） |
| `DetailedScore` | 詳細スコア（各審査基準に対する点数） |
| `JudgingCriteria` | 審査基準（構図、色彩、独創性などの評価項目） |
| `EntryView` | エントリー閲覧記録（審査員が全作品を閲覧したかのチェック用） |
| `Flag` | 通報 |

## 審査方式

### 投票方式 (`judging_type = "vote"`)
- 審査員が `max_votes_per_judge` 件まで投票
- `Category` ごとに独立した投票が可能
- 段階審査: `enable_stages=True` で一次審査 → 二次審査 … と進行

### 点数方式 (`judging_type = "score"`)
- `JudgingCriteria` で評価項目を定義
- 審査員が各項目に点数をつけ、`DetailedScore` として保存
- `JudgeScore.calculate_total_score()` で合計を自動計算

## Twitter 連携

- `twitter_integration.py` でハッシュタグ付きツイートを自動取得
- Celery Beat で定期実行（デフォルト: 6時間ごと）
- 取得したツイートは `source="twitter"` のエントリーとして作成
- `twitter_auto_approve=False`（デフォルト）の場合はモデレーター承認が必要

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `models.py` | 全モデル定義 |
| `views.py` | DRF ViewSets（Contest, Entry, Category, Vote, JudgeScore 等） |
| `serializers.py` | API シリアライザー |
| `permissions.py` | カスタム権限クラス（IsJudge, IsModerator） |
| `tasks.py` | Celery タスク（サムネイル生成） |
| `twitter_integration.py` | Twitter API v2 連携 |
| `admin.py` | Django Admin 設定 |

## 注意事項

- エントリーの `id` は UUID（`uuid4`）
- `vote_count` はモデルのメソッドとして定義（DBフィールドではない）
- 投票数でのソートは `annotate(vote_count=Count("votes"))` で算出
- `DetailedScore.save()` 内で `JudgeScore.calculate_total_score()` が自動呼出される
