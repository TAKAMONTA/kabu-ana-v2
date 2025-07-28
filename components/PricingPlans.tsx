import React, { useEffect, useState } from 'react';
import { PAYPAL_CONFIG } from '../utils/PayPalConfig.js';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

const PricingPlans: React.FC = () => {
  const [configState, setConfigState] = useState<{
    loaded: boolean;
    debugInfo: any;
    error: string | null;
  }>({
    loaded: false,
    debugInfo: null,
    error: null
  });

  useEffect(() => {
    try {
      // デバッグ情報を直接作成
      const debugInfo = {
        config: {
          clientId: PAYPAL_CONFIG.CLIENT_ID?.substring(0, 20) + '...',
          basicPlan: PAYPAL_CONFIG.BASIC_PLAN_ID,
          standardPlan: PAYPAL_CONFIG.STANDARD_PLAN_ID,
          premiumPlan: PAYPAL_CONFIG.PREMIUM_PLAN_ID
        },
        status: {
          isConfigured: !!PAYPAL_CONFIG.CLIENT_ID,
          isFullyConfigured: !!(PAYPAL_CONFIG.CLIENT_ID && PAYPAL_CONFIG.BASIC_PLAN_ID)
        },
        env: {
          mode: 'development',
          dev: true
        },
        envVars: {
          CLIENT_ID: !!PAYPAL_CONFIG.CLIENT_ID,
          BASIC_PLAN: !!PAYPAL_CONFIG.BASIC_PLAN_ID,
          STANDARD_PLAN: !!PAYPAL_CONFIG.STANDARD_PLAN_ID,
          PREMIUM_PLAN: !!PAYPAL_CONFIG.PREMIUM_PLAN_ID
        }
      };
      
      setConfigState({
        loaded: true,
        debugInfo,
        error: null
      });
    } catch (error) {
      console.error('PayPal設定の読み込みに失敗しました:', error);
      setConfigState({
        loaded: true,
        debugInfo: null,
        error: error instanceof Error ? error.message : '設定エラー'
      });
    }
  }, []);

  const plans = [
    {
      id: 'free',
      name: '無料プラン',
      price: '0',
      period: '円/月',
      description: '初心者・お試し向け',
      features: ['月3件まで分析', '広告あり', '銘柄登録制限あり'],
      paypalPlanId: null,
      popular: false
    },
    {
      id: 'basic',
      name: 'ベーシックプラン',
      price: '480',
      period: '円/月',
      description: 'ライトユーザー向け',
      features: ['月10件まで分析', '広告なし', '銘柄保存可', 'AI分析の待機時間短縮'],
      paypalPlanId: PAYPAL_CONFIG.BASIC_PLAN_ID,
      popular: false
    },
    {
      id: 'standard',
      name: 'スタンダードプラン',
      price: '1,480',
      period: '円/月',
      description: '中～上級者向け',
      features: ['月30件まで分析', '酒田五法対応', '画像アップロード分析'],
      paypalPlanId: PAYPAL_CONFIG.STANDARD_PLAN_ID,
      popular: true
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      price: '3,980',
      period: '円/月',
      description: 'アクティブ利用者向け',
      features: ['無制限分析', '高速レスポンス保証', '分析履歴管理'],
      paypalPlanId: PAYPAL_CONFIG.PREMIUM_PLAN_ID,
      popular: false
    }
  ];

  // デバッグ表示（開発環境のみ）
  if (configState.debugInfo) {
    console.log('Plans with PayPal IDs:', plans.map(p => ({ 
      name: p.name, 
      planId: p.paypalPlanId 
    })));
  }

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(180deg, rgba(247,250,252,0.8) 0%, rgba(255,255,255,1) 100%)',
      borderRadius: '24px',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '60px',
      position: 'relative' as const,
    },
    title: {
      fontSize: '52px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px',
      lineHeight: '1.2',
      position: 'relative' as const,
      display: 'inline-block',
    },
    titleUnderline: {
      content: '""',
      position: 'absolute' as const,
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '4px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '2px',
    },
    subtitle: {
      fontSize: '22px',
      color: '#4a5568',
      fontWeight: '400',
      maxWidth: '600px',
      margin: '24px auto 0',
      lineHeight: '1.6',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '40px',
      marginTop: '40px',
      padding: '0 10px',
      // レスポンシブ対応を強化
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
      },
    },
    card: {
      background: '#ffffff',
      borderRadius: '20px',
      padding: '40px 32px',
      position: 'relative' as const,
      border: '2px solid #e2e8f0',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      height: '100%',
      overflow: 'hidden',
    },
    cardHover: {
      transform: 'translateY(-12px)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      borderColor: '#4299e1',
    },
    popularCard: {
      borderColor: '#4299e1',
      transform: 'scale(1.05)',
      boxShadow: '0 25px 50px -12px rgba(66, 153, 225, 0.3)',
      zIndex: 1,
    },
    popularCardHover: {
      transform: 'scale(1.08)',
      boxShadow: '0 25px 50px -12px rgba(66, 153, 225, 0.4)',
    },
    popularBadge: {
      position: 'absolute' as const,
      top: '-16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '8px 24px',
      borderRadius: '50px',
      fontSize: '14px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 6px -1px rgba(66, 153, 225, 0.3)',
      zIndex: 2,
    },
    cardHeader: {
      position: 'relative' as const,
      paddingBottom: '24px',
      marginBottom: '24px',
      borderBottom: '1px solid #edf2f7',
    },
    planName: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '12px',
      textAlign: 'center' as const,
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    price: {
      fontSize: '60px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: '1',
    },
    period: {
      fontSize: '20px',
      color: '#718096',
      marginLeft: '8px',
      fontWeight: '500',
    },
    description: {
      color: '#718096',
      fontSize: '18px',
      textAlign: 'center' as const,
      marginBottom: '8px',
      fontWeight: '500',
    },
    featuresList: {
      listStyle: 'none',
      padding: '0',
      margin: '0 0 32px 0',
      flexGrow: 1,
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 0',
      fontSize: '16px',
      color: '#4a5568',
      lineHeight: '1.5',
    },
    checkIcon: {
      width: '22px',
      height: '22px',
      marginRight: '12px',
      color: '#48bb78',
      flexShrink: 0,
      marginTop: '2px',
    },
    buttonContainer: {
      marginTop: 'auto',
      paddingTop: '16px',
    },
    button: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center' as const,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    buttonRipple: {
      position: 'absolute' as const,
      borderRadius: '50%',
      transform: 'scale(0)',
      animation: 'ripple 0.6s linear',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4), 0 2px 4px -1px rgba(102, 126, 234, 0.06)',
    },
    primaryButtonHover: {
      boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.5), 0 4px 6px -2px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)',
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      color: '#4a5568',
      border: '2px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
    secondaryButtonHover: {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transform: 'translateY(-2px)',
      borderColor: '#cbd5e0',
    },
    disabledButton: {
      background: '#f7fafc',
      color: '#a0aec0',
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
    // アクセシビリティ向上のためのフォーカススタイル
    focusOutline: {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
    },
    // アニメーション用のキーフレーム
    '@keyframes ripple': {
      to: {
        transform: 'scale(4)',
        opacity: 0,
      },
    },
    // モバイル最適化
    '@media (max-width: 640px)': {
      title: {
        fontSize: '42px',
      },
      subtitle: {
        fontSize: '18px',
      },
      card: {
        padding: '32px 24px',
      },
      price: {
        fontSize: '48px',
      },
    },
  };

  // ボタンクリック時のリップルエフェクト用の関数
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <div style={styles.container}>
      {/* デバッグ情報（開発環境のみ） */}
      {(import.meta as any).env?.DEV && configState.debugInfo && (
        <div style={{
          background: configState.debugInfo.status?.isConfigured ? '#d1fae5' : '#fed7d7',
          border: `1px solid ${configState.debugInfo.status?.isConfigured ? '#10b981' : '#f56565'}`,
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <strong>🔧 PayPal Configuration Debug</strong><br/>
          <div style={{ marginTop: '8px' }}>
            Mode: {configState.debugInfo.env?.mode} | Dev: {configState.debugInfo.env?.dev ? '✅' : '❌'}<br/>
            Client ID: {configState.debugInfo.config?.clientId}<br/>
            Plans: Basic({configState.debugInfo.config?.basicPlan}) | Standard({configState.debugInfo.config?.standardPlan}) | Premium({configState.debugInfo.config?.premiumPlan})<br/>
            Status: {configState.debugInfo.status?.isConfigured ? '✅ Configured' : '❌ Not Configured'} | Full: {configState.debugInfo.status?.isFullyConfigured ? '✅' : '❌'}         Env Vars: {Object.entries(configState.debugInfo.envVars).map(([k, v]) => `${k}: ${v ? '✅' : '❌'}`).join(' | ')}
          </div>
        </div>
      )}
      
      <div style={styles.header}>
        <h2 style={styles.title}>
          料金プラン
          <div style={styles.titleUnderline}></div>
        </h2>
        <p style={styles.subtitle}>あなたのニーズに合わせた最適なプランをお選びください</p>
      </div>
      
      <div style={styles.grid}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            style={{
              ...styles.card,
              ...(plan.popular ? styles.popularCard : {})
            }}
            onMouseEnter={(e) => {
              if (plan.popular) {
                Object.assign(e.currentTarget.style, styles.popularCardHover);
              } else {
                Object.assign(e.currentTarget.style, styles.cardHover);
              }
            }}
            onMouseLeave={(e) => {
              if (plan.popular) {
                Object.assign(e.currentTarget.style, styles.popularCard);
              } else {
                Object.assign(e.currentTarget.style, styles.card);
              }
            }}
            role="region"
            aria-label={`${plan.name}の詳細`}
          >
            {plan.popular && (
              <div style={styles.popularBadge} aria-label="人気プラン">
                <span role="img" aria-hidden="true">✨</span> 人気プラン
              </div>
            )}
            
            <div style={styles.cardHeader}>
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.priceContainer}>
                <span style={styles.price}>{plan.price}</span>
                <span style={styles.period}>{plan.period}</span>
              </div>
              <p style={styles.description}>{plan.description}</p>
            </div>
            
            <ul style={styles.featuresList} aria-label={`${plan.name}の機能一覧`}>
              {plan.features.map((feature, index) => (
                <li key={index} style={styles.featureItem}>
                  <svg 
                    style={styles.checkIcon} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                    role="img"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div style={styles.buttonContainer}>
              {plan.id === 'free' ? (
                <button 
                  style={{...styles.button, ...styles.disabledButton}} 
                  disabled
                  aria-label="現在のプラン"
                >
                  現在のプラン
                </button>
              ) : (
                <PayPalSubscriptionButton 
                  planId={plan.paypalPlanId || undefined}
                  planName={plan.name}
                  clientId={PAYPAL_CONFIG.CLIENT_ID}
                  planPrice={parseInt(plan.price.replace(/,/g, '')) || 0}
                  onSuccess={(data) => {
                    console.log(`${plan.name}の登録が完了しました:`, data);
                  }}
                  onError={(error) => {
                    console.error(`${plan.name}の登録中にエラーが発生しました:`, error);
                  }}
                  onCancel={(data) => {
                    console.log(`${plan.name}の登録がキャンセルされました:`, data);
                  }}
                  style={{
                    ...styles.button,
                    ...(plan.popular ? styles.primaryButton : styles.secondaryButton)
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
