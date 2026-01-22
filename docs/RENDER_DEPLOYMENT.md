# Renderへのデプロイガイド

このガイドでは、photo_contest_platformをRenderにデプロイする手順を説明します。

## 前提条件

- Renderアカウント（https://render.com/）
- GitHubリポジトリ（このプロジェクト）
- Google OAuth認証情報（Google Cloud Console）

## デプロイ手順

### 1. PostgreSQLデータベースの作成

1. **Renderダッシュボードにログイン**
   - https://dashboard.render.com/ にアクセス

2. **新規PostgreSQLサービス作成**
   - 左メニューの「New +」→「PostgreSQL」をクリック
   - または https://dashboard.render.com/new/database にアクセス

3. **データベース設定**
   ```
   Name: photo-contest-db
   Database: contest
   User: contestuser
   Region: Singapore (アジアに近いリージョン推奨)
   Instance Type: Free (開発/テスト用) または Starter以上（本番用）
   ```

4. **作成完了後**
   - 「Internal Database URL」をコピー（後で使用）
   - 形式: `postgresql://user:pass@hostname:5432/dbname`

### 2. Redisインスタンスの作成

1. **新規Redisサービス作成**
   - 左メニューの「New +」→「Redis」をクリック

2. **Redis設定**
   ```
   Name: photo-contest-redis
   Region: Singapore（DBと同じリージョン推奨）
   Instance Type: Free
   Maxmemory Policy: allkeys-lru
   ```

3. **作成完了後**
   - 「Internal Redis URL」をコピー（後で使用）
   - 形式: `redis://red-xxxxx:6379`

### 3. バックエンド（Web Service）のデプロイ

1. **新規Web Serviceを作成**
   - 左メニューの「New +」→「Web Service」をクリック
   - GitHubリポジトリを接続

2. **基本設定**
   ```
   Name: photo-contest-platform
   Region: Singapore
   Branch: main (またはmaster)
   Root Directory: backend
   Runtime: Docker
   ```

3. **ビルド設定**
   ```
   Dockerfile Path: backend/Dockerfile
   Docker Command: (空欄 - entrypoint.shが使用される)
   ```

4. **インスタンスタイプ**
   ```
   Free (開発/テスト用)
   Starter以上（本番用、512MB RAM以上推奨）
   ```

5. **環境変数を設定**

   以下の環境変数を追加（「Environment」タブ）：

   **必須:**
   ```bash
   # Django設定
   DEBUG=False
   SECRET_KEY=<ランダムな50文字以上の文字列>
   ALLOWED_HOSTS=photo-contest-platform.onrender.com,.onrender.com,localhost,127.0.0.1
   
   # データベース（Step 1で作成したDB）
   DATABASE_URL=<PostgreSQLのInternal Database URL>
   
   # Redis（Step 2で作成したRedis）
   REDIS_URL=<RedisのInternal Redis URL>
   
   # CORS設定
   CORS_ALLOWED_ORIGINS=https://photo-contest-platform-1.onrender.com
   
   # Celery
   CELERY_BROKER_URL=$REDIS_URL
   CELERY_RESULT_BACKEND=$REDIS_URL
   ```

   **Google OAuth（必須）:**
   ```bash
   GOOGLE_OAUTH_CLIENT_ID=<Google Cloud ConsoleのClient ID>
   GOOGLE_OAUTH_CLIENT_SECRET=<Google Cloud ConsoleのClient Secret>
   ```

   **Twitter連携（オプション）:**
   ```bash
   TWITTER_API_KEY=<Twitter API Key>
   TWITTER_API_SECRET=<Twitter API Secret>
   TWITTER_BEARER_TOKEN=<Twitter Bearer Token>
   TWITTER_OAUTH_CLIENT_ID=<Twitter OAuth 2.0 Client ID>
   TWITTER_OAUTH_CLIENT_SECRET=<Twitter OAuth 2.0 Client Secret>
   ```

   **Django管理者（オプション）:**
   ```bash
   DJANGO_SUPERUSER_EMAIL=admin@example.com
   DJANGO_SUPERUSER_USERNAME=admin
   DJANGO_SUPERUSER_PASSWORD=<強力なパスワード>
   ```

6. **デプロイ実行**
   - 「Create Web Service」をクリック
   - 初回デプロイが自動的に開始されます（5-10分程度）

7. **デプロイ完了確認**
   - ログで「Your service is live 🎉」を確認
   - `https://photo-contest-platform.onrender.com` にアクセス
   - 502エラーが出ないことを確認

### 4. Celeryワーカーのデプロイ（オプション）

Twitter自動取得や画像処理を使用する場合：

1. **新規Background Worker作成**
   - 左メニューの「New +」→「Background Worker」をクリック
   - 同じGitHubリポジトリを選択

2. **設定**
   ```
   Name: photo-contest-celery-worker
   Region: Singapore
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Docker Command: celery -A config worker -l info
   ```

