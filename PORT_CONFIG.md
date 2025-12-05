# ポート設定一覧

VRChatフォトコンテストプラットフォームで使用するポート番号の一覧です。

## 開発環境のポート番号

| サービス | ホストポート | コンテナポート | 説明 |
|---------|------------|--------------|------|
| **Frontend** | 13000 | 3000 | Next.jsフロントエンド |
| **Backend** | 18000 | 8000 | Django API |
| **MySQL** | 13306 | 3306 | データベース |
| **Redis** | 16379 | 6379 | キャッシュ・Celeryブローカー |

## アクセスURL

### ユーザー向け
- **フロントエンド**: http://localhost:13000
- **API**: http://localhost:18000/api

### 管理者向け
- **Django管理画面**: http://localhost:18000/admin

### 開発者向け
- **MySQL接続**: 
  ```bash
  mysql -h 127.0.0.1 -P 13306 -u contestuser -pcontestpass contest
  ```
- **Redis接続**: 
  ```bash
  redis-cli -h 127.0.0.1 -p 16379
  ```

## ポート番号を変更したい場合

`docker-compose.yml`ファイルの`ports`セクションを編集してください。

```yaml
services:
  frontend:
    ports:
      - "ホストポート:コンテナポート"
```

### 例: フロントエンドのポートを3000に変更

```yaml
  frontend:
    ports:
      - "3000:3000"  # 13000から3000に変更
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:18000/api
```

## 環境変数での設定

以下の環境変数も合わせて確認・更新してください：

### バックエンド（.env）
```bash
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:13000
```

### フロントエンド（.env）
```bash
NEXT_PUBLIC_API_URL=http://localhost:18000/api
```

### データベース接続（ローカル開発時）
```bash
# Dockerを使わない場合
DATABASE_URL=mysql://root:password@localhost:13306/contest
```

## ファイアウォール設定

本番環境では、以下のポートのみ外部に公開してください：
- **80** (HTTP)
- **443** (HTTPS)

データベースやRedisのポートは**外部に公開しないでください**。

## トラブルシューティング

### ポートがすでに使用されている

```bash
# ポートを使用しているプロセスを確認
lsof -i :13000  # Linux/Mac
netstat -ano | findstr :13000  # Windows

# プロセスを停止するか、ポート番号を変更
```

### ポート変更後にアクセスできない

1. `.env`ファイルの`NEXT_PUBLIC_API_URL`を更新
2. コンテナを再起動
   ```bash
   docker-compose down
   docker-compose up --build
   ```

---

最終更新: 2024-12-05

