# 本番環境でのログ確認方法

VPS や自前サーバー上でバックエンド（Gunicorn / Django）のログを確認する手順です。

## systemd で動かしている場合

```bash
# ユニット名は環境に合わせて変更（例: photo-contest-backend）
sudo journalctl -u photo-contest-backend -f
```

過去ログを範囲指定する例:

```bash
sudo journalctl -u photo-contest-backend --since "1 hour ago"
```

## Docker Compose で動かしている場合

```bash
docker compose logs -f backend
```

## ログの検索キーワード（OAuth）

```
pre_social_login
save_user
OAuth Error
Error in
```

## ログフォーマット

Django 設定では概ね次の形式で標準出力に出ます。

```
[LEVEL] YYYY-MM-DD HH:MM:SS module.function:line - message
```

## よくある問題

- **何も出ない**: サービス名・ユニット名が正しいか、`journalctl` の `--since` を広げる。
- **権限エラー**: `sudo` が必要なことがあります。

## 関連ドキュメント

- [OAuth認証トラブルシューティング](./OAUTH_TROUBLESHOOTING.md)
- [本番環境OAuth設定ガイド](./PRODUCTION_OAUTH_SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [レンタルサーバー（VPS）デプロイ](./RENTAL_SERVER_DEPLOYMENT.md)
