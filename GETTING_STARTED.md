# はじめに - セットアップガイド

VRChatフォトコンテストプラットフォームを5分で起動するガイドです。

## 📋 目次

1. [クイックスタート（5分）](#クイックスタート5分)
2. [認証設定（オプション）](#認証設定オプション)
3. [Twitter自動取得設定（オプション）](#twitter自動取得設定オプション)
4. [トラブルシューティング](#トラブルシューティング)

---

## クイックスタート（5分）

### 前提条件

- Docker Desktop インストール済み
- Git インストール済み

### 1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/photo_contest_platform.git
cd photo_contest_platform
```

### 2. 環境変数ファイルを作成

**認証なしで最速起動**:

```bash
cat > .env << 'EOF'
# Django基本設定
DEBUG=True
SECRET_KEY=demo-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SETTINGS_MODULE=config.settings

# データベース
DATABASE_URL=mysql://contestuser:contestpass@db:3306/contest

# Redis
REDIS_URL=redis://redis:6379/0

# CORS設定
CORS_ALLOWED_ORIGINS=http://localhost:13000

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# フロントエンド
NEXT_PUBLIC_API_URL=http://localhost:18000/api
NODE_ENV=development

# ダミー値（認証を使わない場合）
GOOGLE_OAUTH_CLIENT_ID=dummy
GOOGLE_OAUTH_CLIENT_SECRET=dummy

# その他
TZ=Asia/Tokyo
LANGUAGE_CODE=ja
EOF
```

### 3. Docker Composeで起動

```bash
# コンテナをビルドして起動
docker-compose up --build -d

# 起動を確認（すべてhealthyになるまで待つ）
docker-compose ps
```

### 4. データベース初期化

```bash
# マイグレーション実行
docker-compose exec backend python manage.py migrate

# 管理者ユーザー作成
docker-compose exec backend python manage.py createsuperuser
# メールアドレス: admin@example.com
# ユーザー名: admin
# パスワード: admin123（または任意）
```

### 5. アクセス確認

以下のURLにアクセス：

- **フロントエンド**: http://localhost:13000
- **管理画面**: http://localhost:18000/admin
- **API**: http://localhost:18000/api/contests/

### 6. サンプルコンテストを作成

```bash
docker-compose exec backend python manage.py shell
```

以下をコピペして実行：

```python
from contest.models import Contest
from django.utils import timezone
from datetime import timedelta

Contest.objects.create(
    slug='sample-2024',
    title='サンプルフォトコンテスト 2024',
    description='テスト用のコンテストです',
    start_at=timezone.now(),
    end_at=timezone.now() + timedelta(days=30),
    voting_end_at=timezone.now() + timedelta(days=45),
    is_public=True,
    max_entries_per_user=3,
    max_images_per_entry=5
)
print("✅ コンテスト作成完了")
exit()
```

🎉 **セットアップ完了！** http://localhost:13000 でアプリが使えます。

---

## 認証設定（オプション）

### Google OAuth 2.0

ユーザーがGoogleアカウントでログインできるようにします。

#### 1. Google Cloud Consoleで設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成
3. **OAuth同意画面**を設定：
   - ユーザータイプ: 外部
   - アプリ名: VRChat フォトコンテスト
   - スコープ: email, profile, openid

4. **認証情報**を作成：
   - タイプ: OAuth クライアントID
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのJavaScript生成元:
     ```
     http://localhost:13000
     ```
   - 承認済みのリダイレクトURI:
     ```
     http://localhost:13000
     http://localhost:13000/auth/callback
     ```

5. **Client ID**と**Client Secret**をコピー

#### 2. 環境変数に設定

`.env`ファイルを編集：

```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=123456789012-xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxx

# フロントエンド用
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789012-xxxxx.apps.googleusercontent.com
```

#### 3. 再起動

```bash
docker-compose restart backend frontend
```

#### 4. 動作確認

http://localhost:13000 で「ログイン」→「Googleでログイン」をクリック

✅ **詳細**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### Twitter OAuth 2.0

ユーザーがTwitterアカウントでログインできるようにします。

#### 1. Twitter Developer Portalで設定

1. [Twitter Developer Portal](https://developer.twitter.com/)にアクセス
2. アプリを作成
3. **User authentication settings**を設定：
   - App permissions: Read
   - Type: Web App
   - Callback URI: `http://localhost:13000/auth/twitter/callback`
   - Website URL: `http://localhost:13000`

4. **Client ID**と**Client Secret**をコピー

#### 2. 環境変数に設定

```bash
# Twitter OAuth
TWITTER_OAUTH_CLIENT_ID=your-client-id
TWITTER_OAUTH_CLIENT_SECRET=your-client-secret
```

#### 3. 再起動

```bash
docker-compose restart backend frontend
```

---

## Twitter自動取得設定（オプション）

ハッシュタグ付きツイートを自動でエントリーとして取得します。

### 1. Twitter API v2の認証情報を取得

Twitter Developer Portalで：

1. **Keys and tokens**タブ
2. 以下を生成/コピー：
   - API Key
   - API Secret
   - Bearer Token
   - Access Token
   - Access Token Secret

### 2. 環境変数に設定

```bash
# Twitter API v2
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token
```

### 3. コンテストで有効化

管理画面（http://localhost:18000/admin）で：

1. コンテストを編集
2. 「Twitter連携」セクション：
   - Twitterハッシュタグ: `フォトコンテスト`（#不要）
   - Twitter自動取得: ✓
   - Twitter投稿の自動承認: ☐（推奨：OFF）
3. 保存

### 4. 手動取得テスト

```bash
docker-compose exec backend python manage.py fetch_twitter
```

### 5. 自動実行

15分ごとに自動実行されます（Celery Beat）。

✅ **詳細**: [TWITTER_SETUP.md](./TWITTER_SETUP.md)

---

## トラブルシューティング

### ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :13000  # Frontend
lsof -i :18000  # Backend

# docker-compose.ymlでポート番号を変更
```

### データベース接続エラー

```bash
# DBの起動を待つ
docker-compose logs db

# ヘルスチェック確認
docker-compose ps
```

### フロントエンドが表示されない

```bash
# ログ確認
docker-compose logs frontend

# 再ビルド
docker-compose up --build frontend
```

### すべてリセット

```bash
# コンテナとボリュームを削除
docker-compose down -v

# 再起動
docker-compose up --build -d
```

---

## 便利なコマンド

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down

# ログ表示
docker-compose logs -f

# バックエンドシェル
docker-compose exec backend bash

# マイグレーション
docker-compose exec backend python manage.py migrate

# Twitter取得
docker-compose exec backend python manage.py fetch_twitter

# 再ビルド
docker-compose up --build
```

またはMakefileを使用：

```bash
make help        # すべてのコマンド表示
make up          # 起動
make logs        # ログ表示
make migrate     # マイグレーション
```

---

## 次のステップ

✅ **認証を設定**: Google/Twitter認証を有効化  
✅ **本番デプロイ**: [DEPLOYMENT.md](./DEPLOYMENT.md)参照  
✅ **カスタマイズ**: コードを編集して機能追加  
✅ **Twitter自動取得**: ハッシュタグ投稿を自動収集  

---

## 📚 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth詳細
- [TWITTER_SETUP.md](./TWITTER_SETUP.md) - Twitter連携詳細
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 本番環境デプロイ
- [PORT_CONFIG.md](./PORT_CONFIG.md) - ポート設定
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 開発ガイドライン

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

