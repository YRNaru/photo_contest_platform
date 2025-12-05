# Django設定
DEBUG=True
SECRET_KEY=demo-secret-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SETTINGS_MODULE=config.settings

# データベース
DATABASE_URL=mysql://contestuser:contestpass@db:3306/contest

# Redis
REDIS_URL=redis://redis:16379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:13000

# Google OAuth（使用する場合は実際の値に変更）
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret

# Twitter OAuth（使用する場合は実際の値に変更）
TWITTER_OAUTH_CLIENT_ID=your-twitter-oauth-client-id
TWITTER_OAUTH_CLIENT_SECRET=your-twitter-oauth-client-secret

# Twitter API v2
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# ストレージ
USE_S3=False

# Celery
CELERY_BROKER_URL=redis://redis:16379/0
CELERY_RESULT_BACKEND=redis://redis:16379/0

# フロントエンド
NEXT_PUBLIC_API_URL=http://localhost:18000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
NEXT_PUBLIC_TWITTER_ENABLED=true
NODE_ENV=development

# その他
TZ=Asia/Tokyo
LANGUAGE_CODE=ja
EOF