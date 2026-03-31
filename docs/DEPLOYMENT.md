# デプロイメントガイド

本番の**推奨手順**は、**レンタルサーバー（VPS）**上に Nginx・systemd・PostgreSQL・Redis を載せて運用することです。詳細は **[RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md)** を参照してください。

共有レンタルサーバー（PHP 専用プラン等）では、本プロジェクトの要件（Python 常駐、PostgreSQL、Redis、Celery、Node.js）を満たせないことが多いです。

## 概要

| 層 | 推奨 |
|----|------|
| **バックエンド** | Gunicorn + Django（`entrypoint.sh` または手動 migrate/collectstatic） |
| **フロントエンド** | `next build` → `next start`（同一 VPS または別サーバー） |
| **データベース** | 同一 VPS 上の PostgreSQL、またはマネージド PostgreSQL |
| **Redis** | 同一 VPS 上の `redis-server`、またはマネージド Redis |
| **メディア** | ローカルディスク（バックアップ必須）または S3 / Cloudflare R2（`USE_S3=True`） |

PaaS（Render 等）向けの旧手順は [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) に残しています（参考用）。

## 1. 事前準備

- VPS または同等の root / sudo 権限
- ドメイン（API 用・フロント用のサブドメイン分割を推奨）
- [Google Cloud](https://console.cloud.google.com/)（Google OAuth 利用時）
- [Twitter Developer Portal](https://developer.twitter.com/)（Twitter 利用時）
- メディアをクラウドに置く場合: [AWS S3](https://aws.amazon.com/s3/) または [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)

## 2. 環境変数（本番チェックリスト）

VPS では `/etc/photo_contest.env` 等に集約し、`systemd` の `EnvironmentFile=` で読み込む運用が扱いやすいです。

```bash
DEBUG=False
SECRET_KEY=<強力なランダム文字列>
DJANGO_SETTINGS_MODULE=config.settings
DATABASE_URL=postgresql://ユーザー:パス@127.0.0.1:5432/contest
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
ALLOWED_HOSTS=api.example.com,www.example.com
CORS_ALLOWED_ORIGINS=https://www.example.com

GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
TWITTER_OAUTH_CLIENT_ID=...
TWITTER_OAUTH_CLIENT_SECRET=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_BEARER_TOKEN=...
```

フロント（ビルド時に埋め込む）:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_TWITTER_ENABLED=true
NODE_ENV=production
```

### スーパーユーザー自動作成（任意）

[backend/entrypoint.sh](../backend/entrypoint.sh) 経由で起動する場合、以下で初回のみ作成できます。

```bash
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-secure-password
DJANGO_SUPERUSER_USERNAME=admin
```

## 3. オブジェクトストレージ（推奨: 本番）

ローカル `media/` のみだとディスク喪失・拡張に弱いため、本番では **S3 または R2** を検討してください。

- AWS S3: バケット作成、IAM、CORS（既存の S3 手順は旧版 [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) 内の JSON 例を参照可能）
- Cloudflare R2: [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md)（ダッシュボードの「Render」という表記は **本番サーバーの環境変数** に読み替えてください）

## 4. OAuth（本番 URL）

バックエンドの公開 URL（例: `https://api.example.com`）に合わせて、Google / Twitter のコールバック URI を登録します。Django **Sites** のドメインも一致させます。手順の詳細は [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md)（表記は Render 例が残る場合がありますが、URL を自ドメインに置き換えてください）。

## 5. デプロイ更新（VPS）

```bash
cd /srv/photo_contest && git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
cd ../frontend && npm ci --legacy-peer-deps && npm run build
sudo systemctl restart photo-contest-backend photo-contest-frontend
```

サービス名は [RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md) の例に合わせて調整してください。

## 6. ヘルスチェックとモニタリング

本番では `/admin/` や専用 `health/` エンドポイントで死活監視できます。ログは `journalctl -u photo-contest-backend -f` 等で確認します。

Sentry を使う場合は `SENTRY_DSN` を環境変数に設定します。

## 7. バックアップ

- **PostgreSQL**: `pg_dump` を定期実行
- **メディア**: S3/R2 の場合はプロバイダの仕様に従う。ローカルのみの場合はファイル同期またはスナップショット

## 8. トラブルシューティング

- **DB 接続**: `DATABASE_URL`、PostgreSQL の `listen_addresses` / `pg_hba.conf`
- **静的ファイル**: `collectstatic` と WhiteNoise（`USE_S3=False` 時）
- **Celery**: Redis 起動確認、`CELERY_BROKER_URL`、`ENABLE_CELERY` または別 unit で worker/beat が動いているか
- **CORS**: `CORS_ALLOWED_ORIGINS` にフロントのオリジン（スキーム付き）を列挙

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues) で報告してください。
