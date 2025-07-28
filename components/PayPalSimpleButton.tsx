import React, { useEffect, useRef, useState } from 'react';
import PayPalManager from '../utils/PayPalManager';
import { PAYPAL_CONFIG } from '../utils/PayPalConfig.js';

interface PayPalSimpleButtonProps {
  planId: string;
  planName: string;
  planPrice: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: (data: any) => void;
  className?: string;
}

const PayPalSimpleButton: React.FC<PayPalSimpleButtonProps> = ({
  planId,
  planName,
  planPrice,
  onSuccess,
  onError,
  onCancel,
  className = ''
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [buttonState, setButtonState] = useState<'loading' | 'ready' | 'error'>('loading');
  const buttonRendered = useRef(false);

  useEffect(() => {
    // 既にボタンがレンダリングされていたらスキップ
    if (buttonRendered.current || !paypalRef.current) return;
    
    // プランIDが無効な場合はエラー状態に
    if (!planId || planId.includes('PLACEHOLDER')) {
      setButtonState('error');
      return;
    }

    const initializePayPal = async () => {
      try {
        // PayPal SDKをPayPalManager経由で読み込み
        const paypalManager = PayPalManager.getInstance();
        await paypalManager.loadPayPalScript(PAYPAL_CONFIG.CLIENT_ID);
        
        if (!paypalRef.current) return;

        if (!paypalManager.isLoaded()) {
          throw new Error('PayPal SDK not loaded');
        }

        const paypal = paypalManager.getPayPal();
        // PayPalボタンをレンダリング
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe',
            height: 45
          },
          createSubscription: (data: any, actions: any) => {
            console.log('Creating subscription for plan:', planId);
            return actions.subscription.create({
              'plan_id': planId
            });
          },
          onApprove: (data: any, actions: any) => {
            console.log('PayPal決済承認:', data);
            
            // 成功コールバックを実行
            onSuccess?.(data);
            
            // Google Analytics イベント（存在する場合）
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'purchase', {
                currency: 'JPY',
                value: planPrice,
                items: [{
                  item_id: planId,
                  item_name: planName,
                  category: 'subscription',
                  quantity: 1,
                  price: planPrice
                }]
              });
            }
          },
          onError: (err: any) => {
            console.error('PayPal決済エラー:', err);
            onError?.(err);
          },
          onCancel: (data: any) => {
            console.log('決済キャンセル:', data);
            onCancel?.(data);
          }
        }).render(paypalRef.current);
        
        buttonRendered.current = true;
        setButtonState('ready');
        
      } catch (error) {
        console.error('PayPal initialization failed:', error);
        console.error('PayPal Manager Debug Info:', PayPalManager.getInstance().getDebugInfo());
        setButtonState('error');
      }
    };

    initializePayPal();

    // クリーンアップ
    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
      buttonRendered.current = false;
    };
  }, [planId, planName, planPrice, onSuccess, onError, onCancel]);

  const renderContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <div className={`flex items-center justify-center py-3 px-4 bg-gray-600 text-white rounded-lg ${className}`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            PayPal読み込み中...
          </div>
        );
      case 'error':
        return (
          <div className={`py-3 px-4 bg-red-600 text-white rounded-lg text-center ${className}`}>
            PayPal設定エラー
          </div>
        );
      case 'ready':
        return <div ref={paypalRef} className={className} style={{ minHeight: '45px' }}></div>;
      default:
        return null;
    }
  };

  return renderContent();
};

export default PayPalSimpleButton;
