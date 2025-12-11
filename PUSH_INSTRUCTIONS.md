# デプロイ手順

## 問題
バックエンドが古いコードでデプロイされており、`DisallowedHost` エラーが発生しています。

## 解決方法1: GitHubにプッシュして自動デプロイ（推奨）

```bash
cd /home/naru_020301/photo_contest_platform
git push origin main
```

これでGitHub Actionsが自動的にRenderにデプロイします。

## 解決方法2: Renderで環境変数を設定（即座の対処）

Render.com ダッシュボード → Backend Service → Environment タブで以下を追加:

```
ALLOWED_HOSTS=photo-contest-platform.onrender.com,.onrender.com,localhost,127.0.0.1
```

追加後、**Manual Deploy** → **Deploy latest commit** をクリック。

## 解決方法3: Renderで手動デプロイ

Render.com ダッシュボード → Backend Service:

1. **Manual Deploy** をクリック
2. **Clear build cache & deploy** を選択
3. デプロイ完了を待つ

---

## 確認方法

デプロイ後、以下のコマンドでCORSヘッダーを確認:

```bash
curl -I -H "Origin: https://photo-contest-platform-1.onrender.com" https://photo-contest-platform.onrender.com/api/contests/
```

`access-control-allow-origin` ヘッダーが含まれていればOK。
