# OAuth認証 トラブルシューティングガイド

本番環境でSocial login（Google, X/Twitter）が動作しない場合の対処法です。

## 🔍 問題の診断

### ステップ1: デプロイログを確認

Render.comのダッシュボード → **Logs** タブで以下を確認：

**正常なログ**:
```
Setting up OAuth from environment variables...
✅ Site updated: photo-contest-platform.onrender.com
✅ Google OAuth updated
✅ Twitter OAuth updated
✅ OAuth setup completed!
```

**エラーログの例**:
```
⚠️  GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET not set
⚠️  TWITTER_OAUTH_CLIENT_ID or TWITTER_OAUTH_CLIENT_SECRET not set
```

### ステップ2: Django管理画面で確認

1. `https://photo-contest-platform.onrender.com/admin/` にアクセス
2. スーパーユーザーでログイン
3. **Sites** → **Sites** でドメインを確認
4. **Social accounts** → **Social applications** でOAuth設定を確認

---

## 🐛 よくある問題と対処法

### 問題1: Server Error (500)

**症状**: Social loginボタンをクリックすると500エラー

**原因**:
1. 環境変数が未設定
2. SocialAppがデータベースに未設定
3. Siteが正しく設定されていない
4. SocialAppとSiteが関連付けられていない

**対処法**:

#### 1. 環境変数の確認

Render.comのダッシュボード → **Environment** タブで以下を確認：

- ✅ `FRONTEND_URL`
- ✅ `ALLOWED_HOSTS`
- ✅ `GOOGLE_OAUTH_CLIENT_ID`
- ✅ `GOOGLE_OAUTH_CLIENT_SECRET`
- ✅ `TWITTER_OAUTH_CLIENT_ID`
- ✅ `TWITTER_OAUTH_CLIENT_SECRET`

#### 2. バックエンドを再デプロイ

環境変数が設定されていれば、再デプロイ時に自動的にOAuth設定が実行されます。

1. Render.comのダッシュボードで **Manual Deploy** → **Clear build cache & deploy**
2. デプロイログで「✅ OAuth setup completed!」を確認

#### 3. Django管理画面で手動設定

自動設定が失敗した場合：

1. **Sites** → **Sites** → Site ID 1を編集
   - **Domain name**: `photo-contest-platform.onrender.com`
   - **Display name**: `VRChat Photo Contest (Production)`

2. **Social accounts** → **Social applications** → **Add social application**

   **Google**:
   - **Provider**: `Google`
   - **Client id**: 環境変数`GOOGLE_OAUTH_CLIENT_ID`の値
   - **Secret key**: 環境変数`GOOGLE_OAUTH_CLIENT_SECRET`の値
   - **Sites**: `photo-contest-platform.onrender.com`を選択

   **Twitter**:
   - **Provider**: `Twitter OAuth2`
   - **Client id**: 環境変数`TWITTER_OAUTH_CLIENT_ID`の値
   - **Secret key**: 環境変数`TWITTER_OAUTH_CLIENT_SECRET`の値
   - **Sites**: `photo-contest-platform.onrender.com`を選択

---

### 問題2: "The OAuth client was not found"

**症状**: Googleログイン時にこのエラーが表示される

**原因**: Client IDまたはClient Secretが間違っている

**対処法**:
1. Google Cloud Consoleで正しい値を確認
2. Render.comの環境変数を更新
3. バックエンドを再デプロイ
4. Django管理画面でSocialAppを更新

---

### 問題3: "Redirect URI mismatch"

**症状**: OAuth認証後にこのエラーが表示される

**原因**: リダイレクトURIがGoogle/Twitterに登録されていない

**対処法**:

#### Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. **APIとサービス** → **認証情報** → OAuth 2.0クライアントIDを選択
4. **承認済みのリダイレクトURI** に以下を追加：
   ```
   https://photo-contest-platform.onrender.com/accounts/google/login/callback/
   ```
   ⚠️ 末尾の `/` を必ず含める

#### Twitter Developer Portal
1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. アプリを選択
3. **Settings** → **User authentication settings** → **Edit**
4. **Callback URI / Redirect URL** に以下を追加：
   ```
   https://photo-contest-platform.onrender.com/accounts/twitter_oauth2/login/callback/
   ```
   ⚠️ 末尾の `/` を必ず含める

---

### 問題4: ログイン後、フロントエンドにリダイレクトされない

**症状**: OAuth認証は成功するが、フロントエンドに戻らない

**原因**: `FRONTEND_URL`環境変数が未設定または間違っている

**対処法**:
1. Render.comの環境変数で`FRONTEND_URL`を確認
2. 正しい値: `https://photo-contest-platform-1.onrender.com`
3. バックエンドを再デプロイ

---

### 問題5: CORSエラー

**症状**: ブラウザのコンソールにCORSエラーが表示される

**原因**: `CORS_ALLOWED_ORIGINS`にフロントエンドのURLが含まれていない

**対処法**:
1. Render.comの環境変数で`CORS_ALLOWED_ORIGINS`を確認
2. フロントエンドのURLを含める: `https://photo-contest-platform-1.onrender.com`
3. バックエンドを再デプロイ

---

## 📋 チェックリスト

問題が解決しない場合、以下を順番に確認：

- [ ] 環境変数がすべて設定されている
- [ ] バックエンドを再デプロイした
- [ ] デプロイログに「✅ OAuth setup completed!」が表示されている
- [ ] Django管理画面でSiteが正しく設定されている
- [ ] Django管理画面でSocialAppが設定されている
- [ ] SocialAppとSiteが関連付けられている
- [ ] Google Cloud ConsoleにリダイレクトURIが登録されている
- [ ] Twitter Developer PortalにリダイレクトURIが登録されている
- [ ] リダイレクトURIの末尾に`/`が含まれている
- [ ] `FRONTEND_URL`が正しく設定されている
- [ ] `CORS_ALLOWED_ORIGINS`にフロントエンドのURLが含まれている

---

## 🔗 関連ドキュメント

- [本番環境OAuth設定ガイド](./PRODUCTION_OAUTH_SETUP.md)
- [OAuth設定ガイド（開発環境）](./OAUTH_SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)

---

## 💡 ヒント

- デプロイログは常に最初に確認してください
- 環境変数の変更後は必ず再デプロイが必要です
- リダイレクトURIの末尾の`/`を忘れがちです
- Django管理画面から設定を確認・修正できます
