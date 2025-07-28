const express = require('express');
const router = express.Router();
const verifyPayPalWebhookSignature = require('../../middleware/verifyWebhook');
const handleWebhookEvent = require('../../services/webhookHandler');

// PayPal Webhook処理（支払い完了通知）
router.post('/paypal/webhook', async (req, res) => {
  try {
    await handleWebhookEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;