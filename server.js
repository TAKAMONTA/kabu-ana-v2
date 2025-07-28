const express = require('express');
const cors = require('cors');
const knex = require('knex');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 環境変数の読み込み（本番環境では.env.productionを使用）
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

// 環境設定
const isProduction = process.env.NODE_ENV === 'production';

const admin = require('firebase-admin');

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  try {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    // エラーが発生してもサーバーは起動を続行
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// 静的ファイルの配信設定
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // 1日間キャッシュ
  etag: true,   // ETagを有効化
  lastModified: true, // Last-Modifiedヘッダーを有効化
  setHeaders: (res, path) => {
    // アイコンファイルのキャッシュ期間を長めに設定
    if (path.match(/\.(ico|png|jpg|jpeg|svg|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// アイコンファイルのエイリアスを設定
app.use('/icons', express.static(path.join(__dirname, 'public', 'icons')));

// マニフェストファイルの配信
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// データベース接続（エラーハンドリング追加）
let db;
try {
  db = knex(require('./knexfile')[process.env.NODE_ENV || 'development']);
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Database connection failed:', error.message);
  console.error('Error details:', error);
  process.exit(1); // データベース接続に失敗した場合はアプリケーションを終了
}

// セキュリティミドルウェア（CSP設定を緩和）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paypal.com", "https://api.sandbox.paypal.com"]
    }
  }
}));

// CORS設定（修正版）
const corsOptions = {
  origin: function (origin, callback) {
    // 開発環境では全て許可
    if (!isProduction) {
      return callback(null, true);
    }
    
    // 本番環境では特定のオリジンのみ許可
    const allowedOrigins = [
      'https://ai-stock.jp', 
      'https://www.ai-stock.jp',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // IE11対応
};

app.use(cors(corsOptions));

// プリフライトリクエストの処理
app.options('*', cors(corsOptions));

// レート制限（DoS攻撃対策）
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 100, // IPアドレスごとに100リクエストまで
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト数が多すぎます。しばらく経ってからお試しください。' }
});

// 基本ミドルウェア
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信設定（新しい構成対応）
// ルートディレクトリの静的ファイル（index.html, manifest.json等）
app.use(express.static(path.join(__dirname), {
  index: false, // SPAルーティング用に自動index.htmlを無効化
  dotfiles: 'deny'
}));

// 新しい静的サイト構成のディレクトリ
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

// 開発用：既存のディレクトリも配信（デバッグ・互換性用）
if (!isProduction) {
  app.use('/dist', express.static(path.join(__dirname, 'dist')));
  app.use('/components', express.static(path.join(__dirname, 'components')));
  app.use('/utils', express.static(path.join(__dirname, 'utils')));
  app.use('/services', express.static(path.join(__dirname, 'services')));
  app.use('/publish', express.static(path.join(__dirname, 'publish')));
}

// 決済APIへのレート制限を適用
app.use('/api/paypal', apiLimiter);

// PayPalアクセストークン取得
const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseURL = isProduction 
    ? 'https://api.paypal.com' 
    : (process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal認証情報が設定されていません');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal認証エラー (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('PayPal access token error:', error);
    throw error;
  }
};

