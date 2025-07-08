import React from 'react';
import { SubscriptionPlan } from '../services/subscriptionService';

interface PlanFeaturesDisplayProps {
  currentPlan: SubscriptionPlan;
}

const PlanFeaturesDisplay: React.FC<PlanFeaturesDisplayProps> = ({ currentPlan }) => {
  return (
    <div className="bg-gray-800/30 border-t border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            現在のプラン: {currentPlan.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
            <div>
              <span className="font-medium">銘柄登録:</span> 
              {currentPlan.features.maxStocks === -1 ? '無制限' : `${currentPlan.features.maxStocks}件`}
            </div>
            <div>
              <span className="font-medium">テクニカル指標:</span> 
              {currentPlan.features.technicalIndicators}種類
            </div>
            <div>
              <span className="font-medium">チャート履歴:</span> 
              {currentPlan.features.chartHistory}年分
            </div>
            <div>
              <span className="font-medium">質問機能:</span> 
              {(currentPlan.features as any).canAskQuestions ? '利用可能' : '利用不可'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanFeaturesDisplay;
