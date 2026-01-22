# Twitter連携セットアップガイド

このガイドでは、VRChatフォトコンテストプラットフォームにTwitter連携機能を設定する手順を説明します。

## 機能概要

### 1. Twitter OAuth認証
- ユーザーがTwitterアカウントでログイン可能
- GoogleログインとTwitterログインの両方をサポート

### 2. Twitter投稿の自動取得
- 指定したハッシュタグ付きのツイートを自動取得
- 画像付きツイートをエントリーとして登録
- **15分ごとに自動実行**（取得漏れなし）
- **重複なし**: `since_time`で前回取得時刻以降のみ取得
- **初回取得**: コンテスト開始時刻から全ツイートを取得
- API利用料は新規投稿数に依存（実際の投稿活動による）

## Twitter API設定

### 1. Twitter Developer Portalでアプリを作成

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. 「Create Project」をクリック
3. プロジェクト名とアプリ名を入力

### 2. OAuth 2.0設定

#### OAuth 2.0 Client IDとSecretの取得

1. アプリの「Settings」タブに移動
2. 「User authentication settings」の「Set up」をクリック
3. 設定:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URI**: 
     - 開発環境: `http://localhost:13000/auth/twitter/callback`
     - 本番環境: `https://vrchat-photo-contest.com/auth/twitter/callback`
   - **Website URL**: 
     - 本番環境: `https://vrchat-photo-contest.com`

4. 「Client ID」と「Client Secret」をメモ

#### API Keys and Tokensの取得

1. 「Keys and tokens」タブに移動
2. **API Key and Secret**をメモ（Consumer KeysとConsumer Secrets）
3. **Bearer Token**を生成してメモ
4. **Access Token and Secret**を生成してメモ

## 環境変数の設定

`.env`ファイルに以下を追加：

```bash
# Twitter OAuth 2.0（ログイン用）
TWITTER_OAUTH_CLIENT_ID=your-oauth2-client-id
TWITTER_OAUTH_CLIENT_SECRET=your-oauth2-client-secret

# Twitter API v2（ツイート取得用）
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token

# Frontend
NEXT_PUBLIC_TWITTER_ENABLED=true
```

## データベースマイグレーション

モデルに変更があったため、マイグレーションを実行します：

```bash
# Docker環境の場合
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# ローカル環境の場合
cd backend
python manage.py makemigrations
python manage.py migrate
```

## コンテストでTwitter自動取得を有効化

### 管理画面から設定

1. Django管理画面にアクセス: http://localhost:18000/admin
2. 「コンテスト」を選択
3. 編集するコンテストを選択
4. 「Twitter連携」セクションを展開
5. 設定:
   - **Twitterハッシュタグ**: 取得したいハッシュタグ（例: `フォトコンテスト`）※ # は不要
   - **Twitter自動取得**: ✓ チェック
   - **Twitter投稿の自動承認**: 自動承認する場合はチェック（推奨: OFF）
6. 保存

### Pythonコードから設定

```python
from contest.models import Contest
from django.utils import timezone
from datetime import timedelta

contest = Contest.objects.create(
    slug='vrchat-photo-2024',
    title='VRChat フォトコンテスト 2024',
    description='VRChatでの素敵な写真を募集！',
    start_at=timezone.now(),
    end_at=timezone.now() + timedelta(days=30),
    # Twitter連携設定
    twitter_hashtag='VRChatフォトコン2024',
    twitter_auto_fetch=True,
    twitter_auto_approve=False,  # モデレーション必須
)
```

## Twitter投稿の手動取得

### 管理コマンドで実行

```bash
# すべてのアクティブなコンテストで実行
docker-compose exec backend python manage.py fetch_twitter

# 特定のコンテストのみ実行
docker-compose exec backend python manage.py fetch_twitter --contest=vrchat-photo-2024
```

### 管理画面から実行

1. Django管理画面の「コンテスト」一覧
2. 取得したいコンテストを選択
3. 「アクション」ドロップダウンから「選択したコンテストのTwitter投稿を取得」を選択
4. 「実行」をクリック

## 自動実行の設定

### Celery Beat（デフォルト設定済み）

デフォルトで15分ごとに実行されます。

設定変更: `backend/config/settings.py`

```python
CELERY_BEAT_SCHEDULE = {
    'fetch-twitter-entries': {
        'task': 'contest.tasks.fetch_twitter_entries',
        'schedule': crontab(minute='*/15'),  # 15分ごと（デフォルト、取得漏れなし）
        # 'schedule': crontab(minute='*/30'),  # 30分ごと
        # 'schedule': crontab(minute='0'),     # 1時間ごと
    },
}
```

**最適化の仕組み**:
- **実行頻度**: 15分ごと（96回/日）
- **取得方法**: `since_time`パラメータで前回取得時刻以降のみ取得
- **重複排除**: 既に取得したツイートは再取得しない
- **取得漏れ防止**: 通常15分間で10件を超える投稿は稀なため、確実に全件取得
- **初回取得**: コンテスト開始時刻から全ツイートを取得（`twitter_last_fetch`がnullの場合）

**API利用料の計算**:
```
利用料 = 実際に投稿された新規ツイート数

例:
- 1日10件の新規投稿 → 月間300件
- 1日50件の新規投稿 → 月間1,500件（Free tier上限）
```