// PayPalサブスクリプション詳細取得
const getSubscriptionDetails = async (accessToken, subscriptionID) => {
  const baseURL = isProduction 
    ? 'https://api.paypal.com' 
    : (process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com');
  
  try {
    const response = await fetch(`${baseURL}/v1/billing/subscriptions/${subscriptionID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`サブスクリプション詳細取得エラー (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get subscription details error:', error);
    throw error;
  }
};

// プラン情報の検証
const validatePlan = (planId, planName) => {
  const validPlans = {
    [process.env.PAYPAL_BASIC_PLAN_ID]: 'ベーシック',
    [process.env.PAYPAL_STANDARD_PLAN_ID]: 'スタンダード',
    [process.env.PAYPAL_PREMIUM_PLAN_ID]: 'プレミアム'
  };

  if (!validPlans[planId]) {
    throw new Error(`無効なプランID: ${planId}`);
  }

  if (validPlans[planId] !== planName) {
    throw new Error(`プラン名が一致しません。期待値: ${validPlans[planId]}, 実際: ${planName}`);
  }

  return true;
};

const authenticate = require('./middleware/authenticate');

// 認証トークンからユーザー情報を取得（スタブ実装）
// この関数はauthenticateミドルウェアに置き換えられます
// const getUserFromToken = async (authToken) => {
//   if (!authToken) return null;

//   try {
//     // 実際の実装では、JWTトークンのデコードを行う
//     return {
//       id: 'user_123',
//       email: 'user@example.com',
//       name: 'Test User'
//     };
//   } catch (error) {
//     console.error('Token validation error:', error);
//     return null;
//   }
// };



// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API情報エンドポイント
app.get('/api', (req, res) => {
  res.json({
    name: 'AI Stock Analyst API',
    version: '1.0.0',
    endpoints: [
      'POST /api/register-user',
      'POST /api/paypal/create-invoice',
      'POST /api/paypal/webhook',
      'POST /api/paypal/subscription/confirm',
      'GET /health'
    ]
  });
});

// ユーザー登録APIエンドポイント
app.post('/api/register-user', authenticate, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const email = req.user.email;
    const name = req.user.name || null; // Firebaseから名前が提供されない場合もある

    if (!firebaseUid || !email) {
      return res.status(400).json({ success: false, error: 'Firebaseユーザー情報が不足しています' });
    }

    // ユーザーを検索または作成
    const user = await findOrCreateUser(firebaseUid, email, name);

    res.status(200).json({ success: true, message: 'ユーザー情報が正常に保存されました', user: { id: user.id, firebase_uid: user.firebase_uid, email: user.email } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});
// 株式分析APIエンドポイント
const { analyzeStock } = require('./services/geminiService');

app.post('/api/analyze', async (req, res) => {
  try {
    const { ticker, investmentStyle, image, question } = req.body;
    
    // 入力検証
    if (!ticker) {
      return res.status(400).json({ 
        success: false, 
        error: '銘柄コードが必要です' 
      });
    }
    
    console.log('Analysis request:', { ticker, investmentStyle, question });
    
    // Gemini APIを使用して実際の分析を実行
    const result = await analyzeStock(ticker, investmentStyle, image, question);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '分析中にエラーが発生しました' 
    });
  }
});

app.get('/api/user/subscription', authenticate, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await getUserByFirebaseUid(firebaseUid);

    if (!user) {
      return res.status(404).json({ success: false, error: 'ユーザーが見つかりません' });
    }

    if (!db) {
      return res.status(500).json({ success: false, error: 'データベースが利用できません' });
    }

    const subscription = await db('user_subscriptions')
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .first();

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'サブスクリプションが見つかりません' });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// PayPal請求書作成API（本格実装）
app.post('/api/paypal/create-invoice', authenticate, async (req, res) => {
  try {
    const { planId, planName, amount, currency, productType, stockSymbol } = req.body;
    const firebaseUid = req.user.uid;
    const user = await findOrCreateUser(firebaseUid, req.user.email, req.user.name);

    // 基本的なバリデーション
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'amount and currency are required'
      });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    // 請求書のデータを準備
    const invoiceData = {
      detail: {
        invoice_number: `INV-${Date.now()}`,
        currency_code: currency || 'JPY',
        payment_term: {
          term_type: 'DUE_ON_RECEIPT'
        }
      },
      invoicer: {
        name: {
          given_name: 'AI株式分析',
          surname: 'サービス'
        },
        email_address: process.env.BUSINESS_EMAIL || 'noreply@ai-stock.jp'
      },
      primary_recipients: [
        {
          billing_info: {
            email_address: user.email // ユーザーのメールアドレス
          }
        }
      ],
      items: [
        {
          name: productType === 'single_stock' 
            ? `${stockSymbol} 永久分析権` 
            : `${planName} - 月額プラン`,
          description: productType === 'single_stock'
            ? `${stockSymbol}の永久分析権利`
            : `${planName}の月額サブスクリプション`,
          quantity: '1',
          unit_amount: {
            currency_code: currency || 'JPY',
            value: amount.toString()
          }
        }
      ],
      configuration: {
        partial_payment: {
          allow_partial_payment: false
        },
        allow_tip: false
      }
    };
    
    // PayPal APIベースURL
    const PAYPAL_API_BASE = isProduction 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    // PayPal APIを呼び出して請求書を作成
    const axios = require('axios');
    const createResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/invoicing/invoices`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const invoiceId = createResponse.data.id;
    
    // 請求書を送信
    await axios.post(
      `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}/send`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 請求書のリンクを取得
    const invoiceDetails = await axios.get(
      `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const invoiceUrl = invoiceDetails.data.detail.metadata.recipient_view_url;
    
    console.log('PayPal Invoice Created:', { invoiceId, planId, amount });
    
    res.json({ 
      success: true, 
      invoiceUrl: invoiceUrl,
      invoiceId: invoiceId 
    });
    
  } catch (error) {
    console.error('PayPal Invoice Creation Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to create invoice'
    });
  }
});

