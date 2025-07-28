declare module '@revenuecat/web-sdk' {
  // Minimal type stubs for initialization and basic usage.
  export interface PackageInfo {
    identifier: string;
    productIdentifier: string;
    priceString: string;
  }
  export interface CustomerInfo {
    activeSubscriptions: string[];
    latestExpirationDate?: string;
  }
  export const Purchases: {
    init: (publicApiKey: string) => void;
    getCustomerInfo: () => Promise<CustomerInfo>;
    getOfferings: () => Promise<{ current?: { availablePackages: PackageInfo[] } }>;
    purchasePackage: (pkg: PackageInfo) => Promise<CustomerInfo>;
    setDebugLogsEnabled: (enabled: boolean) => void;
  };
}
