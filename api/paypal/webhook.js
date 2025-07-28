// PayPal Webhook Handler
// Handles subscription events from PayPal

const crypto = require('crypto');

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Verify PayPal webhook signature
async function verifyWebhookSignature(req) {
  const webhookId = PAYPAL_WEBHOOK_ID;
  const headers = req.headers;
  const body = JSON.stringify(req.body);

  const authAlgo = headers['paypal-auth-algo'];
  const transmission_id = headers['paypal-transmission-id'];
  const cert_id = headers['paypal-cert-id'];
  const transmission_sig = headers['paypal-transmission-sig'];
  const transmission_time = headers['paypal-transmission-time'];

  // Get access token for verification
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const { access_token } = await tokenResponse.json();

  // Verify webhook signature
  const verificationPayload = {
    auth_algo: authAlgo,
    cert_id: cert_id,
    transmission_id: transmission_id,
    transmission_sig: transmission_sig,
    transmission_time: transmission_time,
    webhook_id: webhookId,
    webhook_event: req.body,
  };

  const verifyResponse = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationPayload),
  });

  const verificationResult = await verifyResponse.json();
  return verificationResult.verification_status === 'SUCCESS';
}

// Update subscription in database
async function updateSubscriptionInDatabase(subscriptionId, status, eventData) {
  // Implement your database update logic here
  console.log(`Updating subscription ${subscriptionId} to status ${status}`);
  
  // Example database update (replace with your actual DB logic):
  /*
  await db.query(`
    UPDATE user_subscriptions 
    SET status = ?, updated_at = NOW() 
    WHERE paypal_subscription_id = ?
  `, [status, subscriptionId]);
  */
}

// Handle different webhook events
async function handleWebhookEvent(eventType, eventData) {
  const subscriptionId = eventData.resource?.id;
  
  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      console.log('Subscription activated:', subscriptionId);
      await updateSubscriptionInDatabase(subscriptionId, 'ACTIVE', eventData);
      break;

    case 'BILLING.SUBSCRIPTION.CANCELLED':
      console.log('Subscription cancelled:', subscriptionId);
      await updateSubscriptionInDatabase(subscriptionId, 'CANCELLED', eventData);
      break;

    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      console.log('Subscription suspended:', subscriptionId);
      await updateSubscriptionInDatabase(subscriptionId, 'SUSPENDED', eventData);
      break;

    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
      console.log('Subscription payment failed:', subscriptionId);
      await updateSubscriptionInDatabase(subscriptionId, 'PAYMENT_FAILED', eventData);
      break;

    case 'BILLING.SUBSCRIPTION.EXPIRED':
      console.log('Subscription expired:', subscriptionId);
      await updateSubscriptionInDatabase(subscriptionId, 'EXPIRED', eventData);
      break;

    case 'PAYMENT.SALE.COMPLETED':
      console.log('Payment completed for subscription:', subscriptionId);
      // Update last payment date, next billing date, etc.
      break;

    default:
      console.log('Unhandled webhook event:', eventType);
  }
}

// Main webhook handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Webhook署名の検証
    const isValid = await verifyWebhookSignature(req);
    if (!isValid) {
      console.error('無効なWebhook署名');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const webhookEvent = req.body;
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    console.log('PayPal Webhook受信:', eventType, {
      subscriptionId: resource.id,
      status: resource.status,
      timestamp: new Date().toISOString()
    });

    // イベントタイプに応じた処理
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log('サブスクリプション作成:', resource.id);
        await handleSubscriptionCreated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('サブスクリプション開始:', resource.id);
        await handleSubscriptionActivated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('サブスクリプション解約:', resource.id);
        await handleSubscriptionCancelled(resource);
        break;
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        console.log('サブスクリプション停止:', resource.id);
        await handleSubscriptionSuspended(resource);
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        console.log('サブスクリプション期限切れ:', resource.id);
        await handleSubscriptionExpired(resource);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        console.log('決済完了:', resource.id);
        await handlePaymentCompleted(resource);
        break;
      case 'PAYMENT.SALE.DENIED':
        console.log('決済拒否:', resource.id);
        await handlePaymentDenied(resource);
        break;
      default:
        console.log('未処理のイベントタイプ:', eventType);
    }

    // イベントログを保存
    await saveSubscriptionEvent({
      event_type: eventType,
      subscription_id: resource.id || resource.billing_agreement_id,
      event_data: webhookEvent,
      processed_at: new Date().toISOString()
    });

    res.status(200).json({ success: true, eventType });

  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error.message 
    });
  }
}

// Webhook イベントハンドラー関数

