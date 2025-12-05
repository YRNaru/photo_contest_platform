# Twitter OAuth 2.0 設定ガイド

## 概要

VRChat Photo Contest PlatformでTwitter認証を使用するための設定手順です。

## 前提条件

- Twitterアカウント（通常アカウント、開発者アカウント不要）
- Twitter Developer Portal へのアクセス

## ステップ1: Twitter Developer Portalでアプリを作成

### 1.1 Developer Portalにアクセス

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. Twitterアカウントでログイン
3. 初めての場合は利用規約に同意

### 1.2 新しいアプリを作成

1. 「Projects & Apps」→「Overview」をクリック
2. 「+ Create App」ボタンをクリック
3. アプリ名を入力（例: `VRChat Photo Contest - Dev`）
4. 「Next」をクリック

### 1.3 API KeyとSecretを取得

**重要**: この画面は一度しか表示されません！必ず保存してください。

- **API Key**: `xxxxxxxxxxxxxxxxxxxxx`
- **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

→ これらは後で使用するので、安全な場所に保存

## ステップ2: OAuth 2.0を設定

### 2.1 User authentication settingsを編集

1. アプリのダッシュボードで「Settings」タブをクリック
2. 「User authentication settings」の「Set up」をクリック

### 2.2 OAuth 2.0を有効化

**App permissions**:
- ✅ Read (読み取り権限)

**Type of App**:
- ✅ Web App, Automated App or Bot

**App info**:

| 項目 | 設定値 |
|------|--------|
| Callback URI / Redirect URL | `http://127.0.0.1:18000/accounts/twitter_oauth2/callback/` |
| Website URL | `https://example.com` （または任意のhttps URL） |

**重要な注意点**:
- ✅ Callback URIは `http://127.0.0.1:18000/accounts/twitter_oauth2/callback/` を使用
- ✅ Website URLは`localhost`を受け付けないため、仮のURL（`https://example.com`など）を入力
- ✅ 開発環境では実際にはCallback URIのみが重要

### 2.3 Client IDとClient Secretを取得

設定を保存すると、以下が表示されます：

- **Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxx`
- **Client Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

→ これらも安全な場所に保存

## ステップ3: 環境変数を設定

### 3.1 docker-compose.ymlを編集

`docker-compose.yml`のbackendサービスに以下の環境変数を追加：

```yaml
  backend:
    environment:
      # ... 既存の設定 ...
      - TWITTER_OAUTH_CLIENT_ID=あなたのClient ID
      - TWITTER_OAUTH_CLIENT_SECRET=あなたのClient Secret
```

### 3.2 フロントエンドでTwitterを有効化

`docker-compose.yml`のfrontendサービスに以下を追加：

```yaml
  frontend:
    environment:
      # ... 既存の設定 ...
      - NEXT_PUBLIC_TWITTER_ENABLED=true
```

### 3.3 完全な設定例

```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3"
    ports:
      - "18000:8000"
    environment:
      - DEBUG=True
      - DATABASE_URL=mysql://contestuser:contestpass@db:3306/contest
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key-change-in-production
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend
      - CORS_ALLOWED_ORIGINS=http://localhost:13000
      # Google OAuth
      - GOOGLE_OAUTH_CLIENT_ID=dummy-client-id-for-development
      - GOOGLE_OAUTH_CLIENT_SECRET=dummy
      # Twitter OAuth 2.0
      - TWITTER_OAUTH_CLIENT_ID=あなたのTwitter_Client_ID
      - TWITTER_OAUTH_CLIENT_SECRET=あなたのTwitter_Client_Secret

  frontend:
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:18000/api
      - NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy-client-id-for-development
      - NEXT_PUBLIC_TWITTER_ENABLED=true
      - NODE_ENV=development
```

## ステップ4: コンテナを再起動

```bash
cd /home/yamamoto/photo_contest_platform
docker compose down
docker compose up -d
```

## ステップ5: 動作確認

1. フロントエンドにアクセス: http://localhost:13000
2. 「ログイン」ボタンをクリック
3. 「Twitterでログイン」をクリック
4. Twitterの認証画面が表示されればOK
5. アプリへのアクセスを許可
6. ログイン完了

## トラブルシューティング

### エラー: "アプリにアクセスを許可できません"

**原因**: OAuth 2.0の設定が正しくない

**解決策**:
1. Twitter Developer Portalで「User authentication settings」を確認
2. Callback URIが正確に `http://localhost:18000/accounts/twitter_oauth2/callback/` になっているか確認
3. OAuth 2.0が有効になっているか確認

### エラー: "Callback URL not approved"

**原因**: Callback URLがアプリに登録されていない

**解決策**:
1. Developer Portalの「User authentication settings」を編集
2. Callback URI / Redirect URLに追加

### エラー: Page not found (404)

**原因**: バックエンドのURL設定が正しくない

**解決策**:
1. `backend/config/urls.py`に `path('accounts/', include('allauth.urls'))` が含まれているか確認
2. バックエンドを再起動

## 本番環境での設定

本番環境では、Callback URLを本番ドメインに変更してください：

```
Callback URI: https://your-domain.com/accounts/twitter_oauth2/callback/
Website URL: https://your-domain.com
```

また、環境変数は`.env`ファイルまたは環境変数として設定し、**絶対にGitにコミットしないでください**。

## セキュリティに関する注意

- ✅ Client SecretとAPI Secretは**絶対に公開しない**
- ✅ 本番環境では必ず環境変数として設定
- ✅ `.env`ファイルは`.gitignore`に追加
- ✅ 定期的にキーをローテーション

---

詳細は[Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)を参照してください。
