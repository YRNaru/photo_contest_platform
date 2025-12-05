# 変更履歴

## [1.1.0] - 2024-12-05

### 追加機能
- 🐦 **Twitter OAuth認証**: ユーザーがTwitterアカウントでログイン可能に
- 🔄 **Twitter自動取得**: 指定ハッシュタグ付きツイートを自動でエントリー化
  - 15分ごとに自動実行（Celery Beat）
  - 管理画面から手動実行も可能
  - 画像の自動ダウンロード
  - Twitter投稿情報の保存（ツイートID、ユーザー名、URL等）

### 変更
- **Entryモデル拡張**: Twitter連携フィールド追加
  - `source`: 投稿元（manual/twitter）
  - `twitter_tweet_id`: ツイートID
  - `twitter_user_id`: TwitterユーザーID
  - `twitter_username`: Twitterユーザー名
  - `twitter_url`: ツイートURL
  - `author`: Null許可（Twitter投稿用）

- **Contestモデル拡張**: Twitter連携設定追加
  - `twitter_hashtag`: 取得対象ハッシュタグ
  - `twitter_auto_fetch`: 自動取得ON/OFF
  - `twitter_auto_approve`: 自動承認ON/OFF
  - `twitter_last_fetch`: 最終取得日時

### 技術的変更
- **依存関係追加**: `tweepy==4.14.0`
- **Celery Beat設定**: 定期タスクスケジュール追加
- **管理コマンド**: `fetch_twitter`コマンド追加
- **フロントエンド**: ログインボタンにTwitterオプション追加

### ドキュメント
- `TWITTER_SETUP.md`: Twitter連携セットアップガイド追加
- `README.md`: Twitter機能の説明追加
- `.env.twitter.example`: Twitter用環境変数サンプル追加

### マイグレーション
- `0002_twitter_integration.py`: Twitter連携用フィールド追加

---

## [1.0.0] - 2024-12-05

### 初回リリース
- 📸 写真投稿機能
- ⭐ 投票機能
- 🏆 審査員評価システム
- 🔐 Google OAuth認証
- 📊 管理画面
- 🖼️ 自動画像処理
- 🛡️ モデレーション機能
- 🐳 Docker環境構築
- 🚀 CI/CD（GitHub Actions）