### Celery Beatの起動確認

```bash
# Dockerの場合
docker-compose logs -f celery_beat

# ログに以下が表示されればOK
# [2024-xx-xx xx:xx:xx] Scheduler: Sending due task fetch-twitter-entries
```

## 動作確認

### 1. ログイン機能のテスト

1. フロントエンド: http://localhost:13000
2. 「ログイン」ボタンをクリック
3. 「Twitterでログイン」を選択
4. Twitter認証画面で許可
5. リダイレクト後、ログイン状態を確認

### 2. Twitter投稿取得のテスト

#### テストツイートを投稿

1. Twitterに画像付きでツイート
2. ハッシュタグを含める（例: `#VRChatフォトコン2024`）
3. 投稿

#### 手動取得で確認

```bash
docker-compose exec backend python manage.py fetch_twitter --contest=your-contest-slug
```

#### エントリーを確認

1. 管理画面の「エントリー」一覧を開く
2. 「投稿元: Twitter自動取得」のエントリーが追加されているか確認
3. ツイート情報（Twitter情報セクション）が正しく保存されているか確認

## トラブルシューティング

### エラー: "Twitter API client not initialized"

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. `.env`ファイルを確認
2. `TWITTER_BEARER_TOKEN`が設定されているか確認
3. コンテナを再起動: `docker-compose restart backend`

### エラー: "No tweets found for hashtag"

**原因**: 
- ハッシュタグが間違っている
- 該当するツイートがない
- ツイートが古すぎる（7日以前）

**解決策**:
1. ハッシュタグのスペルを確認
2. Twitter API v2の制限（Recent Search）は過去7日間のみ
3. テスト用に新しくツイートを投稿

### 画像がダウンロードされない

**原因**: 
- ネットワークエラー
- Twitter画像URLの有効期限切れ
- 権限不足

**解決策**:
1. ログを確認: `docker-compose logs -f backend`
2. Twitter APIの権限を確認（Read権限が必要）

### 重複エントリーが作成される

**原因**: `twitter_tweet_id`のユニーク制約が機能していない

**解決策**:
1. マイグレーションを確認
2. データベースを確認: 既存の重複データを削除
3. 再度マイグレーション

## Twitter API制限

### Rate Limits（レート制限）

- **Search Tweets**: 450リクエスト/15分（アプリレート制限）
- **Tweet lookup**: 300リクエスト/15分

### 本プラットフォームの最適化

**デフォルト設定（取得漏れなし、重複なし）**:
- 実行頻度: 15分ごと → **96回/日**
- `since_time`: 前回取得時刻以降のみ取得 → **重複なし**
- 取得件数: 実際の新規投稿数に依存（max_results=10）
- **API利用料 = 実際の新規投稿数**

**想定API使用量**:

実際の投稿活動に応じて変動します：

- **静かなハッシュタグ**（1日10件の新規投稿）:
  - 月間取得: **300件/月** ✅ Free tier OK
  
- **普通のハッシュタグ**（1日30件の新規投稿）:
  - 月間取得: **900件/月** ✅ Free tier OK
  
- **活発なハッシュタグ**（1日50件の新規投稿）:
  - 月間取得: **1,500件/月** ✅ Free tier上限
  
- **非常に活発**（1日100件の新規投稿）:
  - 月間取得: **3,000件/月** ⚠️ Basic tier必要

**重要**: API呼び出し回数は利用料に影響しません。取得したツイート数のみが課金対象です。

### Best Practices

1. **初回取得**: コンテスト開始時は全ツイートを取得
2. **増分取得**: 2回目以降は`since_time`で新規のみ取得
3. **取得漏れ防止**: 15分間隔で確実に取得（通常15分で10件を超えることは稀）
4. **コスト管理**: 投稿活動が活発な場合はBasic tier検討
3. エラー時のリトライロジックを実装

## モデレーション

Twitter経由のエントリーは、デフォルトで**未承認**状態で作成されます。

### 承認フロー

1. 管理画面の「エントリー」一覧で未承認エントリーを確認
2. 内容を確認
3. 「承認」または「非承認」を選択

### 自動承認

信頼できるコンテストの場合、自動承認を有効化できます：

```python
contest.twitter_auto_approve = True
contest.save()
```

⚠️ **注意**: 自動承認は慎重に使用してください。不適切なコンテンツが公開される可能性があります。

## セキュリティ考慮事項

1. **API Keyの保護**: 環境変数を`.env`で管理し、Gitにコミットしない
2. **モデレーション**: 自動承認を使用する場合、モデレーションAPIも併用
3. **レート制限**: 適切な間隔で取得し、API制限を超えないように
4. **画像検証**: ダウンロードした画像のファイルサイズと形式を検証

## 本番環境での注意点

1. **環境変数**: 本番用のTwitterアプリを別途作成
2. **Callback URL**: 本番ドメインで設定
3. **モニタリング**: Sentryなどでエラーを監視
4. **バックアップ**: 定期的なデータベースバックアップ
5. **ログ**: エラーログを適切に記録・監視

---

問題が発生した場合は、[Issues](https://github.com/yourusername/photo_contest_platform/issues)で報告してください。

