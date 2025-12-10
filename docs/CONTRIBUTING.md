# コントリビューションガイド

VRChatフォトコンテストプラットフォームへの貢献に興味を持っていただきありがとうございます！

## 開発の流れ

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## コーディング規約

### Python (バックエンド)

- PEP 8に従う
- Black でフォーマット（行長: 127文字）
- isort でインポートを整理
- flake8 でlint
- 型ヒントを使用（可能な限り）

```bash
# フォーマット
make format-backend

# Lint
make lint-backend
```

### TypeScript (フロントエンド)

- ESLint + Prettier に従う
- 関数コンポーネントを優先
- 型定義を明示的に
- コンポーネントは小さく保つ

```bash
# Lint
make lint-frontend
```

## テスト

### バックエンド

```bash
# すべてのテストを実行
make test-backend

# 特定のテストを実行
docker-compose exec backend pytest contest/tests.py::TestClassName::test_method

# カバレッジ付き
docker-compose exec backend pytest --cov
```

### フロントエンド

```bash
# テスト実行
make test-frontend
```

## コミットメッセージ

コミットメッセージは以下の形式に従ってください：

```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの動作に影響しない変更（空白、フォーマットなど）
- `refactor`: バグ修正や機能追加以外のコード変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```
feat: コンテスト一覧ページにフィルター機能を追加

ユーザーがフェーズやタグでコンテストをフィルタリングできるように
検索バーとドロップダウンメニューを追加

Closes #123
```

## プルリクエストのガイドライン

1. **説明を明確に**: 何を変更したか、なぜ変更したかを説明
2. **テストを含める**: 新機能にはテストを追加
3. **ドキュメントを更新**: 必要に応じてREADMEやAPIドキュメントを更新
4. **小さく保つ**: 大きな変更は複数のPRに分割
5. **レビューに対応**: フィードバックには迅速に対応

## Issue の作成

バグ報告や機能リクエストには以下の情報を含めてください：

### バグ報告
- **概要**: 何が起きているか
- **再現手順**: バグを再現する手順
- **期待される動作**: 何が起きるべきか
- **実際の動作**: 実際に何が起きたか
- **環境**: OS、ブラウザ、Dockerバージョンなど
- **スクリーンショット**: 可能であれば

### 機能リクエスト
- **概要**: 何を実現したいか
- **理由**: なぜこの機能が必要か
- **提案**: どのように実装すべきか（あれば）

## 行動規範

- 敬意を持って接する
- 建設的なフィードバックを提供
- 多様性を尊重
- プライバシーを守る

## 質問

質問がある場合は、[Discussions](https://github.com/yourusername/photo_contest_platform/discussions)で遠慮なくお聞きください。

## ライセンス

このプロジェクトに貢献することで、あなたの貢献がMITライセンスの下でライセンスされることに同意したものとみなされます。

