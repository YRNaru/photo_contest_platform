# ユーティリティスクリプト

このディレクトリには、OAuth認証の設定やテスト実行を簡単にするためのユーティリティスクリプトが含まれています。

## スクリプト一覧

### 🧪 テストスクリプト

#### test_all.sh

バックエンドとフロントエンドの全テストを実行します。

**使用方法**:
```bash
./scripts/test_all.sh
./scripts/test_all.sh --coverage  # カバレッジレポート付き
```

#### test_backend.sh

バックエンド（Django）のテストを実行します。

**使用方法**:
```bash
./scripts/test_backend.sh
./scripts/test_backend.sh --coverage  # カバレッジレポート付き
./scripts/test_backend.sh --verbose   # 詳細表示
./scripts/test_backend.sh --failed    # 前回失敗したテストのみ
```

#### test_frontend.sh

フロントエンド（Next.js）のテストを実行します。

**使用方法**:
```bash
./scripts/test_frontend.sh
./scripts/test_frontend.sh --coverage  # カバレッジレポート付き
./scripts/test_frontend.sh --watch     # ウォッチモード
```

### 🔐 OAuth設定スクリプト

#### 開発環境用

##### create_twitter_app.py

Twitter OAuth2のSocialAppをデータベースに作成します（開発環境向け）。

**使用方法**:
```bash
docker-compose exec backend python /app/../scripts/create_twitter_app.py
```

または、環境変数から自動的に設定を読み込みます。

##### set_google_oauth.py

Google OAuthの認証情報を更新します（開発環境向け）。

**使用方法**:
```bash
docker-compose exec backend python /app/../scripts/set_google_oauth.py "CLIENT_ID" "CLIENT_SECRET"
```

##### update_google_oauth.sh

Google OAuth認証情報を対話的に更新するシェルスクリプト（開発環境向け）。

**使用方法**:
```bash
./scripts/update_google_oauth.sh
```

実行すると、Client IDとClient Secretの入力を求められます。

#### 本番環境用

##### setup_production_oauth.py

本番環境のOAuth設定をデータベースに保存します。

**機能**:
- Django Siteを本番環境のドメインに設定
- Google OAuthの設定をデータベースに保存
- Twitter OAuthの設定をデータベースに保存
- SiteとSocialAppを関連付け

**使用方法**:
```bash
# Render.comのシェルで実行
python scripts/setup_production_oauth.py
```

**必要な環境変数**:
- `ALLOWED_HOSTS` - バックエンドのドメイン（カンマ区切り、`PRODUCTION_DOMAIN`が未設定の場合に使用）
- `GOOGLE_OAUTH_CLIENT_ID` - Google Cloud ConsoleのClient ID
- `GOOGLE_OAUTH_CLIENT_SECRET` - Google Cloud ConsoleのClient Secret
- `TWITTER_OAUTH_CLIENT_ID` - Twitter Developer PortalのClient ID
- `TWITTER_OAUTH_CLIENT_SECRET` - Twitter Developer PortalのClient Secret

##### check_oauth_config.py

OAuth設定の状態を確認し、問題を診断します。

**機能**:
- 環境変数の確認
- Django設定の確認
- Siteの確認
- SocialAppの確認
- CORS設定の確認
- 問題の診断

**使用方法**:
```bash
# ローカル環境
docker-compose exec backend python scripts/check_oauth_config.py

# 本番環境（Render.com）
python scripts/check_oauth_config.py
```

**出力例**:
```
✅ FRONTEND_URL: https://photo-contest-platform-1.onrender.com
✅ Google OAuth: 設定済み
✅ Twitter OAuth: 設定済み
✅ OAuth設定は正常です
```

---

---

## 注意事項

- 開発環境用スクリプトは初回設定時のみ使用します
- 本番環境では環境変数を使用してください
- Client SecretとAPI Secretは**絶対に公開しないでください**
- 本番環境でOAuth設定を変更した後は、必ずバックエンドを再起動してください

---

## 関連ドキュメント

- [OAuth設定ガイド（開発環境）](../docs/OAUTH_SETUP.md)
- [本番環境OAuth設定ガイド](../docs/PRODUCTION_OAUTH_SETUP.md)
- [デプロイメントガイド](../docs/DEPLOYMENT.md)

