# VRChat フォトコンテストプラットフォーム

VRChatのフォトコンテスト用のWebアプリケーションプラットフォームです。

## 主な機能

- 📸 **写真投稿**: 最大5枚の画像をアップロード可能
- ⭐ **投票機能**: ユーザーによる投票システム
- 🏆 **審査員評価**: 専門審査員によるスコアリング
- 🔐 **Google/Twitter OAuth認証**: 簡単ログイン（両方対応）
- 🐦 **Twitter自動取得**: ハッシュタグ付き投稿を自動でエントリー化
- 📊 **管理画面**: モデレーションとCSVエクスポート
- 🖼️ **自動画像処理**: サムネイル生成と最適化
- 🛡️ **モデレーション**: 自動＋手動のコンテンツ審査
- ⏰ **定期実行**: Celery Beat で Twitter 投稿を自動取得（デフォルトは 6 時間ごと。`CELERY_BEAT_SCHEDULE` で変更可）

## 技術スタック

### バックエンド
- Django 5.0
- Django REST Framework
- MySQL 8.0
- Redis
- Celery（画像処理タスク）
- Google OAuth 2.0

### フロントエンド
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- React Query
- Radix UI + Framer Motion

### インフラ
- Docker & Docker Compose（ローカル開発）
- GitHub Actions / GitLab CI（CI）
- 本番: Xserver VPS + Nginx + Gunicorn + systemd（推奨）

## 🚀 クイックスタート

```bash
# 1. リポジトリをクローン
git clone https://github.com/yourusername/photo_contest_platform.git
cd photo_contest_platform

# 2. 環境変数ファイル作成
cp .env.example .env
# 必要に応じて .env を編集

# 3. 起動
docker-compose up --build -d

# 4. 初期化
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# 完了！アクセス:
# フロントエンド: http://localhost:13000
# 管理画面: http://localhost:18000/admin
```

📖 **詳細**: [GETTING_STARTED.md](./docs/GETTING_STARTED.md)  
📚 **全ドキュメントの索引（正本）**: [docs/INDEX.md](./docs/INDEX.md)

## 開発

### バックエンド（Django）

```bash
cd backend

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# マイグレーション
python manage.py migrate

# 開発サーバー起動
python manage.py runserver 8080
```

### フロントエンド（Next.js）

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### Celeryワーカー（画像処理）

```bash
cd backend

# Celeryワーカー起動
celery -A config worker -l info

# Celery Beatスケジューラー（オプション）
celery -A config beat -l info
```

## テスト

### バックエンド

```bash
cd backend
pytest
pytest --cov  # カバレッジ付き
```

### フロントエンド

```bash
cd frontend
npm run lint
npm run type-check
npm run build
```

## デプロイ

本番は **さくら VPS** 等に MySQL・Redis・Nginx・Gunicorn・Next.js・（必要に応じて）Celery を載せる構成を推奨します。手順の全体像は次を参照してください。

📖 **メイン**: [docs/RENTAL_SERVER_DEPLOYMENT.md](./docs/RENTAL_SERVER_DEPLOYMENT.md)  
📖 **概要・環境変数・ストレージ**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

共有レンタルサーバー（PHP 専用プラン等）では要件を満たせないことが多いです。root で systemd / nginx を使える **VPS プラン**を選んでください。

### GitHub Actions

`.github/workflows/ci.yml` でテスト・Lint 等の CI が動きます。本番への反映は **サーバー上で `git pull` と systemd 再起動** 等の運用を想定しています。

## プロジェクト構造

```
photo_contest_platform/
├── backend/                # Djangoバックエンド
│   ├── config/            # Django設定
│   ├── accounts/          # ユーザー認証
│   ├── contest/           # コンテスト・エントリー
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Next.jsフロントエンド
│   ├── app/              # App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/              # ユーティリティ・API
│   ├── package.json
│   └── Dockerfile
├── docs/                  # 📚 ドキュメント（目次は INDEX.md）
│   ├── archive/          # 履歴・旧レポート
│   └── ...
├── deploy/                # 本番用 Nginx / systemd / Gunicorn テンプレート
├── scripts/               # 🛠️ ユーティリティスクリプト
│   ├── test_all.sh       # 全テスト実行
│   ├── test_backend.sh   # バックエンドテスト
│   ├── test_frontend.sh  # フロントエンドテスト
│   └── ...
├── .github/
│   └── workflows/        # GitHub Actions
├── docker-compose.yml
├── Makefile
└── README.md
```

