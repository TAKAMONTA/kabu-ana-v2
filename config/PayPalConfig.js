/**
 * PayPal設定ファイル（本番環境用）
 * 
 * 本番環境用のPayPal設定を管理します。
 * 環境変数から値を取得し、利用できない場合はハードコードされた値を使用します。
 */

const PayPalConfig = {
  // 本番環境用のクライアントID
  clientId: process.env.VITE_PAYPAL_CLIENT_ID || 'ARukwdI9ASOcs2IRs3VMcEeppq9vboiLa4L5uPL3_sYbHbJPFjlZalwBFRR3i0UqBWF66bpNohbVxElN',
  
  // 本番環境用のプランID
  plans: {
    basic: process.env.VITE_PAYPAL_BASIC_PLAN_ID || 'P-0XW838004V548164XNB7VMOQ',
    standard: process.env.VITE_PAYPAL_STANDARD_PLAN_ID || 'P-6B26461844853745CNB7VMOQ',
    premium: process.env.VITE_PAYPAL_PREMIUM_PLAN_ID || 'P-1FG34012BK8809643NB7VMOY',
  },
  
  // 本番環境用の設定
  mode: 'live',
  baseUrl: 'https://api.paypal.com',
  
  // 設定状態の確認
  isConfigured: function() {
    return !!this.clientId && !!this.plans.basic && !!this.plans.standard && !!this.plans.premium;
  },
  
  // 設定値の取得
  getClientId: function() {
    return this.clientId;
  },
  
  getPlanId: function(planType) {
    return this.plans[planType] || null;
  },
  
  // 本番環境かどうかの確認
  isProduction: function() {
    return this.mode === 'live';
  }
};

export default PayPalConfig;
