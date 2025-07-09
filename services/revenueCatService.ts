
export interface RevenueCatProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: {
    price: number;
    priceString: string;
    period: string;
    cycles: number;
  };
}

export interface RevenueCatPurchase {
  productIdentifier: string;
  purchaseDate: string;
  transactionIdentifier: string;
  originalTransactionIdentifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: 'NORMAL' | 'TRIAL' | 'INTRO';
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate?: string;
  unsubscribeDetectedAt?: string;
  billingIssueDetectedAt?: string;
}

export interface RevenueCatCustomerInfo {
  originalAppUserId: string;
  originalApplicationVersion?: string;
  originalPurchaseDate?: string;
  requestDate: string;
  firstSeen: string;
  activeSubscriptions: string[];
  allPurchasesByProduct: { [key: string]: RevenueCatPurchase };
  allExpirationDatesByProduct: { [key: string]: string };
  entitlements: {
    active: { [key: string]: RevenueCatPurchase };
    all: { [key: string]: RevenueCatPurchase };
  };
}

export class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;
  private mockMode = true;

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async configure(apiKey: string, userId?: string): Promise<void> {
    try {
      if (this.mockMode) {
        console.log('RevenueCat configured in mock mode');
        this.isConfigured = true;
        return;
      }
      
      console.log('RevenueCat Web SDK configured successfully with API key:', apiKey.substring(0, 8) + '...');
      console.log('User ID:', userId);
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw error;
    }
  }

  async getProducts(): Promise<RevenueCatProduct[]> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    if (this.mockMode) {
      return [
        {
          identifier: 'basic_ume_monthly',
          description: 'ベーシック（梅）プラン - 月額',
          title: 'ベーシック（梅）',
          price: 480,
          priceString: '¥480',
          currencyCode: 'JPY'
        },
        {
          identifier: 'standard_take_monthly',
          description: 'スタンダード（竹）プラン - 月額',
          title: 'スタンダード（竹）',
          price: 980,
          priceString: '¥980',
          currencyCode: 'JPY'
        },
        {
          identifier: 'premium_matsu_monthly',
          description: 'プレミアム（松）プラン - 月額',
          title: 'プレミアム（松）',
          price: 2480,
          priceString: '¥2,480',
          currencyCode: 'JPY'
        },
        {
          identifier: 'single_stock_purchase',
          description: '単発銘柄分析権',
          title: '単発購入',
          price: 150,
          priceString: '¥150',
          currencyCode: 'JPY'
        }
      ];
    }

    throw new Error('RevenueCat integration not implemented for production');
  }

  async purchaseProduct(productIdentifier: string): Promise<RevenueCatPurchase> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    if (this.mockMode) {
      const now = new Date().toISOString();
      const expirationDate = productIdentifier.includes('monthly') 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      return {
        productIdentifier,
        purchaseDate: now,
        transactionIdentifier: `mock_${Date.now()}`,
        originalTransactionIdentifier: `mock_${Date.now()}`,
        isActive: true,
        willRenew: productIdentifier.includes('monthly'),
        periodType: 'NORMAL',
        latestPurchaseDate: now,
        originalPurchaseDate: now,
        expirationDate
      };
    }

    throw new Error('RevenueCat integration not implemented for production');
  }

  async getCustomerInfo(): Promise<RevenueCatCustomerInfo> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    if (this.mockMode) {
      const now = new Date().toISOString();
      return {
        originalAppUserId: 'mock_user',
        requestDate: now,
        firstSeen: now,
        activeSubscriptions: [],
        allPurchasesByProduct: {},
        allExpirationDatesByProduct: {},
        entitlements: {
          active: {},
          all: {}
        }
      };
    }

    throw new Error('RevenueCat integration not implemented for production');
  }

  async restorePurchases(): Promise<RevenueCatCustomerInfo> {
    return this.getCustomerInfo();
  }

  async syncPurchases(): Promise<RevenueCatCustomerInfo> {
    return this.getCustomerInfo();
  }

  async createWebCheckoutSession(productIdentifier: string): Promise<{ checkoutUrl: string }> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    if (this.mockMode) {
      return {
        checkoutUrl: `https://mock-checkout.revenuecat.com/${productIdentifier}?user_id=mock_user&success_url=${encodeURIComponent(window.location.origin)}`
      };
    }

    try {
      const checkoutUrl = `https://api.revenuecat.com/v1/checkout/${productIdentifier}?user_id=${encodeURIComponent('web_user')}&success_url=${encodeURIComponent(window.location.origin)}`;
      return { checkoutUrl };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async getWebProducts(): Promise<RevenueCatProduct[]> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    if (this.mockMode) {
      return this.getProducts();
    }

    try {
      return this.getProducts();
    } catch (error) {
      console.error('Failed to get web products:', error);
      throw error;
    }
  }
}
