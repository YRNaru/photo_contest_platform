# Twitter OAuth デバッグガイド

## エラー: "アプリにアクセスを許可できません"

このエラーが発生する主な原因と解決策：

## ✅ チェックリスト

### 1. Twitter Developer Portal - User authentication settings

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にログイン
2. アプリを選択
3. **「Settings」タブ** → **「User authentication settings」** をクリック
4. **「Edit」** をクリック

### 2. 必須設定項目

#### OAuth 2.0 Settings

**✅ App permissions** (重要！)
- [ ] Read のみ
- [ ] Read and Write
- [x] **Read and Write and Direct Messages** ← おすすめ

**✅ Type of App** (重要！)
- [ ] Native App
- [x] **Web App, Automated App or Bot** ← これを選択

#### Callback Settings

**✅ Callback URI / Redirect URL**

以下の**両方**を追加してください：

```
http://127.0.0.1:18000/accounts/twitter_oauth2/callback/
http://localhost:18000/accounts/twitter_oauth2/callback/
```

**重要**: 
- 末尾の `/` を忘れないこと
- `/accounts/twitter_oauth2/callback/` の部分が正確であること
- http**s**ではなく**http**であること（開発環境）

**✅ Website URL**

```
https://example.com
```
または任意のhttps URL（開発時は使用されません）

### 3. 設定後の確認

1. **「Save」** をクリック
2. 画面をリロードして設定が保存されたか確認
3. **Client ID** と **Client Secret** を再確認

### 4. Client ID と Client Secret の確認

**正しいClient IDの例**:
```
T09GVEFkUVljOFlSTFBveHN5eE46MTpjaQ
```

**正しいClient Secretの例**:
```
2lS85HZbV-nFliK0wFvkxz6BgQm0oqBniPSTf_aVz-VdImkaMe
```

これらが `ENV_TEMPLATE.md` の値と一致しているか確認してください。

## 🔧 トラブルシューティング手順

### 手順1: Settings画面のスクリーンショット確認項目

確認すべき項目：
1. **OAuth 2.0** が有効になっているか
2. **Callback URI** が正確に設定されているか
3. **App permissions** が設定されているか

### 手順2: 設定を再保存

1. Twitter Developer Portalで **「Edit」** をクリック
2. すべての設定を再確認
3. **「Save」** をクリック
4. **数分待つ**（設定が反映されるまで時間がかかることがある）

### 手順3: バックエンドの環境変数を確認

```bash
docker compose exec backend env | grep TWITTER
```

以下が表示されるはずです：
```
TWITTER_OAUTH_CLIENT_ID=T09GVEFkUVljOFlSTFBveHN5eE46MTpjaQ
TWITTER_OAUTH_CLIENT_SECRET=2lS85HZbV-nFliK0wFvkxz6BgQm0oqBniPSTf_aVz-VdImkaMe
```

### 手順4: Django設定の確認

```bash
docker compose exec backend python manage.py shell
```

```python
from django.conf import settings
print("Twitter OAuth Client ID:", settings.SOCIALACCOUNT_PROVIDERS['twitter_oauth2']['APP']['client_id'])
print("Twitter OAuth Client Secret:", settings.SOCIALACCOUNT_PROVIDERS['twitter_oauth2']['APP']['secret'])
```

### 手順5: Siteの設定確認

Django allauthではSiteフレームワークを使用します。

```bash
docker compose exec backend python manage.py shell
```

```python
from django.contrib.sites.models import Site
site = Site.objects.get_current()
print("Current site:", site.domain)
# もし間違っている場合は修正
site.domain = '127.0.0.1:18000'
site.name = 'VRChat Photo Contest'
site.save()
```

## 🚀 完全な設定手順（もう一度）

### Twitter Developer Portal

1. **App Settings** → **User authentication settings** → **Edit**

2. **App permissions**: 
   - ✅ Read and Write（または Read のみ）

3. **Type of App**: 
   - ✅ Web App, Automated App or Bot

4. **App info**:
   - **Callback URI**: `http://127.0.0.1:18000/accounts/twitter_oauth2/callback/` と `http://localhost:18000/accounts/twitter_oauth2/callback/` の両方
   - **Website URL**: `https://example.com`

5. **Save** をクリック

6. **OAuth 2.0 Client ID and Client Secret** をコピー

### docker-compose.yml

`docker-compose.yml` の backend セクション:

```yaml
- TWITTER_OAUTH_CLIENT_ID=コピーしたClient_ID
- TWITTER_OAUTH_CLIENT_SECRET=コピーしたClient_Secret
```

### 再起動

```bash
cd /home/yamamoto/photo_contest_platform
docker compose restart backend
```

### テスト

1. http://localhost:13000 にアクセス
2. 「ログイン」→「Twitterでログイン」をクリック
3. Twitter認証画面が表示される
4. アプリを承認
5. ログイン成功

## ⚠️ よくある間違い

### ❌ 間違い 1: Callback URIの末尾に `/` がない
```
http://127.0.0.1:18000/accounts/twitter_oauth2/callback  ← 間違い
```

### ✅ 正しい:
```
http://127.0.0.1:18000/accounts/twitter_oauth2/callback/  ← 正しい
```

### ❌ 間違い 2: HTTPSを使用している（開発環境）
```
https://127.0.0.1:18000/accounts/twitter_oauth2/callback/  ← 間違い
```

### ✅ 正しい:
```
http://127.0.0.1:18000/accounts/twitter_oauth2/callback/  ← 正しい
```

### ❌ 間違い 3: OAuth 1.0aを使用している
Twitter OAuth 2.0が有効になっていることを確認してください。

## 📸 設定画面の例

### User authentication settings 画面

```
[x] Set up User authentication

OAuth 2.0 Settings
─────────────────
App permissions: Read and Write
Type of App: Web App, Automated App or Bot

App info
─────────────────
Callback URI / Redirect URL:
  http://127.0.0.1:18000/accounts/twitter_oauth2/callback/
  http://localhost:18000/accounts/twitter_oauth2/callback/

Website URL:
  https://example.com

OAuth 2.0 Client ID and Client Secret
─────────────────────────────────────
Client ID: T09GVEFkUVljOFlSTFBveHN5eE46MTpjaQ
Client Secret: 2lS85HZbV-nFliK0wFvkxz6BgQm0oqBniPSTf_aVz-VdImkaMe
```

## 🔍 デバッグログの確認

```bash
# バックエンドログを確認
docker compose logs backend -f

# フロントエンドログを確認
docker compose logs frontend -f
```

エラーメッセージがあれば、それを確認してください。

## 📞 サポート

それでも解決しない場合：
1. Twitter Developer Portalの設定スクリーンショットを確認
2. バックエンドのログを確認
3. Djangoの管理画面でSocialアプリの設定を確認: http://localhost:18000/admin/socialaccount/socialapp/

---

最終更新: 2025-12-05
