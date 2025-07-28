import React, { useEffect } from 'react';

const PaymentSuccess: React.FC = () => {
  useEffect(() => {
    // Google Analyticsイベント（存在する場合）
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'payment_success_view', {
        event_category: 'payment',
        event_label: 'success_page_view'
      });
    }
  }, []);

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
        <h1 style={{ 
          fontSize: '48px', 
          color: '#22c55e', 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          決済完了！
        </h1>
        <p style={{ fontSize: '20px', color: '#e2e8f0', marginBottom: '40px' }}>
          ご登録ありがとうございます。<br/>
          すぐにサービスをご利用いただけます。
        </p>
        <button 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => window.location.href = '/'}
          onMouseOver={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          分析を開始する
        </button>
        
        <div style={{ marginTop: '40px', fontSize: '14px', color: '#a0aec0' }}>
          <p>サブスクリプションの詳細は登録メールアドレスに送信されました。</p>
          <p>お問い合わせは <a href="mailto:support@ai-stock.jp" style={{ color: '#90cdf4' }}>support@ai-stock.jp</a> までお願いします。</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