// サブスクリプション作成時の処理
async function handleSubscriptionCreated(resource) {
  try {
    console.log('サブスクリプション作成処理:', resource.id);
    
    // データベースにサブスクリプション情報を保存
    // 実際のデータベース処理はここに実装
    const subscriptionData = {
      subscription_id: resource.id,
      plan_id: resource.plan_id,
      status: 'CREATED',
      subscriber_email: resource.subscriber?.email_address,
      created_at: new Date().toISOString()
    };
    
    console.log('サブスクリプションデータ保存:', subscriptionData);
    // await saveUserSubscription(subscriptionData);
    
  } catch (error) {
    console.error('サブスクリプション作成処理エラー:', error);
  }
}

// サブスクリプション有効化時の処理
async function handleSubscriptionActivated(resource) {
  try {
    console.log('サブスクリプション有効化処理:', resource.id);
    
    // ユーザーのサブスクリプション状態を有効化
    const updateData = {
      subscription_id: resource.id,
      status: 'ACTIVE',
      activated_at: new Date().toISOString(),
      next_billing_time: resource.billing_info?.next_billing_time
    };
    
    console.log('サブスクリプション有効化:', updateData);
    // await updateUserSubscriptionStatus(resource.id, 'ACTIVE');
    
  } catch (error) {
    console.error('サブスクリプション有効化処理エラー:', error);
  }
}

// サブスクリプション解約時の処理
async function handleSubscriptionCancelled(resource) {
  try {
    console.log('サブスクリプション解約処理:', resource.id);
    
    // ユーザーのサブスクリプション状態を解約に変更
    const updateData = {
      subscription_id: resource.id,
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: resource.status_change_note
    };
    
    console.log('サブスクリプション解約:', updateData);
    // await updateUserSubscriptionStatus(resource.id, 'CANCELLED');
    
  } catch (error) {
    console.error('サブスクリプション解約処理エラー:', error);
  }
}

// サブスクリプション停止時の処理
async function handleSubscriptionSuspended(resource) {
  try {
    console.log('サブスクリプション停止処理:', resource.id);
    
    const updateData = {
      subscription_id: resource.id,
      status: 'SUSPENDED',
      suspended_at: new Date().toISOString()
    };
    
    console.log('サブスクリプション停止:', updateData);
    // await updateUserSubscriptionStatus(resource.id, 'SUSPENDED');
    
  } catch (error) {
    console.error('サブスクリプション停止処理エラー:', error);
  }
}

// サブスクリプション期限切れ時の処理
async function handleSubscriptionExpired(resource) {
  try {
    console.log('サブスクリプション期限切れ処理:', resource.id);
    
    const updateData = {
      subscription_id: resource.id,
      status: 'EXPIRED',
      expired_at: new Date().toISOString()
    };
    
    console.log('サブスクリプション期限切れ:', updateData);
    // await updateUserSubscriptionStatus(resource.id, 'EXPIRED');
    
  } catch (error) {
    console.error('サブスクリプション期限切れ処理エラー:', error);
  }
}

// 決済完了時の処理
async function handlePaymentCompleted(resource) {
  try {
    console.log('決済完了処理:', resource.id);
    
    // 決済履歴を保存
    const paymentData = {
      payment_id: resource.id,
      subscription_id: resource.billing_agreement_id,
      amount: resource.amount?.total,
      currency: resource.amount?.currency,
      payment_date: resource.create_time,
      status: 'COMPLETED'
    };
    
    console.log('決済履歴保存:', paymentData);
    // await savePaymentHistory(paymentData);
    
  } catch (error) {
    console.error('決済完了処理エラー:', error);
  }
}

// 決済拒否時の処理
async function handlePaymentDenied(resource) {
  try {
    console.log('決済拒否処理:', resource.id);
    
    const paymentData = {
      payment_id: resource.id,
      subscription_id: resource.billing_agreement_id,
      amount: resource.amount?.total,
      currency: resource.amount?.currency,
      payment_date: resource.create_time,
      status: 'DENIED',
      reason: resource.reason_code
    };
    
    console.log('決済拒否履歴保存:', paymentData);
    // await savePaymentHistory(paymentData);
    
  } catch (error) {
    console.error('決済拒否処理エラー:', error);
  }
}

// サブスクリプションイベント保存
async function saveSubscriptionEvent(eventData) {
  try {
    console.log('イベントログ保存:', eventData);
    // 実際のデータベース処理はここに実装
    // await db.subscription_events.insert(eventData);
  } catch (error) {
    console.error('イベントログ保存エラー:', error);
  }
}

// Alternative export for different frameworks
module.exports = handler;
