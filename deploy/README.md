# 本番デプロイ用テンプレート

さくら VPS 等で **Nginx + Gunicorn + systemd** 運用するときの設定例です。手順の全体は [docs/RENTAL_SERVER_DEPLOYMENT.md](../docs/RENTAL_SERVER_DEPLOYMENT.md) を参照してください。

| パス | 用途 |
|------|------|
| [nginx/api.conf.example](nginx/api.conf.example) | API（Django）用の `server` ブロック。`/etc/nginx/sites-available/` にコピーして `server_name` を書き換える。 |
| [nginx/frontend.conf.example](nginx/frontend.conf.example) | Next.js（`next start`）用のリバースプロキシ。 |
| [gunicorn.conf.py](gunicorn.conf.py) | Gunicorn（bind・workers・timeout）。本番では `/srv/photo_contest/deploy/` 等に置き、systemd から参照。 |
| [systemd/*.service](systemd/) | `photo-contest-backend` / `frontend` / `celery-worker` / `celery-beat` の unit 例。`User`・`WorkingDirectory` は環境に合わせて編集。 |

デプロイ更新や MySQL・環境変数の詳細は [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) も参照してください。
