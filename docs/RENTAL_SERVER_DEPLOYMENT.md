# さくら VPS へのデプロイ

本番運用の**推奨**は、**root 権限で systemd・Nginx を使える VPS** です。PHP 専用の**共有レンタルサーバー**では、Python 3.11・MySQL・Redis・常駐プロセス（Gunicorn / Celery / Node）を自由に動かせないことが多く、本スタックは事実上向きません。

想定環境: さくらの VPS（Ubuntu 22.04 LTS 以上）。他の VPS（ConoHa、AWS Lightsail 等）でも手順はほぼ同じです。

## アーキテクチャ概要

| コンポーネント | 役割 |
|----------------|------|
| **Nginx** | TLS 終端、リバースプロキシ、`/media/` `/static/` の静的配信 |
| **Gunicorn** | Django（WSGI） |
| **MySQL 8.0** | 本番 DB |
| **Redis** | Celery ブローカー・キャッシュ |
| **Celery worker / beat** | 非同期タスク・定期実行 |
| **Node.js** | `next build` -> `next start`（フロント） |

ドメイン例:

- API・管理画面: `api.example.com`
- フロント（Next.js）: `www.example.com` または `app.example.com`

## 1. サーバー準備

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential default-libmysqlclient-dev pkg-config \
  nginx redis-server mysql-server \
  git certbot python3-certbot-nginx python3-venv python3-pip
```

**Python**: 本番イメージは 3.11 系です。ディストリビューションに `python3.11` が無い場合は [deadsnakes PPA](https://launchpad.net/~deadsnakes/+archive/ubuntu/ppa) 等で入れるか、同等以上のバージョンで venv を作成してください。

**Node.js**: 22 系（[NodeSource](https://github.com/nodesource/distributions) 等）。`node -v` が 20 以上であることを確認してください。

## 2. MySQL

```bash
sudo mysql_secure_installation
```

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE contest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'contestuser'@'localhost' IDENTIFIED BY '強力なパスワード';
GRANT ALL PRIVILEGES ON contest.* TO 'contestuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

`DATABASE_URL` 例（同一ホスト）:

```text
mysql://contestuser:強力なパスワード@127.0.0.1:3306/contest
```

## 3. アプリの配置

例: デプロイユーザ `deploy`、アプリルート `/srv/photo_contest`。

```bash
sudo mkdir -p /srv/photo_contest && sudo chown deploy:deploy /srv/photo_contest
cd /srv/photo_contest
git clone <your-repo-url> .
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

本番用環境変数は `/etc/photo_contest.env` などにまとめ、`systemd` の `EnvironmentFile=` で読み込みます（`chmod 600` を推奨）。

最低限の変数（抜粋）:

```bash
DEBUG=False
SECRET_KEY=<ランダム長文>
DJANGO_SETTINGS_MODULE=config.settings
DATABASE_URL=mysql://contestuser:...@127.0.0.1:3306/contest
REDIS_URL=redis://127.0.0.1:6379/0
ALLOWED_HOSTS=api.example.com,www.example.com
CORS_ALLOWED_ORIGINS=https://www.example.com
CSRF_TRUSTED_ORIGINS=https://www.example.com,https://api.example.com
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
```

メディアをオブジェクトストレージに載せる場合は `USE_S3=True` および [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) 等を参照。ローカルディスクのみの場合はディスク容量とバックアップに注意してください。

## 4. Django 初期化

```bash
cd /srv/photo_contest/backend
source venv/bin/activate
set -a && source /etc/photo_contest.env && set +a
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## 5. systemd（サービス登録）

リポジトリの `deploy/systemd/` に `.service` ファイルのテンプレートが含まれています。これらを `/etc/systemd/system/` にコピーして使います。

```bash
sudo cp /srv/photo_contest/deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### バックエンド（Gunicorn）

```bash
sudo systemctl enable --now photo-contest-backend
```

Gunicorn の設定は `deploy/gunicorn.conf.py` にまとめています。ワーカー数やタイムアウトはここで調整してください。

### Celery（worker + beat）

```bash
sudo systemctl enable --now photo-contest-celery-worker
sudo systemctl enable --now photo-contest-celery-beat
```

Celery が不要な場合はこのステップをスキップしてください。

## 6. フロントエンド（Next.js）

```bash
cd /srv/photo_contest/frontend
npm ci --legacy-peer-deps
```

ビルド時に埋め込む公開変数:

```bash
export NEXT_PUBLIC_API_URL=https://api.example.com/api
export NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
npm run build
```

systemd で起動:

```bash
sudo systemctl enable --now photo-contest-frontend
```

## 7. Nginx

リポジトリの `deploy/nginx/` に設定テンプレートが含まれています。

```bash
sudo cp /srv/photo_contest/deploy/nginx/api.conf.example \
        /etc/nginx/sites-available/photo-contest-api
sudo cp /srv/photo_contest/deploy/nginx/frontend.conf.example \
        /etc/nginx/sites-available/photo-contest-frontend

# ドメイン名を自分の環境に合わせて編集
sudo nano /etc/nginx/sites-available/photo-contest-api
sudo nano /etc/nginx/sites-available/photo-contest-frontend

# 有効化
sudo ln -s /etc/nginx/sites-available/photo-contest-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/photo-contest-frontend /etc/nginx/sites-enabled/

# デフォルトサイトを無効化（任意）
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx
```

### SSL（Let's Encrypt）

```bash
sudo certbot --nginx -d api.example.com -d www.example.com
```

certbot は Nginx の設定に自動で HTTPS リダイレクトと証明書パスを追記します。

## 8. OAuth（Google / Twitter）

バックエンドのドメイン（例: `https://api.example.com`）をベースにコールバック URL を登録します。

- Google: `https://api.example.com/accounts/google/login/callback/`
- Twitter: `https://api.example.com/accounts/twitter_oauth2/login/callback/`

Django の **Sites** の `domain` を本番 API ホストに合わせる（管理画面または `scripts/update_site_domain.py`）。詳細は [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md) の手順を、ドメインだけ置き換えて適用してください。

## 9. デプロイ更新フロー

```bash
cd /srv/photo_contest && git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
cd ../frontend && npm ci --legacy-peer-deps && npm run build
sudo systemctl restart photo-contest-backend photo-contest-frontend photo-contest-celery-worker photo-contest-celery-beat
```

## 10. バックアップ

- MySQL: `mysqldump -u contestuser -p contest > backup_$(date +%Y%m%d).sql` を cron で取得
- `media/` ローカル利用時はファイル同期またはオブジェクトストレージ移行を検討

## 11. ファイアウォール

さくら VPS のパケットフィルタ、または `ufw` で以下のポートのみ許可:

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

MySQL (3306) や Redis (6379) は **外部に公開しないこと**。

## 関連ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) -- 概要・環境変数・ストレージ
- [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md) -- OAuth（ドメインを自環境に読み替え）
- [PORT_CONFIG.md](./PORT_CONFIG.md) -- ローカル開発時のポート
