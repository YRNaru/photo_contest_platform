# Xserver VPS で photo_contest_platform を動かす手順（備忘録）

本書は、**エックスサーバー VPS（Ubuntu 22.04）** 上に本リポジトリをデプロイした際の手順と、実際につまずいた点をまとめたものです。  
詳細な本番手順の正本は [docs/RENTAL_SERVER_DEPLOYMENT.md](docs/RENTAL_SERVER_DEPLOYMENT.md) です。

---

## 1. 前提

- **サーバー種別**: root・systemd・Nginx が使える VPS（共有レンタルサーバーでは不可）
- **OS イメージ**: **OS タブの Ubuntu 22.04 LTS**（アプリのプリセットではなく素の Ubuntu を推奨）
- **アプリ配置先の例**: `/srv/photo_contest`
- **IP だけで暫定公開する場合の例**:
  - フロント: `http://<グローバルIP>/`（Nginx **80**）
  - API: `http://<グローバルIP>:8080/`（Nginx **8080** ※フロントとポートを分ける）

---

## 2. SSH が「つながらない」とき（最初のつまずき）

### 現象

`ssh root@<IP>` が**何も返さず固まる**、または**タイムアウト**する。

### 原因

Xserver VPS の **パケットフィルター**が ON で、**許可ルールが空**のとき、**22 番もブロック**される。

### 対処

1. サーバーパネル → **パケットフィルター設定**
2. **フィルター: SSH / TCP 22 / 送信元は必要に応じて（まずは全て許可でも可）**
3. フォームを埋めただけでは反映されない。**必ず「追加する」**を押し、一覧にルールが出ることを確認する

### 補足

- `needrestart` の TUI（「Daemons using outdated libraries」）は **Space / Tab / Enter** で操作。**了解**で選んだサービスが再起動される。迷ったら後で `sudo reboot` でもよい。
- 初回接続のホスト鍵確認で `yes` と答える。

---

## 3. サーバー準備（パッケージ）

`docs/RENTAL_SERVER_DEPLOYMENT.md` の §1 に沿って進める。

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential default-libmysqlclient-dev pkg-config \
  nginx redis-server mysql-server \
  git certbot python3-certbot-nginx python3-venv python3-pip \
  software-properties-common
```

**Python 3.11**（Jammy ではデフォルトが 3.10 のため）:

```bash
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev
```

**Node.js 22**（NodeSource の手順に従い `node -v` で確認）。

---

## 4. デプロイユーザーとディレクトリ

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /srv/photo_contest
sudo chown deploy:deploy /srv/photo_contest
```

以降、`$APP_ROOT` を使うコマンドでは **事前に** `export APP_ROOT=/srv/photo_contest` するか、**パスを直書き**する（未設定だと空になりコピーや `cd` が壊れる）。

---

## 5. MySQL（`mysql_secure_installation` とユーザー作成）

### パスワード強度の選択

`0 = LOW, 1 = MEDIUM, 2 = STRONG` の質問では **数字 0 / 1 / 2 を入力**する（空 Enter などは `Invalid option` になる）。

### 推奨の答え方（例）

- 匿名ユーザー削除: **y**
- root のリモートログイン禁止: **y**（※これは **MySQL の root** の話で、**SSH の root とは別**）
- test データベース削除: **y**（本番想定なら）
- 権限テーブル再読込: **y**

### アプリ用ユーザー作成でつまずいた点

**MEDIUM/STRONG のとき**、`CREATE USER ... IDENTIFIED BY '...'` で

```text
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```

となる。**記号や複雑さが足りない**ことが多い。

**対処の例**:

```sql
SET GLOBAL validate_password.policy=LOW;
CREATE USER 'contestuser'@'localhost' IDENTIFIED BY '自分のパスワード';
GRANT ALL PRIVILEGES ON contest.* TO 'contestuser'@'localhost';
FLUSH PRIVILEGES;
```

**注意**: `CREATE USER` が失敗した状態で `GRANT` だけ実行すると

