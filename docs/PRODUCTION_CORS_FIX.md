# 本番環境CORSエラー修正ガイド

## 問題

フロントエンド (`https://photo-contest-platform-1.onrender.com`) からバックエンド (`https://photo-contest-platform.onrender.com`) へのAPIリクエストがCORSエラーで失敗していました。

## 実施した修正

### 1. バックエンド設定の修正 (`backend/config/settings.py`)

#### ALLOWED_HOSTS
本番環境でRender.comのドメインを許可:
```python
if not DEBUG:
    ALLOWED_HOSTS.extend([
        "photo-contest-platform.onrender.com",
        ".onrender.com",
    ])
```

#### CORS設定
フロントエンドのオリジンを許可:
```python
if not DEBUG:
    CORS_ALLOWED_ORIGINS.extend([
        "https://photo-contest-platform-1.onrender.com",
    ])
```

#### CSRF/Session Cookie設定
本番環境でクロスオリジンCookieを許可:
```python
else:
    # 本番環境の設定
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_DOMAIN = None

    CSRF_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = False
    CSRF_TRUSTED_ORIGINS = [
        "https://photo-contest-platform-1.onrender.com",
        "https://photo-contest-platform.onrender.com",
    ]
```

## 必要な環境変数設定

### Render.com (バックエンド)

以下の環境変数を設定してください:

1. **DEBUG**
   ```
   DEBUG=False
   ```

2. **ALLOWED_HOSTS** (オプション、コードでデフォルト設定済み)
   ```
   ALLOWED_HOSTS=photo-contest-platform.onrender.com,.onrender.com
   ```

3. **CORS_ALLOWED_ORIGINS** (オプション、コードでデフォルト設定済み)
   ```
   CORS_ALLOWED_ORIGINS=https://photo-contest-platform-1.onrender.com
   ```

### Render.com または Vercel (フロントエンド)

フロントエンドの環境変数を設定してください:

1. **NEXT_PUBLIC_API_URL**
   ```
   NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api
   ```

## デプロイ手順

### 1. バックエンドの再デプロイ

Render.comのダッシュボードで:
1. バックエンドサービスを選択
2. 「Manual Deploy」→「Deploy latest commit」をクリック
3. または、Gitにプッシュして自動デプロイを待つ

### 2. フロントエンドの再デプロイ

#### Render.comの場合:
1. フロントエンドサービスを選択
2. 環境変数 `NEXT_PUBLIC_API_URL` を確認
3. 「Manual Deploy」→「Deploy latest commit」をクリック

#### Vercelの場合:
1. Vercelのダッシュボードで環境変数を確認
2. 設定 → Environment Variables → `NEXT_PUBLIC_API_URL` を確認
3. 再デプロイ（自動または手動）

## トラブルシューティング

### CORSエラーが続く場合

1. **ブラウザのキャッシュをクリア**
   - DevToolsを開く (F12)
   - Network タブ → 「Disable cache」をチェック
   - ページをリロード (Ctrl+Shift+R)

2. **環境変数の確認**
   - Render.comダッシュボードで環境変数が正しく設定されているか確認
   - フロントエンドが正しいAPI URLを使用しているか、DevToolsのNetworkタブで確認

3. **バックエンドのログ確認**
   - Render.comのダッシュボードでバックエンドのログを確認
   - CORSエラーや400エラーの詳細を確認

4. **異なるオリジンの場合**
   フロントエンドのURLが変更された場合、`settings.py`の`CORS_ALLOWED_ORIGINS`と`CSRF_TRUSTED_ORIGINS`を更新してください。

### 400 Bad Requestエラーが続く場合

1. **リクエストの詳細を確認**
   - DevToolsのNetworkタブでリクエストヘッダーとボディを確認
   - バックエンドのログでエラーの詳細を確認

2. **認証トークンの確認**
   - LocalStorageにトークンが保存されているか確認
   - トークンの有効期限を確認

## 確認方法

1. ブラウザでフロントエンドURL (`https://photo-contest-platform-1.onrender.com`) を開く
2. DevTools (F12) → Console タブを確認
3. CORSエラーが表示されないことを確認
4. Network タブでAPIリクエストが成功 (200 OK) していることを確認

## 参考

- [Django CORS設定](https://github.com/adamchainz/django-cors-headers)
- [Next.js環境変数](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Render.com環境変数設定](https://render.com/docs/environment-variables)
