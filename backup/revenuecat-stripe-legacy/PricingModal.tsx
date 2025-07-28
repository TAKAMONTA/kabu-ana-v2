import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, SINGLE_STOCK_PRICE, SubscriptionService } from '../../services/subscriptionService';
import { purchasePlanByIdentifier } from '../../services/revenuecat';
import { CheckCircleIcon } from '../icons';

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

  if (!isOpen) return null;

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      onClose();
      return;
    }
    try {
      await purchasePlanByIdentifier(planId);
      onSelectPlan(planId);
      onClose();
    } catch (e) {
      alert(`購入に失敗しました: ${String(e)}`);
    }
  };

  const handleSingleStockPurchase = () => {
    if (targetStock) {
      onPurchaseSingleStock(targetStock);
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
                onClick={() => setSelectedPlan(plan.id)}
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

                {selectedPlan === plan.id && plan.id !== 'free' && (
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    このプランを選択
                  </button>
                )}
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
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      購入
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