3. **環境変数**
   - バックエンドと同じ環境変数を設定
   - `DEBUG`, `DATABASE_URL`, `REDIS_URL`, Twitter API関連など

4. **Celery Beat（定期タスク）**
   - 別途Background Workerを作成
   - Name: `photo-contest-celery-beat`
   - Docker Command: `celery -A config beat -l info`

### 5. フロントエンド（Next.js）のデプロイ

**推奨: Vercelを使用**（Renderでも可能だが、Vercelが最適）

1. **Vercelにデプロイ**
   - https://vercel.com にアクセス
   - GitHubリポジトリを接続
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **環境変数**
   ```bash
   NEXT_PUBLIC_API_URL=https://photo-contest-platform.onrender.com/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<Google OAuth Client ID>
   NEXT_PUBLIC_TWITTER_ENABLED=true
   NODE_ENV=production
   ```

3. **カスタムドメイン設定**（オプション）
   - Vercel/Renderの設定でカスタムドメインを追加

### 6. GitHub Actionsによる自動デプロイ設定

git pushで自動的にRenderにデプロイされるように設定します。

#### 6.1 Render API Keyの取得

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com/ にログイン

2. **API Keyを作成**
   - 右上のアカウントアイコンをクリック
   - 「Account Settings」を選択
   - 左メニューから「API Keys」を選択
   - 「Create API Key」ボタンをクリック
   - キー名を入力（例: `github-actions-deploy`）
   - 「Create API Key」をクリック
   - ⚠️ **重要**: 生成されたAPI Keyをコピーして保存してください（一度しか表示されません）

#### 6.2 RenderサービスIDの確認

各サービス（Backend、Frontend、Celery Worker、Celery Beat）のサービスIDを確認します。

**方法1: URLから確認**
1. Renderダッシュボードで各サービスを開く
2. ブラウザのURLバーを確認
   - 例: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
   - `srv-` 以降の部分がサービスIDです

**方法2: Settingsから確認**
1. 各サービスの「Settings」タブを開く
2. 「Info」セクションでサービスIDを確認

**必要なサービスID:**
- Backend: `RENDER_SERVICE_ID`
- Frontend: `RENDER_FRONTEND_SERVICE_ID`
- Celery Worker: `RENDER_CELERY_WORKER_ID`
- Celery Beat: `RENDER_CELERY_BEAT_ID`

#### 6.3 GitHub Secretsの設定

1. **GitHubリポジトリにアクセス**
   - https://github.com/ でリポジトリを開く

2. **Settingsに移動**
   - リポジトリの「Settings」タブをクリック
   - 左メニューから「Secrets and variables」→「Actions」を選択

3. **New repository secretをクリック**

4. **以下のSecretsを1つずつ追加**

   **① RENDER_API_KEY**
   - Name: `RENDER_API_KEY`
   - Secret: （6.1で取得したRender API Keyを貼り付け）
   - 「Add secret」をクリック

   **② RENDER_SERVICE_ID（Backend）**
   - Name: `RENDER_SERVICE_ID`
   - Secret: （BackendサービスのID、例: `srv-xxxxxxxxxxxxx`）
   - 「Add secret」をクリック

   **③ RENDER_FRONTEND_SERVICE_ID（Frontend）**
   - Name: `RENDER_FRONTEND_SERVICE_ID`
   - Secret: （FrontendサービスのID、例: `srv-xxxxxxxxxxxxx`）
   - 「Add secret」をクリック

   **④ RENDER_CELERY_WORKER_ID（Celery Worker）**
   - Name: `RENDER_CELERY_WORKER_ID`
   - Secret: （Celery WorkerサービスのID、例: `srv-xxxxxxxxxxxxx`）
   - 「Add secret」をクリック

   **⑤ RENDER_CELERY_BEAT_ID（Celery Beat）**
   - Name: `RENDER_CELERY_BEAT_ID`
   - Secret: （Celery BeatサービスのID、例: `srv-xxxxxxxxxxxxx`）
   - 「Add secret」をクリック

#### 6.4 設定の確認

1. **Secrets一覧を確認**
   - 「Secrets and variables」→「Actions」で、追加した5つのSecretsが表示されていることを確認

2. **自動デプロイの動作確認**
   - `main`ブランチに何か変更をpushする
   - GitHubリポジトリの「Actions」タブを開く
   - 「Deploy to Render」ワークフローが実行されていることを確認
   - 各ステップが成功することを確認

#### 6.5 トラブルシューティング

**デプロイが失敗する場合:**
- Render API Keyが正しいか確認
- サービスIDが正しいか確認（`srv-` プレフィックスを含む）
- GitHub Actionsのログでエラーメッセージを確認

**特定のサービスだけデプロイされない場合:**
- 該当するサービスIDのSecretが正しく設定されているか確認
- Renderダッシュボードで該当サービスが存在するか確認

### 7. Google OAuth設定

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/

