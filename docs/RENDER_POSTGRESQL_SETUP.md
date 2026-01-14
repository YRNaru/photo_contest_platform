# Render PostgreSQL セットアップ手順

## PostgreSQL作成手順

### 1. PostgreSQLサービスを作成

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com/ にログイン

2. **新規PostgreSQL作成**
   - 左メニューの「New +」をクリック
   - 「PostgreSQL」を選択

3. **基本設定**
   ```
   Name: photo-contest-db
   Database: contest
   User: contestuser
   Region: Singapore（推奨、アジアに近い）
   PostgreSQL Version: 16（最新）
   Instance Type: Free（開発/テスト用）
   ```

4. **作成実行**
   - 「Create Database」をクリック
   - 作成には1-2分かかります

### 2. Internal Database URLを取得

1. **PostgreSQLサービス画面を開く**
   - 作成した `photo-contest-db` をクリック

2. **接続情報を確認**
   - 「Info」タブまたは「Connections」タブを開く
   - **「Internal Database URL」** をコピー

   **形式:**
   ```
   postgresql://contestuser:xxxxx@dpg-xxxxx-xxxxx-a/contest_elqn
   ```

   ⚠️ **重要**: 
   - Renderの「Internal Database URL」はホスト名が不完全（`dpg-xxxxx-a`）な場合があります
   - **手動で完全なFQDNに修正する必要があります**
   - Internal Database URLのホスト名に `.singapore-postgres.render.com` を追加
   - 例: `dpg-xxxxx-a` → `dpg-xxxxx-a.singapore-postgres.render.com`
   - ポート番号（`:5432`）も追加が必要な場合があります

   **修正後の形式:**
   ```
   postgresql://contestuser:xxxxx@dpg-xxxxx-xxxxx-a.singapore-postgres.render.com:5432/contest_elqn
   ```

   **または、External Database URLを使用**（セキュリティリスクあり、推奨しない）

### 3. バックエンド環境変数を設定

1. **バックエンドWeb Serviceを開く**
   - `photo-contest-platform` サービスをクリック

2. **Environmentタブを開く**

3. **DATABASE_URLを追加/更新**
   ```
   KEY: DATABASE_URL
   VALUE: <ステップ2でコピーしたInternal Database URLを修正>
   ```

   **修正方法:**
   1. Internal Database URLをコピー: 
      ```
      postgresql://contestuser:xxxxx@dpg-xxxxx-a/contest_elqn
      ```
   2. ホスト名に `.singapore-postgres.render.com` を追加:
      ```
      postgresql://contestuser:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com/contest_elqn
      ```
   3. ポート番号（`:5432`）を追加（ない場合）:
      ```
      postgresql://contestuser:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com:5432/contest_elqn
      ```

4. **MySQL関連の環境変数を削除**（存在する場合）
   - `MYSQL_DATABASE`
   - `MYSQL_PASSWORD`
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_USER`

5. **保存**
   - 「Save Changes」をクリック
   - 自動的に再デプロイが開始されます

### 4. デプロイ確認

1. **ログを確認**
   - 「Logs」タブで以下を確認:
     ```
     ✅ "Database connection successful!"
     ✅ "Running migrations..." が成功
     ✅ "Your service is live 🎉"
     ```

2. **エラーがないか確認**
   - `connection to server at "localhost"` エラーが出ないこと
   - `psycopg2.OperationalError` が出ないこと

3. **動作確認**
   - https://photo-contest-platform.onrender.com にアクセス
   - 502エラーが出ないこと

## トラブルシューティング

### エラー: "connection to server at 'localhost' failed"

**原因:**
- `DATABASE_URL` 環境変数が設定されていない
- または、デフォルト値（localhost）が使われている

**解決策:**
1. 環境変数 `DATABASE_URL` が正しく設定されているか確認
2. Internal Database URLを使用しているか確認
3. 再デプロイを実行

### エラー: "could not translate host name 'dpg-xxxxx-a' to address: Name or service not known"

**原因:**
- Renderの「Internal Database URL」が不完全なホスト名（`dpg-xxxxx-a`）を提供している
- 完全なFQDN（`.singapore-postgres.render.com`）が必要

**解決策:**
1. RenderのPostgreSQLサービス画面で「Internal Database URL」をコピー
2. ホスト名に `.singapore-postgres.render.com` を手動で追加
   - 例: `dpg-xxxxx-a` → `dpg-xxxxx-a.singapore-postgres.render.com`
3. ポート番号（`:5432`）が含まれているか確認、なければ追加
4. 環境変数 `DATABASE_URL` を修正したURLに更新
5. 再デプロイを実行

**修正例:**
```
修正前: postgresql://contestuser:xxxxx@dpg-xxxxx-a/contest_elqn
修正後: postgresql://contestuser:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com:5432/contest_elqn
```

### エラー: "authentication failed"

**原因:**
- パスワードが間違っている
- External Database URLを使用している

**解決策:**
1. Internal Database URLを使用する
2. PostgreSQLサービスでパスワードを再生成（必要に応じて）

### エラー: "database does not exist"

**原因:**
- データベース名が間違っている

**解決策:**
1. PostgreSQL作成時の「Database」名を確認
2. `DATABASE_URL` の最後の部分（`/contest`）が正しいか確認

## セキュリティ注意事項

1. **Internal Database URLを使用**
   - Render内のサービス間通信のみ許可
   - 外部からの直接アクセスを防ぐ

2. **環境変数の保護**
   - `DATABASE_URL` は機密情報（パスワード含む）
   - Renderの環境変数は自動的に暗号化される

3. **本番環境では**
   - Freeプランではなく、Starter以上を使用推奨
   - 自動バックアップが有効

## 参考リンク

- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [Django Database Configuration](https://docs.djangoproject.com/en/5.0/ref/settings/#databases)
