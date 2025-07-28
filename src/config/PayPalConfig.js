// PayPal設定ファイル - 緊急対応版（ハードコーディング）
// 環境変数エラーを回避し、直接設定でPayPal機能を動作させる

const PayPalConfig = {
  // 直接設定（環境変数に依存しない）
  clientId: 'Af1Azw69JIUiM--lIMTHTPUkabuSMNyqhMcncuzWaeZ0z4lr73Tj66mxBpbNLylimKxdkJIFCPJn7sMC',
  mode: 'sandbox',
  
  // PayPalプランID（paypal-setup.jsで作成された実際のID）
  plans: {
    basic: 'P-8G75275349810225FNCAGLNI',
    standard: 'P-82X42005YX321573ENCAGLNQ', 
    premium: 'P-18E538664T4008946NCAGLNQ'
  },
  
  // プランID取得
  getPlanId(planType) {
    const planId = this.plans[planType];
    
    if (!planId) {
      console.warn(`PayPal ${planType} plan not configured`);
      return null;
    }
    
    console.log(`💳 PayPal ${planType} plan ID: ${planId}`);
    return planId;
  },

  // 設定状態の確認
  isConfigured() {
    return !!(this.clientId && this.clientId.length > 0);
  },

  isFullyConfigured() {
    return this.isConfigured() && 
           this.getPlanId('basic') && 
           this.getPlanId('standard') && 
           this.getPlanId('premium');
  },

  // SDK URL生成
  getSDKUrl() {
    return `https://www.paypal.com/sdk/js?client-id=${this.clientId}&vault=true&intent=subscription&currency=JPY`;
  },

  // デバッグ情報（ハードコーディング版）
  getDebugInfo() {
    return {
      env: {
        mode: 'development',
        dev: true,
        prod: false
      },
      config: {
        clientId: this.clientId ? `${this.clientId.substring(0, 25)}...` : 'NOT_SET',
        mode: this.mode,
        basicPlan: this.getPlanId('basic') || 'NOT_SET',
        standardPlan: this.getPlanId('standard') || 'NOT_SET',
        premiumPlan: this.getPlanId('premium') || 'NOT_SET'
      },
      status: {
        isConfigured: this.isConfigured(),
        isFullyConfigured: this.isFullyConfigured()
      },
      hardcoded: {
        method: 'HARDCODED',
        reason: 'Environment variable error bypass',
        timestamp: new Date().toISOString()
      }
    };
  }
};

// 初期化時のデバッグ
console.log('🔧 PayPal Config Debug:', PayPalConfig.getDebugInfo());

export default PayPalConfig;
