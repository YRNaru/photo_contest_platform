# 環境変数の設定

このプロジェクトでは、機密情報を環境変数で管理しています。

## セットアップ手順

1. `.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

2. `.env`ファイルを編集して、実際の認証情報を設定：

### Google OAuth の設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」に移動
4. 「OAuth 2.0 クライアント ID」を作成
5. 承認済みのリダイレクト URI を設定：
   - `http://localhost:18000/api/auth/google/callback/`
6. クライアントIDとクライアントシークレットを`.env`ファイルに設定：
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`（フロントエンド用）

### Twitter OAuth 2.0 の設定

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. アプリを作成
3. OAuth 2.0設定で以下を設定：
   - Type of App: Web App
   - Callback URI: `http://localhost:18000/api/auth/twitter/callback/`
4. クライアントIDとクライアントシークレットを`.env`ファイルに設定：
   - `TWITTER_OAUTH_CLIENT_ID`
   - `TWITTER_OAUTH_CLIENT_SECRET`

### Twitter API v2 の設定

1. 同じTwitter Developer Portalで
2. 「Keys and tokens」タブから以下を取得：
   - API Key
   - API Secret Key
   - Bearer Token
3. `.env`ファイルに設定：
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_BEARER_TOKEN`

### その他の設定

- `SECRET_KEY`: Django用のシークレットキー（本番環境では必ず変更）
- `MYSQL_PASSWORD`: MySQLのパスワード（必要に応じて変更）

## 注意事項

- `.env`ファイルは`.gitignore`に含まれており、Gitリポジトリにコミットされません
- 機密情報は決して`docker-compose.yml`や他の設定ファイルに直接記載しないでください
- 本番環境では、より強固なシークレットキーやパスワードを使用してください