```text
ERROR 1410: You are not allowed to create a user with GRANT
```

のように見える。**必ずユーザー作成が成功してから `GRANT`**。

データベース作成（未実施なら）:

```sql
CREATE DATABASE contest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 6. リポジトリと Python venv

```bash
sudo -u deploy -H bash -c 'cd /srv/photo_contest && git clone <リポジトリURL> .'
sudo -u deploy -H bash -c 'cd /srv/photo_contest/backend && python3.11 -m venv venv && \
  source venv/bin/activate && pip install -U pip && pip install -r requirements.txt'
```

---

## 7. 本番環境変数 `/etc/photo_contest.env`

### 必ず自分で入れる値

- `SECRET_KEY` … `python3.11 -c "import secrets; print(secrets.token_urlsafe(50))"` などで生成（**生成した文字列を改変しない**。別のランダム文字列でよい）
- `DATABASE_URL` … `mysql://contestuser:<パスワード>@127.0.0.1:3306/contest`
- IP 暫定時: `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` / `CORS_ALLOWED_ORIGINS` を **実際のグローバル IP とポート**に合わせる

### `sudo tee <<EOF` の注意

- ヒアドキュメント内の **`${SERVER_IP}`** は、**コマンドを実行しているシェルで `export SERVER_IP=...` していないと空になる**。迷ったら **IP を直接書く**。
- `tee` のあと **`chmod 600 /etc/photo_contest.env`** を忘れない。

### つまずき: `deploy` が `source /etc/photo_contest.env` できない

ファイルが **`root` のみ読める（600）** のため、`sudo -u deploy ... source /etc/photo_contest.env` は **許可エラー**になる。

**systemd** の `EnvironmentFile=` は **root が読む**のでサービス自体は動くが、**手動で deploy がコマンドを打つとき**は次のいずれか。

1. **一時対応**: `sudo bash -c 'set -a && source /etc/photo_contest.env && ...'` で root 側が読む  
2. **継続対応（例）**:

```bash
sudo chgrp deploy /etc/photo_contest.env
sudo chmod 640 /etc/photo_contest.env
```

（`deploy` が読める。書き込みは root のみ。）

### `manage.py check --deploy` の WARNING

HTTP のみのとき、`SECURE_HSTS_SECONDS` / `SECURE_SSL_REDIRECT` 関連の **WARNING は想定内**。HTTPS 化するタイミングで Nginx または Django 側を調整する。

---

## 8. Django（migrate / collectstatic / superuser）

### `media` が無いエラー

初回、`chown` で `backend/media` が無いとエラーになる。

```bash
sudo mkdir -p /srv/photo_contest/backend/media
sudo chown -R deploy:deploy /srv/photo_contest/backend/staticfiles /srv/photo_contest/backend/media
```

### migrate / collectstatic

`deploy` が env を読めない間は **root で env を読んで実行**した例:

```bash
sudo bash -c 'cd /srv/photo_contest/backend && source venv/bin/activate && \
  set -a && source /etc/photo_contest.env && set +a && \
  python manage.py migrate --noinput && \
  python manage.py collectstatic --noinput'
```

その後、所有者を直す:

```bash
sudo chown -R deploy:deploy /srv/photo_contest/backend/staticfiles /srv/photo_contest/backend/media
```

### MySQL の警告 `models.W036`

`account.EmailAddress` の条件付き UNIQUE が MySQL で完全には作れないという **既知の警告**。多くの場合そのままでよい。

### `createsuperuser`

同様に env が読めない場合は root で:

```bash
sudo bash -c 'cd /srv/photo_contest/backend && source venv/bin/activate && \
  set -a && source /etc/photo_contest.env && set +a && \
  python manage.py createsuperuser'
```

---

## 9. Redis と systemd

```bash
sudo systemctl enable --now redis-server
sudo cp /srv/photo_contest/deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now photo-contest-backend
sudo systemctl enable --now photo-contest-celery-worker
sudo systemctl enable --now photo-contest-celery-beat
```

