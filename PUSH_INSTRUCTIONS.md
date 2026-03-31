# 本番反映の目安

本番は **VPS（レンタルサーバー）** 上の `git pull` と **systemd 再起動** で反映する運用を想定しています。

- 手順全体: [docs/RENTAL_SERVER_DEPLOYMENT.md](docs/RENTAL_SERVER_DEPLOYMENT.md)
- 環境変数・OAuth・ストレージ: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

`DisallowedHost` が出る場合は、本番の `ALLOWED_HOSTS` に実際の API ドメイン（カンマ区切り）が入っているか確認し、変更後にバックエンドを再起動してください。

Render 向けの旧手順は [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) を参照してください（参考）。
