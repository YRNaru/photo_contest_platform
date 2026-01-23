# Contributing to Photo Contest Platform

このプロジェクトへのご協力ありがとうございます！このガイドラインに従って、スムーズな開発体験を実現しましょう。

## 目次
- [行動規範](#行動規範)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [Issue の作成](#issue-の作成)
- [Pull Request の作成](#pull-request-の作成)
- [コーディング規約](#コーディング規約)
- [コミットメッセージ](#コミットメッセージ)

## 行動規範

このプロジェクトは、すべての参加者に対してオープンで歓迎的な環境を提供することを目指しています。[Code of Conduct](CODE_OF_CONDUCT.md)をご確認ください。

## 開発環境のセットアップ

### 必要な環境
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### セットアップ手順
```bash
# リポジトリのクローン
git clone https://github.com/yourproject/photo_contest_platform.git
cd photo_contest_platform

# バックエンドのセットアップ
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# フロントエンドのセットアップ
cd ../frontend
npm install

# Dockerでの起動
docker-compose up -d
```

## Issue の作成

### Issue の種類
- **Bug Report**: バグを発見した場合
- **Feature Request**: 新機能の提案
- **Question**: 質問がある場合

### Issue 作成のガイドライン
1. 既存の Issue を確認して重複を避ける
2. 適切なテンプレートを使用する
3. 明確で具体的なタイトルをつける
4. 必要な情報をすべて記入する

## Pull Request の作成

### PR を作成する前に
1. Issue が存在することを確認（なければ作成）
2. 最新の main ブランチから新しいブランチを作成
3. コーディング規約に従う
4. テストを追加・実行する
5. ドキュメントを更新する

### ブランチ命名規則
```
feature/issue-番号-簡単な説明
bugfix/issue-番号-簡単な説明
docs/issue-番号-簡単な説明
```

例: `feature/123-add-photo-upload`

### PR の手順
1. フォークしたリポジトリから新しいブランチを作成
2. 変更を加える
3. コミット（適切なコミットメッセージで）
4. フォークリポジトリにプッシュ
5. 元のリポジトリに対してPRを作成
6. PR テンプレートに従って記入
7. レビューを待つ

## コーディング規約

### Python (Backend)
- PEP 8 に準拠
- 型ヒントを使用
- Docstring を追加
- flake8 でリントチェック

```python
def calculate_score(photo_id: int, criteria: dict) -> float:
    """
    写真のスコアを計算する
    
    Args:
        photo_id: 写真のID
        criteria: 評価基準の辞書
    
    Returns:
        計算されたスコア
    """
    pass
```

### JavaScript/TypeScript (Frontend)
- ESLint 設定に準拠
- Prettier でフォーマット
- コンポーネントには JSDoc を追加
- 関数は小さく保つ

```typescript
/**
 * 写真をアップロードする
 * @param file - アップロードするファイル
 * @returns アップロード結果
 */
async function uploadPhoto(file: File): Promise<UploadResult> {
  // 実装
}
```

## コミットメッセージ

### フォーマット
```
<type>: <subject>

<body>

<footer>
```

### Type の種類
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマットなど）
- `refactor`: バグ修正や機能追加ではないコードの変更
- `test`: テストの追加や修正
- `chore`: ビルドプロセスやツールの変更

### 例
```
feat: 写真アップロード機能を追加

複数ファイルのドラッグ&ドロップに対応
プレビュー機能を実装

Closes #123
```

## テスト

### Backend
```bash
cd backend
pytest
pytest --cov=app tests/  # カバレッジ付き
```

### Frontend
```bash
cd frontend
npm test
npm run test:coverage
```

## 質問がある場合

- [Discussions](https://github.com/yourproject/photo_contest_platform/discussions) で質問する
- [Issue](https://github.com/yourproject/photo_contest_platform/issues) を作成する

貢献していただきありがとうございます！ 🎉
