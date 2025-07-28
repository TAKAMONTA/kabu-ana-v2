const knex = require('knex');
const knexConfig = require('../knexfile');
const userServiceModule = require('./userService');

const environment = process.env.NODE_ENV || 'development';

// userServiceの初期化
let userService;
let db;

if (process.env.NODE_ENV === 'test') {
  // テスト環境では後でモックを設定するため、一時的にnullに設定
  userService = null;
  db = null;
} else {
  // 本番・開発環境では実際のdbでuserServiceを作成
  db = knex(knexConfig[environment]);
  
  // userServiceModuleが関数かどうかチェック
  if (typeof userServiceModule === 'function') {
    userService = userServiceModule(db);
  } else {
    // 既に初期化済みの場合はそのまま使用
    userService = userServiceModule;
  }
}

// テスト用にuserServiceを設定する関数
const setUserService = (mockUserService) => {
  userService = mockUserService;
};

// テスト用にdbを設定する関数
const setDb = (mockDb) => {
  db = mockDb;
};

const processPayPalWebhook = async (event) => {
  const requestId = `req_${Date.now()}`;
  console.log(`[${requestId}] [START] Processing PayPal Webhook Event: ${event.event_type}`);
  console.log(`[${requestId}] Event details:`, JSON.stringify(event, null, 2));
  
  try {
    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await db.transaction(async (trx) => {
          await handlePaymentCompleted(event.resource, trx);
        });
        break;
      case 'PAYMENT.SALE.DENIED':
        await db.transaction(async (trx) => {
          await handlePaymentDenied(event.resource, trx);
        });
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await db.transaction(async (trx) => {
          await handleSubscriptionActivated(event.resource, trx);
        });
        break;
      default:
        console.log(`Unhandled PayPal Webhook Event: ${event.event_type}`);
    }
  } catch (error) {
    console.error(`[${requestId}] [ERROR] Error processing PayPal webhook:`, {
      error: error.message,
      stack: error.stack,
      eventType: event?.event_type,
      resourceId: event?.resource?.id
    });
    throw error;
  } finally {
    console.log(`[${requestId}] [END] Completed processing PayPal Webhook Event: ${event.event_type}`);
  }
};

const handlePaymentCompleted = async (resource, trx) => {
  const paymentId = resource.id;
  const subscriptionId = resource.billing_agreement_id;
  const requestId = `payment_${paymentId || 'unknown'}_${Date.now()}`;
  
  console.log(`[${requestId}] [START] Processing payment completed`, {
    paymentId,
    subscriptionId,
    amount: resource.amount?.total,
    currency: resource.amount?.currency
  });
  
  if (!trx) {
    const errorMsg = 'Transaction not provided';
    console.error(`[${requestId}] [ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  try {
    const paymentData = {
      payment_id: paymentId,
      subscription_id: subscriptionId,
      amount: resource.amount?.total,
      currency: resource.amount?.currency,
      status: 'completed',
      raw_data: JSON.stringify(resource),
      created_at: new Date()
    };
    
    console.log(`[${requestId}] Inserting payment record:`, paymentData);
    await trx('payments').insert(paymentData);
    
    console.log(`[${requestId}] Successfully processed payment ${paymentId} for subscription ${subscriptionId}`);
  } catch (error) {
    console.error(`[${requestId}] [ERROR] Error saving payment:`, {
      error: error.message,
      stack: error.stack,
      paymentId,
      subscriptionId
    });
    throw error;
  } finally {
    console.log(`[${requestId}] [END] Completed processing payment ${paymentId}`);
  }
};

const handlePaymentDenied = async (resource, trx) => {
  const paymentId = resource.id;
  const reason = resource.reason_code || 'unknown';
  const requestId = `denied_${paymentId || 'unknown'}_${Date.now()}`;
  
  console.log(`[${requestId}] [START] Processing payment denied`, {
    paymentId,
    reason,
    resource: JSON.stringify(resource, null, 2)
  });
  
  if (!trx) {
    const errorMsg = 'Transaction not provided';
    console.error(`[${requestId}] [ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  try {
    const failureData = {
      payment_id: paymentId,
      reason_code: reason,
      raw_data: JSON.stringify(resource),
      created_at: new Date()
    };
    
    console.log(`[${requestId}] Inserting payment failure record:`, failureData);
    await trx('payment_failures').insert(failureData);
    
    console.log(`[${requestId}] Successfully recorded payment failure for ${paymentId}. Reason: ${reason}`);
  } catch (error) {
    console.error(`[${requestId}] [ERROR] Error saving payment failure:`, {
      error: error.message,
      stack: error.stack,
      paymentId,
      reason
    });
    throw error;
  } finally {
    console.log(`[${requestId}] [END] Completed processing payment denial for ${paymentId}`);
  }
};

const handleSubscriptionActivated = async (resource, trx) => {
  const subscriptionId = resource.id;
  const subscriberEmail = resource.subscriber?.email_address;
  const requestId = `sub_${subscriptionId || 'unknown'}_${Date.now()}`;
  
  console.log(`[${requestId}] [START] Processing subscription activation`, {
    subscriptionId,
    subscriberEmail,
    status: resource.status
  });
  
  if (!userService) {
    const errorMsg = 'User service not initialized';
    console.error(`[${requestId}] [ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  if (!subscriberEmail) {
    const errorMsg = 'No subscriber email provided in the subscription data';
    console.error(`[${requestId}] [ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  try {
    console.log(`[${requestId}] Looking up user with email: ${subscriberEmail}`);
    const user = await userService.getUserByEmail(subscriberEmail);
    
    if (!user) {
      const errorMsg = `No user found with email: ${subscriberEmail}`;
      console.error(`[${requestId}] [ERROR] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    console.log(`[${requestId}] Found user: ${user.name} (ID: ${user.id})`);
    
    if (!trx) {
      const errorMsg = 'Transaction not provided';
      console.error(`[${requestId}] [ERROR] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const updateData = {
      subscription_status: 'active',
      subscription_id: subscriptionId,
      updated_at: new Date()
    };
    
    console.log(`[${requestId}] Updating user subscription status:`, updateData);
    await trx('users')
      .where({ id: user.id })
      .update(updateData);
    console.log(`[${requestId}] Successfully updated subscription for user ${user.id}`);
  } catch (error) {
    console.error(`[${requestId}] [ERROR] Error processing subscription activation:`, {
      error: error.message,
      stack: error.stack,
      subscriptionId,
      subscriberEmail
    });
    throw error;
  } finally {
    console.log(`[${requestId}] [END] Completed processing subscription activation for ${subscriptionId}`);
  }
};

module.exports = {
  processPayPalWebhook,
  setUserService,
  setDb, // テスト用
  // テスト用に内部関数もエクスポート
  _testExports: {
    handlePaymentCompleted,
    handlePaymentDenied,
    handleSubscriptionActivated
  }
};
