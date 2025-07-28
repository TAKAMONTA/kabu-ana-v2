const crypto = require('crypto');
const fetch = require('node-fetch'); // node-fetchをインストールする必要があるかもしれません

const verifyPayPalWebhookSignature = async (req, res, next) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; // .envファイルから取得
  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const certUrl = req.headers['paypal-cert-url'];
  const authAlgo = req.headers['paypal-auth-algo'];
  const transmissionSig = req.headers['paypal-transmission-sig'];
  const webhookEventBody = req.rawBody; // 生のJSONボディを使用

  if (!webhookId || !transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig || !webhookEventBody) {
    console.error('Missing PayPal Webhook headers or body for verification.');
    return res.status(400).send('Missing required headers or body');
  }

  try {
    // 1. 公開証明書を取得
    const certResponse = await fetch(certUrl);
    if (!certResponse.ok) {
      throw new Error(`Failed to fetch PayPal public certificate: ${certResponse.statusText}`);
    }
    const certPem = await certResponse.text();

    // 2. 署名対象文字列を構築
    const signableBase = `${transmissionId}|${transmissionTime}|${webhookId}|${webhookEventBody}`;

    // 3. 署名を検証
    const verifier = crypto.createVerify(authAlgo.replace('SHA256withRSA', 'RSA-SHA256'));
    verifier.update(signableBase);

    const isValid = verifier.verify(certPem, transmissionSig, 'base64');

    if (!isValid) {
      console.warn('Invalid PayPal Webhook signature. Request rejected.');
      return res.status(403).send('Invalid signature');
    }

    next(); // 検証成功、次のミドルウェアへ

  } catch (error) {
    console.error('PayPal Webhook signature verification failed:', error);
    res.status(500).send('Webhook verification error');
  }
};

module.exports = verifyPayPalWebhookSignature;
