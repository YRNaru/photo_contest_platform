# ドキュメント索引

## 📚 全ドキュメント一覧

### 🚀 スタートガイド
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - 総合セットアップガイド【推奨】
- [README.md](../README.md) - プロジェクト概要（ルート）

### 🔐 認証設定
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Google/Twitter OAuth設定統合ガイド（開発環境）
- [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md) - 本番環境OAuth設定ガイド【NEW】
- [OAUTH_TROUBLESHOOTING.md](./OAUTH_TROUBLESHOOTING.md) - OAuth認証トラブルシューティング【NEW】
- [TWITTER_SETUP.md](./TWITTER_SETUP.md) - Twitter連携詳細設定
- [TWITTER_API_OPTIMIZATION.md](./TWITTER_API_OPTIMIZATION.md) - Twitter API利用料最適化ガイド【NEW】

### 🛠️ セットアップ・設定
- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - 環境変数テンプレート
- [ENV_SETUP.md](./ENV_SETUP.md) - 環境変数セットアップガイド
- [PORT_CONFIG.md](./PORT_CONFIG.md) - ポート設定

### 🚢 デプロイ・運用
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 本番環境デプロイ（Render推奨）
- [CLOUDFLARE_VERCEL_SETUP.md](./CLOUDFLARE_VERCEL_SETUP.md) - Cloudflare + Vercel セットアップガイド【NEW】
- [CLOUDFLARE_OPTIMIZATION.md](./CLOUDFLARE_OPTIMIZATION.md) - Cloudflare 最適化設定ガイド【NEW】
- [LOG_VIEWING.md](./LOG_VIEWING.md) - 本番環境でのログ確認方法【NEW】

### 👥 開発・貢献
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 開発ガイドライン
- [TESTING.md](./TESTING.md) - テストガイド
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - プロジェクト構造
- [IDE_SETUP.md](./IDE_SETUP.md) - IDE設定
- [LINTER_SETUP.md](./LINTER_SETUP.md) - Linter設定

### 📊 品質・実績
- [ACHIEVEMENT.md](./ACHIEVEMENT.md) - カバレッジ93%達成記録
- [TEST_QUALITY_REPORT.md](./TEST_QUALITY_REPORT.md) - テスト品質レポート
- [JUDGING_SYSTEM.md](./JUDGING_SYSTEM.md) - 審査システム詳細

### 📝 履歴・整理記録
- [CHANGELOG.md](./CHANGELOG.md) - 変更履歴
- [FILE_ORGANIZATION_2024.md](./FILE_ORGANIZATION_2024.md) - ファイル整理完了レポート（2024年12月10日）
- [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) - プロジェクト整理完了レポート
- [CLEANUP_DONE.md](./CLEANUP_DONE.md) - コード整理完了レポート（旧）

---

## 🛠️ スクリプト

スクリプトは `../scripts/` ディレクトリに配置されています：

- [test_all.sh](../scripts/test_all.sh) - 全テスト実行
- [test_backend.sh](../scripts/test_backend.sh) - バックエンドテスト
- [test_frontend.sh](../scripts/test_frontend.sh) - フロントエンドテスト
- [create_twitter_app.py](../scripts/create_twitter_app.py) - Twitter App作成スクリプト（開発環境）
- [set_google_oauth.py](../scripts/set_google_oauth.py) - Google OAuth設定（開発環境）
- [update_google_oauth.sh](../scripts/update_google_oauth.sh) - Google OAuth更新（開発環境）
- [setup_production_oauth.py](../scripts/setup_production_oauth.py) - 本番環境OAuth設定【NEW】
- [check_oauth_config.py](../scripts/check_oauth_config.py) - OAuth設定確認【NEW】

詳細は [scripts/README.md](../scripts/README.md) を参照してください。

