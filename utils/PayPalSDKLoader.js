// utils/PayPalSDKLoader.js
import { PAYPAL_CONFIG } from './PayPalConfig.js';

const loadPayPalSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const clientId = PAYPAL_CONFIG.CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_CLIENT_ID' || clientId === '') {
      console.warn('PayPal Client ID not configured');
      console.warn('Available config:', PAYPAL_CONFIG);
      reject(new Error('PayPal Client ID not found'));
      return;
    }

    console.log('Loading PayPal SDK with Client ID:', clientId.substring(0, 20) + '...');
    
    const script = document.createElement('script');
    script.src = `${PAYPAL_CONFIG.BASE_URL}?client-id=${clientId}&vault=true&intent=subscription&currency=${PAYPAL_CONFIG.CURRENCY}`;
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      resolve(window.paypal);
    };
    script.onerror = () => {
      console.error('PayPal SDK failed to load');
      console.error('Script URL:', script.src);
      reject(new Error('PayPal SDK failed to load'));
    };
    
    document.head.appendChild(script);
  });
};

export default loadPayPalSDK;
