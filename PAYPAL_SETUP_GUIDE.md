# PayPal 4段階課金プラン セットアップガイド

## 実装完了項目

### 完成した機能
- **4段階課金プラン設計**
  - 無料プラン: ¥0/月 (月3件まで分析)
  - ベーシックプラン: ¥480/月 (月10件まで分析)
  - **スタンダードプラン**: ¥1,480/月 (月30件まで分析、酒田五法対応)
  - プレミアムプラン: ¥3,980/月 (無制限分析)

- **PayPal統合**
  - プラン作成スクリプト (`scripts/create-paypal-plans.js`)
  - Webhookハンドラー (`api/paypal/webhook.js`)
  - サブスクリプション確認API (`api/paypal/subscription/confirm.js`)

- **フロントエンド**
  - 価格表示コンポーネント (`components/PricingPlans.tsx`)
  - PayPal決済ボタン (`components/PayPalSubscriptionButton.tsx`)
  - レスポンシブCSS (`components/PricingPlans.css`)

- **テスト環境**
  - PayPal SDK テストページ (`public/paypal-sdk.html`)
  - 環境変数設定 (`.env.development`)

## 🚀 セットアップ手順

### 1. PayPal Developer Dashboard設定

1. **PayPal Developer Dashboard**にアクセス
   ```
   https://developer.paypal.com/
   ```

2. **サンドボックスアプリケーション作成**
   - 「Create App」をクリック
   - App Name: `AI株式分析サービス`
   - Features: `Accept payments` を選択
   - Client IDとSecretをメモ

3. **Webhook設定**
   - Webhook URL: `https://your-domain.com/api/paypal/webhook`
   - 有効化するイベント:
     - `BILLING.SUBSCRIPTION.CREATED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `PAYMENT.SALE.COMPLETED`

### 2. 環境変数設定

`.env.development` を `.env.local` にコピーして実際の値を設定:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID=YOUR_ACTUAL_WEBHOOK_ID
PAYPAL_MODE=sandbox
PAYPAL_BASE_URL=https://api.sandbox.paypal.com

# Frontend Environment Variables
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. PayPalプラン作成

```bash
# 依存関係インストール
npm install dotenv node-fetch

# PayPalプラン作成実行
node scripts/create-paypal-plans.js
```

成功すると以下のような出力が表示されます:
```
🚀 PayPal サブスクリプションプラン作成を開始...
✅ 商品作成完了: PROD-XXXXXXXXXXXX
✅ ベーシックプラン作成完了: P-XXXXXXXXXXXX
✅ スタンダードプラン作成完了: P-XXXXXXXXXXXX
✅ プレミアムプラン作成完了: P-XXXXXXXXXXXX

🎉 PayPalプラン作成が完了しました！
```

### 4. プランIDの環境変数更新

作成されたプランIDを環境変数に追加:

```bash
# PayPal Plan IDs
PAYPAL_BASIC_PLAN_ID=P-ACTUAL-BASIC-PLAN-ID
PAYPAL_STANDARD_PLAN_ID=P-ACTUAL-STANDARD-PLAN-ID
PAYPAL_PREMIUM_PLAN_ID=P-ACTUAL-PREMIUM-PLAN-ID

# Frontend Plan IDs
REACT_APP_PAYPAL_BASIC_PLAN_ID=P-ACTUAL-BASIC-PLAN-ID
REACT_APP_PAYPAL_STANDARD_PLAN_ID=P-ACTUAL-STANDARD-PLAN-ID
REACT_APP_PAYPAL_PREMIUM_PLAN_ID=P-ACTUAL-PREMIUM-PLAN-ID
```

### 5. フロントエンド統合

#### HTML head部分にPayPal SDKを追加:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&vault=true&intent=subscription&currency=JPY"></script>
```

#### Reactアプリに価格表示コンポーネントを追加:

```jsx
import PricingPlans from './components/PricingPlans';

function App() {
  return (
    <div className="App">
      <PricingPlans />
    </div>
  );
}
```

### 6. テスト実行

#### PayPal SDK テストページでの確認:
```
http://localhost:3000/paypal-sdk.html
```

#### 決済フローテスト:
1. プランを選択
2. PayPalボタンをクリック
3. PayPalサンドボックスアカウントでログイン
4. 決済承認
5. Webhookイベントの確認

## 🔧 トラブルシューティング

### よくある問題

#### 1. PayPal認証エラー (401)
```
❌ エラーが発生しました: PayPal認証エラー: 401
```
**解決方法:**
- Client IDとSecretが正しいか確認
- サンドボックス/本番環境の設定が一致しているか確認

#### 2. プラン作成失敗
```
❌ エラーが発生しました: プラン作成エラー
```
**解決方法:**
- 商品が正常に作成されているか確認
- プラン設定（価格、通貨、間隔）が正しいか確認

#### 3. Webhook署名検証エラー
```
❌ 無効なWebhook署名
```
**解決方法:**
- Webhook IDが正しいか確認
- HTTPS接続が有効か確認

### デバッグ方法

#### ログ確認:
```bash
# サーバーログ
tail -f logs/paypal.log

# ブラウザコンソール
F12 > Console タブ
```

#### PayPal Developer Dashboard:
- Sandbox Accounts でテストアカウント確認
- Webhooks でイベント履歴確認
- API Calls でリクエスト履歴確認

## 📊 プラン機能比較

| 機能 | 無料 | ベーシック | スタンダード | プレミアム |
|------|------|------------|--------------|------------|
| 月間分析数 | 3件 | 10件 | 30件 | 無制限 |
| 広告表示 | あり | なし | なし | なし |
| 銘柄保存 | 制限あり | 可能 | 可能 | 可能 |
| AI分析待機時間 | あり | 短縮 | 短縮 | 短縮 |
| 酒田五法分析 | ❌ | ❌ | ✅ | ✅ |
| 画像アップロード | ❌ | ❌ | ✅ | ✅ |
| 高速レスポンス | ❌ | ❌ | ❌ | ✅ |
| 分析履歴管理 | ❌ | ❌ | ❌ | ✅ |

## 🎯 本番環境への移行

### 1. PayPal本番環境設定
- PayPal Developer Dashboardで本番アプリケーション作成
- 本番用Client ID/Secretを取得

### 2. 環境変数更新
```bash
PAYPAL_MODE=live
PAYPAL_BASE_URL=https://api.paypal.com
```

### 3. SSL証明書設定
- HTTPS接続必須
- Webhook URLもHTTPS必須

### 4. 最終テスト
- 実際のクレジットカードでテスト決済
- Webhook動作確認
- サブスクリプション管理機能確認

## 📞 サポート

問題が発生した場合:
1. このガイドのトラブルシューティングを確認
2. PayPal Developer Documentationを参照
3. 開発チームまでお問い合わせください

---

**PayPal 4段階課金プランの実装が完了しました！** 🎉
