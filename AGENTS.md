# Photo Contest Platform — AI Agent Guide

## プロジェクト概要

VRChat のフォトコンテスト用 Web アプリケーション。  
写真投稿・投票・審査員評価・Twitter 連携・管理機能を備えたフルスタック構成。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Backend | Django 5.0 / Django REST Framework / Python 3.11 |
| DB | MySQL 8.0 |
| Cache/Queue | Redis / Celery |
| Frontend | Next.js 15 (App Router) / React 19 / TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | React Query (TanStack) / Zustand |
| UI | Radix UI / Framer Motion |
| Auth | Google OAuth 2.0 / Twitter OAuth 2.0 (allauth) |
| Infra | Docker Compose（ローカル）/ さくら VPS（本番） |

## アーキテクチャ

```
photo_contest_platform/
├── backend/               # Django バックエンド
│   ├── config/            # Django 設定（settings, urls, celery）
│   ├── accounts/          # ユーザー認証・OAuth（CustomUser, allauth adapter）
│   ├── contest/           # コンテスト・エントリー・審査
│   │   ├── models.py      # Contest, Entry, Category, Vote, JudgeScore, DetailedScore, Flag
│   │   ├── views.py       # DRF ViewSets
│   │   ├── serializers.py # API シリアライザー
│   │   ├── tasks.py       # Celery タスク（サムネイル生成）
│   │   └── twitter_integration.py  # Twitter API 連携
│   └── shared/            # 共通ユーティリティ（errors.py）
├── frontend/              # Next.js フロントエンド
│   ├── app/               # App Router ページ
│   ├── components/        # React コンポーネント
│   ├── lib/               # API クライアント・ユーティリティ・型定義
│   └── types/             # 追加の型定義
├── docs/                  # ドキュメント（INDEX.md が目次）
├── deploy/                # 本番用 Nginx / systemd テンプレート
├── scripts/               # ユーティリティスクリプト
├── docker-compose.yml
└── Makefile               # Docker 操作ショートカット
```

## セットアップ

```bash
# Docker（推奨）
docker-compose up --build -d && docker-compose exec backend python manage.py migrate

# ローカル開発（バックエンド）
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python manage.py runserver 8080

# ローカル開発（フロントエンド）
cd frontend && npm install && npm run dev

# テスト
cd backend && pytest                        # バックエンド
cd frontend && npm run validate             # フロントエンド（型チェック + lint + テスト）

# 全検証
make validate
```

## NEVER（絶対やらないこと）

- `.env` / `.env.*` ファイルをコードに含めない、編集しない
- `backend/*/migrations/` を手動編集しない（`makemigrations` で生成する）
- 既存のテストを削除しない、既存テストの assertion を弱める変更をしない
- `console.log` / `print` デバッグをプロダクションコードに残さない
- TypeScript で `any` 型を使わない（`unknown` + 型ガード、またはジェネリクスを使う）
- `as` 型アサーションを安易に使わない
- デフォルトエクスポートを使わない（named export のみ）
- SQL 文字列結合を行わない（Django ORM / パラメータバインドを使う）
- `except Exception` で広範囲に例外を握りつぶさない
- API キー・シークレットをハードコードしない（環境変数で管理）

## コードスタイル例

### Backend（Python / Django）

```python
# models.py — verbose_name 付き、docstring 必須
class Contest(models.Model):
    """コンテストモデル"""
    slug = models.SlugField(unique=True, verbose_name="スラッグ")
    title = models.CharField(max_length=200, verbose_name="タイトル")
    # ...

    def phase(self) -> str:
        """現在のフェーズを返す"""
        now = timezone.now()
        if now < self.start_at:
            return "upcoming"
        # ...
```

```python
# views.py — DRF ViewSet パターン
class ContestViewSet(viewsets.ModelViewSet):
    """コンテストViewSet"""
    queryset = Contest.objects.filter(is_public=True)
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ContestCreateSerializer
        elif self.action == "retrieve":
            return ContestDetailSerializer
        return ContestListSerializer
```

### Frontend（TypeScript / React）

```typescript
// lib/api.ts — axios インスタンス + API 関数オブジェクト
export const contestApi = {
  getContests: () => api.get('/contests/'),
  getContest: (slug: string) => api.get(`/contests/${slug}/`),
  createContest: (data: FormData) => api.post('/contests/', data),
}
```

```typescript
// lib/types.ts — JSDoc コメント付き型定義
/** コンテスト情報 */
export interface Contest {
  /** URL スラッグ（一意） */
  slug: string
  /** コンテストタイトル */
  title: string
  /** 現在のフェーズ */
  phase: 'upcoming' | 'submission' | 'voting' | 'closed'
}
```

## 権限

### 自由にやっていい

- `backend/accounts/`, `backend/contest/` のコード修正
- `frontend/app/`, `frontend/components/`, `frontend/lib/` のコード修正
- テストの追加（既存テストの削除は NG）
- ドキュメントの更新

### 確認してから

- `requirements.txt` / `package.json` への依存関係追加
- Django モデルの変更（マイグレーション影響）
- API エンドポイントの追加・変更
- DB スキーマの変更

### 絶対にやらない

- `.env*` ファイルの編集
- `docker-compose.yml` / `Dockerfile` の変更
- CI/CD 設定（`.github/workflows/`）の変更
- 本番 DB への直接アクセス
- 認証フロー（OAuth）の大幅変更

## 重要な規約

- **認証**: allauth + カスタムアダプター（`accounts/adapter.py`）。JWT トークンは `localStorage` に保存
- **エントリー承認制**: 投稿は `approved=False` で作成される。モデレーターが承認後に公開
- **Twitter 連携**: `contest/twitter_integration.py` で Celery Beat 経由の自動取得
- **画像処理**: Celery タスクでサムネイル生成（`contest/tasks.py`）
- **審査方式**: 投票方式 (vote) と点数方式 (score) の2種類。Category（賞）単位で段階審査も可能
- **エラーハンドリング**: `backend/shared/errors.py` の `AppError` クラスを使う。DRF のビルトイン例外も併用可
