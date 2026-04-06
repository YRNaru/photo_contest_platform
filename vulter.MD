# Vultr VPS デプロイ完全ガイド
**参照元：** [はる@フルスタックチャンネル](https://zenn.dev/hathle) (Zenn)

**対象リソース：**
| タイトル | URL |
|----------|-----|
| Next.js を VPS(Vultr) にデプロイする方法 | https://zenn.dev/hathle/articles/nextjs-vultr-deploy |
| Django VPS デプロイ方法（無料本） | https://zenn.dev/hathle/books/django-vultr-book |
| Django を AWS EC2 にデプロイする方法（同著者・同構成） | https://zenn.dev/hathle/articles/django-ec2-deploy |

> **注記：** Django Vultr 本の各章はJS動的レンダリングのため直接取得できなかったが、同著者が公開している「Django EC2 デプロイ方法」記事は完全に同一の構成・手順であるため、その内容をVultr向けに統合した。

---

## 目次

**【共通手順】**
1. [Vultr とは](#1-vultr-とは)
2. [事前準備（アカウント・SSH・ファイアウォール）](#2-事前準備)
3. [サーバー構築](#3-サーバー構築)
4. [サーバー初期設定（ユーザー作成・sudo権限）](#4-サーバー初期設定)
5. [ミドルウェアのインストール](#5-ミドルウェアのインストール)
6. [データベース設定（PostgreSQL）](#6-データベース設定postgresql)

**【Django デプロイ】**
7. [Python 環境構築（pyenv・仮想環境）](#7-python-環境構築)
8. [Django アプリのデプロイ](#8-django-アプリのデプロイ)
9. [Nginx 設定（Django 向け）](#9-nginx-設定django-向け)
10. [Gunicorn の起動と systemd サービス化](#10-gunicorn-の起動と-systemd-サービス化)
11. [Celery（非同期処理）の設定](#11-celery非同期処理の設定)

**【Next.js デプロイ】**
12. [Node.js・pm2 のインストール](#12-nodejs--pm2-のインストール)
13. [Next.js アプリのデプロイ（Prisma・PostgreSQL）](#13-nextjs-アプリのデプロイ)
14. [Nginx 設定（Next.js 向け）](#14-nginx-設定nextjs-向け)

**【共通：自動デプロイ・公開設定】**
15. [GitHub Actions による自動デプロイ](#15-github-actions-による自動デプロイ)
16. [ドメイン設定と HTTPS 化](#16-ドメイン設定と-https-化)
17. [サブドメイン設定](#17-サブドメイン設定)
18. [Redis のインストール（オプション）](#18-redis-のインストール)
19. [トラブルシューティング](#19-トラブルシューティング)

---

## 1. Vultr とは

Vultr（バルチャー）は、VPS（仮想プライベートサーバー）を提供するクラウドインフラサービス。

### 主な特徴

| 特徴 | 内容 |
|------|------|
| **価格** | 低価格プランあり（$6/月〜）。スモールスタートに最適 |
| **リージョン** | 世界中にDCを保有。**東京リージョンあり** |
| **OS サポート** | Ubuntu / Debian / CentOS / Fedora / Windows など多数 |
| **管理画面** | 直感的なダッシュボード。数クリックでサーバー作成可能 |
| **API** | 自動化スクリプト対応の API を提供 |
| **スケーラビリティ** | CPU / RAM / ストレージを必要に応じてアップグレード可能 |

### 主な用途

- Webアプリケーションのホスティング（Next.js / Django など）
- 開発・テスト環境の構築
- VPN / セキュリティサーバー
- ゲームサーバー

### Vultr を使うメリット

- 数分でサーバーを立ち上げられ、素早くプロジェクトを開始できる
- 小規模から始めて、必要に応じてリソースを増やせるコスト効率
- OS やアプリケーションを自由に選べる柔軟性

---

## 2. 事前準備

### 2-1. Vultr アカウント登録

1. https://www.vultr.com にアクセスし、アカウントを作成
2. クレジットカードを登録（登録しただけでは課金されない）
3. メールアドレスの認証を完了する

### 2-2. SSH キーの作成（ローカル）

SSH 鍵ペアを作成し、公開鍵を Vultr に登録することで、パスワード不要の安全なサーバー接続が可能になる。

```bash
# SSH キー生成
ssh-keygen -t rsa -b 4096 -C "your_email@gmail.com"

# 公開鍵を表示してコピー
cat ~/.ssh/id_rsa.pub
```

### 2-3. SSH キーを Vultr に登録

Vultr 管理画面の SSH Keys ページ（`https://my.vultr.com/sshkeys/manage/?id=new`）にコピーした公開鍵を貼り付けて登録する。

### 2-4. ファイアウォール設定

管理画面（`https://my.vultr.com/firewall/add/`）で以下のポートを開放する。

| ポート | 用途 |
|--------|------|
| 22 | SSH 接続 |
| 80 | HTTP 通信 |
| 443 | HTTPS 通信 |
| 5432 | PostgreSQL（必要な場合） |

---

## 3. サーバー構築

Vultr 管理画面の `Deploy > Deploy New Server` からサーバーを作成する。

### 推奨設定

| 項目 | 推奨値 |
|------|--------|
| **Server Type** | Cloud Compute |
| **Location** | Tokyo（日本ユーザーの場合） |
| **OS** | Ubuntu 22.04 LTS |
| **Plan** | 2GB RAM / 1 vCPU（$12/月）以上 |
| **SSH Key** | 上記で登録した SSH キーを選択 |
| **Firewall** | 上記で作成したファイアウォールグループを選択 |

設定後、`Deploy Now` をクリック。

---

## 4. サーバー初期設定

### 4-1. root でログイン

```bash
ssh root@<サーバーのIPアドレス>
```

### 4-2. 一般ユーザーの作成

セキュリティ上、root ユーザーでの運用は避ける。

```bash
# ユーザー作成
adduser haruyasu

# sudo 権限を付与
gpasswd -a haruyasu sudo

# 作成したユーザーに切り替え
su haruyasu
```

### 4-3. パッケージの更新

```bash
sudo apt update
sudo apt upgrade
```

---

## 5. ミドルウェアのインストール

### Nginx・PostgreSQL のインストール

```bash
sudo apt install nginx postgresql postgresql-contrib -y
```

### UFW ファイアウォールの許可

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

> ✅ この時点で `http://<サーバーIP>` にアクセスし「Welcome to nginx!」が表示されることを確認。

---

## 6. データベース設定（PostgreSQL）

```bash
sudo -u postgres psql
```

```sql
-- データベース作成
CREATE DATABASE myproject;

-- ユーザー作成
CREATE USER myuser WITH PASSWORD 'password';

-- 文字コードの設定（日本語対応）
ALTER ROLE myuser SET client_encoding TO 'utf8';

-- トランザクション分離レベルの設定
ALTER ROLE myuser SET default_transaction_isolation TO 'read committed';

-- タイムゾーン設定（日本時間）
ALTER ROLE myuser SET timezone TO 'UTC+9';

-- 権限付与
GRANT ALL PRIVILEGES ON DATABASE myproject TO myuser;

-- スキーマ権限付与
\c myproject
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;

\q
```

> **ポイント：** `UTF-8` を設定することで日本語などのマルチバイト文字を正しく扱える。

---

## 7. Python 環境構築

### 7-1. pyenv で Python バージョン管理

```bash
# pyenv のインストール
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
exec "$SHELL"

# 依存パッケージのインストール
sudo apt update
sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

# Python のインストール（バージョンは適宜変更）
pyenv install 3.11.8
pyenv global 3.11.8
python -V
```

### 7-2. 必要パッケージのインストール

```bash
sudo apt install nginx python3-pip python3-dev python3-venv libpq-dev
sudo -H pip3 install --upgrade pip
```

---

## 8. Django アプリのデプロイ

### 8-1. リポジトリのクローン

```bash
git clone https://github.com/your-username/myproject.git
cd myproject

# リモートを SSH に変更（GitHub Actions 連携に必要）
git remote set-url origin git@github.com:your-username/myproject.git

# 本番用ブランチに切り替え（必要な場合）
git checkout release/production
```

### 8-2. 環境変数の設定

```bash
nano .env
```

```env
POSTGRES_NAME=myproject
POSTGRES_USER=myuser
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost

SECRET_KEY=your_django_secret_key
DEBUG=False

# AWS S3 を使う場合（オプション）
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_STORAGE_BUCKET_NAME=xxxx
```

### 8-3. 仮想環境の構築とセットアップ

```bash
# 仮想環境の作成と有効化
python -m venv venv
source venv/bin/activate

# 依存パッケージのインストール
pip3 install --upgrade pip setuptools
pip3 install -r requirements.txt

# 静的ファイルの収集
python manage.py collectstatic

# マイグレーション
python manage.py migrate

# スーパーユーザーの作成
python manage.py createsuperuser
```

> **注意：** static ファイルを `/usr/share/nginx/html/static` に配置する場合は sudo 権限で実行する。
> ```bash
> sudo pip3 install django
> sudo python manage.py collectstatic
> ```

---

## 9. Nginx 設定（Django 向け）

```bash
sudo nano /etc/nginx/sites-available/myproject
```

```nginx
server {
    listen 80;
    server_name <サーバーIPまたはドメイン>;
    client_max_body_size 10g;

    # 静的ファイルの配信
    location /static {
        alias /usr/share/nginx/html/static;
    }

    location /media {
        alias /usr/share/nginx/html/media;
    }

    # Gunicorn へのリバースプロキシ
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# シンボリックリンクを作成して有効化
sudo ln -s /etc/nginx/sites-available/myproject /etc/nginx/sites-enabled/

# 設定の確認と反映
sudo nginx -t
sudo systemctl restart nginx
```

> ✅ この時点で IP アドレスにアクセスし「502 Bad Gateway」が表示されることを確認（Gunicornがまだ起動していないため正常）。

### （必要に応じて）nginx.conf の上限設定

```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
http {
    client_max_body_size 10g;
    ...
}
```

---

## 10. Gunicorn の起動と systemd サービス化

### 10-1. 動作確認

```bash
# runserver で確認（開発用）
python manage.py runserver 0.0.0.0:8000

# Gunicorn で確認（本番用）
gunicorn --bind 127.0.0.1:8000 mysite.wsgi:application
```

### 10-2. systemd サービスの作成

Gunicorn をサービスとして登録することで、サーバー再起動時の自動起動やコマンドによる管理が簡単になる。

```bash
sudo nano /etc/systemd/system/myproject.service
```

```ini
[Unit]
Description=gunicorn
After=network.target

[Service]
User=haruyasu
Group=www-data
WorkingDirectory=/home/haruyasu/myproject
ExecStart=/home/haruyasu/myproject/venv/bin/gunicorn \
    --access-logfile - \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    mysite.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 10-3. サービスの起動・管理コマンド

```bash
sudo systemctl start myproject     # 起動
sudo systemctl restart myproject   # 再起動
sudo systemctl stop myproject      # 停止
sudo systemctl status myproject    # 状態確認
```

---

## 11. Celery（非同期処理）の設定

Django で非同期タスク（メール送信など）を処理する場合に使用する。

### 11-1. Celery サービスの作成

```bash
sudo nano /etc/systemd/system/celery.service
```

```ini
[Unit]
Description=Celery Service
After=network.target

[Service]
User=haruyasu
Group=www-data
WorkingDirectory=/home/haruyasu/myproject

PermissionsStartOnly=true
ExecStartPre=/bin/mkdir -p /var/log/celery
ExecStartPre=/bin/chown haruyasu:haruyasu /var/log/celery
ExecStartPre=/bin/chmod 755 /var/log/celery
ExecStartPre=/bin/mkdir -p /var/run/celery
ExecStartPre=/bin/chown haruyasu:haruyasu /var/run/celery
ExecStartPre=/bin/chmod 755 /var/run/celery

ExecStart=/home/haruyasu/myproject/venv/bin/celery \
    -A config worker -l info \
    --pidfile=/var/run/celery/%n.pid \
    --logfile=/var/log/celery/%n.log \
    --concurrency=4
ExecStop=/home/haruyasu/myproject/venv/bin/celery multi stopwait worker \
    -A config --pidfile=/var/run/celery/%n.pid
ExecReload=/home/haruyasu/myproject/venv/bin/celery \
    -A config worker -l info \
    --pidfile=/var/run/celery/%n.pid \
    --logfile=/var/log/celery/%n.log \
    --concurrency=4

Restart=on-failure
IgnoreSIGPIPE=no
KillMode=process
GuessMainPID=no
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

### 11-2. ログディレクトリの作成

```bash
sudo mkdir /var/log/celery
sudo chown -R haruyasu:haruyasu /var/log/celery
sudo chmod -R 755 /var/log/celery

sudo mkdir /var/run/celery
sudo chown -R haruyasu:haruyasu /var/run/celery
sudo chmod -R 755 /var/run/celery
```

### 11-3. Celery の操作コマンド

```bash
sudo systemctl start celery    # 起動
sudo systemctl restart celery  # 再起動
sudo systemctl stop celery     # 停止

# ログ確認
cat /var/log/celery/celery.service.log
```

---

## 12. Node.js・pm2 のインストール

Next.js のデプロイに必要。nvm 経由でインストールする。

```bash
# nvm のインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# LTS バージョンの Node.js をインストール
nvm install --lts
node -v

# npm と pm2 のインストール
sudo apt install -y npm
sudo npm install -g pm2
```

---

## 13. Next.js アプリのデプロイ

### 13-1. リポジトリのクローン

```bash
git clone https://github.com/your-username/myproject.git
cd myproject

# リモートを SSH に変更
git remote set-url origin git@github.com:your-username/myproject.git

# 本番用ブランチに切り替え（必要な場合）
git checkout release/production
```

### 13-2. 環境変数の設定

```bash
nano .env
```

```env
DATABASE_URL=postgresql://myuser:password@localhost:5432/myproject?schema=public
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://<サーバーIP>
NEXT_PUBLIC_APP_URL=http://<サーバーIP>
```

### 13-3. ビルドと起動

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# pm2 でアプリを起動（プロセス管理）
pm2 start 'npm start' --name app
pm2 log
```

> ✅ この時点で `http://<サーバーIP>` にアクセスし、Next.js アプリが表示されることを確認。

### pm2 操作コマンド

```bash
pm2 list           # 起動中のプロセス一覧
pm2 log            # ログの確認
pm2 restart app    # アプリの再起動
pm2 del app        # アプリの削除
```

---

## 14. Nginx 設定（Next.js 向け）

```bash
sudo nano /etc/nginx/conf.d/myproject.conf
```

```nginx
server {
    listen 80;
    server_name <サーバーIPまたはドメイン>;
    client_max_body_size 10g;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 15. GitHub Actions による自動デプロイ

### 15-1. サーバー側：デプロイ用 SSH キーの作成

```bash
# サーバー上で SSH キーを生成
ssh-keygen -t rsa -b 4096 -C "your_email@gmail.com"

# 公開鍵を authorized_keys に登録
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

### 15-2. GitHub：Deploy Keys の登録

GitHub リポジトリの `Settings > Deploy keys` に `~/.ssh/id_rsa.pub` の内容を登録する。  
**これをしないと `git pull` が失敗する。**

### 15-3. GitHub：Secrets の設定

`Settings > Secrets and variables > Actions` に以下を登録する。

| キー名 | 値 |
|--------|----|
| `VULTR_HOST` | サーバーのIPアドレス |
| `VULTR_USERNAME` | ログインユーザー名（例：`haruyasu`） |
| `VULTR_SSH_KEY` | `cat ~/.ssh/id_rsa` の出力内容（秘密鍵全体） |

> ⚠️ `VULTR_SSH_KEY` は `-----BEGIN OPENSSH PRIVATE KEY-----` から `-----END OPENSSH PRIVATE KEY-----` まで含めてコピーする。

### 15-4a. GitHub Actions ワークフロー（Next.js）

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Vultr Production

on:
  push:
    branches:
      - release/production

jobs:
  build-and-deploy:
    name: Build and Deploy to Vultr
    runs-on: ubuntu-22.04

    steps:
    - name: Checkout to the branch
      uses: actions/checkout@v2

    - name: Deploy to Vultr
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VULTR_HOST }}
        username: ${{ secrets.VULTR_USERNAME }}
        key: ${{ secrets.VULTR_SSH_KEY }}
        script: |
          ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
          cd /home/haruyasu/myproject
          git pull
          npm install
          npx prisma migrate deploy
          npm run build
          pm2 del app
          pm2 start 'npm start' --name app
        ssh_args: '-o StrictHostKeyChecking=no'
```

### 15-4b. GitHub Actions ワークフロー（Django）

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Vultr Production

on:
  push:
    branches:
      - release/production

jobs:
  build-and-deploy:
    name: Build and Deploy to Vultr
    runs-on: ubuntu-22.04

    steps:
    - name: Checkout to the branch
      uses: actions/checkout@v2

    - name: Deploy to Vultr
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VULTR_HOST }}
        username: ${{ secrets.VULTR_USERNAME }}
        key: ${{ secrets.VULTR_SSH_KEY }}
        script: |
          ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
          cd /home/haruyasu/myproject
          git pull
          source venv/bin/activate
          pip install -r requirements.txt
          python manage.py migrate
          python manage.py collectstatic --noinput
          sudo systemctl restart myproject
          sudo systemctl restart celery
        ssh_args: '-o StrictHostKeyChecking=no'
```

---

## 16. ドメイン設定と HTTPS 化

### 16-1. 必要なパッケージのインストール

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
# または
sudo apt-get install letsencrypt
```

### 16-2. DNS レコードの設定

ドメインレジストラ（お名前.com など）の管理画面で設定する。

| 設定項目 | 値 |
|----------|----|
| **A レコード** | ドメイン（`example.com`）→ サーバーのIPアドレス |
| **ネームサーバー1** | `ns1.vultr.com` |
| **ネームサーバー2** | `ns2.vultr.com` |

> DNS の反映には最大 24〜48 時間かかる。[Google Toolbox Dig](https://toolbox.googleapps.com/apps/dig/) で確認推奨。

### 16-3. SSL 証明書の取得（Let's Encrypt）

```bash
# Nginx プラグインを使う方法（推奨）
sudo certbot --nginx -d example.com

# standalone モードを使う方法
sudo systemctl stop nginx
sudo letsencrypt certonly --standalone -d example.com
```

### 16-4. Nginx 設定（HTTPS 対応・Next.js 用）

```bash
sudo nano /etc/nginx/conf.d/example.conf
```

```nginx
# HTTP → HTTPS リダイレクト
server {
    listen 80;
    server_name example.com;
    client_max_body_size 10g;

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 設定
server {
    listen 443 ssl;
    server_name example.com;
    client_max_body_size 10g;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 16-5. Nginx 設定（HTTPS 対応・Django 用）

```nginx
# HTTP → HTTPS リダイレクト
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 設定
server {
    listen 443 ssl;
    server_name example.com;
    client_max_body_size 10g;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location /static {
        alias /usr/share/nginx/html/static;
    }

    location /media {
        alias /usr/share/nginx/html/media;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl restart myproject   # Django の場合
```

### 16-6. 環境変数の更新（Next.js の場合）

```bash
nano .env
```

```env
NEXTAUTH_URL=https://example.com
NEXT_PUBLIC_APP_URL=https://example.com
```

### 16-7. 再ビルドと再起動

**Next.js の場合：**
```bash
npm run build
pm2 del app
pm2 start 'npm start' --name app
```

**Django の場合：**
```bash
sudo systemctl restart myproject
```

### 16-8. SSL 証明書の自動更新設定

#### 方法A：更新スクリプト + Cron

```bash
sudo nano /usr/local/bin/renew-letsencrypt.sh
```

```bash
#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

certbot renew --standalone \
  --pre-hook "systemctl stop nginx" \
  --post-hook "systemctl start nginx"
```

```bash
sudo chmod +x /usr/local/bin/renew-letsencrypt.sh

# Cron ジョブ（毎月1日 午前5時）
sudo nano /etc/crontab
```

```cron
0 5 1 * * root /usr/local/bin/renew-letsencrypt.sh
```

```bash
# 動作確認
sudo /usr/local/bin/renew-letsencrypt.sh
```

#### 方法B：crontab に直接記述

```bash
sudo crontab -e
```

```cron
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
HOME=/
00 05 01 * * sudo systemctl stop nginx; sudo letsencrypt renew; sudo systemctl start nginx
```

---

## 17. サブドメイン設定

### 17-1. DNS レコードの設定

ドメインレジストラでサブドメインの A レコードを追加する。  
例：`sub.example.com` → サーバーのIPアドレス

### 17-2. SSL 証明書の取得（サブドメイン）

```bash
sudo systemctl stop nginx
sudo letsencrypt certonly --standalone -d sub.example.com

# ポートの競合確認（必要に応じて）
sudo lsof -i :80
sudo kill -9 [PID]
```

### 17-3. Nginx 設定（サブドメイン用）

```bash
sudo nano /etc/nginx/conf.d/subexample.conf
```

```nginx
server {
    listen 80;
    server_name sub.example.com;
    client_max_body_size 10g;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sub.example.com;
    client_max_body_size 10g;

    ssl_certificate /etc/letsencrypt/live/sub.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sub.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl start nginx
```

---

## 18. Redis のインストール

Django で Celery を使う場合や、キャッシュ用途に Redis をインストールする。

```bash
sudo apt install redis-server
sudo nano /etc/redis/redis.conf
```

`supervised` を `systemd` に変更する：

```
# 変更前
supervised no

# 変更後
supervised systemd
```

```bash
sudo systemctl restart redis.service
sudo systemctl status redis

# 動作確認
redis-cli
> ping
PONG
```

---

## 19. トラブルシューティング

### Nginx のエラーログを確認

```bash
sudo tail -f /var/log/nginx/error.log
```

### アプリが正常に動いているか確認

```bash
# Next.js が 3000 番で動いているか確認
curl http://127.0.0.1:3000

# Django が 8000 番で動いているか確認
curl http://127.0.0.1:8000

# Nginx 再起動
sudo systemctl restart nginx
```

### 502 Bad Gateway が出る場合

| 原因 | 対処法 |
|------|--------|
| アプリが起動していない | `pm2 list` または `systemctl status myproject` で確認 |
| ポートが合っていない | Nginx の `proxy_pass` の番号を確認（Next.js: 3000、Django: 8000） |
| Gunicorn が落ちている | `sudo systemctl restart myproject` で再起動 |

### Celery のログ確認

```bash
cd /var/log/celery
cat celery.service.log
```

### コード変更後の手動再起動（Django）

```bash
sudo systemctl restart myproject
sudo systemctl restart celery
```

---

## アーキテクチャ概要

```
Internet
   │
   ▼
[Nginx :80/:443]    ← SSL終端・静的ファイル配信・リバースプロキシ
   │
   ├─ Django ──▶ [Gunicorn :8000]  ← WSGIサーバー
   │                  │
   └─ Next.js ──▶ [pm2 / Node :3000] ← プロセスマネージャー
                       │
                       ▼
              [Django / Next.js アプリ]
                       │
                       ▼
              [PostgreSQL :5432]    ← データベース
                       │（オプション）
              [Redis]              ← キャッシュ・Celeryブローカー
                       │
              [Celery]             ← 非同期タスク処理（Djangoのみ）
```

---

## 参考リンク

| リソース | URL |
|----------|-----|
| Zenn 記事（Next.js + Vultr） | https://zenn.dev/hathle/articles/nextjs-vultr-deploy |
| Zenn 本（Django + Vultr） | https://zenn.dev/hathle/books/django-vultr-book |
| Zenn 記事（Django + EC2・同構成） | https://zenn.dev/hathle/articles/django-ec2-deploy |
| フルスタックチャンネル（YouTube） | https://www.youtube.com/@fullstackchannel |
| フルスタックチャンネル（公式サイト） | https://www.fullstackchannel.com/ |
| Vultr 公式 | https://www.vultr.com |
| nvm（Node.js バージョン管理） | https://github.com/nvm-sh/nvm |
| pyenv（Python バージョン管理） | https://github.com/pyenv/pyenv |