# プロジェクト構造

VRChat Photo Contest Platformのディレクトリ構造とファイルの説明です。

## 📁 ルートディレクトリ

```
photo_contest_platform/
├── backend/              # Djangoバックエンド
├── frontend/             # Next.jsフロントエンド
├── scripts/              # ユーティリティスクリプト
├── docs/                 # 詳細ドキュメント
├── docker-compose.yml    # Docker構成
├── .gitignore           # Git除外設定
├── Makefile             # 便利コマンド
└── README.md            # プロジェクト概要
```

## 📄 主要ドキュメント

| ファイル | 説明 |
|---------|------|
| `README.md` | プロジェクト概要とクイックスタート |
| `GETTING_STARTED.md` | 詳細セットアップガイド（5分で起動） |
| `ENV_TEMPLATE.md` | 環境変数テンプレート |
| `DEPLOYMENT.md` | 本番環境デプロイガイド |
| `CONTRIBUTING.md` | 開発ガイドライン |
| `PORT_CONFIG.md` | ポート設定 |
| `TWITTER_SETUP.md` | Twitter API v2連携（ツイート自動取得） |
| `docs/OAUTH_SETUP.md` | OAuth認証設定（Twitter/Google） |
| `docs/PROJECT_STRUCTURE.md` | このファイル |

## 🔧 scripts/ ディレクトリ

OAuth認証の初期設定を簡単にするユーティリティスクリプト

| スクリプト | 説明 |
|-----------|------|
| `create_twitter_app.py` | Twitter OAuth2のSocialAppを作成 |
| `set_google_oauth.py` | Google OAuth認証情報を更新 |
| `update_google_oauth.sh` | Google OAuth対話的更新スクリプト |

## 🎨 backend/ ディレクトリ

```
backend/
├── accounts/              # ユーザー認証・管理
│   ├── models.py         # Userモデル
│   ├── views.py          # API & プロフィールビュー
│   ├── serializers.py    # DRFシリアライザー
│   ├── adapter.py        # カスタムSocialAccountAdapter
│   └── urls.py           # URLルーティング
├── contest/              # コンテスト・エントリー
│   ├── models.py         # Contest, Entry, Vote等
│   ├── views.py          # コンテストAPI
│   ├── serializers.py    # シリアライザー
│   ├── tasks.py          # Celeryタスク
│   └── management/       # カスタムコマンド
├── config/               # Django設定
│   ├── settings.py       # メイン設定
│   ├── urls.py           # URLルート
│   └── celery.py         # Celery設定
├── templates/            # Djangoテンプレート
│   ├── base.html         # ベーステンプレート
│   ├── account/          # ログイン・サインアップ
│   └── socialaccount/    # ソーシャル認証
├── media/                # アップロードファイル
├── staticfiles/          # 静的ファイル
├── requirements.txt      # Python依存関係
└── manage.py            # Djangoマネジメント
```

## 🌐 frontend/ ディレクトリ

```
frontend/
├── app/                  # Next.js 15 App Router
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   ├── profile/          # プロフィールページ
│   ├── contests/         # コンテスト一覧・詳細
│   ├── submit/           # エントリー投稿
│   └── auth/             # 認証コールバック
├── components/           # Reactコンポーネント
│   ├── Header.tsx        # ヘッダー
│   ├── LoginButton.tsx   # ログインボタン
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ
│   ├── api.ts            # APIクライアント
│   ├── auth.ts           # 認証ストア (Zustand)
│   ├── types.ts          # TypeScript型定義
│   └── utils.ts          # ヘルパー関数
├── package.json          # Node依存関係
└── tailwind.config.js    # Tailwind設定
```

## 🔑 重要な設定ファイル

### backend/config/settings.py

主要な設定項目：

- **データベース**: MySQLdb4対応（絵文字サポート）
- **CORS**: フロントエンド許可設定
- **OAuth**: Twitter/Google認証設定
- **JWT**: SimpleJWT設定
- **Celery**: 非同期タスク設定

### frontend/lib/api.ts

APIクライアント設定：

- Axios インスタンス
- JWT自動付与
- トークンリフレッシュ

### backend/accounts/adapter.py

カスタムSocialAccountAdapter：

- 既存アカウント自動連携
- ログイン済みユーザーへの自動接続
- 重複メールアドレスの処理

## 🚀 主要な機能実装

### OAuth認証フロー

1. ユーザーがログインボタンをクリック
2. バックエンドのOAuthエンドポイントにリダイレクト
3. Twitter/Google認証画面
4. 認証完了後、コールバック
5. カスタムアダプターが既存アカウントをチェック
6. JWTトークン生成
7. フロントエンドのプロフィールページにリダイレクト
8. トークンをlocalStorageに保存
9. ユーザー情報とソーシャルアカウント情報を表示

### 自動アカウント連携

- **未ログイン＋既存メールアドレス**: 自動接続してログイン
- **ログイン済み**: 新しいソーシャルアカウントを現在のユーザーに接続
- **新規ユーザー**: 新しいアカウントを作成

## 📝 開発時のよくある作業

### マイグレーション作成・適用

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### スーパーユーザー作成

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Twitterツイート取得

```bash
docker-compose exec backend python manage.py fetch_twitter
```

### ログ確認

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### コンテナ再起動

```bash
docker-compose restart backend
docker-compose restart frontend
```

---

詳細は各ディレクトリのREADMEを参照してください。

