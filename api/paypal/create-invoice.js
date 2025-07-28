const express = require('express');
const router = express.Router();

// PayPal請求書作成API
router.post('/create-invoice', async (req, res) => {
  try {
    const { planId, planName, amount, currency, productType, stockSymbol } = req.body;

    // 基本的なバリデーション
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'amount and currency are required'
      });
    }

    // PayPal請求書URL生成（簡易版）
    // 実際の実装では PayPal Invoice API を使用
    const invoiceData = {
      planId,
      planName,
      amount,
      currency,
      productType,
      stockSymbol,
      timestamp: new Date().toISOString()
    };

    // PayPal Sandboxの決済ページURL（テスト用）
    const paypalClientId = process.env.PAYPAL_CLIENT_ID || 'Af1Azw69JIUiM--lIMTHTPUkabuSMNyqhMcncuzWaeZ0z4lr73Tj66mxBpbNLylimKxdkJIFCPJn7sMC';
    
    // PayPal決済ページのURL生成
    let invoiceUrl;
    
    if (productType === 'single_stock') {
      // 単発購入用URL
      invoiceUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${paypalClientId}&item_name=${encodeURIComponent(stockSymbol + ' 永久分析権')}&amount=${amount}&currency_code=${currency}&return=http://localhost:8080/payment-success&cancel_return=http://localhost:8080/payment-cancel`;
    } else {
      // サブスクリプション用URL
      invoiceUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=${paypalClientId}&item_name=${encodeURIComponent(planName)}&a3=${amount}&p3=1&t3=M&currency_code=${currency}&return=http://localhost:8080/payment-success&cancel_return=http://localhost:8080/payment-cancel`;
    }

    console.log('PayPal Invoice Created:', invoiceData);
    console.log('Invoice URL:', invoiceUrl);

    res.json({
      success: true,
      invoiceUrl: invoiceUrl,
      invoiceData: invoiceData
    });

  } catch (error) {
    console.error('PayPal Invoice Creation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
