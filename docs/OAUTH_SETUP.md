# OAuth認証セットアップガイド

VRChat Photo Contest PlatformでTwitterとGoogle認証を設定する手順です。

## 📋 目次

1. [Twitter OAuth 2.0 設定](#twitter-oauth-20-設定)
2. [Google OAuth 2.0 設定](#google-oauth-20-設定)
3. [トラブルシューティング](#トラブルシューティング)

---

## Twitter OAuth 2.0 設定

### 前提条件

- Twitterアカウント
- Twitter Developer Portal へのアクセス

### ステップ1: Twitter Developer Portalでアプリを作成

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. Twitterアカウントでログイン
3. 「+ Create App」ボタンをクリック
4. アプリ名を入力（例: `VRChat Photo Contest`）

### ステップ2: User authentication settingsを設定

1. アプリの「Settings」タブをクリック
2. 「User authentication settings」の「Set up」をクリック

### ステップ3: OAuth 2.0設定

**App permissions**:
- ✅ **Read** または **Read and write**

**Type of App**:
- ✅ **Web App, Automated App or Bot**

**App info**:

| 項目 | 設定値 |
|------|--------|
| Callback URI / Redirect URL | `http://localhost:18000/accounts/twitter_oauth2/login/callback/`<br>`http://127.0.0.1:18000/accounts/twitter_oauth2/login/callback/` |
| Website URL | `https://example.com` または任意のhttps URL |

⚠️ **重要**: 
- Callback URIの末尾の `/` を忘れずに
- `/accounts/twitter_oauth2/login/callback/` のパスが正確であること
- 開発環境では `http://` を使用

### ステップ4: Client IDとSecretをコピー

設定画面の「OAuth 2.0 Client ID and Client Secret」セクションから：
- **Client ID** をコピー
- **Client Secret** をコピー

### ステップ5: データベースに設定

```bash
cd /home/naru_020301/photo_contest_platform
docker-compose exec backend python scripts/create_twitter_app.py
```

または、手動で設定：

```bash
docker-compose exec backend python manage.py shell
```

```python
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Twitter OAuth2アプリを作成
twitter_app, created = SocialApp.objects.get_or_create(
    provider='twitter_oauth2',
    defaults={
        'name': 'Twitter OAuth2',
        'client_id': 'YOUR_CLIENT_ID',
        'secret': 'YOUR_CLIENT_SECRET',
    }
)

# すべてのSiteに関連付け
for site in Site.objects.all():
    twitter_app.sites.add(site)

print("✅ Twitter OAuth2設定完了")
exit()
```

### ステップ6: 環境変数に設定（オプション）

`docker-compose.yml` または `.env` に追加：

```yaml
- TWITTER_OAUTH_CLIENT_ID=YOUR_CLIENT_ID
- TWITTER_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### ステップ7: テスト

```
http://localhost:18000/accounts/twitter_oauth2/login/
```

---

## Google OAuth 2.0 設定

### 前提条件

- Googleアカウント
- Google Cloud Console へのアクセス

### ステップ1: Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択

### ステップ2: OAuth同意画面を設定

1. 左メニュー → 「APIとサービス」→「OAuth同意画面」
2. ユーザータイプ: **外部**
3. アプリ情報を入力：
   - アプリ名: `VRChat Photo Contest`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス

### ステップ3: スコープを追加

以下のスコープを選択：
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`

### ステップ4: OAuth クライアントIDを作成

1. 左メニュー → 「APIとサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブ アプリケーション**

**承認済みのリダイレクトURI**:
```
http://localhost:18000/accounts/google/login/callback/
http://127.0.0.1:18000/accounts/google/login/callback/
```

⚠️ **重要**: 末尾の `/` を忘れずに

### ステップ5: Client IDとSecretをコピー

- **クライアントID** をコピー
- **クライアントシークレット** をコピー

### ステップ6: データベースに設定

```bash
docker-compose exec backend python manage.py shell
```

```python
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Google OAuthアプリを作成
google_app, created = SocialApp.objects.get_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth2',
        'client_id': 'YOUR_CLIENT_ID',
        'secret': 'YOUR_CLIENT_SECRET',
    }
)

# すべてのSiteに関連付け
for site in Site.objects.all():
    google_app.sites.add(site)

print("✅ Google OAuth2設定完了")
exit()
```

### ステップ7: テスト

```
http://localhost:18000/accounts/google/login/
```

---

## トラブルシューティング

### エラー: "The OAuth client was not found"

**原因**: Client IDまたはClient Secretが間違っている

**解決策**:
1. Google Cloud ConsoleでClient IDとSecretを再確認
2. データベースの設定を更新

### エラー: "Callback URL not approved"

**原因**: リダイレクトURIが登録されていない

**解決策**:
1. Developer PortalでCallback URIを確認
2. 末尾の `/` を含めて正確に入力

### エラー: "An account already exists with this email address"

**原因**: 既存のアカウントと同じメールアドレス

**解決策**:
- カスタムアダプターが自動的に処理します
- 既にログイン済みの場合は、自動的にソーシャルアカウントを接続します

### エラー: "Network Error"

**原因**: バックエンドが起動していない、またはCORS設定の問題

**解決策**:
```bash
docker-compose ps  # バックエンドが起動しているか確認
docker-compose restart backend  # 再起動
```

---

## セキュリティに関する注意

- ✅ Client SecretとAPI Secretは**絶対に公開しない**
- ✅ 本番環境では必ず環境変数として設定
- ✅ `.env`ファイルは`.gitignore`に追加済み
- ✅ 定期的にキーをローテーション

---

## 参考リンク

- [Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Django Allauth Documentation](https://django-allauth.readthedocs.io/)

