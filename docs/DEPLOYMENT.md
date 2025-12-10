# デプロイメントガイド

このガイドでは、VRChatフォトコンテストプラットフォームをRenderにデプロイする手順を説明します。

## 概要

- **バックエンド**: Render Web Service (Docker)
- **フロントエンド**: Render Web Service (Docker) または Static Site
- **データベース**: Render PostgreSQL または外部MySQL
- **Redis**: Render Redis
- **ストレージ**: AWS S3 または Cloudflare R2

## 1. 事前準備

### 必要なアカウント
- [Render](https://render.com/)アカウント
- [AWS](https://aws.amazon.com/)アカウント（S3使用の場合）
- [Google Cloud](https://console.cloud.google.com/)アカウント（OAuth）

### リポジトリ
GitHubリポジトリを公開またはRenderに接続できる状態にしてください。

## 2. データベースのセットアップ

### オプション A: Render PostgreSQL（推奨）

1. Renderダッシュボードで「New PostgreSQL」を選択
2. 設定:
   - Name: `photo-contest-db`
   - Region: 最寄りのリージョン
   - Plan: Starter（無料）または有料プラン
3. 作成後、Internal Database URLをメモ

### オプション B: 外部MySQL

PlanetScaleやDigital OceanなどのMySQLサービスを使用できます。

## 3. Redisのセットアップ

1. Renderダッシュボードで「New Redis」を選択
2. 設定:
   - Name: `photo-contest-redis`
   - Region: データベースと同じリージョン
   - Plan: Starter（無料）または有料プラン
3. 作成後、Internal Redis URLをメモ

## 4. S3ストレージのセットアップ

### AWS S3の場合

1. S3バケットを作成
   - バケット名: `vrchat-photo-contest-media`
   - リージョン: 任意
   - パブリックアクセス: 一部許可（画像配信用）

2. IAMユーザーを作成
   - 権限: S3へのフルアクセス
   - アクセスキーとシークレットキーをメモ

3. CORS設定

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Cloudflare R2の場合

1. R2バケットを作成
2. API トークンを生成
3. エンドポイントURLをメモ

## 5. バックエンドのデプロイ

### 5.1 Render Web Service作成

1. Renderダッシュボードで「New Web Service」を選択
2. GitHubリポジトリを接続
3. 設定:

```yaml
Name: photo-contest-backend
Region: Singapore (または最寄り)
Branch: main
Root Directory: backend
Environment: Docker
Instance Type: Starter（または必要に応じて）
```

### 5.2 環境変数の設定

Renderの環境変数タブで以下を設定：

```bash
# Django
DEBUG=False
SECRET_KEY=<強力なランダム文字列>
ALLOWED_HOSTS=your-backend-url.onrender.com,your-frontend-url.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com

# Database (Render PostgreSQLの場合)
DATABASE_URL=<Render PostgreSQL Internal URL>

# Redis
REDIS_URL=<Render Redis Internal URL>

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=<your-google-client-id>
GOOGLE_OAUTH_CLIENT_SECRET=<your-google-client-secret>

# AWS S3
USE_S3=True
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_STORAGE_BUCKET_NAME=vrchat-photo-contest-media
AWS_S3_REGION_NAME=ap-northeast-1

# その他
DJANGO_SETTINGS_MODULE=config.settings
```

### 5.3 ビルドコマンドとスタートコマンド

Render.yamlを使用する場合（推奨）:

`render.yaml`をプロジェクトルートに作成:

```yaml
services:
  - type: web
    name: photo-contest-backend
    env: docker
    region: singapore
    plan: starter
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: photo-contest-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: photo-contest-redis
          property: connectionString
    healthCheckPath: /admin/

databases:
  - name: photo-contest-db
    region: singapore
    plan: starter

  - name: photo-contest-redis
    region: singapore
    plan: starter
```

## 6. Celeryワーカーのデプロイ

Celeryワーカーを別のBackground Workerとしてデプロイ:

1. 「New Background Worker」を選択
2. 同じリポジトリを接続
3. 設定:
   - Name: `photo-contest-celery`
   - Build Command: (空)
   - Start Command: `celery -A config worker -l info`
   - 環境変数: バックエンドと同じ

## 7. フロントエンドのデプロイ

### オプション A: Render Web Service（推奨）

1. 「New Web Service」を選択
2. 設定:

```yaml
Name: photo-contest-frontend
Region: Singapore
Branch: main
Root Directory: frontend
Environment: Docker
```

3. 環境変数:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
NODE_ENV=production
```

### オプション B: Vercel（代替案）

Next.jsアプリはVercelにデプロイすることもできます。

## 8. Google OAuthの更新

Google Cloud Consoleで認証情報を更新:

1. 承認済みのJavaScript生成元:
   - `https://your-frontend-url.onrender.com`

2. 承認済みのリダイレクトURI:
   - `https://your-frontend-url.onrender.com`
   - `https://your-backend-url.onrender.com/api/auth/google/callback/`

## 9. GitHub Actionsの設定

### 9.1 Renderデプロイフックの取得

1. Renderダッシュボードで各サービスの「Settings」
2. 「Deploy Hook」のURLをコピー

### 9.2 GitHubシークレットの設定

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で追加:

- `RENDER_API_KEY`: RenderのAPIキー
- `RENDER_SERVICE_ID`: RenderサービスID

## 10. 初回デプロイ後の設定

### 10.1 マイグレーション実行

Renderのシェルから:

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 10.2 静的ファイル収集

```bash
python manage.py collectstatic --noinput
```

## 11. ヘルスチェックとモニタリング

### ヘルスチェックエンドポイント

`backend/config/urls.py`に追加:

```python
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('health/', health_check),
    # ...
]
```

### Sentryの設定（推奨）

環境変数に追加:
```bash
SENTRY_DSN=<your-sentry-dsn>
```

## 12. パフォーマンス最適化

### CDNの設定

CloudflareをDNSプロキシとして使用:

1. Cloudflareアカウントでドメイン追加
2. DNSレコードを設定
3. SSL/TLSをFullに設定
4. キャッシュルールを設定

### 画像最適化

S3 + CloudFront または Cloudflare R2 + Workers を使用して画像配信を最適化

## 13. バックアップ戦略

### データベース

Render PostgreSQLは自動バックアップ機能があります。

手動バックアップ:
```bash
pg_dump -h <host> -U <user> -d <database> > backup.sql
```

### メディアファイル

S3のバージョニング機能を有効化するか、定期的にバックアップスクリプトを実行

## 14. トラブルシューティング

### ログの確認

```bash
# Renderダッシュボードの「Logs」タブで確認
# または
render logs -s <service-name>
```

### データベース接続エラー

- DATABASE_URLが正しく設定されているか確認
- データベースとバックエンドが同じリージョンにあるか確認

### 静的ファイルが表示されない

- `collectstatic`が実行されているか確認
- WhiteNoiseが正しく設定されているか確認

### Celeryタスクが実行されない

- Celeryワーカーが起動しているか確認
- Redis URLが正しいか確認

## 15. スケーリング

トラフィックが増加した場合:

1. Renderのインスタンスタイプをアップグレード
2. 水平スケーリング（複数インスタンス）
3. データベースのスケールアップ
4. CDNの活用
5. キャッシュ戦略の最適化

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

