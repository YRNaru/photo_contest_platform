# 本番環境 OAuth設定ガイド

本番環境で Google / Twitter OAuth を設定する手順です。例として `https://api.example.com`（バックエンド）と `https://www.example.com`（フロント）を使います。実際のドメインに置き換えてください。VPS 全体の手順は [RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md) を参照してください。

## 📋 目次

1. [環境変数の設定](#環境変数の設定)
2. [OAuth設定スクリプトの実行](#oauth設定スクリプトの実行)
3. [リダイレクトURIの登録](#リダイレクトuriの登録)
4. [トラブルシューティング](#トラブルシューティング)

---

## 環境変数の設定

### 本番サーバーで環境変数を設定

1. 本番サーバーの環境変数（EnvironmentFile 等）を編集
2. バックエンドサービスを選択
3. **Environment** タブをクリック
4. 以下の環境変数を追加：

```bash
# 必須
FRONTEND_URL=https://www.example.com
PRODUCTION_DOMAIN=api.example.com

# Google OAuth（Google Cloud Consoleから取得）
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Twitter OAuth（Twitter Developer Portalから取得）
TWITTER_OAUTH_CLIENT_ID=your-twitter-client-id
TWITTER_OAUTH_CLIENT_SECRET=your-twitter-client-secret
```

### 環境変数の説明

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `FRONTEND_URL` | フロントエンドのURL（プロトコル含む） | `https://www.example.com` |
| `ALLOWED_HOSTS` | バックエンドのドメイン（カンマ区切り） | `api.example.com` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud ConsoleのクライアントID | `123456789-abc...apps.googleusercontent.com` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Cloud Consoleのクライアントシークレット | `GOCSPX-...` |
| `TWITTER_OAUTH_CLIENT_ID` | Twitter Developer PortalのClient ID | `abc123...` |
| `TWITTER_OAUTH_CLIENT_SECRET` | Twitter Developer PortalのClient Secret | `xyz789...` |

---

## OAuth設定の実行

### 方法1: 自動設定（推奨）

環境変数が設定されていれば、**バックエンドの起動時に自動的にOAuth設定が行われます**。

`entrypoint.sh`に`setup_oauth_from_env`コマンドが追加されており、以下の処理が自動実行されます：

- ✅ Django Siteを本番環境のドメインに設定
- ✅ Google OAuthの設定をデータベースに保存
- ✅ Twitter OAuthの設定をデータベースに保存
- ✅ SiteとSocialAppを関連付け

**手順**:
1. 環境変数を設定（上記参照）
2. バックエンドを再デプロイ
3. デプロイログで「✅ OAuth setup completed!」を確認

### 方法2: Django管理画面から手動設定

自動設定が失敗した場合や、手動で確認・修正したい場合は、Django管理画面から設定できます。

#### ステップ1: 管理画面にアクセス

```
https://api.example.com/admin/
```

スーパーユーザーでログイン（環境変数`DJANGO_SUPERUSER_EMAIL`と`DJANGO_SUPERUSER_PASSWORD`で作成されます）

#### ステップ2: Siteの設定

1. **Sites** → **Sites** をクリック
2. Site ID 1を選択
3. 以下を設定：
   - **Domain name**: `api.example.com`
   - **Display name**: `VRChat Photo Contest (Production)`
4. **保存**をクリック

#### ステップ3: Google OAuthの設定

1. **Social accounts** → **Social applications** をクリック
2. **Add social application** をクリック（または既存のGoogleアプリを編集）
3. 以下を設定：
   - **Provider**: `Google`
   - **Name**: `Google OAuth2 (Production)`
   - **Client id**: 環境変数`GOOGLE_OAUTH_CLIENT_ID`の値
   - **Secret key**: 環境変数`GOOGLE_OAUTH_CLIENT_SECRET`の値
   - **Sites**: `api.example.com`を選択（右側から追加）
4. **保存**をクリック

#### ステップ4: Twitter OAuthの設定

1. **Social accounts** → **Social applications** をクリック
2. **Add social application** をクリック（または既存のTwitterアプリを編集）
3. 以下を設定：
   - **Provider**: `Twitter OAuth2`
   - **Name**: `Twitter OAuth2 (Production)`
   - **Client id**: 環境変数`TWITTER_OAUTH_CLIENT_ID`の値
   - **Secret key**: 環境変数`TWITTER_OAUTH_CLIENT_SECRET`の値
   - **Sites**: `api.example.com`を選択（右側から追加）
4. **保存**をクリック

### 方法3: ローカルからスクリプトを実行（開発環境のみ）

開発環境でテストする場合：

```bash
# ローカル環境
docker-compose exec backend python scripts/check_oauth_config.py
docker-compose exec backend python scripts/setup_production_oauth.py
```

**注意**: 本番環境のデータベースに直接接続する場合は、セキュリティに注意してください。

---

## リダイレクトURIの登録

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. **APIとサービス** → **認証情報** を開く
4. OAuth 2.0クライアントIDを選択
5. **承認済みのリダイレクトURI** に以下を追加：

```
https://api.example.com/accounts/google/login/callback/
```

⚠️ **重要**: 末尾の `/` を必ず含めてください

### Twitter Developer Portal

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. アプリを選択
3. **Settings** → **User authentication settings** → **Edit** をクリック
4. **Callback URI / Redirect URL** に以下を追加：

```
https://api.example.com/accounts/twitter_oauth2/login/callback/
```

⚠️ **重要**: 末尾の `/` を必ず含めてください

---

## トラブルシューティング

### エラー: Server Error (500)

**症状**: Social loginボタンをクリックすると500エラー

**原因と対処法**:

#### 1. 環境変数が未設定
**対処**: 本番サーバーに環境変数を追加

#### 2. SocialAppが未設定
**対処**: 
- バックエンドを再デプロイ（自動設定が実行されます）
- または、Django管理画面から手動設定（方法2を参照）

#### 3. デプロイログを確認
本番バックエンドのログ（journalctl 等）で以下を確認：
- `✅ OAuth setup completed!` が表示されているか
- エラーメッセージがないか

#### 3. リダイレクトURIが未登録
- Google Cloud Console / Twitter Developer PortalでリダイレクトURIを確認
- `https://api.example.com/accounts/.../callback/` が登録されているか確認

#### 4. Siteの設定が誤っている
```bash
# Djangoシェルで確認
python manage.py shell

from django.contrib.sites.models import Site
print(Site.objects.get(pk=1).domain)
# => api.example.com であるべき

# 修正
site = Site.objects.get(pk=1)
site.domain = 'api.example.com'
site.name = 'VRChat Photo Contest (Production)'
site.save()
```

### エラー: "The OAuth client was not found"

**原因**: Client IDまたはClient Secretが間違っている

**対処法**:
1. Google Cloud Console / Twitter Developer Portalで正しい値を確認
2. `scripts/setup_production_oauth.py` を再実行
3. バックエンドを再起動

### エラー: "Redirect URI mismatch"

**原因**: リダイレクトURIがGoogle/Twitterに登録されていない

**対処法**:
1. エラーメッセージに表示されているURIをコピー
2. Google Cloud Console / Twitter Developer Portalに追加
3. 末尾の `/` を忘れずに

### ログの確認

本番環境のログを確認する方法：

1. 本番バックエンドのログを開く（例: journalctl -u photo-contest-backend -f）
2. デプロイ時のログを確認

**正常なログ例**:
```
Setting up OAuth from environment variables...
Setting up Site: api.example.com
✅ Site updated: api.example.com
Setting up Google OAuth...
✅ Google OAuth updated
✅ Google OAuth - Site linked
Setting up Twitter OAuth...
✅ Twitter OAuth updated
✅ Twitter OAuth - Site linked
✅ OAuth setup completed!
```

**エラーログから以下を探す**:
- `SocialApp matching query does not exist` → SocialAppが未設定（自動設定が失敗）
- `Site matching query does not exist` → Siteが未設定（自動設定が失敗）
- `KeyError: 'FRONTEND_URL'` → 環境変数が未設定
- `⚠️  GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET not set` → 環境変数が未設定

---

## 設定チェックリスト

本番環境のOAuth設定が完了したか確認：

- [ ] 本番サーバーで環境変数を設定
  - [ ] `FRONTEND_URL`
  - [ ] `ALLOWED_HOSTS`
  - [ ] `GOOGLE_OAUTH_CLIENT_ID`
  - [ ] `GOOGLE_OAUTH_CLIENT_SECRET`
  - [ ] `TWITTER_OAUTH_CLIENT_ID`
  - [ ] `TWITTER_OAUTH_CLIENT_SECRET`
- [ ] バックエンドを再デプロイ（自動設定が実行される）
- [ ] デプロイログで「✅ OAuth setup completed!」を確認
- [ ] （オプション）Django管理画面で設定を確認
- [ ] Google Cloud ConsoleにリダイレクトURIを追加
- [ ] Twitter Developer PortalにリダイレクトURIを追加
- [ ] バックエンドを再起動
- [ ] Googleログインをテスト
- [ ] Twitterログインをテスト

---

## 参考リンク

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Django Allauth Documentation](https://django-allauth.readthedocs.io/)
- [Django Sites](https://docs.djangoproject.com/en/stable/ref/contrib/sites/)

---

## 関連ドキュメント

- [OAuth設定ガイド（開発環境）](./OAUTH_SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [環境変数設定](./ENV_SETUP.md)
