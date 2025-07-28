// PayPal サブスクリプション確認API
// /api/paypal/subscription/confirm

// 環境変数でモードを切り替え（デフォルトはモック）
const API_MODE = process.env.PAYPAL_API_MODE || 'mock';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionID, planId, planName, orderID } = req.body;

    if (!subscriptionID || !planId || !planName) {
      return res.status(400).json({ 
        success: false,
        error: '必要なパラメータが不足しています',
        required: ['subscriptionID', 'planId', 'planName']
      });
    }

    // モードに応じてAPI呼び出しまたはモックレスポンスを使用
    let subscriptionDetails;
    
    if (API_MODE === 'live') {
      // 本番モード: 実際のPayPal APIを呼び出し
      console.log('Using LIVE PayPal API mode');
      const accessToken = await getPayPalAccessToken();
      subscriptionDetails = await getSubscriptionDetails(accessToken, subscriptionID);
    } else {
      // モックモード: テスト用のモックデータを返す
      console.log('Using MOCK PayPal API mode');
      subscriptionDetails = getMockSubscriptionDetails(subscriptionID, planId, planName);
    }

    // プラン情報の検証
    const planValidation = validatePlan(planId, planName);
    if (!planValidation.valid) {
      return res.status(400).json({ 
        success: false,
        error: 'プラン情報が無効です',
        details: planValidation.error
      });
    }

    // ユーザー情報の取得（認証トークンから）
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const userInfo = await getUserFromToken(authToken);

    if (!userInfo) {
      return res.status(401).json({ 
        success: false,
        error: '認証が必要です' 
      });
    }

    // データベースにサブスクリプション情報を保存
    const subscriptionData = {
      user_id: userInfo.id,
      subscription_id: subscriptionID,
      plan_id: planId,
      plan_name: planName,
      status: subscriptionDetails.status,
      start_time: subscriptionDetails.start_time,
      next_billing_time: subscriptionDetails.billing_info?.next_billing_time,
      amount: subscriptionDetails.billing_info?.last_payment?.amount?.value,
      currency: subscriptionDetails.billing_info?.last_payment?.amount?.currency_code,
      created_at: new Date().toISOString(),
      paypal_data: subscriptionDetails
    };

    await saveUserSubscription(subscriptionData);

    // ユーザーのプラン情報を更新
    await updateUserPlan(userInfo.id, {
      plan_type: getPlanType(planId),
      plan_name: planName,
      subscription_id: subscriptionID,
      subscription_status: 'ACTIVE',
      updated_at: new Date().toISOString()
    });

    // 成功レスポンス
    res.status(200).json({
      success: true,
      message: 'サブスクリプションが正常に確認・保存されました',
      subscriptionId: subscriptionID,
      subscription: {
        id: subscriptionID,
        plan: planName,
        status: subscriptionDetails.status,
        next_billing: subscriptionDetails.billing_info?.next_billing_time
      }
    });

  } catch (error) {
    console.error('Subscription confirmation error:', error);
    res.status(500).json({
      success: false,
      error: 'サブスクリプション確認に失敗しました',
      details: error.message
    });
  }
}

