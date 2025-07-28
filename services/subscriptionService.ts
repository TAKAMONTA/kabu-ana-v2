export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    maxStocks: number;
    analysisType: 'simple' | 'basic' | 'enhanced' | 'comprehensive';
    technicalIndicators: number;
    chartHistory: number;
    maxCommentLength: number;
    hasComparison: boolean;
    hasPrediction: boolean;
    hasStopLoss: boolean;
    canAskQuestions: boolean;
    canQuestionAnalysis: boolean;
  };
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface SingleStockPurchase {
  stockSymbol: string;
  purchaseDate: Date;
  isActive: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    currency: 'JPY',
    interval: 'month',
    features: {
      maxStocks: 3,
      analysisType: 'simple',
      technicalIndicators: 2,
      chartHistory: 1,
      maxCommentLength: 100,
      hasComparison: false,
      hasPrediction: false,
      hasStopLoss: false,
      canAskQuestions: false,
      canQuestionAnalysis: false
    }
  },
  {
    id: 'basic_ume',
    name: 'ベーシック（梅）',
    price: 480,
    currency: 'JPY',
    interval: 'month',
    features: {
      maxStocks: 10,
      analysisType: 'basic',
      technicalIndicators: 4,
      chartHistory: 3,
      maxCommentLength: 250,
      hasComparison: false,
      hasPrediction: false,
      hasStopLoss: false,
      canAskQuestions: true,
      canQuestionAnalysis: false
    }
  },
  {
    id: 'standard_take',
    name: 'スタンダード（竹）',
    price: 980,
    currency: 'JPY',
    interval: 'month',
    features: {
      maxStocks: 30,
      analysisType: 'enhanced',
      technicalIndicators: 6,
      chartHistory: 5,
      maxCommentLength: 250,
      hasComparison: true,
      hasPrediction: false,
      hasStopLoss: false,
      canAskQuestions: true,
      canQuestionAnalysis: true
    }
  },
  {
    id: 'premium_matsu',
    name: 'プレミアム（松）',
    price: 2480,
    currency: 'JPY',
    interval: 'month',
    features: {
      maxStocks: -1,
      analysisType: 'comprehensive',
      technicalIndicators: 10,
      chartHistory: 10,
      maxCommentLength: 250,
      hasComparison: true,
      hasPrediction: true,
      hasStopLoss: true,
      canAskQuestions: true,
      canQuestionAnalysis: true
    }
  }
];

export const SINGLE_STOCK_PRICE = 150;

export class SubscriptionService {
  static getCurrentPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }

  static canAnalyzeStock(
    subscription: UserSubscription | null,
    registeredStocks: string[],
    singleStockPurchases: SingleStockPurchase[],
    targetStock: string
  ): boolean {
    if (singleStockPurchases.some(purchase => 
      purchase.stockSymbol === targetStock && purchase.isActive
    )) {
      return true;
    }

    if (!subscription || subscription.status !== 'active') {
      const freePlan = this.getCurrentPlan('free');
      return freePlan ? registeredStocks.length < freePlan.features.maxStocks : false;
    }

    const plan = this.getCurrentPlan(subscription.planId);
    if (!plan) return false;

    return plan.features.maxStocks === -1 || registeredStocks.length < plan.features.maxStocks;
  }

  static getAnalysisType(
    subscription: UserSubscription | null,
    singleStockPurchases: SingleStockPurchase[],
    targetStock: string
  ): 'simple' | 'basic' | 'enhanced' | 'comprehensive' {
    if (singleStockPurchases.some(purchase => 
      purchase.stockSymbol === targetStock && purchase.isActive
    )) {
      return 'comprehensive';
    }

    if (!subscription || subscription.status !== 'active') {
      return 'simple';
    }

    const plan = this.getCurrentPlan(subscription.planId);
    return plan?.features.analysisType || 'simple';
  }

  static formatPrice(price: number, currency: string = 'JPY'): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  }

  static canAskQuestions(subscription: UserSubscription | null): boolean {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }
    const plan = this.getCurrentPlan(subscription.planId);
    return plan?.features.canAskQuestions || false;
  }

  static canQuestionAnalysis(subscription: UserSubscription | null): boolean {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }
    const plan = this.getCurrentPlan(subscription.planId);
    return plan?.features.canQuestionAnalysis || false;
  }
}
