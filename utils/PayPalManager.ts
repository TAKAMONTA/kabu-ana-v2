// PayPalManager.ts - PayPalスクリプトの統一管理クラス

declare global {
  interface Window {
    paypal?: any;
  }
}

class PayPalManager {
  private static instance: PayPalManager;
  private scriptLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;
  private clientId: string = '';

  private constructor() {}

  static getInstance(): PayPalManager {
    if (!PayPalManager.instance) {
      PayPalManager.instance = new PayPalManager();
    }
    return PayPalManager.instance;
  }

  /**
   * PayPalスクリプトを読み込む
   * @param clientId PayPalクライアントID
   * @param options 追加オプション
   */
  async loadPayPalScript(
    clientId: string, 
    options: {
      currency?: string;
      components?: string;
      intent?: string;
    } = {}
  ): Promise<void> {
    // 既に読み込み済みで同じクライアントIDの場合
    if (this.scriptLoaded && this.clientId === clientId) {
      return Promise.resolve();
    }

    // 読み込み中の場合は既存のPromiseを返す
    if (this.loadingPromise && this.clientId === clientId) {
      return this.loadingPromise;
    }

    // 既存のスクリプトを削除（異なるクライアントIDの場合）
    if (this.clientId !== clientId) {
      this.removeExistingScript();
    }

    this.clientId = clientId;

    this.loadingPromise = new Promise((resolve, reject) => {
      // 既存のスクリプトをチェック
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);
      if (existingScript && window.paypal) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      // スクリプトURLの構築
      const baseUrl = 'https://www.paypal.com/sdk/js';
      const params = new URLSearchParams({
        'client-id': clientId,
        currency: options.currency || 'USD',
        components: options.components || 'buttons',
        ...(options.intent && { intent: options.intent })
      });

      const script = document.createElement('script');
      script.src = `${baseUrl}?${params.toString()}`;
      script.async = true;
      script.defer = true;
      
      // 成功時のハンドリング
      script.onload = () => {
        console.log('PayPal script loaded successfully');
        this.scriptLoaded = true;
        resolve();
      };
      
      // エラー時のハンドリング
      script.onerror = (error) => {
        console.error('PayPal script failed to load:', error);
        this.scriptLoaded = false;
        this.loadingPromise = null;
        reject(new Error('PayPal script failed to load'));
      };

      // タイムアウト処理
      setTimeout(() => {
        if (!this.scriptLoaded) {
          console.error('PayPal script loading timeout');
          reject(new Error('PayPal script loading timeout'));
        }
      }, 10000); // 10秒タイムアウト

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * PayPalスクリプトが読み込まれているかチェック
   */
  isLoaded(): boolean {
    return this.scriptLoaded && typeof window.paypal !== 'undefined';
  }

  /**
   * PayPalオブジェクトを取得
   */
  getPayPal(): any {
    if (!this.isLoaded()) {
      throw new Error('PayPal script is not loaded yet');
    }
    return window.paypal;
  }

  /**
   * 既存のPayPalスクリプトを削除
   */
  private removeExistingScript(): void {
    const scripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    scripts.forEach(script => script.remove());
    
    // PayPalオブジェクトもクリア
    if (window.paypal) {
      delete window.paypal;
    }
    
    this.scriptLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * PayPalスクリプトを完全にリセット
   */
  reset(): void {
    this.removeExistingScript();
    this.clientId = '';
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo(): object {
    return {
      scriptLoaded: this.scriptLoaded,
      clientId: this.clientId,
      loadingPromise: !!this.loadingPromise,
      paypalAvailable: typeof window.paypal !== 'undefined'
    };
  }
}

export default PayPalManager;