// PayPalアクセストークン取得
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal認証情報が設定されていません');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`PayPal認証エラー: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// PayPalサブスクリプション詳細取得
async function getSubscriptionDetails(accessToken, subscriptionID) {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

  const response = await fetch(`${baseURL}/v1/billing/subscriptions/${subscriptionID}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`サブスクリプション詳細取得エラー: ${response.status}`);
  }

  return await response.json();
}

// プラン情報の検証
function validatePlan(planId, planName) {
  const validPlans = {
    [process.env.REACT_APP_PAYPAL_BASIC_PLAN_ID || 'P-TEST_BASIC']: 'ベーシック',
    [process.env.REACT_APP_PAYPAL_STANDARD_PLAN_ID || 'P-38H32373Y6043933CNB7A3AQ']: 'スタンダード',
    [process.env.REACT_APP_PAYPAL_PREMIUM_PLAN_ID || 'P-TEST_PREMIUM']: 'プレミアム'
  };

  if (!validPlans[planId]) {
    return {
      valid: false,
      error: `無効なプランID: ${planId}`
    };
  }

  if (validPlans[planId] !== planName) {
    return {
      valid: false,
      error: `プラン名が一致しません: ${planName} (期待値: ${validPlans[planId]})`
    };
  }

  return { valid: true };
}

// プランタイプの取得
function getPlanType(planId) {
  if (planId === process.env.PAYPAL_BASIC_PLAN_ID) return 'basic';
  if (planId === process.env.PAYPAL_STANDARD_PLAN_ID) return 'standard';
  if (planId === process.env.PAYPAL_PREMIUM_PLAN_ID) return 'premium';
  return 'unknown';
}

// 認証トークンからユーザー情報を取得
async function getUserFromToken(authToken) {
  if (!authToken) return null;

  try {
    // JWTトークンのデコード（実際の実装に応じて調整）
    // ここではダミーの実装
    return {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User'
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// モック用のサブスクリプション詳細を生成
function getMockSubscriptionDetails(subscriptionID, planId, planName) {
  const now = new Date();
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  
  return {
    id: subscriptionID,
    status: 'ACTIVE',
    plan_id: planId,
    start_time: now.toISOString(),
    billing_info: {
      next_billing_time: nextBillingDate.toISOString(),
      last_payment: {
        amount: {
          value: getPlanPrice(planId),
          currency_code: 'JPY'
        }
      }
    },
    subscriber: {
      email_address: 'test@example.com',
      name: {
        given_name: 'Test',
        surname: 'User'
      }
    },
    create_time: now.toISOString(),
    update_time: now.toISOString()
  };
}

// プランIDから価格を取得するヘルパー関数
function getPlanPrice(planId) {
  const prices = {
    [process.env.REACT_APP_PAYPAL_BASIC_PLAN_ID || 'P-TEST_BASIC']: '980',
    [process.env.REACT_APP_PAYPAL_STANDARD_PLAN_ID || 'P-38H32373Y6043933CNB7A3AQ']: '1980',
    [process.env.REACT_APP_PAYPAL_PREMIUM_PLAN_ID || 'P-TEST_PREMIUM']: '4980'
  };
  
  return prices[planId] || '1980';
}

// ユーザーサブスクリプション情報の保存
async function saveUserSubscription(subscriptionData) {
  try {
    // モックモードの場合はデータベース操作をシミュレートする
    if (API_MODE === 'mock') {
      console.log('Mock mode: Simulating database save operation');
      return 'mock_subscription_id_' + Date.now();
    }
    
    console.log('Saving subscription data:', subscriptionData);
    
    // DB接続取得
    const knex = require('knex')(require('../../../knexfile')[process.env.NODE_ENV || 'development']);
    
    // 既存のサブスクリプションがあればステータスを更新、なければ新規作成
    const existingSubscription = await knex('user_subscriptions')
      .where('user_id', subscriptionData.user_id)
      .andWhere('paypal_subscription_id', subscriptionData.subscription_id)
      .first();
    
    if (existingSubscription) {
      // 既存のサブスクリプションを更新
      await knex('user_subscriptions')
        .where('id', existingSubscription.id)
        .update({
          status: subscriptionData.status,
          current_period_start: subscriptionData.start_time,
          current_period_end: subscriptionData.next_billing_time,
          updated_at: knex.fn.now()
        });
      
      return existingSubscription.id;
    } else {
      // 新規サブスクリプションを作成
      const [id] = await knex('user_subscriptions').insert({
        user_id: subscriptionData.user_id,
        paypal_subscription_id: subscriptionData.subscription_id,
        plan_type: subscriptionData.plan_id,
        status: subscriptionData.status,
        current_period_start: subscriptionData.start_time,
        current_period_end: subscriptionData.next_billing_time,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }).returning('id');
      
      return id;
    }
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

// ユーザープラン情報の更新
async function updateUserPlan(userId, planData) {
  try {
    // モックモードの場合はデータベース操作をシミュレートする
    if (API_MODE === 'mock') {
      console.log('Mock mode: Simulating user plan update for user:', userId, planData);
      return true;
    }
    
    console.log('Updating user plan:', userId, planData);
    
    // DB接続取得
    const knex = require('knex')(require('../../../knexfile')[process.env.NODE_ENV || 'development']);
    
    // ユーザープラン情報を更新
    await knex('users')
      .where('id', userId)
      .update({
        subscription_plan: planData.plan_type,
        subscription_status: planData.status,
        subscription_updated_at: knex.fn.now()
      });
    
    // プラン変更履歴を記録
    await knex('user_plan_history').insert({
      user_id: userId,
      plan_type: planData.plan_type,
      status: planData.status,
      created_at: knex.fn.now()
    });
    
    return true;
  } catch (error) {
    console.error('User plan update error:', error);
    throw error;
  }
}
