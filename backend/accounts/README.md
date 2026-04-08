# Accounts Feature

## 概要

ユーザー認証・OAuth 連携を管理するアプリ。

## モデル

### `User`（CustomUser）
- `AbstractUser` を拡張したカスタムユーザーモデル
- `USERNAME_FIELD = "email"`（メールアドレスで認証）
- 追加フィールド: `avatar`, `avatar_url`, `is_judge`, `is_moderator`

## 認証フロー

- **Google OAuth 2.0**: `@react-oauth/google` → バックエンドの `/api/auth/google/` → JWT 発行
- **Twitter OAuth 2.0**: allauth のリダイレクトフロー → JWT 発行
- **カスタムアダプター**: `adapter.py` でソーシャルアカウントのマッピングを制御

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `models.py` | CustomUser モデル |
| `adapter.py` | allauth カスタムアダプター（ソーシャルログイン制御） |
| `views.py` | ユーザー関連 API エンドポイント |
| `serializers.py` | DRF シリアライザー |

## 注意事項

- JWT トークンは `localStorage` に保存される
- ソーシャルアカウントは `allauth.socialaccount` で管理
- ユーザー削除は物理削除（論理削除なし）
