# プロフィール画像機能のセットアップ

## 📋 実行手順

プロフィール画像機能を有効にするには、以下のコマンドを実行してください：

### 1. マイグレーションを実行

```bash
# バックエンドコンテナでマイグレーションを実行
docker-compose exec backend python manage.py migrate accounts

# または、バックエンドコンテナ内に入って実行
docker-compose exec backend bash
python manage.py migrate accounts
exit
```

### 2. メディアディレクトリの作成（既に存在する場合はスキップ）

```bash
docker-compose exec backend mkdir -p media/avatars
docker-compose exec backend chmod 755 media/avatars
```

### 3. バックエンドを再起動（必要な場合）

```bash
docker-compose restart backend
```

## ✅ 確認方法

1. ブラウザで http://localhost:13000/profile にアクセス
2. 「画像をアップロード」ボタンが表示されているか確認
3. 画像を選択してアップロード
4. Twitterアカウントが連携されている場合、「Twitterアイコンを使用」ボタンも表示されます

## 🎨 追加された機能

### フロントエンド
- ✅ プロフィール画像のアップロード機能
- ✅ リアルタイムプレビュー
- ✅ Twitterアイコンの使用機能
- ✅ アップロード中のローディング表示
- ✅ 成功・エラー通知

### バックエンド
- ✅ Userモデルに`avatar`フィールド追加
- ✅ `/api/users/update_me/` エンドポイント（PATCH）
- ✅ `/api/users/set_twitter_icon/` エンドポイント（POST）
- ✅ 画像の自動ダウンロードと保存

## 🔧 トラブルシューティング

### マイグレーションが失敗する場合

```bash
# データベースをチェック
docker-compose exec backend python manage.py showmigrations accounts

# マイグレーションをリセット（注意: データが失われる可能性）
docker-compose exec backend python manage.py migrate accounts zero
docker-compose exec backend python manage.py migrate accounts
```

### 画像がアップロードできない場合

1. Pillowがインストールされているか確認
2. MEDIA_ROOTディレクトリの権限を確認
3. バックエンドのログを確認: `docker-compose logs backend`

## 📝 注意事項

- アップロード可能な画像形式: JPG, PNG, WEBP
- 推奨サイズ: 512x512px 以上
- Twitterアイコンは高解像度版（400x400px）が自動的にダウンロードされます
