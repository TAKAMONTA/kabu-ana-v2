import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, SINGLE_STOCK_PRICE, SubscriptionService } from '../../services/subscriptionService';
import { CheckCircleIcon } from '../icons';
import PayPalSimpleButton from '../PayPalSimpleButton';
import { PAYPAL_CONFIG } from '../../utils/PayPalConfig.js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  onPurchaseSingleStock: (stockSymbol: string) => void;
  currentPlanId?: string;
  targetStock?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onPurchaseSingleStock,
  currentPlanId = 'free',
  targetStock
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usePayPalButtons, setUsePayPalButtons] = useState(true); // PayPalボタンとInvoice APIの切り替え

  // デバッグ情報（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('PricingModal - currentPlanId:', currentPlanId, 'typeof:', typeof currentPlanId);
  }

  if (!isOpen) return null;

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      onClose();
      return;
    }

    setIsProcessing(true);
    
    try {
      // PayPal Invoice APIを使用
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('プランが見つかりません');

      // PayPal請求書を作成
      const response = await fetch('/api/paypal/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          planName: plan.name,
          amount: plan.price,
          currency: 'JPY'
        }),
      });

      if (!response.ok) {
        throw new Error('請求書の作成に失敗しました');
      }

      const { invoiceUrl } = await response.json();
      
      // PayPal決済ページへリダイレクト
      window.location.href = invoiceUrl;
      
    } catch (error) {
      console.error('PayPal payment failed:', error);
      alert('決済処理に失敗しました。もう一度お試しください。');
      setIsProcessing(false);
    }
  };

  const handleSingleStockPurchase = async () => {
    if (!targetStock) return;
    
    setIsProcessing(true);
    
    try {
      // 単発購入用のPayPal請求書を作成
      const response = await fetch('/api/paypal/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'single_stock',
          stockSymbol: targetStock,
          amount: SINGLE_STOCK_PRICE,
          currency: 'JPY'
        }),
      });

      if (!response.ok) {
        throw new Error('請求書の作成に失敗しました');
      }

      const { invoiceUrl } = await response.json();
      
      // PayPal決済ページへリダイレクト
      window.location.href = invoiceUrl;
      
    } catch (error) {
      console.error('PayPal payment failed:', error);
      alert('決済処理に失敗しました。もう一度お試しください。');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">プラン選択</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
              disabled={isProcessing}
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            より詳細な分析を受けるためにプランをアップグレードしてください
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                } ${currentPlanId === plan.id ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => plan.id !== 'free' && setSelectedPlan(plan.id)}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-blue-400">
                    {SubscriptionService.formatPrice(plan.price)}
                    <span className="text-sm text-gray-400">/月</span>
                  </div>
                  {currentPlanId === plan.id && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mt-2">
                      現在のプラン
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    銘柄登録: {plan.features.maxStocks === -1 ? '無制限' : `${plan.features.maxStocks}件`}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    分析タイプ: {plan.features.analysisType === 'simple' ? '簡易要約' :
                                plan.features.analysisType === 'basic' ? '通常分析' :
                                plan.features.analysisType === 'enhanced' ? '強化分析' : '総合分析'}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    テクニカル指標: {plan.features.technicalIndicators}種類
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    チャート履歴: {plan.features.chartHistory}年分
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    コメント: {plan.features.maxCommentLength}文字
                  </li>
                  {plan.features.hasComparison && (
                    <li className="flex items-center text-gray-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                      類似銘柄比較
                    </li>
                  )}
                  {plan.features.hasPrediction && (
                    <li className="flex items-center text-gray-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                      価格予測
                    </li>
                  )}
                  {plan.features.hasStopLoss && (
                    <li className="flex items-center text-gray-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                      損切り目安
                    </li>
                  )}
                </ul>

                {/* PayPal決済ボタン表示ロジック */}
                {(() => {
                  const isFreePlan = plan.id === 'free';
                  const isCurrentPlan = plan.id === currentPlanId;
                  const shouldShowButton = !isFreePlan && !isCurrentPlan;
                  
                  // 開発時のみデバッグ情報を表示
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Plan ${plan.id}: free=${isFreePlan}, current=${isCurrentPlan}, show=${shouldShowButton}`);
                  }
                  
                  if (!shouldShowButton) return null;
                  
                  // PayPalプランIDを取得
                  const getPayPalPlanId = (planId: string) => {
                    switch (planId) {
                      case 'basic': return PAYPAL_CONFIG.BASIC_PLAN_ID;
                      case 'standard': return PAYPAL_CONFIG.STANDARD_PLAN_ID;
                      case 'premium': return PAYPAL_CONFIG.PREMIUM_PLAN_ID;
                      default: return null;
                    }
                  };
                  
                  const paypalPlanId = getPayPalPlanId(plan.id);
                  
                  return (
                    <div className="mt-4 space-y-2">
                      {/* PayPal/Invoice API切り替えボタン */}
                      <div className="flex justify-center mb-2">
                        <button
                          onClick={() => setUsePayPalButtons(!usePayPalButtons)}
                          className="text-xs text-gray-400 hover:text-gray-300 underline"
                        >
                          {usePayPalButtons ? 'Invoice決済に切り替え' : 'PayPal決済に切り替え'}
                        </button>
                      </div>
                      
                      {usePayPalButtons && paypalPlanId ? (
                        // PayPalボタンを表示
                        <PayPalSimpleButton
                          planId={paypalPlanId}
                          planName={plan.name}
                          planPrice={plan.price}
                          onSuccess={(data) => {
                            console.log('PayPal決済成功:', data);
                            onSelectPlan(plan.id);
                            onClose();
                          }}
                          onError={(error) => {
                            console.error('PayPal決済エラー:', error);
                            alert('決済処理に失敗しました。もう一度お試しください。');
                          }}
                          onCancel={(data) => {
                            console.log('PayPal決済キャンセル:', data);
                          }}
                          className="w-full"
                        />
                      ) : (
                        // Invoice APIボタンを表示
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanSelect(plan.id);
                          }}
                          disabled={isProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? '処理中...' : 'このプランを選択（Invoice）'}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          {targetStock && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                単発購入オプション
              </h3>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">
                      {targetStock} 永久分析権
                    </h4>
                    <p className="text-sm text-gray-400">
                      この銘柄を永久に分析可能（再分析含む）
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-400">
                      {SubscriptionService.formatPrice(SINGLE_STOCK_PRICE)}
                    </div>
                    <button
                      onClick={handleSingleStockPurchase}
                      disabled={isProcessing}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? '処理中...' : '購入'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
