# Render ストレージ警告

## ⚠️ 重要な注意事項

Render.comは**一時的なストレージ**を使用します。これは、以下の問題を引き起こす可能性があります：

## 🤔 なぜ一時ストレージなのか？

### Renderの設計上の仕様

Renderは**コンテナベースのPaaS（Platform as a Service）**です。これは以下の理由から、ファイルシステムが一時的（ephemeral）になっています：

1. **スケーラビリティ**
   - 複数のインスタンス間でファイルを共有する必要がない
   - 各インスタンスは独立して動作できる
   - 水平スケーリングが容易

2. **一貫性**
   - デプロイごとにクリーンな環境を提供
   - 古いファイルが残らない
   - 再現性の高いデプロイ

3. **コスト効率**
   - 永続ストレージの管理が不要
   - ストレージコストを削減
   - シンプルなアーキテクチャ

4. **セキュリティ**
   - 再起動時にデータがクリアされる
   - 一時的な機密情報が残らない

### 他のPaaSも同様

多くのPaaSサービスも同様の設計です：
- **Heroku**: Ephemeral filesystem
- **Vercel**: 一時的なファイルシステム
- **Railway**: 一時的なストレージ
- **Fly.io**: 一時的なボリューム

### 現在の設定の問題

現在、このプロジェクトでは：
```python
USE_S3 = os.environ.get("USE_S3", "False") == "True"
```

デフォルトで`USE_S3=False`になっているため、ローカルファイルシステム（`MEDIA_ROOT = BASE_DIR / "media"`）に保存しています。

**開発環境では問題ありませんが、本番環境（Render）では：**
- ファイルは一時的に保存される
- 再起動・デプロイ時に削除される
- 画像が表示されなくなる

1. **再起動時にメディアファイルが失われる**
   - アプリケーションの再起動（デプロイ、スケーリング、メンテナンスなど）により、`MEDIA_ROOT`に保存されたファイルが削除されます
   - アップロードした画像、アバター、バナーなどが表示されなくなる可能性があります

2. **データの永続化が必要**
   - 本番環境では、S3、Cloudflare R2、またはその他の永続ストレージを使用することを**強く推奨**します

## 🔧 解決策

### オプション1: Cloudflare R2 を使用（推奨）

1. Cloudflare R2バケットを作成
2. 環境変数を設定：
   ```
   USE_S3=True
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-key>
   AWS_STORAGE_BUCKET_NAME=<your-bucket-name>
   AWS_S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
   AWS_S3_REGION_NAME=auto
   ```

詳細は `docs/CLOUDFLARE_OPTIMIZATION.md` を参照してください。

### オプション2: AWS S3 を使用

1. AWS S3バケットを作成
2. 環境変数を設定：
   ```
   USE_S3=True
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-key>
   AWS_STORAGE_BUCKET_NAME=<your-bucket-name>
   AWS_S3_REGION_NAME=<your-region>
   ```

### オプション3: 一時的な回避策（非推奨）

現在、Next.jsの画像最適化を無効化しています（`next.config.js`で`unoptimized: true`）。これは一時的な回避策であり、根本的な解決策ではありません。

## 📝 現在の設定

- `USE_S3=False`の場合：ローカルストレージ（Renderでは再起動時に失われる）
- `USE_S3=True`の場合：S3/R2ストレージ（推奨）

## 🚀 移行手順

既存のデータをS3/R2に移行する場合：

1. S3/R2バケットを作成
2. 環境変数を設定
3. Django管理コマンドで既存ファイルをアップロード（必要に応じて）

```python
# カスタム管理コマンドの例
python manage.py migrate_media_to_s3
```