確認:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/health/
```

（200 なら Gunicorn まで届いている。）

Celery の `broker_connection_retry_on_startup` などの **警告は将来の Celery 6 向け**で、動作優先なら後回しでよい。

---

## 10. フロント（Next.js）ビルドとつまずき

### `NEXT_PUBLIC_API_URL` が空になる問題

`sudo -u deploy ... NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` としたとき、**root のシェルで `export` していないと中身が空**のままビルドされる。

**確実な方法**（IP・ポートは自分の環境に合わせる）:

```bash
sudo -u deploy -H bash -c 'cd /srv/photo_contest/frontend && npm ci --legacy-peer-deps && \
  NEXT_PUBLIC_API_URL=http://<グローバルIP>:8080/api \
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=<Google クライアントID> \
  NEXT_PUBLIC_TWITTER_ENABLED=false \
  npm run build'
```

### フロントの systemd 起動

```bash
sudo systemctl enable --now photo-contest-frontend
sudo systemctl status photo-contest-frontend --no-pager
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

---

## 11. Nginx（つまずきが多い箇所）

### 正しい状態の目安

- `sites-enabled` に **`photo-contest-api`** と **`photo-contest-frontend`** のシンボリックリンクがある
- **`default` は無効化**（`sites-enabled/default` を削除）してよい
- **API 用**: `listen 8080;` と `server_name <グローバルIP>;`（**80 のままだとフロントと競合**）
- **フロント用**: `listen 80;` と `server_name <グローバルIP>;`
- `alias` の `/srv/photo_contest/backend/staticfiles` 等は、配置先が同じならテンプレのままでよい

コピー例:

```bash
sudo cp /srv/photo_contest/deploy/nginx/api.conf.example /etc/nginx/sites-available/photo-contest-api
sudo cp /srv/photo_contest/deploy/nginx/frontend.conf.example /etc/nginx/sites-available/photo-contest-frontend
# nano 等で上記を編集
sudo ln -sf /etc/nginx/sites-available/photo-contest-api /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/photo-contest-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 確認コマンド

```bash
grep -E '^\s*(listen|server_name)\s' /etc/nginx/sites-available/photo-contest-api /etc/nginx/sites-available/photo-contest-frontend
ls -la /etc/nginx/sites-enabled/
sudo ss -tlnp | grep nginx
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/health/
```

### ポート 3000 について

Next のログに `Network: http://<IP>:3000` と出ることがある。**パケットフィルターで 3000 を開けなくてよい**（Nginx 80 経由で十分）。**わざわざ 3000 を開けると直アクセスされやすい**ので非推奨。

---

## 12. パケットフィルター（外から見えるようにする）

一覧に少なくとも次を入れる:

| 用途 | 設定の例 |
|------|-----------|
| SSH | プリセット **SSH**（TCP 22） |
| HTTP/HTTPS | プリセット **Web**（TCP 80 / 443） |
| API（8080） | **手動で設定** … TCP **単一ポート 8080** |

各ルールで **「追加する」** を押し、**一覧に行が増えたこと**を確認する。

### 疎通確認（ブラウザまたはローカル PC）

- `http://<グローバルIP>/` … フロント
- `http://<グローバルIP>:8080/health/` … 例: `{"status":"healthy","database":"connected"}`

**開けてはいけない例**: MySQL 3306、Redis 6379（外部公開しない）。

---

## 12.5 Django 管理画面（`/admin`）と CSRF 403

### URL

API を **8080** で出している構成では、管理画面は **ポート付き**で開く。

```text
http://<グローバルIP>:8080/admin/
```

（`http://<IP>/admin/` は Next.js 側になり 404 などになる。）

### 「CSRF 検証に失敗（403）」になる理由

本番（`DEBUG=False`）では、従来設定では **セッション／CSRF 用クッキーに `Secure` 属性**が付く。  
**HTTPS ではない HTTP** では、ブラウザはそのクッキーを**保存・送信しない**ため、ログインフォーム送信時に CSRF 検証が通らず 403 になる。

