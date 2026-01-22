# Cloudflare R2 セットアップガイド

このガイドでは、Cloudflare R2を設定してRenderのバックエンドで使用する手順を説明します。

## 📋 前提条件

- Cloudflareアカウント
- Cloudflareにログイン済み

## 🔧 セットアップ手順

### ステップ0: R2バケットの作成

1. **Cloudflareダッシュボードにアクセス**
   - https://dash.cloudflare.com/ にログイン
   - 左メニューから「R2」を選択
   - まだR2を使用していない場合は、有効化が必要な場合があります

2. **「Create bucket」ボタンをクリック**
   - 右サイドバーの「+ Create bucket」ボタンをクリック
   - または、メインエリアの「Create bucket」ボタンをクリック

3. **バケット名を入力**
   - 「Bucket name」フィールドにバケット名を入力
   - 例: `photo-contest-media` または `contest`
   - **重要**: バケット名は後から変更できません（permanent）
   - 使用可能な文字: 小文字、数字、ハイフン（`-`）
   - 推奨: 小文字とハイフンのみを使用

4. **Location（ロケーション）の設定**
   - **「Automatic」を選択（推奨）**
     - Cloudflareが自動的に最適なロケーション（Asia Pacific）を選択
     - 特に要件がなければ、この設定で問題ありません
   - **「Specify jurisdiction」を選択（オプション）**
     - データレジデンシー要件がある場合のみ
     - 特定の管轄区域にデータを制限

5. **Default Storage Class（ストレージクラス）の設定**
   - **「Standard」を選択（推奨）**
     - 月に1回以上アクセスされるオブジェクトに推奨
     - 画像ファイルは頻繁にアクセスされるため、Standardが適切
   - **「Infrequent Access」を選択**
     - 月に1回未満のアクセスに推奨
     - アーカイブ用途など

6. **「Create bucket」ボタンをクリック**
   - 設定を確認して「Create bucket」をクリック
   - バケットが作成されます

7. **作成完了**
   - バケット一覧に作成したバケットが表示されます
   - バケット名をクリックしてバケットを開きます

### ステップ1: バケットの設定

1. **Cloudflareダッシュボードにアクセス**
   - https://dash.cloudflare.com/ にログイン
   - 左メニューから「R2」を選択

2. **作成したバケットを開く**
   - バケット名（例: `contest`）をクリック

3. **「Settings」タブを開く**
   - バケットページの上部にある「Settings」タブをクリック

4. **Public Development URLを有効化**
   - Settingsページの右側パネルで「Public Development URL」セクションを探す
   - 現在のステータス: 「The public development URL is disabled for this bucket.」
   - **「Enable」ボタンをクリック**
   - これにより、パブリックアクセスが有効になり、画像を直接配信できるようになります
   - 有効化後、パブリックURL（`pub-xxxxx.r2.dev`形式）が表示されます
   - **このURLをメモしてください**（後で環境変数`AWS_S3_CUSTOM_DOMAIN`に設定します）

5. **カスタムドメインの設定（オプション）**

   **重要**: カスタムドメインを使用するには、そのドメインがCloudflareアカウントで管理されている必要があります。

   **オプションA: Public Development URLを使用（推奨・簡単）**
   - カスタムドメインの設定をスキップ
   - Public Development URL（`pub-xxxxx.r2.dev`）をそのまま使用
   - 追加設定不要で、すぐに使用可能
   - このURLを環境変数`AWS_S3_CUSTOM_DOMAIN`に設定します

   **オプションB: カスタムドメインを使用（上級者向け）**
   
   前提条件: ドメインがCloudflareで管理されている必要があります
   
   1. **ドメインをCloudflareに追加（まだ追加していない場合）**
      - Cloudflareダッシュボードで「Add a Site」をクリック
      - ドメイン名を入力して追加
      - DNS設定を完了
   
   2. **カスタムドメインを設定**
      - R2バケットの「Settings」→「Custom Domains」→「+ Add」をクリック
      - カスタムドメインを入力（例: `img.your-photocontest.com`）
      - **Minimum TLS version（最小TLSバージョン）の設定**
        - 「Minimum TLS version (advanced)」を展開
        - **「TLS 1.3」を選択（推奨）**
          - 最も安全で最新のTLSバージョン
          - パフォーマンスも優れている
          - 2024年現在のベストプラクティス
        - 注意: TLS 1.0や1.1は非推奨で、多くのブラウザでサポートされていません
      - 「Continue」をクリック
      - 警告メッセージを確認（カスタムドメインを接続すると、バケットの内容がそのドメイン経由で公開アクセス可能になります）
      - 設定を完了
   
   **エラーが出た場合**
   - 「That domain was not found on your account」というエラーが出た場合
   - そのドメインがCloudflareで管理されていないことを意味します
   - この場合は、Public Development URL（`pub-xxxxx.r2.dev`）を使用してください

