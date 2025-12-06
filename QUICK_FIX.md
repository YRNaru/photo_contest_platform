# 🚀 プロフィール画像機能のセットアップ（簡易版）

## ✅ 完了した修正

1. ✅ バックエンドAPIエンドポイント追加
2. ✅ Userモデルにavatarフィールド追加
3. ✅ フロントエンドUI実装
4. ✅ ポート番号修正（8080 → 18000）

## 📋 実行が必要なコマンド

以下のコマンドをターミナルで実行してください：

### 1. マイグレーションを実行

```bash
cd /home/naru_020301/photo_contest_platform
docker-compose exec backend python manage.py migrate accounts
```

### 2. メディアディレクトリの権限設定

```bash
docker-compose exec backend mkdir -p media/avatars
docker-compose exec backend chmod -R 755 media
```

### 3. フロントエンドを再起動（next.config.jsの変更を反映）

```bash
docker-compose restart frontend
```

## 🔍 確認方法

1. フロントエンドが再起動されたら、ブラウザをリロード
2. http://localhost:13000/profile にアクセス
3. 「画像をアップロード」ボタンまたは「Twitterアイコンを使用」ボタンをクリック
4. プロフィール画像が正しく表示されることを確認

## 🎯 修正内容の詳細

### ポート番号の修正
- **変更前**: `http://localhost:8080/media/...`
- **変更後**: `http://localhost:18000/media/...`
- **理由**: Docker Composeでバックエンドはポート18000でホストに公開されている

### Next.jsリライト設定
```javascript
{
  source: '/media/:path*',
  destination: 'http://localhost:18000/media/:path*',
}
```

### 画像の許可設定
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '18000',
      pathname: '/media/**',
    },
    // ...
  ],
}
```

## 🎉 使用可能な機能

1. **画像アップロード**
   - JPG, PNG, WEBP対応
   - リアルタイムプレビュー
   - 自動アップロード

2. **Twitterアイコン使用**
   - ワンクリックで設定
   - 高解像度版（400x400px）を自動取得
   - Twitterユーザー名表示

3. **美しいUI**
   - グラデーションボタン
   - アニメーション効果
   - ダークモード対応
   - レスポンシブデザイン
