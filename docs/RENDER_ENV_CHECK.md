# Render.com 環境変数設定チェックリスト

## 本番環境のCORSエラーを解決するために必要な設定

### 重要: 必ず以下の手順を実行してください

## 1. コードの変更をデプロイ

```bash
git push origin main
```

これにより、GitHub Actionsが自動的にRender.comへデプロイします。

## 2. バックエンド環境変数の確認・設定

Render.com ダッシュボード → Backend Service → Environment タブで以下を確認:

### 必須の環境変数

```bash
# デバッグモードを無効化（本番環境の設定を有効にする）
DEBUG=False

# シークレットキー（必ず変更してください）
SECRET_KEY=<本番用のランダムな文字列>

# データベースURL（Render.comが自動設定）
DATABASE_URL=<自動設定される>

# RedisURL（Render.comが自動設定）
REDIS_URL=<自動設定される>
```

### CORS関連（オプション、コードでデフォルト設定済み）

これらの環境変数は設定しなくてもコード内でデフォルト値が適用されます:

```bash
# 設定しない場合は、コード内のデフォルト値が使用される
# ALLOWED_HOSTS=photo-contest-platform.onrender.com
# CORS_ALLOWED_ORIGINS=https://photo-contest-platform-1.onrender.com
```

## 3. フロントエンド環境変数の確認・設定

### Render.comの場合

Render.com ダッシュボード → Frontend Service → Environment タブ:

```bash
# バックエンドAPIのURL
NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api

# Node環境
NODE_ENV=production
```

### Vercelの場合

Vercel ダッシュボード → Project Settings → Environment Variables:

```bash
# バックエンドAPIのURL
NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api

# Node環境（Vercelが自動設定）
NODE_ENV=production
```

## 4. デプロイの確認

### バックエンドの確認

1. Render.com ダッシュボード → Backend Service → Logs で確認:
   ```
   Looking for 'DEBUG' in logs - should show False
   Looking for 'CORS' in logs - should show allowed origins
   ```

2. APIエンドポイントにアクセス:
   ```
   https://photo-contest-platform.onrender.com/api/contests/
   ```
   - ブラウザで直接アクセスして、JSONレスポンスが返ることを確認

### フロントエンドの確認

1. Render.com/Vercel ダッシュボード → Frontend Service → Environment で確認:
   ```
   NEXT_PUBLIC_API_URL が正しく設定されているか確認
   ```

2. ビルドログを確認:
   ```
   Environment variables が正しく読み込まれているか確認
   ```

3. フロントエンドにアクセス:
   ```
   https://photo-contest-platform-1.onrender.com
   ```
   - ブラウザのDevTools (F12) → Console でCORSエラーが出ないことを確認
   - Network タブで API リクエストが成功 (200 OK) することを確認

## 5. デプロイ手順

### 手動デプロイ

#### バックエンド
1. Render.com ダッシュボードを開く
2. Backend Service を選択
3. 環境変数を確認・設定
4. 「Manual Deploy」→「Deploy latest commit」をクリック
5. デプロイログで成功を確認

#### フロントエンド
1. Render.com/Vercel ダッシュボードを開く
2. Frontend Service を選択
3. 環境変数を確認・設定
4. 「Manual Deploy」または「Redeploy」をクリック
5. ビルドログで成功を確認

### 自動デプロイ

GitHub に push すれば、GitHub Actions が自動的にデプロイします:

```bash
git push origin main
```

## トラブルシューティング

### CORSエラーが続く場合

1. **バックエンドの DEBUG 環境変数を確認**
   ```
   DEBUG=False になっているか確認
   ```

2. **バックエンドのログを確認**
   ```
   Render.com → Backend Service → Logs
   "CORS_ALLOWED_ORIGINS" を検索して、フロントエンドURLが含まれているか確認
   ```

3. **フロントエンドの環境変数を確認**
   ```
   NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api
   ```

4. **ブラウザのキャッシュをクリア**
   ```
   DevTools (F12) → Application → Clear storage
   または Ctrl+Shift+R で強制リロード
   ```

5. **両方のサービスを再デプロイ**
   - バックエンドを先にデプロイ
   - 完了後、フロントエンドをデプロイ

### 400 Bad Request エラーが出る場合

1. **バックエンドのログを確認**
   ```
   Render.com → Backend Service → Logs
   エラーメッセージの詳細を確認
   ```

2. **データベースの状態を確認**
   ```
   マイグレーションが完了しているか確認
   ```

3. **API エンドポイントを直接テスト**
   ```bash
   curl https://photo-contest-platform.onrender.com/api/contests/
   ```

## チェックリスト

- [ ] コードをGitHubにプッシュ済み
- [ ] バックエンドの環境変数設定済み（DEBUG=False）
- [ ] バックエンドのデプロイ成功
- [ ] フロントエンドの環境変数設定済み
- [ ] フロントエンドのデプロイ成功
- [ ] ブラウザでCORSエラーが出ないことを確認
- [ ] APIリクエストが成功することを確認

## 参考リンク

- [PRODUCTION_CORS_FIX.md](./PRODUCTION_CORS_FIX.md) - 詳細な修正内容
- [Render.com 環境変数設定](https://render.com/docs/environment-variables)
- [Vercel 環境変数設定](https://vercel.com/docs/concepts/projects/environment-variables)
