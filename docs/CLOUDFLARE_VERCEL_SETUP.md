# 環境変数設定ガイド（Cloudflare R2 + Vercel）

このドキュメントは、Cloudflare R2とVercelを使用した本番環境の環境変数設定ガイドです。

## 📋 必須環境変数一覧

### Render（バックエンド）環境変数

```bash
# Django基本設定
DEBUG=False
SECRET_KEY=<ランダムな強力な文字列>
ALLOWED_HOSTS=photo-contest-platform.onrender.com,api.your-photocontest.com
DJANGO_SETTINGS_MODULE=config.settings

# データベース（RenderのPostgreSQLから自動取得）
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis（RenderのRedisから自動取得）
REDIS_URL=redis://host:6379/0
CELERY_BROKER_URL=redis://host:6379/0
CELERY_RESULT_BACKEND=redis://host:6379/0

# CORS設定（Vercelのフロントエンドを許可）
CORS_ALLOWED_ORIGINS=https://your-photocontest.com,https://www.your-photocontest.com

# CSRF設定
CSRF_TRUSTED_ORIGINS=https://photo-contest-platform.onrender.com,https://api.your-photocontest.com,https://your-photocontest.com

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxx

# Twitter OAuth & API
TWITTER_OAUTH_CLIENT_ID=xxxxx
TWITTER_OAUTH_CLIENT_SECRET=xxxxx
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_BEARER_TOKEN=xxxxx

# Cloudflare R2ストレージ
USE_S3=True
AWS_ACCESS_KEY_ID=<R2 Access Key ID>
AWS_SECRET_ACCESS_KEY=<R2 Secret Access Key>
AWS_STORAGE_BUCKET_NAME=photo-contest-media
AWS_S3_REGION_NAME=auto
AWS_S3_ENDPOINT_URL=https://xxxxx.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN=pub-xxxxx.r2.dev

# タイムゾーン
TZ=Asia/Tokyo

# JWT設定（オプション）
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Sentry（オプション）
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Vercel（フロントエンド）環境変数

```bash
# API URL（カスタムドメイン使用の場合）
NEXT_PUBLIC_API_URL=https://api.your-photocontest.com/api

# または Render URLを直接使用
NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api

# Google OAuth（フロントエンドでも必要）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Twitter機能
NEXT_PUBLIC_TWITTER_ENABLED=true

# 本番環境
NODE_ENV=production
```

## 🔧 設定手順

### 1. SECRET_KEYの生成

```bash
# ランダムなSECRET_KEYを生成
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. Cloudflare R2の設定取得

1. Cloudflare Dashboard → R2
2. バケット作成: `photo-contest-media`
3. API トークン管理 → API トークン作成
4. 以下の情報をコピー:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL
   - Public Bucket URL

### 3. Renderで環境変数を設定

1. Render Dashboard → サービス選択
2. Environment タブ
3. 上記の環境変数を追加
4. 「Save Changes」→ 自動再デプロイ

### 4. Vercelで環境変数を設定

1. Vercel Dashboard → プロジェクト選択
2. Settings → Environment Variables
3. 上記の環境変数を追加
4. Production, Preview, Development を選択
5. Save → 再デプロイ

## 🌐 Cloudflare DNS設定

### フロントエンド（Vercel）

```
Type: CNAME
Name: @ または www
Content: cname.vercel-dns.com
Proxy: DNS only（最初はグレー）
```

### バックエンドAPI（Render）

```
Type: CNAME
Name: api
Content: photo-contest-platform.onrender.com
Proxy: Proxied（オレンジ）
```

## 🔒 セキュリティ設定

### Cloudflare SSL/TLS設定

1. Cloudflare Dashboard → SSL/TLS
2. モード: Full (strict) を選択
3. Edge Certificates: 自動HTTPS書き換え ON

### Cloudflareセキュリティルール

1. Security → WAF
2. 推奨ルール:
   - Bot Fight Mode: ON
   - DDoS Protection: ON
   - Rate Limiting: APIエンドポイントに設定

### Cloudflare R2 CORS設定

R2バケットの設定でCORSポリシーを追加:

```json
[
  {
    "AllowedOrigins": [
      "https://your-photocontest.com",
      "https://www.your-photocontest.com",
      "https://api.your-photocontest.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 🎯 動作確認

### バックエンド確認

```bash
# ヘルスチェック
curl https://api.your-photocontest.com/admin/

# API確認
curl https://api.your-photocontest.com/api/contests/
```

### フロントエンド確認

```bash
# ブラウザでアクセス
https://your-photocontest.com

# 画像アップロードテスト
# ブラウザでエントリー投稿 → R2に画像が保存されるか確認
```

### R2ストレージ確認

```bash
# Cloudflare Dashboard → R2 → バケット
# アップロードされた画像ファイルが表示されるか確認
```

## 💰 コスト概算

### Cloudflare

- DNS: 無料
- CDN: 無料
- R2 Storage:
  - ストレージ: $0.015/GB/月（最初の10GB無料）
  - データ転送: 無料（最大の利点！）
  - Class A操作: $4.50/100万リクエスト
  - Class B操作: $0.36/100万リクエスト

### Vercel

- Hobby: $0/月（個人利用）
- Pro: $20/月（商用利用）

### Render

- PostgreSQL: $7/月〜
- Redis: $10/月〜
- Web Service: $7/月〜
- Background Worker: $7/月〜

**合計: 約$31〜/月 + Cloudflare R2使用量**

## 🔍 トラブルシューティング

### 画像がアップロードできない

1. R2のCORS設定を確認
2. 環境変数 `USE_S3=True` を確認
3. R2 API トークンの権限を確認
4. Renderのログで詳細エラーを確認

### Cloudflare DNSが反映されない

1. ネームサーバーが正しく設定されているか確認
2. 最大48時間待つ
3. `dig your-photocontest.com` でDNS確認

### CORS エラーが出る

1. `CORS_ALLOWED_ORIGINS` にVercelのURLが含まれているか
2. CloudflareのProxy設定を確認
3. ブラウザのコンソールでエラー詳細を確認

---

詳細は [docs/DEPLOYMENT.md](./DEPLOYMENT.md) も参照してください。

