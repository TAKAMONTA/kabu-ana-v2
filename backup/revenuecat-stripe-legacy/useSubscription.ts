import { useState, useEffect } from 'react';
import { getActivePlanId } from '../services/revenuecat';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserSubscription, 
  SingleStockPurchase, 
  SubscriptionService,
  SUBSCRIPTION_PLANS 
} from '../services/subscriptionService';
// import { FirestoreService } from '../services/firestoreService';
// import { RevenueCatService } from '../services/revenueCatService';

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

  // Poll RevenueCat for subscription changes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const activePlanId = await getActivePlanId();
        if (activePlanId && activePlanId !== subscription?.planId) {
          console.log('RevenueCat subscription updated:', activePlanId);
          setSubscription(prev => ({
            planId: activePlanId,
            status: 'active' as const,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch RevenueCat customer info:', e);
      }
    }, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, [user, subscription?.planId]);

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
      console.log('Mock: Upgrading to plan', planId);
      
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
    upgradePlan
  };
};
