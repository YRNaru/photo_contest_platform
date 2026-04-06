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

# データベース（Compose 内はサービス名 db・ポート 3306）
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

### Twitter OAuth 2.0

ユーザーがTwitterアカウントでログインできるようにします。

#### 1. Twitter Developer Portalで設定

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. 「+ Create App」ボタンをクリック
3. アプリ名を入力（例: `VRChat Photo Contest`）

#### 2. User authentication settingsを設定

1. アプリの「Settings」タブ → 「User authentication settings」の「Set up」をクリック
2. 設定：
   - **App permissions**: Read または Read and write
   - **Type of App**: Web App, Automated App or Bot
   - **Callback URI**:
     ```
     http://localhost:18000/accounts/twitter_oauth2/login/callback/
     http://127.0.0.1:18000/accounts/twitter_oauth2/login/callback/
     ```
   - **Website URL**: `https://example.com`

⚠️ **重要**: Callback URIの末尾の `/` を忘れずに！

#### 3. データベースに設定

```bash
# スクリプトを使用（推奨）
docker-compose exec backend python manage.py shell -c "
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os

twitter_app, _ = SocialApp.objects.get_or_create(
    provider='twitter_oauth2',
    defaults={
        'name': 'Twitter OAuth2',
        'client_id': os.environ.get('TWITTER_OAUTH_CLIENT_ID'),
        'secret': os.environ.get('TWITTER_OAUTH_CLIENT_SECRET'),
    }
)
for site in Site.objects.all():
    twitter_app.sites.add(site)
print('✅ Twitter OAuth2設定完了')
"
```

#### 4. テスト

http://localhost:13000 で「ログイン」→「Twitterでログイン」をクリック

### Google OAuth 2.0

ユーザーがGoogleアカウントでログインできるようにします。

#### 1. Google Cloud Consoleで設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. **OAuth同意画面**を設定（外部ユーザー）
4. **認証情報**を作成：
   - タイプ: OAuth クライアントID
   - アプリケーションの種類: ウェブアプリケーション
   - **承認済みのリダイレクトURI**:
     ```
     http://localhost:18000/accounts/google/login/callback/
     http://127.0.0.1:18000/accounts/google/login/callback/
     ```

⚠️ **重要**: リダイレクトURIの末尾の `/` を忘れずに！

#### 2. データベースに設定

```bash
docker-compose exec backend python manage.py shell -c "
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os

google_app, _ = SocialApp.objects.get_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth2',
        'client_id': os.environ.get('GOOGLE_OAUTH_CLIENT_ID'),
        'secret': os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET'),
    }
)
for site in Site.objects.all():
    google_app.sites.add(site)
print('✅ Google OAuth2設定完了')
"
```

#### 3. テスト

http://localhost:13000 で「ログイン」→「Googleでログイン」をクリック

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

Celery Beat のスケジュールに従って自動実行されます（デフォルトは `settings.py` で **6 時間ごと**）。`since_time` で重複取得を排除します。間隔は `CELERY_BEAT_SCHEDULE` で変更できます。

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
✅ **本番デプロイ**: [RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md) / [DEPLOYMENT.md](./DEPLOYMENT.md)  
✅ **カスタマイズ**: コードを編集して機能追加  
✅ **Twitter自動取得**: ハッシュタグ投稿を自動収集  

---

## 📚 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [TWITTER_SETUP.md](./TWITTER_SETUP.md) - Twitter連携詳細
- [RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md) - 本番（VPS・推奨）
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 本番概要・環境変数
- [TESTING.md](./TESTING.md) - テストガイド
- [archive/ACHIEVEMENT.md](./archive/ACHIEVEMENT.md) - テスト品質達成記録（アーカイブ）
- [PORT_CONFIG.md](./PORT_CONFIG.md) - ポート設定
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 開発ガイドライン

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

