import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '../components/PayPalButton';

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: '無料プラン',
      price: 0,
      currency: 'JPY',
      period: '',
      features: [
        '基本的な株価分析',
        '1日5回までの分析',
        '基本的なチャート表示',
        '広告表示'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      price: 1000,
      currency: 'JPY',
      period: selectedPlan === 'monthly' ? '/月' : '/年',
      features: [
        '高度なAI分析',
        '無制限の分析回数',
        '詳細なチャート分析',
        'リアルタイムデータ',
        '広告非表示',
        '優先サポート',
        'カスタムアラート'
      ],
      popular: true
    }
  ];

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    navigate('/payment-success', { 
      state: { 
        planType: 'premium',
        amount: selectedPlan === 'monthly' ? 1000 : 10000
      } 
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert('決済に失敗しました。もう一度お試しください。');
  };

  const currentPlan = plans.find(plan => plan.id === 'premium');
  const displayPrice = selectedPlan === 'monthly' ? currentPlan.price : currentPlan.price * 10;

  return (
    <div className="pricing-page" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="header" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '20px' }}>
          料金プラン
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
          あなたの投資戦略に最適なプランを選択してください
        </p>
        
        {/* プラン選択トグル */}
        <div className="plan-toggle" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <span style={{ color: selectedPlan === 'monthly' ? '#007bff' : '#666' }}>
            月額
          </span>
          <label className="switch" style={{
            position: 'relative',
            display: 'inline-block',
            width: '60px',
            height: '34px'
          }}>
            <input
              type="checkbox"
              checked={selectedPlan === 'yearly'}
              onChange={(e) => setSelectedPlan(e.target.checked ? 'yearly' : 'monthly')}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span className="slider" style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ccc',
              transition: '.4s',
              borderRadius: '34px',
              '&:before': {
                position: 'absolute',
                content: '""',
                height: '26px',
                width: '26px',
                left: '4px',
                bottom: '4px',
                backgroundColor: 'white',
                transition: '.4s',
                borderRadius: '50%'
              }
            }}></span>
          </label>
          <span style={{ color: selectedPlan === 'yearly' ? '#007bff' : '#666' }}>
            年額（2ヶ月分お得）
          </span>
        </div>
      </div>

      <div className="plans-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px'
      }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            style={{
              border: plan.popular ? '3px solid #007bff' : '1px solid #ddd',
              borderRadius: '15px',
              padding: '30px',
              textAlign: 'center',
              position: 'relative',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                人気
              </div>
            )}

            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#333' }}>
              {plan.name}
            </h2>

            <div className="price" style={{ marginBottom: '30px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#007bff' }}>
                ¥{plan.id === 'premium' ? displayPrice.toLocaleString() : '0'}
              </span>
              <span style={{ fontSize: '1.2rem', color: '#666' }}>
                {plan.period}
              </span>
            </div>

            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ 
                  padding: '8px 0', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    color: '#28a745', 
                    marginRight: '10px',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <button style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}>
                現在のプラン
              </button>
            ) : (
              <PayPalButton
                amount={displayPrice}
                currency="JPY"
                planType="premium"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isSubscription={true}
              />
            )}
          </div>
        ))}
      </div>

      <div className="faq" style={{ marginTop: '60px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#333' }}>
          よくある質問
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          <div>
            <h4 style={{ color: '#007bff', marginBottom: '10px' }}>いつでもキャンセルできますか？</h4>
            <p style={{ color: '#666' }}>はい、いつでもキャンセル可能です。キャンセル後も期間終了まではサービスをご利用いただけます。</p>
          </div>
          <div>
            <h4 style={{ color: '#007bff', marginBottom: '10px' }}>支払い方法は？</h4>
            <p style={{ color: '#666' }}>PayPalアカウントまたはクレジットカードでお支払いいただけます。</p>
          </div>
          <div>
            <h4 style={{ color: '#007bff', marginBottom: '10px' }}>無料トライアルはありますか？</h4>
            <p style={{ color: '#666' }}>現在、無料プランで基本的な機能をお試しいただけます。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 