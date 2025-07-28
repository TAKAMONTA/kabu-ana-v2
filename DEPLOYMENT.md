# AI株式分析アプリ - デプロイメントガイド

## 📋 デプロイ前チェックリスト

### 環境変数の設定
`.env.local` に以下の環境変数を設定してください：

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Google Gemini AI
GOOGLE_API_KEY=your_google_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### データベース設定
1. PostgreSQL データベースを準備
2. `database/schema.sql` を実行してテーブルを作成
3. データベース接続情報を環境変数に設定

### PayPal設定
1. PayPal Developer Dashboard でアプリケーションを作成
2. サンドボックス/本番環境の Client ID と Secret を取得
3. Webhook エンドポイントを設定: `https://your-domain.com/api/paypal/webhook`
4. 必要なイベントタイプを有効化：
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`

## 🚀 デプロイ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. テスト実行
```bash
# 単体テスト
npm run test

# E2Eテスト（ブラウザが必要）
npm run install-browsers
npm run test:e2e

# PWAテスト
npm run test:coverage
```

### 3. ビルド
```bash
npm run build
```

### 4. 本番デプロイ

#### Netlify デプロイ
1. GitHub リポジトリにプッシュ
2. Netlify で新しいサイトを作成
3. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `publish`
4. 環境変数を Netlify の設定で追加
5. カスタムドメインを設定（オプション）

#### Vercel デプロイ
1. Vercel CLI をインストール: `npm i -g vercel`
2. `vercel` コマンドを実行
3. 環境変数を Vercel ダッシュボードで設定

#### 手動デプロイ
1. `publish` フォルダの内容を Web サーバーにアップロード
2. HTTPS を有効化
3. Service Worker が正しく動作することを確認

## 🔧 本番環境設定

### HTTPS 必須
PWA機能とPayPal決済にはHTTPS接続が必要です。

### CSP (Content Security Policy)
以下のCSPヘッダーを設定してください：
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://js.paypal.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.paypal.com https://api.sandbox.paypal.com https://generativelanguage.googleapis.com;
```

### Service Worker キャッシュ
- 静的アセットは長期キャッシュ
- API レスポンスは5分間キャッシュ
- 必要に応じてキャッシュバージョンを更新

## 📊 監視・ログ

### 重要な監視項目
1. **決済成功率**: PayPal決済の成功/失敗率
2. **PWA利用率**: インストール数、オフライン利用率
3. **API応答時間**: 株式分析APIの応答速度
4. **エラー率**: JavaScript エラー、API エラー

### ログ設定
```javascript
// 本番環境でのエラーログ
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // エラー追跡サービスに送信
});

// Service Worker エラー
navigator.serviceWorker.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});
```

## 🧪 テスト環境

### ステージング環境
- PayPal サンドボックスを使用
- テスト用のFirebaseプロジェクト
- 実際のAPIキーは使用しない

### テストシナリオ
1. **基本機能テスト**
   - 株式分析の実行
   - 結果表示の確認
   - レスポンシブデザインの確認

2. **決済フローテスト**
   - プラン選択
   - PayPal決済フロー
   - サブスクリプション状態の更新

3. **PWAテスト**
   - インストール機能
   - オフライン動作
   - プッシュ通知

## 🔒 セキュリティ

### API キーの保護
- 環境変数を使用してAPIキーを保護
- クライアントサイドには公開キーのみ
- サーバーサイドでシークレットキーを管理

### PayPal Webhook 検証
```javascript
// Webhook署名の検証を必ず実装
const isValidSignature = await verifyWebhookSignature(req);
if (!isValidSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### CORS設定
```javascript
// 必要なオリジンのみ許可
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.paypal.com'
];
```

## 📈 パフォーマンス最適化

### 画像最適化
- WebP形式の使用
- 適切なサイズでの配信
- 遅延読み込みの実装

### バンドルサイズ
- 不要な依存関係の削除
- コード分割の実装
- Tree shaking の活用

### キャッシュ戦略
- 静的アセット: 長期キャッシュ
- API レスポンス: 短期キャッシュ
- Service Worker: 適切な更新戦略

## 🚨 トラブルシューティング

### よくある問題

1. **PayPal決済が失敗する**
   - Client ID の確認
   - Webhook URL の確認
   - HTTPS接続の確認

2. **PWAインストールができない**
   - manifest.json の確認
   - Service Worker の登録確認
   - HTTPS接続の確認

3. **オフライン機能が動作しない**
   - Service Worker のキャッシュ戦略確認
   - ネットワークリクエストの確認

### デバッグ方法
```javascript
// Service Worker デバッグ
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker ready:', registration);
});

// PayPal デバッグ
window.paypal.Buttons({
  onError: (err) => {
    console.error('PayPal error:', err);
  }
});
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. ブラウザの開発者ツールでエラーログを確認
2. ネットワークタブでAPI通信を確認
3. Service Worker の状態を確認
4. PayPal Developer Dashboard でトランザクション履歴を確認
