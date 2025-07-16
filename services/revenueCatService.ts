
import { Purchases } from '@revenuecat/purchases-js';
import { RobustApiClient, RetryConfig, createRetryConfig } from "./apiUtils";

const REVENUECAT_RETRY_CONFIG: RetryConfig = createRetryConfig({
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 5000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'INTERNAL_ERROR', 'BILLING_UNAVAILABLE']
});

const apiClient = new RobustApiClient();

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
  private mockMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
      
      if (!apiKey || apiKey === 'test_key' || apiKey === 'rc_web_api_key_placeholder' || apiKey.includes('placeholder')) {
        console.warn('RevenueCat: Invalid or placeholder API key detected, running in mock mode');
        this.mockMode = true;
        this.isConfigured = true;
        return;
      }
      
      const operation = async () => {
        return Purchases.configure({
          apiKey: apiKey,
          appUserId: userId || 'anonymous'
        });
      };
      
      await apiClient.executeWithRetry(operation, REVENUECAT_RETRY_CONFIG, 'revenuecat-configure');
      this.isConfigured = true;
      console.log('RevenueCat Web SDK configured successfully');
    } catch (error) {
      console.error('Failed to configure RevenueCat after retries:', error);
      console.warn('RevenueCat: Falling back to mock mode due to configuration error');
      this.mockMode = true;
      this.isConfigured = true;
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

    try {
      const operation = async () => {
        const offerings = await Purchases.getSharedInstance().getOfferings();
        const products: RevenueCatProduct[] = [];
        
        if (offerings.current) {
          for (const pkg of offerings.current.availablePackages) {
            products.push({
              identifier: pkg.identifier,
              description: pkg.webBillingProduct.description || '',
              title: pkg.webBillingProduct.title,
              price: pkg.webBillingProduct.currentPrice.amountMicros / 1000000,
              priceString: pkg.webBillingProduct.currentPrice.formattedPrice,
              currencyCode: pkg.webBillingProduct.currentPrice.currency
            });
          }
        }
        
        return products;
      };
      
      return await apiClient.executeWithRetry(operation, REVENUECAT_RETRY_CONFIG, 'revenuecat-get-products');
    } catch (error) {
      console.error('Failed to get products after retries:', error);
      throw error;
    }
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

    try {
      const offerings = await Purchases.getSharedInstance().getOfferings();
      let targetPackage = null;
      
      if (offerings.current) {
        targetPackage = offerings.current.availablePackages.find((pkg: any) => 
          pkg.identifier === productIdentifier
        );
      }
      
      if (!targetPackage) {
        throw new Error(`Package ${productIdentifier} not found`);
      }
      
      const purchaseResult = await Purchases.getSharedInstance().purchase({
        rcPackage: targetPackage
      });
      
      const customerInfo = purchaseResult.customerInfo;
      const now = new Date().toISOString();
      
      return {
        productIdentifier,
        purchaseDate: now,
        transactionIdentifier: `web_${Date.now()}`,
        originalTransactionIdentifier: `web_${Date.now()}`,
        isActive: true,
        willRenew: productIdentifier.includes('monthly'),
        periodType: 'NORMAL',
        latestPurchaseDate: now,
        originalPurchaseDate: now,
        expirationDate: productIdentifier.includes('monthly') 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined
      };
    } catch (error) {
      console.error('Failed to purchase product:', error);
      throw error;
    }
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

    try {
      const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
      return {
        originalAppUserId: customerInfo.originalAppUserId,
        requestDate: customerInfo.requestDate.toISOString(),
        firstSeen: customerInfo.firstSeenDate.toISOString(),
        activeSubscriptions: Array.from(customerInfo.activeSubscriptions),
        allPurchasesByProduct: {},
        allExpirationDatesByProduct: Object.fromEntries(
          Object.entries(customerInfo.allExpirationDatesByProduct).map(([key, value]) => [
            key, 
            value ? value.toISOString() : null
          ])
        ) as { [key: string]: string },
        entitlements: {
          active: {} as { [key: string]: RevenueCatPurchase },
          all: {} as { [key: string]: RevenueCatPurchase }
        }
      };
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
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
      const mockCheckoutPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mock RevenueCat Checkout</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .product { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; width: 100%; font-size: 16px; }
            .button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Mock RevenueCat Checkout</h1>
              <p>これはテスト用のモックチェックアウトページです</p>
            </div>
            <div class="product">
              <h3>商品: ${productIdentifier}</h3>
              <p>実際の本番環境では、ここでRevenueCatの決済フローが開始されます。</p>
            </div>
            <button class="button" onclick="window.close()">チェックアウトを閉じる</button>
          </div>
        </body>
        </html>
      `;
      
      return {
        checkoutUrl: `data:text/html;charset=utf-8,${encodeURIComponent(mockCheckoutPage)}`
      };
    }

    try {
      const offerings = await Purchases.getSharedInstance().getOfferings();
      let targetPackage = null;
      
      if (offerings.current) {
        targetPackage = offerings.current.availablePackages.find((pkg: any) => 
          pkg.identifier === productIdentifier
        );
      }
      
      if (!targetPackage) {
        throw new Error(`Package ${productIdentifier} not found`);
      }
      
      const {customerInfo} = await Purchases.getSharedInstance().purchase({
        rcPackage: targetPackage
      });
      
      return { checkoutUrl: window.location.origin + '?purchase=success' };
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
