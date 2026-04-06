# ドキュメント索引

**このファイルがドキュメントの正本の目次です。** 全ファイルへのリンクはここから辿れます。

---

## はじめに

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** — ローカル起動・Docker（推奨）
- [README.md](../README.md) — プロジェクト概要（リポジトリルート）

## 認証・Twitter

- [OAUTH_SETUP.md](./OAUTH_SETUP.md) — Google / Twitter OAuth（開発）
- [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md) — 本番 OAuth
- [OAUTH_TROUBLESHOOTING.md](./OAUTH_TROUBLESHOOTING.md) — OAuth トラブルシューティング
- [TWITTER_SETUP.md](./TWITTER_SETUP.md) — Twitter 連携・ハッシュタグ取得
- [TWITTER_API_OPTIMIZATION.md](./TWITTER_API_OPTIMIZATION.md) — Twitter API 利用の最適化

## 環境・ローカル開発

- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) — 環境変数テンプレート
- [ENV_SETUP.md](./ENV_SETUP.md) — 環境変数の説明
- [PORT_CONFIG.md](./PORT_CONFIG.md) — ポート一覧・変更方法

## デプロイ・運用

- **[RENTAL_SERVER_DEPLOYMENT.md](./RENTAL_SERVER_DEPLOYMENT.md)** — さくら VPS 等（Nginx + Gunicorn + systemd）
- [DEPLOYMENT.md](./DEPLOYMENT.md) — 本番概要・環境変数・ストレージ
- [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) — Cloudflare R2
- [CLOUDFLARE_OPTIMIZATION.md](./CLOUDFLARE_OPTIMIZATION.md) — Cloudflare 最適化
- [LOG_VIEWING.md](./LOG_VIEWING.md) — 本番ログの見方
- **本番用テンプレート**（リポジトリルート）: [deploy/README.md](../deploy/README.md) — Nginx / systemd / Gunicorn 設定例

## CI/CD

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — バックエンド・フロントのテスト・ビルド
- [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) — テスト（カバレッジ）・Lint・型チェック
- [`.gitlab-ci.yml`](../.gitlab-ci.yml) — GitLab CI（GitHub ミラー用）

## 開発・品質・構造

- [CONTRIBUTING.md](./CONTRIBUTING.md) — コントリビューション
- [TESTING.md](./TESTING.md) — テストの書き方・実行
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — ディレクトリ構成
- [IDE_SETUP.md](./IDE_SETUP.md) — IDE 設定
- [LINTER_SETUP.md](./LINTER_SETUP.md) — Linter 設定
- [JUDGING_SYSTEM.md](./JUDGING_SYSTEM.md) — 審査システム

## アーカイブ（履歴・旧レポート）

過去の整理記録・品質レポート。通常の開発手順には不要です。

- [archive/ACHIEVEMENT.md](./archive/ACHIEVEMENT.md)
- [archive/TEST_QUALITY_REPORT.md](./archive/TEST_QUALITY_REPORT.md)
- [archive/FILE_ORGANIZATION_2024.md](./archive/FILE_ORGANIZATION_2024.md)
- [archive/CLEANUP_SUMMARY.md](./archive/CLEANUP_SUMMARY.md)
- [archive/CLEANUP_DONE.md](./archive/CLEANUP_DONE.md)

## 変更履歴

- [CHANGELOG.md](./CHANGELOG.md)

---

## スクリプト

`../scripts/` 配下。詳細は [scripts/README.md](../scripts/README.md)。

- [test_all.sh](../scripts/test_all.sh) / [test_backend.sh](../scripts/test_backend.sh) / [test_frontend.sh](../scripts/test_frontend.sh)
- [setup_production_oauth.py](../scripts/setup_production_oauth.py) / [check_oauth_config.py](../scripts/check_oauth_config.py) など