const webhooksRouter = require('./api/routes/webhooks');
const paymentRouter = require('./server/routes/payment');
const { saveUserSubscription, updateUserPlan } = require('./services/dbService');
const userServiceModule = require('./services/userService');
let userService;

// userServiceModuleが関数かどうかチェック
if (typeof userServiceModule === 'function') {
  userService = userServiceModule(db);
} else {
  // 既に初期化済みの場合はそのまま使用
  userService = userServiceModule;
}

// Webhookルーターをマウント
app.use('/api', webhooksRouter);

// 支払いルーターをマウント
app.use('/api', paymentRouter);

// PayPal Subscription Confirmation API (本格実装)
app.post('/api/paypal/subscription/confirm', authenticate, async (req, res) => {
  try {
    const { subscriptionID, planId, planName, orderID } = req.body;
    const firebaseUid = req.user.uid;
    const user = await findOrCreateUser(firebaseUid, req.user.email, req.user.name);
    
    console.log('PayPal API Request:', { subscriptionID, planId, planName, orderID });
    
    // バリデーション
    if (!subscriptionID || !planId) {
      return res.status(400).json({ 
        success: false, 
        error: '必要なパラメータが不足しています' 
      });
    }

    // プラン情報の検証
    validatePlan(planId, planName);

    // PayPalアクセストークン取得
    const accessToken = await getPayPalAccessToken();
    
    // PayPalサブスクリプション詳細取得
    const subscriptionDetails = await getSubscriptionDetails(accessToken, subscriptionID);
    
    // データベースに保存
    const subscriptionData = {
      user_id: user.id,
      paypal_subscription_id: subscriptionID,
      plan_id: planId,
      status: subscriptionDetails.status
    };
    
    await saveUserSubscription(subscriptionData);
    
    // ユーザープラン更新
    const planData = {
      plan_type: planName,
      status: subscriptionDetails.status
    };
    
    await updateUserPlan(user.id, planData);
    
    const response = {
      success: true,
      message: 'サブスクリプションが正常に確認・保存されました',
      subscriptionId: subscriptionID,
      planId: planId,
      planName: planName,
      status: subscriptionDetails.status,
      user: {
        id: user.id,
        email: user.email
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('PayPal API Response:', response);
    
    res.json(response);
    
  } catch (error) {
    console.error('PayPal subscription confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// PayPal Subscription Plan Change API
app.post('/api/paypal/change-subscription-plan', authenticate, async (req, res) => {
  try {
    const { subscriptionId, newPlanId } = req.body;
    const firebaseUid = req.user.uid;
    const user = await getUserByFirebaseUid(firebaseUid);

    if (!user) {
      return res.status(404).json({ success: false, error: 'ユーザーが見つかりません' });
    }

    if (!subscriptionId || !newPlanId) {
      return res.status(400).json({ success: false, error: '必要なパラメータが不足しています' });
    }

    const accessToken = await getPayPalAccessToken();
    const baseURL = isProduction 
      ? 'https://api.paypal.com' 
      : (process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com');

    // PayPal APIを呼び出してプランを変更
    const response = await fetch(`${baseURL}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          op: 'replace',
          path: '/plan_id',
          value: newPlanId,
        },
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPalプラン変更エラー (${response.status}): ${errorText}`);
    }

    // データベースのサブスクリプション情報を更新
    await saveUserSubscription({
      user_id: user.id,
      paypal_subscription_id: subscriptionId,
      plan_id: newPlanId,
      status: 'ACTIVE', // プラン変更後はアクティブと仮定
    });

    res.json({ success: true, message: 'プランが正常に変更されました' });

  } catch (error) {
    console.error('PayPal plan change error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// PayPal Webhookイベントの検証と処理
app.post('/api/paypal/webhook', async (req, res) => {
  try {
    const authHeader = req.headers['paypal-auth-algo'];
    const certUrl = req.headers['paypal-cert-url'];
    const transmissionId = req.headers['paypal-transmission-id'];
    const transmissionTime = req.headers['paypal-transmission-time'];
    const transmissionSig = req.headers['paypal-transmission-sig'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const eventBody = req.body;

    // 必要なヘッダーが存在するか確認
    if (!authHeader || !certUrl || !transmissionId || !transmissionTime || !transmissionSig || !webhookId) {
      console.error('Missing required PayPal webhook headers');
      return res.status(400).json({ error: 'Missing required headers' });
    }

    // 本番環境でのみ実際の検証を行う
    if (isProduction) {
      try {
        // PayPal SDKを使用してWebhookイベントを検証
        const paypal = require('@paypal/checkout-server-sdk');
        const environment = new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        );
        
        const client = new paypal.core.PayPalHttpClient(environment);
        
        const verifyWebhook = new paypal.webhooks.WebhooksVerifySignatureRequest();
        verifyWebhook.requestBody({
          auth_algo: authHeader,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: eventBody
        });

        const response = await client.execute(verifyWebhook);
        if (response.result.verification_status !== 'SUCCESS') {
          console.error('Webhook signature verification failed');
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      } catch (error) {
        console.error('Webhook verification error:', error);
        return res.status(400).json({ error: 'Webhook verification failed' });
      }
    }

    // イベントタイプに基づいて処理を分岐
    const eventType = eventBody.event_type;
    const resource = eventBody.resource;

    console.log(`Received PayPal webhook event: ${eventType}`);

    try {
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
        case 'BILLING.SUBSCRIPTION.UPDATED':
          // サブスクリプションが有効化または更新された場合
          await handleSubscriptionUpdate(resource);
          break;
          
        case 'BILLING.SUBSCRIPTION.EXPIRED':
        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          // サブスクリプションが期限切れ、キャンセル、または停止された場合
          await handleSubscriptionCancellation(resource);
          break;
          
        case 'PAYMENT.SALE.COMPLETED':
          // 支払いが完了した場合
          await handlePaymentCompleted(resource);
          break;
          
        case 'PAYMENT.SALE.DENIED':
        case 'PAYMENT.SALE.REFUNDED':
        case 'PAYMENT.SALE.REVERSED':
          // 支払いが拒否、返金、または取り消された場合
          await handlePaymentFailure(resource);
          break;
          
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }
      
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      res.status(500).json({ error: 'Error processing webhook event' });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// サブスクリプション更新処理
async function handleSubscriptionUpdate(subscription) {
  console.log('Handling subscription update:', subscription.id);
  
  // ここでデータベースを更新するロジックを実装
  // 例: ユーザーのサブスクリプションステータスを更新
  try {
    if (db) {
      await db('user_subscriptions')
        .where({ paypal_subscription_id: subscription.id })
        .update({
          status: subscription.status,
          plan_id: subscription.plan_id,
          updated_at: new Date()
        });
    }
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

// サブスクリプションキャンセル処理
async function handleSubscriptionCancellation(subscription) {
  console.log('Handling subscription cancellation:', subscription.id);
  
  try {
    if (db) {
      await db('user_subscriptions')
        .where({ paypal_subscription_id: subscription.id })
        .update({
          status: 'CANCELLED',
          cancelled_at: new Date(),
          updated_at: new Date()
        });
    }
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

// 支払い完了処理
async function handlePaymentCompleted(payment) {
  console.log('Handling payment completed:', payment.id);
  
  try {
    if (db) {
      // 支払い情報を記録
      await db('payments').insert({
        payment_id: payment.id,
        subscription_id: payment.billing_agreement_id,
        amount: payment.amount.total,
        currency: payment.amount.currency,
        status: payment.state,
        created_at: new Date()
      });
      
      // サブスクリプションの最終支払日を更新
      await db('user_subscriptions')
        .where({ paypal_subscription_id: payment.billing_agreement_id })
        .update({
          last_payment_date: new Date(),
          next_billing_date: payment.next_billing_time || null,
          updated_at: new Date()
        });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// 支払い失敗処理
async function handlePaymentFailure(payment) {
  console.log('Handling payment failure:', payment.id);
  
  try {
    if (db) {
      // 支払い失敗を記録
      await db('payment_failures').insert({
        payment_id: payment.id,
        subscription_id: payment.billing_agreement_id,
        amount: payment.amount?.total || null,
        currency: payment.amount?.currency || null,
        reason: payment.reason_code || 'unknown',
        created_at: new Date()
      });
      
      // サブスクリプションステータスを更新（必要に応じて）
      await db('user_subscriptions')
        .where({ paypal_subscription_id: payment.billing_agreement_id })
        .update({
          status: 'PAYMENT_FAILED',
          updated_at: new Date()
        });
    }
  } catch (error) {
    console.error('Payment failure processing error:', error);
    throw error;
  }
}

// SPAフォールバック設定（Reactアプリ用）
// 全ての非APIルートをindex.htmlにフォールバック
app.get('*', (req, res) => {
  // APIルートは除外
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  console.log(`SPA fallback for path: ${req.path}`);
  const indexPath = path.join(__dirname, 'publish', 'index.html');
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving React app index.html:', err);
      res.status(500).send(`
        <html>
          <head><title>AI Stock Analyst - Error</title></head>
          <body>
            <h1>AI Stock Analyst</h1>
            <p>Reactアプリケーションの読み込みに失敗しました。</p>
            <p>ファイルパス: ${indexPath}</p>
            <p>npm run build を実行してアプリケーションをビルドしてください。</p>
            <a href="/health">ヘルスチェック</a>
          </body>
        </html>
      `);
    }
  });
});

// SPA用のフォールバック（APIルート以外はindex.htmlを返す）
app.get('*', (req, res, next) => {
  // APIルートの場合はスキップ
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next();
  }
  
  // その他のルートはindex.htmlを返す
  console.log(`Fallback route accessed: ${req.path}, serving index.html`);
  const indexPath = path.join(__dirname, 'index.html');
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html for fallback:', err);
      res.status(404).json({
        error: 'Page not found',
        path: req.path,
        message: 'index.htmlファイルが見つかりません'
      });
    }
  });
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('サーバーエラー:', err.stack);
  
  // 本番環境ではエラー詳細を隠す
  const errorMessage = isProduction 
    ? '内部サーバーエラーが発生しました' 
    : err.message;
  
  res.status(500).json({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📝 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /              - Root page`);
  console.log(`   GET  /health        - Health check`);
  console.log(`   GET  /api           - API info`);
  console.log(`   POST /api/paypal/create-invoice`);
  console.log(`   POST /api/paypal/webhook`);
  console.log(`   POST /api/paypal/subscription/confirm`);
  console.log(`🌐 Webhook endpoint: http://localhost:${PORT}/api/paypal/webhook`);
});

module.exports = app;
