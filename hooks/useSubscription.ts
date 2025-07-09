import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserSubscription, 
  SingleStockPurchase, 
  SubscriptionService,
  SUBSCRIPTION_PLANS 
} from '../services/subscriptionService';
// import { FirestoreService } from '../services/firestoreService';
import { RevenueCatService } from '../services/revenueCatService';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [singleStockPurchases, setSingleStockPurchases] = useState<SingleStockPurchase[]>([]);
  const [registeredStocks, setRegisteredStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSubscriptionData();
    } else {
      setSubscription(null);
      setSingleStockPurchases([]);
      setRegisteredStocks([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserSubscriptionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const userData = null as any;
      
      if (userData) {
        setSubscription(userData.subscription);
        setSingleStockPurchases(userData.singleStockPurchases);
        setRegisteredStocks(userData.registeredStocks);
      } else {
        const defaultData = {
          userId: user.uid,
          subscription: {
            planId: 'standard_take',
            status: 'active' as const,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: true
          },
          singleStockPurchases: [],
          registeredStocks: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setSubscription(defaultData.subscription);
        setSingleStockPurchases(defaultData.singleStockPurchases);
        setRegisteredStocks(defaultData.registeredStocks);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      const fallbackSubscription: UserSubscription = {
        planId: 'standard_take',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: true
      };
      setSubscription(fallbackSubscription);
      setSingleStockPurchases([]);
      setRegisteredStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) {
      return SUBSCRIPTION_PLANS.find(plan => plan.id === 'free') || SUBSCRIPTION_PLANS[0];
    }
    return SubscriptionService.getCurrentPlan(subscription.planId) || SUBSCRIPTION_PLANS[0];
  };

  const canAnalyzeStock = (stockSymbol: string) => {
    return SubscriptionService.canAnalyzeStock(
      subscription,
      registeredStocks,
      singleStockPurchases,
      stockSymbol
    );
  };

  const getAnalysisType = (stockSymbol: string) => {
    return SubscriptionService.getAnalysisType(
      subscription,
      singleStockPurchases,
      stockSymbol
    );
  };

  const addRegisteredStock = async (stockSymbol: string) => {
    if (!user || registeredStocks.includes(stockSymbol)) return;
    
    try {
      console.log('Mock: Adding registered stock', stockSymbol);
      setRegisteredStocks(prev => [...prev, stockSymbol]);
    } catch (error) {
      console.error('Failed to add registered stock:', error);
    }
  };

  const purchaseSingleStock = async (stockSymbol: string) => {
    if (!user) return false;
    
    try {
      console.log('Mock: Purchasing single stock', stockSymbol);
      
      const newPurchase: SingleStockPurchase = {
        stockSymbol,
        purchaseDate: new Date(),
        isActive: true
      };
      
      setSingleStockPurchases(prev => [...prev, newPurchase]);
      return true;
    } catch (error) {
      console.error('Failed to purchase single stock:', error);
      return false;
    }
  };

  const upgradePlan = async (planId: string) => {
    if (!user) return false;
    
    try {
      console.log('Upgrading to plan via web checkout:', planId);
      
      const revenueCatService = RevenueCatService.getInstance();
      const checkoutSession = await revenueCatService.createWebCheckoutSession(`${planId}_monthly`);
      
      console.log('Opening checkout URL:', checkoutSession.checkoutUrl);
      window.open(checkoutSession.checkoutUrl, '_blank');
      
      const newSubscription: UserSubscription = {
        planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      };
      
      setSubscription(newSubscription);
      return true;
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      return false;
    }
  };

  return {
    subscription,
    singleStockPurchases,
    registeredStocks,
    loading,
    getCurrentPlan,
    canAnalyzeStock,
    getAnalysisType,
    canAskQuestions: () => SubscriptionService.canAskQuestions(subscription),
    canQuestionAnalysis: () => SubscriptionService.canQuestionAnalysis(subscription),
    addRegisteredStock,
    purchaseSingleStock,
    upgradePlan,
    createWebCheckout: async (productIdentifier: string) => {
      const revenueCatService = RevenueCatService.getInstance();
      return revenueCatService.createWebCheckoutSession(productIdentifier);
    }
  };
};
