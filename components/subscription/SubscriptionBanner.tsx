import React from 'react';
import { SubscriptionPlan } from '../../services/subscriptionService';

interface SubscriptionBannerProps {
  currentPlan: SubscriptionPlan;
  onUpgrade: () => void;
  className?: string;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  currentPlan,
  onUpgrade,
  className = ''
}) => {
  if (currentPlan.id === 'premium_matsu') {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">
            現在のプラン: {currentPlan.name}
          </h3>
          <p className="text-blue-100 text-sm">
            より詳細な分析と機能をご利用いただけます
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          アップグレード
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