### ステップ2: APIトークンの作成

1. **R2ダッシュボードの右サイドバーから「Manage R2 API Tokens」をクリック**
   - または直接: https://dash.cloudflare.com/?to=/:account/r2/api-tokens

2. **「Account API Tokens」を選択（推奨）**
   - **「Create Account API token」ボタンをクリック**
   - **推奨理由**:
     - アカウント全体に紐づくため、組織を離れても有効
     - 本番システムに適している（recommended）
     - より安定した運用が可能
   - **「User API Tokens」は使用しない**
     - ユーザーアカウントに紐づくため、組織を離れると無効になる
     - 個人アクセスや開発作業向け

3. **トークンの設定**

   **Token name（トークン名）**
   - 例: `photo-contest-platform-r2`
   - 後で識別しやすい名前を入力

   **Specify bucket(s)（バケットの指定）**
   - **「Apply to all buckets in this account」を選択（推奨）**
     - アカウント内のすべてのバケットに適用
     - 新しく作成したバケットにも自動的に適用される
     - シンプルで管理しやすい
   - または「Apply to specific buckets only」を選択
     - 特定のバケット（例: `contest`）のみに制限したい場合
     - セキュリティをより厳密にしたい場合

   **TTL (Time To Live)（有効期限）**
   - **「Forever」を選択（推奨）**
     - トークンが無期限で有効
     - 本番環境では通常この設定を使用
   - または特定の期間を選択
     - セキュリティ要件で有効期限が必要な場合

   **Client IP Address Filtering（IPアドレスフィルタリング）**
   - **デフォルトのまま（すべてのIPアドレス）でOK**
     - RenderなどのPaaSではIPアドレスが動的に変わるため
     - 特定のIPアドレスを指定すると接続できなくなる可能性があります
   - セキュリティ要件で特定のIPアドレスのみ許可したい場合のみ設定

4. **「Create Account API Token」をクリック**

5. **重要: トークン情報をコピー**
   - **Access Key ID**: コピーして保存
   - **Secret Access Key**: 一度しか表示されないため、必ずコピーして保存
   - この情報は後で環境変数に設定します

### ステップ3: 必要な情報の取得

以下の情報をメモしてください：

1. **Account ID**
   - R2ダッシュボードの右サイドバーに表示
   - または、Cloudflareダッシュボードの右サイドバーから取得

2. **バケット名**
   - 作成したバケットの名前

3. **エンドポイントURL**
   - 形式: `https://<account-id>.r2.cloudflarestorage.com`
   - Account IDを使用して構築

4. **パブリックドメイン（カスタムドメイン未設定の場合）**
   - バケットの「Settings」→「Public Access」で確認
   - 形式: `pub-xxxxx.r2.dev`
   - または、カスタムドメインを設定した場合はそのドメイン

### ステップ4: Renderの環境変数設定

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com/ にログイン

2. **バックエンドサービスを選択**
   - バックエンドのWeb Serviceを開く

3. **「Environment」タブを開く**

4. **以下の環境変数を追加**

