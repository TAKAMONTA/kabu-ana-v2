import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { SUBSCRIPTION_PLANS, SubscriptionService } from '../../services/subscriptionService';
// import { RevenueCatService } from '../../services/revenueCatService';
import PricingModal from './PricingModal';
import { CheckCircleIcon } from '../icons';

const SubscriptionManager: React.FC = () => {
  const { 
    getCurrentPlan, 
    subscription, 
    singleStockPurchases, 
    registeredStocks,
    upgradePlan,
    loading 
  } = useSubscription();
  
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Mock: Loading products');
      setProducts([]);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    const success = await upgradePlan(planId);
    if (success) {
      setShowPricingModal(false);
    }
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">サブスクリプション管理</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              現在のプラン: {currentPlan.name}
            </h3>
            <p className="text-gray-400">
              {SubscriptionService.formatPrice(currentPlan.price)}/月
            </p>
          </div>
          {subscription && subscription.status === 'active' && (
            <div className="flex items-center text-green-400">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">アクティブ</span>
            </div>
          )}
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-white mb-2">プラン特典</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 銘柄登録数: {currentPlan.features.maxStocks === -1 ? '無制限' : `${currentPlan.features.maxStocks}件`}</li>
            <li>• テクニカル指標: {currentPlan.features.technicalIndicators}種類</li>
            <li>• チャート履歴: {currentPlan.features.chartHistory}年分</li>
            <li>• AIコメント: {currentPlan.features.maxCommentLength}文字まで</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">登録済み銘柄</p>
            <p className="text-lg font-semibold text-white">
              {registeredStocks.length}
              {currentPlan.features.maxStocks !== -1 && (
                <span className="text-gray-400">/{currentPlan.features.maxStocks}</span>
              )}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">単発購入銘柄</p>
            <p className="text-lg font-semibold text-white">
              {singleStockPurchases.filter(p => p.isActive).length}件
            </p>
          </div>
        </div>

        {currentPlan.id !== 'premium_matsu' && (
          <button
            onClick={() => setShowPricingModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            プランをアップグレード
          </button>
        )}
      </div>

      {singleStockPurchases.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-2">購入済み銘柄</h4>
          <div className="space-y-2">
            {singleStockPurchases.map((purchase, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-700/30 rounded p-2">
                <span className="text-white font-medium">{purchase.stockSymbol}</span>
                <span className="text-sm text-gray-400">
                  {purchase.purchaseDate.toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handlePlanSelect}
        onPurchaseSingleStock={() => {}}
        currentPlanId={currentPlan.id}
      />
    </div>
  );
};

export default SubscriptionManager;
