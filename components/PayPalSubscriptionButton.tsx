import React, { useEffect, useRef, useState } from 'react';
import PayPalManager from '../utils/PayPalManager';
import { PAYPAL_CONFIG } from '../utils/PayPalConfig.js';

interface PayPalSubscriptionButtonProps {
  planId: string | undefined;
  planName: string;
  clientId: string | undefined;
  planPrice?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: (data: any) => void;
  style?: React.CSSProperties;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({ 
  planId, 
  planName, 
  clientId,
  planPrice,
  onSuccess, 
  onError,
  onCancel,
  style 
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [buttonState, setButtonState] = useState<'loading' | 'placeholder' | 'error' | 'ready'>('loading');

  useEffect(() => {
    console.log(`PayPal Button - Plan: ${planName}, ID: ${planId}, Client: ${clientId?.substring(0, 10)}...`);
    
    if (!planId || !clientId) {
      if (planId?.includes('PLACEHOLDER')) {
        setButtonState('placeholder');
      } else {
        setButtonState('error');
      }
      return;
    }
    
    setButtonState('ready');

    // PayPal SDK動的読み込み（PayPalManagerを使用）
    const loadPayPalSDKAsync = async () => {
      try {
        const paypalManager = PayPalManager.getInstance();
        await paypalManager.loadPayPalScript(PAYPAL_CONFIG.CLIENT_ID);
        initializePayPalButton();
      } catch (err) {
        console.error('PayPal SDK loading failed:', err);
        console.error('PayPal Manager Debug Info:', PayPalManager.getInstance().getDebugInfo());
        setButtonState('error');
      }
    };

    const initializePayPalButton = () => {
      if (!paypalRef.current) return;

      const paypalManager = PayPalManager.getInstance();
      if (!paypalManager.isLoaded()) {
        console.error('PayPal SDK not loaded when trying to initialize button');
        setButtonState('error');
        return;
      }

      const paypal = paypalManager.getPayPal();
      paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe',
          height: 55
        },
        createSubscription: function(data: any, actions: any) {
          console.log('Creating subscription for plan:', planId);
          return actions.subscription.create({
            'plan_id': planId
          });
        },
        onApprove: function(data: any, actions: any) {
          console.log('PayPal決済承認:', data);
          
          // 現在のユーザーメールを取得（実際の実装ではユーザーコンテキストから取得）
          const getCurrentUserEmail = () => {
            // 実際の実装では認証システムからユーザーメールを取得
            return localStorage.getItem('userEmail') || 'user@example.com';
          };
          
          // バックエンドに通知
          fetch('http://localhost:3333/api/paypal/subscription/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionID: data.subscriptionID,
              planId: planId,
              planName: planName,
              userEmail: getCurrentUserEmail()
            })
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              // Google Analytics イベント追加（存在する場合）
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'purchase', {
                  currency: 'JPY',
                  value: planPrice || 0,
                  items: [{
                    item_id: planId,
                    item_name: planName,
                    category: 'subscription',
                    quantity: 1,
                    price: planPrice || 0
                  }]
                });
              }
              
              onSuccess?.(data);
              
              // 成功画面へリダイレクト
              window.location.href = '/payment-success';
            } else {
              throw new Error(result.error || '決済処理に失敗しました');
            }
          })
          .catch(error => {
            console.error('Subscription confirmation failed:', error);
            onError?.(error);
            showErrorMessage('登録処理中にエラーが発生しました。しばらく後にもう一度お試しください。');
          });
        },
        onError: function(err: any) {
          console.error('PayPal決済エラー:', err);
          setButtonState('error');
          onError?.(err);
          showErrorMessage('決済処理中にエラーが発生しました。しばらく後にもう一度お試しください。');
        },
        onCancel: function(data: any) {
          console.log('決済キャンセル:', data);
          onCancel?.(data);
          showInfoMessage('決済がキャンセルされました。');
        }
      }).render(paypalRef.current);
    };

    loadPayPalSDKAsync();
  }, [planId, planName, clientId]);

  const renderButton = () => {
    switch (buttonState) {
      case 'placeholder':
        return (
          <button style={{...style, opacity: 0.6}} disabled>
            プラン作成中...
          </button>
        );
      case 'error':
        return (
          <button style={{...style, opacity: 0.5}} disabled>
            設定エラー
          </button>
        );
      case 'loading':
        return (
          <button style={{...style, opacity: 0.8}} disabled>
            読み込み中...
          </button>
        );
      case 'ready':
        return <div ref={paypalRef} style={{ width: '100%' }}></div>;
      default:
        return null;
    }
  };

  // エラーメッセージ表示
  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#f56565';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '12px 24px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    errorDiv.style.maxWidth = '90%';
    errorDiv.style.textAlign = 'center';
    errorDiv.innerText = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(errorDiv), 500);
    }, 5000);
  };
  
  // 情報メッセージ表示
  const showInfoMessage = (message: string) => {
    const infoDiv = document.createElement('div');
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '20px';
    infoDiv.style.left = '50%';
    infoDiv.style.transform = 'translateX(-50%)';
    infoDiv.style.backgroundColor = '#4299e1';
    infoDiv.style.color = 'white';
    infoDiv.style.padding = '12px 24px';
    infoDiv.style.borderRadius = '8px';
    infoDiv.style.zIndex = '9999';
    infoDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    infoDiv.style.maxWidth = '90%';
    infoDiv.style.textAlign = 'center';
    infoDiv.innerText = message;
    
    document.body.appendChild(infoDiv);
    
    setTimeout(() => {
      infoDiv.style.opacity = '0';
      infoDiv.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(infoDiv), 500);
    }, 3000);
  };

  return renderButton();
};

export default PayPalSubscriptionButton;