```bash
# R2ストレージを有効化
USE_S3=True

# R2 APIトークン（ステップ2で取得）
AWS_ACCESS_KEY_ID=<Access Key ID>
AWS_SECRET_ACCESS_KEY=<Secret Access Key>

# バケット名（ステップ3で取得）
AWS_STORAGE_BUCKET_NAME=<your-bucket-name>

# R2エンドポイント（ステップ3で取得）
AWS_S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com

# リージョン（R2では"auto"を使用）
AWS_S3_REGION_NAME=auto

# パブリックドメイン（推奨: カスタムドメイン未設定の場合はpub-xxxxx.r2.devを設定）
# バケットのSettings → Public Accessで確認できるドメイン
AWS_S3_CUSTOM_DOMAIN=pub-xxxxx.r2.dev
# または、カスタムドメインを使用する場合
# AWS_S3_CUSTOM_DOMAIN=img.your-photocontest.com
```

### ステップ5: 設定の確認

1. **環境変数を保存**
   - 「Save Changes」をクリック

2. **サービスを再デプロイ**
   - 環境変数の変更後、自動的に再デプロイが開始されます
   - または、手動で「Manual Deploy」→「Deploy latest commit」を実行

3. **ログを確認**
   - 「Logs」タブでエラーがないか確認
   - R2への接続エラーがないか確認

### ステップ6: 動作確認

1. **画像をアップロード**
   - プロフィール画像やコンテストバナーをアップロード

2. **R2バケットを確認**
   - Cloudflare R2ダッシュボードで、アップロードされたファイルが表示されることを確認

3. **画像が表示されることを確認**
   - フロントエンドで画像が正しく表示されることを確認
   - 画像URLがR2のドメインになっていることを確認

## 🔍 トラブルシューティング

### エラー: "Access Denied"

**原因**: APIトークンの権限が不足している

**解決策**:
- R2 APIトークンの権限を「Object Read & Write」に設定
- トークンを再作成

### エラー: "Bucket not found"

**原因**: バケット名が間違っている

**解決策**:
- `AWS_STORAGE_BUCKET_NAME`の値を確認
- バケット名は大文字小文字を区別します

### エラー: "Invalid endpoint URL"

**原因**: エンドポイントURLの形式が間違っている

**解決策**:
- `AWS_S3_ENDPOINT_URL`の形式を確認
- 正しい形式: `https://<account-id>.r2.cloudflarestorage.com`
- Account IDが正しいか確認

### 画像が表示されない

**原因1**: パブリックアクセスが有効になっていない

**解決策**:
- バケットの「Settings」→「Public Development URL」で「Enable」をクリック

**原因2**: CORS設定の問題（最も一般的）

**解決策**:
1. **R2バケットのCORS設定を追加**
   - Cloudflare R2ダッシュボードでバケット（`contest`）を開く
   - 「Settings」タブをクリック
   - 「CORS Policy」セクションで「+ Add」をクリック
   - 以下のCORS設定を追加：

```json
[
  {
    "AllowedOrigins": [
      "https://photo-contest-platform-1.onrender.com",
      "https://photo-contest-platform.onrender.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

   - 「Save」をクリック

2. **フロントエンドを再デプロイ**
   - Render（フロントエンド）のダッシュボードで「Manual Deploy」→「Deploy latest commit」を実行
   - `next.config.js`の変更（`unoptimized: true`）が反映されます

**原因3**: フロントエンドが再デプロイされていない

**解決策**:
- Renderのフロントエンドサービスを再デプロイ
- `next.config.js`の`unoptimized: true`設定が反映されます

## 📝 環境変数の例

実際の値を使用した例：

```bash
USE_S3=True
AWS_ACCESS_KEY_ID=abc123def456ghi789
AWS_SECRET_ACCESS_KEY=xyz789uvw456rst123
AWS_STORAGE_BUCKET_NAME=photo-contest-media
AWS_S3_ENDPOINT_URL=https://e421bafd4d310e432be7c2d1b314.r2.cloudflarestorage.com
AWS_S3_REGION_NAME=auto
AWS_S3_CUSTOM_DOMAIN=pub-xxxxx.r2.dev
```

## 🎉 完了

これで、Renderの再起動後も画像が永続的に保存されるようになりました！

## 📚 参考資料

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [django-storages Documentation](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html)