2. **認証情報の設定**
   - 「APIとサービス」→「認証情報」
   - OAuth 2.0 クライアントIDを選択

3. **承認済みのリダイレクトURI**に以下を追加:
   ```
   https://photo-contest-platform.onrender.com/accounts/google/login/callback/
   ```

4. **承認済みのJavaScript生成元**に以下を追加:
   ```
   https://photo-contest-platform-1.onrender.com
   ```

### 8. デプロイ後の初期設定

1. **Django管理画面にアクセス**
   ```
   https://photo-contest-platform.onrender.com/admin
   ```

2. **スーパーユーザーでログイン**
   - 環境変数で設定した管理者アカウント
   - または、Renderのシェルで作成:
     ```bash
     python manage.py createsuperuser
     ```

3. **Social Applicationの設定**
   - 管理画面で「Sites」→「example.com」を編集
   - Domain name: `photo-contest-platform.onrender.com`
   - Display name: `Photo Contest Platform`

   - 「Social applications」→「Add Social Application」
   - Provider: Google
   - Name: Google OAuth
   - Client id: `<Google OAuth Client ID>`
   - Secret key: `<Google OAuth Client Secret>`
   - Sites: 上記で設定したサイトを選択

4. **コンテストの作成**
   - 管理画面でコンテストを作成
   - フロントエンドで正常に表示されることを確認

## トラブルシューティング

### 502 Bad Gateway エラー

**原因:**
- データベース接続失敗
- Worker timeout（メモリ不足）

**対処法:**
1. Renderログで詳細エラーを確認
   ```
   Services → photo-contest-platform → Logs
   ```

2. 環境変数 `DATABASE_URL` が正しいか確認
   - Internal Database URL（`postgresql://...`）を使用
   - External Database URLではない

3. インスタンスタイプをアップグレード
   - Free → Starter (512MB RAM)

### Worker Timeout

**原因:**
- gunicornのデフォルトタイムアウト（30秒）が短すぎる
- マイグレーション実行中にタイムアウト

**対処法:**
- `entrypoint.sh`で既に120秒に設定済み
- さらに長くする場合は、`--timeout 300` に変更

### データベース接続エラー

**確認事項:**
1. PostgreSQLサービスが起動しているか
2. 環境変数 `DATABASE_URL` が正しいか
3. 同じリージョンにデプロイしているか（レイテンシー削減）

### Google OAuth エラー

**確認事項:**
1. リダイレクトURIが正しく登録されているか
2. 環境変数 `GOOGLE_OAUTH_CLIENT_ID`, `SECRET` が正しいか
3. 管理画面でSocial Applicationが設定されているか

## パフォーマンス最適化

### 1. CDN設定（静的ファイル）
- Cloudflare等のCDNを使用
- 静的ファイルの配信を高速化

### 2. データベースチューニング
- 適切なインデックスを設定
- `DATABASES['default']['conn_max_age']` を調整（既に600秒設定済み）

### 3. Redisキャッシュ活用
- エントリー一覧などをキャッシュ
- セッション情報をRedisに保存

### 4. 画像最適化
- Cloudflare R2やAWS S3を使用（`USE_S3=True`）
- WebP/AVIFフォーマット対応

## セキュリティ

### 1. SECRET_KEY
- ランダムな50文字以上の文字列を使用
- 絶対に公開しない

### 2. ALLOWED_HOSTS
- 本番ドメインのみ許可

### 3. CORS設定
- フロントエンドのURLのみ許可

### 4. HTTPS
- Renderは自動的にHTTPSを有効化

### 5. 環境変数
- 機密情報は必ず環境変数で管理
- `.env`ファイルをGitにコミットしない

## モニタリング

### 1. Renderダッシュボード
- CPU/メモリ使用率
- リクエスト数
- エラーログ

### 2. Sentry（オプション）
- エラートラッキング
- パフォーマンスモニタリング
- 環境変数 `SENTRY_DSN` を設定

## バックアップ

### データベース
- Renderの自動バックアップ（有料プラン）
- または手動でpg_dumpを実行

### メディアファイル
- S3/R2にアップロードすれば自動的に保持

## スケーリング

### 水平スケーリング
- Renderの有料プランでインスタンス数を増加

### 垂直スケーリング
- インスタンスタイプをアップグレード
  - Free → Starter → Standard → Pro

## コスト見積もり

### 開発/テスト環境（Free）
- Web Service: $0/月
- PostgreSQL: $0/月
- Redis: $0/月
- **合計: $0/月**

### 本番環境（最小構成）
- Web Service (Starter): $7/月
- PostgreSQL (Starter): $7/月
- Redis (25MB): $3/月
- Celery Worker (Starter): $7/月
- **合計: $24/月**

## 参考リンク

- [Render公式ドキュメント](https://render.com/docs)
- [Django on Render](https://render.com/docs/deploy-django)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Redis on Render](https://render.com/docs/redis)

