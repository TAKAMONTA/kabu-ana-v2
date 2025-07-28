import React, { useEffect } from 'react';

const PayPalButton = ({ planId, planName }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AaKFi74Oq9lXKnajNaHIYvsBVedVKfNP0nbEQqUGSbD4vLI4pCkLpWZ7f5Hj3VuEoKPo9m9tLxQShpQH&vault=true&intent=subscription";
    script.addEventListener('load', () => {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            'plan_id': planId
          });
        },
        onApprove: function(data, actions) {
          console.log('Subscription ID:', data.subscriptionID);
          alert(`${planName}プランへの登録が完了しました！`);
        },
        onError: function(err) {
          console.error('PayPal error:', err);
          alert('決済処理中にエラーが発生しました');
        }
      }).render(`#paypal-button-container-${planId}`);
    });
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [planId, planName]);

  return (
    <div id={`paypal-button-container-${planId}`}></div>
  );
};

export default PayPalButton;