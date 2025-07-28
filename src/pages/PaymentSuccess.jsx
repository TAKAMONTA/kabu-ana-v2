import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const { planType, amount } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="payment-success" style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '60px 20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="success-icon" style={{
        fontSize: '4rem',
        color: '#28a745',
        marginBottom: '30px'
      }}>
        ✓
      </div>

      <h1 style={{
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '20px'
      }}>
        決済完了
      </h1>

      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        marginBottom: '40px'
      }}>
        プレミアムプランの登録が完了しました！
      </p>

      <div className="payment-details" style={{
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          color: '#333',
          marginBottom: '20px'
        }}>
          決済詳細
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          fontSize: '1.1rem'
        }}>
          <div>
            <strong>プラン:</strong>
          </div>
          <div>
            {planType === 'premium' ? 'プレミアムプラン' : 'プレミアムプラン'}
          </div>
          
          <div>
            <strong>金額:</strong>
          </div>
          <div>
            ¥{amount ? amount.toLocaleString() : '1,000'}
          </div>
          
          <div>
            <strong>決済日時:</strong>
          </div>
          <div>
            {new Date().toLocaleString('ja-JP')}
          </div>
          
          <div>
            <strong>ステータス:</strong>
          </div>
          <div style={{ color: '#28a745', fontWeight: 'bold' }}>
            完了
          </div>
        </div>
      </div>

      <div className="next-steps" style={{
        backgroundColor: '#e7f3ff',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '40px'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          color: '#007bff',
          marginBottom: '20px'
        }}>
          次のステップ
        </h3>
        
        <ul style={{
          listStyle: 'none',
          padding: 0,
          textAlign: 'left'
        }}>
          <li style={{
            padding: '10px 0',
            borderBottom: '1px solid #d1ecf1',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              marginRight: '15px'
            }}>
              1
            </span>
            プレミアム機能が即座に利用可能になります
          </li>
          
          <li style={{
            padding: '10px 0',
            borderBottom: '1px solid #d1ecf1',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              marginRight: '15px'
            }}>
              2
            </span>
            詳細な分析機能をお試しください
          </li>
          
          <li style={{
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              marginRight: '15px'
            }}>
              3
            </span>
            カスタムアラートを設定して投資機会を見逃さない
          </li>
        </ul>
      </div>

      <div className="actions" style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          ホームに戻る
        </button>
        
        <button
          onClick={() => navigate('/analysis')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          分析を開始
        </button>
      </div>

      <p style={{
        marginTop: '30px',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        {countdown}秒後に自動的にホームページに移動します
      </p>

      <div className="support" style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          ご質問やサポートが必要な場合は、お気軽にお問い合わせください
        </p>
        <a
          href="mailto:support@ai-stock.jp"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          support@ai-stock.jp
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess; 