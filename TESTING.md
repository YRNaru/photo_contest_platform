# テストガイド

このドキュメントでは、Photo Contest Platformのテストの実行方法と、テストコードの記述方法について説明します。

## 目次

1. [テストの概要](#テストの概要)
2. [バックエンドテスト](#バックエンドテスト)
3. [フロントエンドテスト](#フロントエンドテスト)
4. [テストの実行方法](#テストの実行方法)
5. [テストカバレッジ](#テストカバレッジ)
6. [継続的インテグレーション](#継続的インテグレーション)

## テストの概要

このプロジェクトでは、以下のテストフレームワークを使用しています：

### バックエンド（Django）
- **pytest**: テストランナー
- **pytest-django**: Django統合
- **pytest-cov**: カバレッジ測定

### フロントエンド（Next.js）
- **Jest**: テストランナー
- **React Testing Library**: コンポーネントテスト
- **axios-mock-adapter**: APIモック

## バックエンドテスト

### ディレクトリ構造

```
backend/
├── accounts/
│   └── tests.py          # アカウント関連テスト
├── contest/
│   └── tests.py          # コンテスト関連テスト
└── pytest.ini            # pytest設定
```

### テストの種類

#### 1. モデルテスト
データベースモデルの動作を検証します。

```python
class UserModelTest(TestCase):
    def test_user_creation(self):
        """ユーザーが正しく作成される"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
```

#### 2. APIテスト
RESTful APIエンドポイントの動作を検証します。

```python
class UserAPITest(APITestCase):
    def test_get_users_list(self):
        """ユーザー一覧を取得"""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

#### 3. 権限テスト
ユーザー権限とアクセス制御を検証します。

```python
class ModeratorPermissionsTest(APITestCase):
    def test_moderator_can_approve_entry(self):
        """モデレーターはエントリーを承認できる"""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/entries/{self.entry.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### テストの実行

#### 基本的な実行
```bash
cd backend
pytest
```

#### 詳細な出力
```bash
pytest -v
```

#### 特定のテストファイル
```bash
pytest accounts/tests.py
pytest contest/tests.py
```

#### 特定のテストクラス
```bash
pytest accounts/tests.py::UserModelTest
```

#### 特定のテストメソッド
```bash
pytest accounts/tests.py::UserModelTest::test_user_creation
```

## フロントエンドテスト

### ディレクトリ構造

```
frontend/
├── components/
│   └── __tests__/
│       ├── ContestCard.test.tsx
│       └── Header.test.tsx
├── lib/
│   └── __tests__/
│       ├── api.test.ts
│       └── utils.test.ts
├── jest.config.js        # Jest設定
└── jest.setup.js         # テストセットアップ
```

### テストの種類

#### 1. コンポーネントテスト
Reactコンポーネントの表示とインタラクションを検証します。

```typescript
describe('ContestCard', () => {
  it('renders contest information correctly', () => {
    render(<ContestCard contest={mockContest} />)
    expect(screen.getByText('Test Contest')).toBeInTheDocument()
  })
})
```

#### 2. APIテスト
API呼び出しとレスポンス処理を検証します。

```typescript
describe('Contest API', () => {
  it('should fetch contests list', async () => {
    const mockData = [{ id: 1, title: 'Test Contest' }]
    mock.onGet('/contests/').reply(200, mockData)
    
    const response = await contestApi.getContests()
    expect(response.data).toEqual(mockData)
  })
})
```

#### 3. ユーティリティテスト
ヘルパー関数やユーティリティ関数を検証します。

```typescript
describe('Date Formatting', () => {
  it('should format ISO date string', () => {
    const isoDate = '2024-01-01T00:00:00Z'
    const date = new Date(isoDate)
    expect(date.getFullYear()).toBe(2024)
  })
})
```

### テストの実行

#### 基本的な実行
```bash
cd frontend
npm test
```

#### ウォッチモード（開発中）
```bash
npm run test:watch
```

#### 特定のテストファイル
```bash
npm test ContestCard.test
```

## テストの実行方法

### 便利なスクリプト

プロジェクトルートに以下のスクリプトを用意しています：

#### 1. バックエンドテストのみ
```bash
./test_backend.sh
```

オプション：
- `--coverage`: カバレッジレポート付き
- `--verbose`: 詳細な出力
- `--failed`: 前回失敗したテストのみ

例：
```bash
./test_backend.sh --coverage
```

#### 2. フロントエンドテストのみ
```bash
./test_frontend.sh
```

オプション：
- `--coverage`: カバレッジレポート付き
- `--watch`: ウォッチモード

例：
```bash
./test_frontend.sh --coverage
```

#### 3. すべてのテスト
```bash
./test_all.sh
```

カバレッジ付き：
```bash
./test_all.sh --coverage
```

### スクリプトに実行権限を付与

初回のみ、以下のコマンドを実行してください：

```bash
chmod +x test_backend.sh test_frontend.sh test_all.sh
```

## テストカバレッジ

### バックエンド

カバレッジレポートの生成：
```bash
cd backend
pytest --cov=. --cov-report=html --cov-report=term
```

HTMLレポートは `backend/htmlcov/index.html` に生成されます。

ブラウザで確認：
```bash
open backend/htmlcov/index.html  # macOS
xdg-open backend/htmlcov/index.html  # Linux
```

### フロントエンド

カバレッジレポートの生成：
```bash
cd frontend
npm run test:coverage
```

HTMLレポートは `frontend/coverage/index.html` に生成されます。

ブラウザで確認：
```bash
open frontend/coverage/index.html  # macOS
xdg-open frontend/coverage/index.html  # Linux
```

## テストの書き方

### バックエンド

#### 新しいテストファイルの作成

各Djangoアプリの `tests.py` ファイルにテストを追加します。

```python
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

class MyModelTest(TestCase):
    """モデルのテスト"""
    
    def setUp(self):
        # テストデータのセットアップ
        pass
    
    def test_something(self):
        # テストケース
        pass

class MyAPITest(APITestCase):
    """APIのテスト"""
    
    def setUp(self):
        # テストデータのセットアップ
        self.client = APIClient()
    
    def test_api_endpoint(self):
        response = self.client.get('/api/endpoint/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### フロントエンド

#### 新しいテストファイルの作成

`__tests__` ディレクトリにテストファイルを作成します。

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

## ベストプラクティス

### 1. テストの命名
- テストメソッド名は `test_` で始める（Python）
- 何をテストしているかを明確に記述
- 日本語でのコメントを活用

### 2. テストの構造
- **Arrange**: テストデータのセットアップ
- **Act**: テスト対象の実行
- **Assert**: 結果の検証

### 3. テストの独立性
- 各テストは独立して実行可能にする
- テスト間で状態を共有しない
- `setUp` と `tearDown` を適切に使用

### 4. モックの使用
- 外部依存（API、データベース等）はモックする
- テストの実行速度を最適化

### 5. カバレッジ目標
- 重要な機能は100%カバー
- 全体で80%以上のカバレッジを目指す

## トラブルシューティング

### バックエンド

#### テストデータベースのエラー
```bash
# データベースをリセット
python manage.py flush --no-input
python manage.py migrate
```

#### import エラー
```bash
# Pythonパスの確認
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

### フロントエンド

#### モジュールが見つからない
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

#### Jestキャッシュのクリア
```bash
npm test -- --clearCache
```

## 継続的インテグレーション

### GitHub Actions

`.github/workflows/test.yml` でCI/CDパイプラインを設定できます。

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: ./test_backend.sh --coverage
  
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run frontend tests
        run: ./test_frontend.sh --coverage
```

## まとめ

このガイドに従って、プロジェクトのテストを効率的に管理できます。質問や問題がある場合は、開発チームにお問い合わせください。

---

**参考リンク：**
- [pytest ドキュメント](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [React Testing Library](https://testing-library.com/react)
- [Jest ドキュメント](https://jestjs.io/ja/)

