# 本番環境でのログ確認方法

Render.comの本番環境でログを確認する方法です。

## 📋 ログの確認方法

### 方法1: Render.comダッシュボード（推奨）

1. [Render.com](https://dashboard.render.com/) にログイン
2. バックエンドサービスを選択
3. 左側のメニューから **Logs** をクリック
4. リアルタイムでログが表示されます

### 方法2: ログの検索

Render.comのログビューアには検索機能があります：

- **検索ボックス**にキーワードを入力
- 例: `OAuth`, `Error`, `pre_social_login`, `save_user`

### 方法3: ログのフィルタリング

ログレベルでフィルタリングできます：

- **INFO**: 通常の情報ログ
- **WARNING**: 警告ログ
- **ERROR**: エラーログ

---

## 🔍 OAuth認証エラーのログ確認

### 検索キーワード

OAuth認証の問題を調査する際は、以下のキーワードで検索してください：

```
pre_social_login
save_user
OAuth Error
Error in
```

### 正常なログの例

```
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:31 - pre_social_login called: provider=google, is_existing=False
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:47 - Email from email_addresses: user@example.com
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:58 - Found 0 existing users with email: user@example.com
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:60 - No existing user found, will create new user
[INFO] 2025-01-15 10:30:45 accounts.adapter.save_user:95 - save_user called: email=user@example.com
[INFO] 2025-01-15 10:30:45 accounts.adapter.save_user:103 - Creating new user
[INFO] 2025-01-15 10:30:45 accounts.adapter.save_user:106 - New user created: user@example.com
```

### エラーログの例

```
[ERROR] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:85 - [OAuth Error] pre_social_login failed: ...
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:86 - [OAuth Error] Provider: google
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:87 - [OAuth Error] Exception type: IntegrityError
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:88 - [OAuth Error] Exception message: duplicate key value violates unique constraint
```

---

## 📝 ログフォーマット

ログは以下のフォーマットで出力されます：

```
[LEVEL] YYYY-MM-DD HH:MM:SS module.function:line - message
```

例:
```
[INFO] 2025-01-15 10:30:45 accounts.adapter.pre_social_login:31 - pre_social_login called: provider=google
```

---

## 🐛 よくある問題

### ログが表示されない

**原因**: ログレベルが高すぎる、またはログが出力されていない

**対処法**:
1. Render.comのダッシュボードで **Logs** タブを確認
2. 検索ボックスで `INFO` や `ERROR` を検索
3. 時間範囲を調整（最新のログを表示）

### ログが多すぎる

**対処法**:
1. 検索ボックスで特定のキーワードを検索
2. ログレベルでフィルタリング（ERRORのみ表示など）
3. 時間範囲を絞り込む

### リアルタイムでログが見れない

**対処法**:
1. ページをリロード
2. ブラウザのキャッシュをクリア
3. 別のブラウザで試す

---

## 💡 ヒント

- **ログは保持期間が限られている**ため、重要なエラーはすぐに確認してください
- **検索機能を活用**して、特定のエラーを素早く見つけられます
- **エラーログには詳細情報**が含まれているため、問題の原因を特定しやすくなります

---

## 🔗 関連ドキュメント

- [OAuth認証トラブルシューティング](./OAUTH_TROUBLESHOOTING.md)
- [本番環境OAuth設定ガイド](./PRODUCTION_OAUTH_SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
