import React, { useEffect, useRef, useState } from 'react';
import { initializePayPal, createPayPalSubscription, PAYPAL_PLANS, PayPalPlanType, formatPayPalPrice } from '../services/paypalService';
import { CheckCircleIcon, CreditCardIcon } from './icons';

interface PayPalSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: (subscriptionId: string, planType: PayPalPlanType) => void;
  onSubscriptionError: (error: string) => void;
  currentPlanType?: PayPalPlanType | null;
}

const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
  onSubscriptionError,
  currentPlanType
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PayPalPlanType>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !paypalLoaded) {
      initializePayPal()
        .then(() => {
          setPaypalLoaded(true);
        })
        .catch((error) => {
          console.error('PayPal initialization failed:', error);
          onSubscriptionError('PayPal の初期化に失敗しました');
        });
    }
  }, [isOpen, paypalLoaded, onSubscriptionError]);

  useEffect(() => {
    if (paypalLoaded && paypalButtonRef.current && window.paypal) {
      // Clear previous buttons
      paypalButtonRef.current.innerHTML = '';

      const plan = PAYPAL_PLANS[selectedPlan];

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async (data: any, actions: any) => {
          try {
            setIsLoading(true);
            const subscription = await createPayPalSubscription(selectedPlan);
            return subscription.subscriptionId;
          } catch (error) {
            console.error('Subscription creation failed:', error);
            onSubscriptionError('サブスクリプションの作成に失敗しました');
            throw error;
          } finally {
            setIsLoading(false);
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            setIsLoading(true);
            // Subscription approved by user
            onSubscriptionSuccess(data.subscriptionID, selectedPlan);
            onClose();
          } catch (error) {
            console.error('Subscription approval failed:', error);
            onSubscriptionError('サブスクリプションの承認に失敗しました');
          } finally {
            setIsLoading(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          onSubscriptionError('PayPal でエラーが発生しました');
          setIsLoading(false);
        },
        onCancel: () => {
          console.log('PayPal subscription cancelled by user');
          setIsLoading(false);
        }
      }).render(paypalButtonRef.current);
    }
  }, [paypalLoaded, selectedPlan, onSubscriptionSuccess, onSubscriptionError, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <CreditCardIcon className="h-8 w-8 text-blue-400 mr-3" />
              サブスクリプション
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            PayPal で安全にお支払いいただけます
          </p>
        </div>

        <div className="p-6">
          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(PAYPAL_PLANS).map(([planType, plan]) => (
              <div
                key={planType}
                className={`border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === planType
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                } ${currentPlanType === planType ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setSelectedPlan(planType as PayPalPlanType)}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-blue-400">
                    {formatPayPalPrice(plan.price)}
                    <span className="text-sm text-gray-400">
                      /{plan.interval === 'month' ? '月' : '年'}
                    </span>
                  </div>
                  {currentPlanType === planType && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mt-2">
                      現在のプラン
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    銘柄登録: 無制限
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    詳細分析レポート
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    テクニカル指標: 全種類
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    チャート履歴: 10年分
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                    AI質問機能
                  </li>
                  {planType === 'yearly' && (
                    <li className="flex items-center text-green-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2" />
                      <strong>年間プランで2ヶ月分お得！</strong>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* PayPal Button */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              選択したプラン: {PAYPAL_PLANS[selectedPlan].name}
            </h3>
            
            {isLoading && (
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <p className="text-gray-400 mt-2">処理中...</p>
              </div>
            )}

            <div 
              ref={paypalButtonRef} 
              className="max-w-md mx-auto"
              style={{ minHeight: '200px' }}
            />

            {!paypalLoaded && (
              <div className="text-center text-gray-400">
                PayPal を読み込み中...
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>• いつでもキャンセル可能</p>
            <p>• 安全な PayPal 決済</p>
            <p>• 自動更新（解約まで）</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalSubscription;
