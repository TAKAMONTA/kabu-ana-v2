// PayPalSubscriptionButton.tsx - 修正版

import React, { useEffect, useRef, useState } from 'react';
import PayPalManager from '../utils/PayPalManager';

interface PayPalSubscriptionButtonProps {
  planId: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'subscribe';
    height?: number;
  };
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  planId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  style = {}
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isButtonRendered, setIsButtonRendered] = useState(false);
  const paypalManager = PayPalManager.getInstance();

  // PayPalクライアントIDを環境変数から取得
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setError('PayPal Client IDが設定されていません');
      setIsLoading(false);
      return;
    }

    if (!planId) {
      setError('プランIDが指定されていません');
      setIsLoading(false);
      return;
    }

    const loadPayPalAndRenderButton = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // PayPalスクリプトを読み込み
        await paypalManager.loadPayPalScript(clientId, {
          currency: 'USD',
          components: 'buttons',
          intent: 'subscription'
        });

        // ボタンをレンダリング
        if (buttonRef.current && paypalManager.isLoaded() && !isButtonRendered) {
          renderPayPalButton();
        }
      } catch (error) {
        console.error('PayPal loading error:', error);
        setError('PayPal の読み込みに失敗しました');
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayPalAndRenderButton();

    // クリーンアップ
    return () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
      setIsButtonRendered(false);
    };
  }, [planId, clientId, onSuccess, onError, isButtonRendered]);

  const renderPayPalButton = () => {
    if (!buttonRef.current || !paypalManager.isLoaded() || isButtonRendered) {
      return;
    }

    try {
      const paypal = paypalManager.getPayPal();
      
      paypal.Buttons({
        style: {
          layout: style.layout || 'vertical',
          color: style.color || 'blue',
          shape: style.shape || 'rect',
          label: style.label || 'subscribe',
          height: style.height || 40
        },
        
        createSubscription: (data: any, actions: any) => {
          console.log('Creating subscription for plan:', planId);
          return actions.subscription.create({
            plan_id: planId,
            application_context: {
              brand_name: 'AI株式分析サービス',
              locale: 'ja-JP',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW'
            }
          });
        },
        
        onApprove: async (data: any, actions: any) => {
          console.log('PayPal subscription approved:', data);
          
          try {
            // サブスクリプション詳細を取得
            const subscriptionDetails = await actions.subscription.get();
            console.log('Subscription details:', subscriptionDetails);
            
            // 成功コールバックを呼び出し
            onSuccess({
              subscriptionID: data.subscriptionID,
              orderID: data.orderID,
              details: subscriptionDetails
            });
          } catch (error) {
            console.error('Error getting subscription details:', error);
            onError(error);
          }
        },
        
        onCancel: (data: any) => {
          console.log('PayPal subscription cancelled:', data);
          if (onCancel) {
            onCancel();
          }
        },
        
        onError: (err: any) => {
          console.error('PayPal subscription error:', err);
          setError('決済処理中にエラーが発生しました');
          onError(err);
        }
        
      }).render(buttonRef.current).then(() => {
        setIsButtonRendered(true);
        console.log('PayPal button rendered successfully');
      }).catch((error: any) => {
        console.error('PayPal button render error:', error);
        setError('PayPalボタンの表示に失敗しました');
        onError(error);
      });

    } catch (error) {
      console.error('PayPal button creation error:', error);
      setError('PayPalボタンの作成に失敗しました');
      onError(error);
    }
  };

  // エラー表示
  if (error) {
    return (
      <div className="paypal-error" style={{ 
        padding: '12px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        border: '1px solid #f5c6cb', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>エラー:</strong> {error}
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginLeft: '8px', 
            padding: '4px 8px', 
            fontSize: '12px',
            backgroundColor: '#721c24',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="paypal-loading" style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}>
        <div style={{ 
          display: 'inline-block', 
          width: '20px', 
          height: '20px', 
          border: '2px solid #0070ba', 
          borderTop: '2px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          PayPal を読み込み中...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="paypal-subscription-button">
      <div 
        ref={buttonRef} 
        style={{ 
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto'
        }}
      />
      {disabled && (
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          textAlign: 'center', 
          margin: '8px 0 0 0' 
        }}>
          このボタンは現在無効です
        </p>
      )}
    </div>
  );
};

export default PayPalSubscriptionButton;