📖 **詳細**: [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

## API仕様

### 主要エンドポイント

#### 認証
- `POST /api/auth/google/` - Google OAuth認証
- `GET /api/auth/twitter/login/` - Twitter OAuth認証（リダイレクト）
- `GET /api/users/me/` - 現在のユーザー情報

#### コンテスト
- `GET /api/contests/` - コンテスト一覧
- `GET /api/contests/{slug}/` - コンテスト詳細
- `GET /api/contests/{slug}/entries/` - エントリー一覧

#### エントリー
- `POST /api/entries/` - エントリー作成
- `GET /api/entries/{id}/` - エントリー詳細
- `POST /api/entries/{id}/vote/` - 投票
- `DELETE /api/entries/{id}/unvote/` - 投票取消
- `POST /api/entries/{id}/flag/` - 通報

#### 管理・審査
- `POST /api/entries/{id}/approve/` - 承認（モデレーター）
- `POST /api/entries/{id}/reject/` - 非承認（モデレーター）
- `POST /api/entries/{id}/judge_score/` - 審査員スコア
- `GET /api/entries/pending/` - 承認待ち一覧

## モデレーション

### 自動モデレーション

Celeryタスクで画像アップロード時に自動的に実行：
- 画像サイズチェック
- 不適切コンテンツ検出（外部API連携）
- サムネイル生成

### 手動モデレーション

管理画面またはモデレーションページで：
- エントリーの承認・非承認
- 通報の確認と対応
- ユーザーの権限管理

### Twitter投稿のモデレーション

Twitter経由のエントリーは、デフォルトで**未承認**状態で作成されます：
- 管理画面で内容を確認してから承認
- 自動承認も設定可能（推奨: OFF）
- 不適切な投稿は非承認または削除

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT License

## サポート

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

## Twitter連携機能（NEW！）

### ハッシュタグ自動取得

特定のハッシュタグ付きのツイートを自動的に取得してエントリーとして登録：

```bash
# コンテスト作成時にハッシュタグを設定
コンテスト管理画面 → Twitter連携
- Twitterハッシュタグ: フォトコンテスト
- Twitter自動取得: ✓
```

Celery Beat のスケジュール（デフォルトは 6 時間ごと）で自動実行され、新しいツイートをチェックします。間隔は `backend/config/settings.py` の `CELERY_BEAT_SCHEDULE` で変更できます。
- **重複なし**: `since_time` で前回取得時刻以降のみ取得
- **レート制限配慮**: 長めの間隔で API 利用を抑える設定になっている場合があります
- **初回取得**: コンテスト開始時刻から全ツイートを取得
- **API利用料**: 取得ツイート数で課金（新規投稿数に依存）

### 手動取得コマンド

```bash
# すべてのアクティブなコンテストで実行
docker-compose exec backend python manage.py fetch_twitter

# 特定のコンテストのみ
docker-compose exec backend python manage.py fetch_twitter --contest=contest-slug
```

詳細は[TWITTER_SETUP.md](./docs/TWITTER_SETUP.md)を参照してください。

## ロードマップ

- [x] Twitter OAuth認証
- [x] Twitter投稿の自動取得
- [ ] Instagram連携
- [ ] WebP/AVIF画像フォーマット対応
- [ ] リアルタイム通知（WebSocket）
- [ ] SNSシェア機能強化
- [ ] 多言語対応
- [ ] モバイルアプリ（React Native）
- [ ] 画像編集機能
- [ ] AIによる自動タグ付け

---

Powered by Django + Next.js ❤️

