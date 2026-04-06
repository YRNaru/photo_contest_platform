# Cloudflare 最適化設定ガイド

Cloudflareを使用してパフォーマンスとセキュリティを最大化するための設定ガイドです。

## 📊 基本設定

### 1. SSL/TLS設定

**Cloudflare Dashboard → SSL/TLS**

```
暗号化モード: Full (strict)
最小TLSバージョン: TLS 1.2
自動HTTPS書き換え: ON
常にHTTPSを使用: ON
TLS 1.3: ON
```

### 2. キャッシュ設定

**Cloudflare Dashboard → Caching → Configuration**

```
キャッシュレベル: Standard
ブラウザキャッシュTTL: Respect Existing Headers
```

### 3. ページルール（Page Rules）

**Cloudflare Dashboard → Rules → Page Rules**

#### ルール1: API はキャッシュしない

```
URL: api.your-photocontest.com/*
設定:
  - Cache Level: Bypass
  - Disable Performance
```

#### ルール2: 画像ファイルを長時間キャッシュ

```
URL: *your-photocontest.com/*.jpg
URL: *your-photocontest.com/*.png
URL: *your-photocontest.com/*.jpeg
URL: *your-photocontest.com/*.webp
設定:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day
```

#### ルール3: 静的アセットをキャッシュ

```
URL: *your-photocontest.com/_next/static/*
設定:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
```

### 4. セキュリティ設定

**Cloudflare Dashboard → Security**

#### ファイアウォールルール

```
ルール1: 管理画面を保護
Expression: (http.request.uri.path contains "/admin/")
Action: Managed Challenge

ルール2: API レート制限
Expression: (http.request.uri.path contains "/api/")
Action: Rate Limit (100 requests per minute)

ルール3: 特定の国からのアクセスを制限（オプション）
Expression: (ip.geoip.country ne "JP" and http.request.uri.path contains "/admin/")
Action: Block
```

#### Bot Fight Mode

```
Bot Fight Mode: ON
Super Bot Fight Mode: ON (Proプラン以上)
```

#### DDoS Protection

```
HTTP DDoS Attack Protection: ON
Network-layer DDoS Attack Protection: ON（自動）
```

### 5. パフォーマンス最適化

**Cloudflare Dashboard → Speed**

#### Auto Minify

```
JavaScript: ON
CSS: ON
HTML: ON
```

#### Brotli

```
Brotli: ON
```

#### Early Hints

```
Early Hints: ON
```

#### Rocket Loader（注意）

```
Rocket Loader: OFF
※ Next.jsと競合する可能性があるため、OFFを推奨
```

## 🖼️ Cloudflare R2 画像配信最適化

### R2 Public バケット設定

1. **R2 Dashboard → バケット → Settings**

```
Public Access: Enable
Custom Domain: img.your-photocontest.com （オプション）
```

2. **カスタムドメインの設定（オプション）**

```bash
# Cloudflare DNS設定
Type: CNAME
Name: img
Content: pub-xxxxx.r2.dev
Proxy: Proxied（オレンジ）

# 本番サーバーの環境変数を更新
AWS_S3_CUSTOM_DOMAIN=img.your-photocontest.com
```

### 画像変換ワーカー（Cloudflare Workers）

R2画像を動的にリサイズ・最適化する場合：

```javascript
// workers/image-resize.js

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 画像パラメータ取得
    const width = url.searchParams.get('w');
    const quality = url.searchParams.get('q') || '85';
    
    // R2から画像取得
    const object = await env.R2_BUCKET.get(path.slice(1));
    
    if (!object) {
      return new Response('Not found', { status: 404 });
    }
    
    // 画像変換（Cloudflare Image Resizing使用）
    const resizeOptions = {
      cf: {
        image: {
          width: width ? parseInt(width) : undefined,
          quality: parseInt(quality),
          format: 'auto',
        }
      }
    };
    
    return fetch(request, resizeOptions);
  }
};
```

## 🔐 セキュリティベストプラクティス

### 1. HTTP セキュリティヘッダー

**Transform Rules で追加:**

```
ルール名: セキュリティヘッダー追加
When: All incoming requests
Then: 
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 2. CSP（Content Security Policy）

Next.js の `next.config.js` で設定:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https: *.r2.dev img.your-photocontest.com;
      font-src 'self';
      connect-src 'self' api.your-photocontest.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📈 モニタリング設定

### Cloudflare Analytics

**Dashboard → Analytics**

- トラフィック監視
- キャッシュヒット率確認
- セキュリティイベント監視

### Cloudflare Logs（Enterprise）

ログをエクスポートして詳細分析:

```bash
# Logpushの設定（Enterpriseプラン）
# S3やDatadogなどに送信可能
```

### アラート設定

**Dashboard → Notifications**

```
トラフィック異常: ON
DDoS攻撃検知: ON
SSL証明書期限: ON
```

## 🚀 パフォーマンステスト

### ツール

```bash
# Lighthouse（Chrome DevTools）
# PageSpeed Insights
https://pagespeed.web.dev/

# WebPageTest
https://www.webpagetest.org/

# Cloudflare Observatory
https://observatory.cloudflare.com/
```

### 目標スコア

```
Performance: 90+
Accessibility: 95+
Best Practices: 90+
SEO: 90+
```

## 💡 コスト最適化

### R2 コスト削減

```
1. 不要な古い画像を定期削除
2. Lifecycle Policyで自動削除設定
3. 画像アップロード時にリサイズ（Celeryタスク）
4. WebP/AVIF形式に変換
```

### Cloudflare Workers 使用量管理

```
Freeプラン: 100,000 リクエスト/日
有料プラン: $5/1000万リクエスト
```

## 🔄 デプロイチェックリスト

本番環境にデプロイする前の確認事項:

- [ ] Cloudflare DNS設定完了
- [ ] SSL/TLS: Full (strict)
- [ ] R2バケット作成＆CORS設定
- [ ] 本番サーバーの環境変数設定（R2含む）
- [ ] セキュリティヘッダー設定
- [ ] ページルール設定
- [ ] Bot Fight Mode有効化
- [ ] 画像アップロードテスト
- [ ] パフォーマンステスト実施

---

詳細は公式ドキュメントも参照してください:
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