### 対処（HTTP の暫定運用のみ）

1. サーバーの `/etc/photo_contest.env` に **1 行追加**（または追記）:

   ```bash
   SESSION_CSRF_COOKIE_SECURE=False
   ```

2. バックエンドを再起動:

   ```bash
   sudo systemctl restart photo-contest-backend
   ```

3. ブラウザで **当該サイトのクッキーを削除**するかシークレットウィンドウで `http://<IP>:8080/admin/` を開き直し、再度ログインする。

**注意**: `SESSION_CSRF_COOKIE_SECURE=False` は **平文 HTTP 向けの妥協**である。**Let's Encrypt 等で HTTPS にしたら**、この行を**削除するか `True` に戻す**こと（未設定の本番デフォルトは従来どおり Secure 相当）。

リポジトリの `backend/config/settings.py` は、上記環境変数で本番時の Secure／SameSite を切り替えられるようになっている。

### `CSRF_TRUSTED_ORIGINS`

`http://<グローバルIP>,http://<グローバルIP>:8080` のように、**8080 のオリジンを含める**（既に [RENTAL_SERVER_DEPLOYMENT.md](docs/RENTAL_SERVER_DEPLOYMENT.md) の IP 暫定例どおりなら足りている）。

---

## 13. 環境変数の検証コマンド（変数の中身を晒さない）

```bash
sudo ls -l /etc/photo_contest.env
sudo grep -E '^[A-Za-z_][A-Za-z0-9_]*=' /etc/photo_contest.env | cut -d= -f1 | sort
sudo bash -c 'set -a && source /etc/photo_contest.env && set +a && \
  for v in DEBUG SECRET_KEY DJANGO_SETTINGS_MODULE DATABASE_URL REDIS_URL ALLOWED_HOSTS; do \
    val="${!v}"; \
    if [ -n "$val" ]; then echo "$v: OK (length ${#val})"; else echo "$v: EMPTY"; fi; \
  done'
```

**誤り**: `${#!v}` のような書き方は bash では使えない（**`${#val}`** に一度代入してから使う）。

---

## 14. セキュリティ（必読）

- **ターミナルログやチャットにクライアントシークレット・DB パスワード・Bearer トークン・SECRET_KEY を貼らない。** 漏れた場合は **Google / Twitter / DB パスワード / SECRET_KEY をすべて再発行・更新**する。
- `/etc/photo_contest.env` は **600 または 640（deploy 読み取り）** を維持する。
- 本番で HTTPS にしたら、[docs/PRODUCTION_OAUTH_SETUP.md](docs/PRODUCTION_OAUTH_SETUP.md) に沿って **OAuth コールバック URL を https に更新**する（IP の http だけではプロバイダが弾くことがある）。

---

## 15. 更新デプロイ（再掲）

[docs/RENTAL_SERVER_DEPLOYMENT.md](docs/RENTAL_SERVER_DEPLOYMENT.md) §9:

```bash
cd /srv/photo_contest && git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt && \
  python manage.py migrate --noinput && python manage.py collectstatic --noinput
cd ../frontend && npm ci --legacy-peer-deps && \
  NEXT_PUBLIC_API_URL=http://<IP>:8080/api NEXT_PUBLIC_GOOGLE_CLIENT_ID=... NEXT_PUBLIC_TWITTER_ENABLED=false \
  npm run build
sudo systemctl restart photo-contest-backend photo-contest-frontend photo-contest-celery-worker photo-contest-celery-beat
```

---

## 16. 関連ドキュメント

- [docs/RENTAL_SERVER_DEPLOYMENT.md](docs/RENTAL_SERVER_DEPLOYMENT.md) … 本番デプロイの正本
- [docs/PRODUCTION_OAUTH_SETUP.md](docs/PRODUCTION_OAUTH_SETUP.md) … OAuth
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) … 環境変数の概要
