# Google OAuth 2.0 セットアップガイド

このガイドでは、Google OAuth 2.0認証に必要なClient IDとClient Secretを取得する手順を説明します。

## 前提条件

- Googleアカウントを持っていること
- アプリケーションが起動していること（開発環境でOK）

## 手順

### 1. Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. Googleアカウントでログイン

### 2. プロジェクトの作成

#### 新規プロジェクトを作成する場合

1. 画面上部の「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト情報を入力：
   - **プロジェクト名**: `VRChat Photo Contest`（任意の名前）
   - **組織**: なし（個人の場合）
4. 「作成」をクリック
5. 作成されたプロジェクトを選択

#### 既存のプロジェクトを使用する場合

1. 画面上部の「プロジェクトを選択」をクリック
2. 使用したいプロジェクトを選択

### 3. OAuth同意画面の設定

1. 左側のメニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択：
   - **外部**: 誰でもログイン可能（推奨）
   - **内部**: Google Workspaceユーザーのみ
3. 「作成」をクリック

#### OAuth同意画面の情報を入力

**アプリ情報**:
- **アプリ名**: `VRChat フォトコンテスト`
- **ユーザーサポートメール**: あなたのメールアドレス
- **アプリのロゴ**: （オプション）アプリのロゴ画像

**アプリのドメイン**:
- **アプリのホームページ**: 
  - 開発環境: `http://localhost:13000`
  - 本番環境: `https://vrchat-photo-contest.com`
- **アプリのプライバシーポリシーリンク**: （オプション）
- **アプリの利用規約リンク**: （オプション）

**承認済みドメイン**:
- 開発環境では不要
- 本番環境: `vrchat-photo-contest.com` を追加

**デベロッパーの連絡先情報**:
- あなたのメールアドレスを入力

4. 「保存して次へ」をクリック

#### スコープの設定

1. 「スコープを追加または削除」をクリック
2. 以下のスコープを選択：
   - `../auth/userinfo.email`（メールアドレス）
   - `../auth/userinfo.profile`（基本的なプロフィール情報）
   - `openid`（OpenID Connect）
3. 「更新」→「保存して次へ」をクリック

#### テストユーザーの追加（開発中のみ）

1. 「テストユーザー」セクションで「+ ADD USERS」をクリック
2. テスト用のGoogleアカウント（メールアドレス）を追加
3. 「保存して次へ」をクリック

**注意**: 本番環境に公開する前に、OAuth同意画面を「公開」ステータスにする必要があります。

### 4. 認証情報の作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 上部の「+ 認証情報を作成」をクリック
3. 「OAuth クライアント ID」を選択

#### OAuth クライアントIDの設定

1. **アプリケーションの種類**: 「ウェブ アプリケーション」を選択

2. **名前**: `VRChat Photo Contest Web Client`（任意の名前）

3. **承認済みの JavaScript 生成元**:
   ```
   http://localhost:13000
   https://vrchat-photo-contest.com
   ```
   
   **追加方法**:
   - 「URI を追加」をクリック
   - `http://localhost:13000` を入力
   - もう一度「URI を追加」をクリック
   - `https://vrchat-photo-contest.com` を入力（本番環境用）

4. **承認済みのリダイレクト URI**:
   ```
   http://localhost:13000
   http://localhost:13000/auth/callback
   https://vrchat-photo-contest.com
   https://vrchat-photo-contest.com/auth/callback
   ```
   
   **追加方法**:
   - 「URI を追加」を複数回クリックして、上記4つのURIをすべて追加

5. 「作成」をクリック

### 5. Client IDとSecretの取得

1. 作成完了のポップアップが表示されます
2. **クライアント ID** と **クライアント シークレット** をコピー
   - 🔑 **クライアントID**: `123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com`
   - 🔐 **クライアントシークレット**: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx`

3. これらの値を安全な場所にメモ（後で`.env`ファイルに設定）

**ヒント**: 後で確認したい場合は、「認証情報」ページで作成したクライアントIDをクリックすれば再度確認できます。

### 6. 環境変数の設定

`.env`ファイルに取得した値を設定します：

```bash
# Google OAuth 2.0
GOOGLE_OAUTH_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx

# フロントエンド用（同じClient IDを使用）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com
```

### 7. 動作確認

1. アプリケーションを再起動：
   ```bash
   docker-compose restart backend frontend
   ```

2. フロントエンドにアクセス: http://localhost:13000

3. 「ログイン」→「Googleでログイン」をクリック

4. Google認証画面が表示されれば成功！

5. アカウントを選択してログイン

6. 「アプリがアクセスを求めています」という画面で「許可」をクリック

7. アプリにリダイレクトされ、ログイン状態になればOK ✅

## トラブルシューティング

### エラー: "リダイレクトURIの不一致"

**原因**: 承認済みのリダイレクトURIに現在のURLが含まれていない

**解決方法**:
1. Google Cloud Consoleの「認証情報」に戻る
2. 作成したOAuth 2.0クライアントIDをクリック
3. 「承認済みのリダイレクトURI」にエラーメッセージに表示されたURIを追加
4. 「保存」をクリック

### エラー: "アクセスがブロックされました"

**原因**: OAuth同意画面が「テスト中」で、テストユーザーに追加されていない

**解決方法**:
1. 「OAuth同意画面」に移動
2. 「テストユーザー」セクションでログインしようとしているGoogleアカウントを追加
3. または、OAuth同意画面を「公開」にする（本番環境の場合）

### エラー: "invalid_client"

**原因**: Client IDまたはClient Secretが間違っている

**解決方法**:
1. `.env`ファイルの値を確認
2. Google Cloud Consoleで正しい値をコピーし直す
3. 値の前後に余分なスペースがないか確認
4. コンテナを再起動

### ログインボタンをクリックしても何も起こらない

**原因**: フロントエンドの環境変数が設定されていない

**解決方法**:
1. `.env`ファイルに`NEXT_PUBLIC_GOOGLE_CLIENT_ID`が設定されているか確認
2. フロントエンドコンテナを再ビルド：
   ```bash
   docker-compose up --build frontend
   ```

## 本番環境での注意点

### 1. OAuth同意画面を公開する

1. 「OAuth同意画面」に移動
2. 「アプリを公開」をクリック
3. 確認画面で「確認」をクリック

**注意**: 公開するとすべてのGoogleユーザーがログインできるようになります。

### 2. 承認済みドメインを更新

本番環境のドメインを追加：
- JavaScript生成元: `https://vrchat-photo-contest.com`
- リダイレクトURI: `https://vrchat-photo-contest.com/auth/callback`

### 3. 環境変数を本番用に更新

本番環境の`.env`ファイル：
```bash
GOOGLE_OAUTH_CLIENT_ID=本番用のClient ID
GOOGLE_OAUTH_CLIENT_SECRET=本番用のClient Secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=本番用のClient ID
```

**ヒント**: 開発環境と本番環境で別々のOAuth クライアントIDを作成することを推奨します。

## セキュリティのベストプラクティス

1. ✅ Client Secretは**絶対に公開しない**
2. ✅ `.env`ファイルをGitにコミットしない（`.gitignore`で除外）
3. ✅ 本番環境では必ずHTTPS（SSL/TLS）を使用
4. ✅ リダイレクトURIは必要最小限に限定
5. ✅ 定期的にClient Secretをローテーション（更新）

## 参考リンク

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0公式ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [OAuth同意画面の設定](https://support.google.com/cloud/answer/10311615)

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

