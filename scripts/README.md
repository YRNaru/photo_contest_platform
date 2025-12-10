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

### create_twitter_app.py

Twitter OAuth2のSocialAppをデータベースに作成します。

**使用方法**:
```bash
docker-compose exec backend python /app/../scripts/create_twitter_app.py
```

または、環境変数から自動的に設定を読み込みます。

### set_google_oauth.py

Google OAuthの認証情報を更新します。

**使用方法**:
```bash
docker-compose exec backend python /app/../scripts/set_google_oauth.py "CLIENT_ID" "CLIENT_SECRET"
```

### update_google_oauth.sh

Google OAuth認証情報を対話的に更新するシェルスクリプト。

**使用方法**:
```bash
./scripts/update_google_oauth.sh
```

実行すると、Client IDとClient Secretの入力を求められます。

---

## 注意事項

- これらのスクリプトは初回設定時のみ使用します
- 本番環境では環境変数を使用してください
- Client SecretとAPI Secretは絶対に公開しないでください

