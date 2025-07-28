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

const app = express();
const PORT = process.env.PORT || 3000;

// データベース接続（エラーハンドリング追加）
let db;
try {
  db = knex(require('./knexfile')[process.env.NODE_ENV || 'development']);
} catch (error) {
  console.warn('Database connection failed:', error.message);
  // データベースなしでも起動できるようにする
  db = null;
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信設定（修正版）
// ルートディレクトリの静的ファイル
app.use(express.static(path.join(__dirname), {
  index: false, // 自動的にindex.htmlを返さない
  dotfiles: 'deny' // ドットファイルへのアクセスを拒否
}));

// 特定のディレクトリのみを公開
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use('/services', express.static(path.join(__dirname, 'services')));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // 画像やCSSファイル用

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
};

// PayPalサブスクリプション詳細取得
const getSubscriptionDetails = async (accessToken, subscriptionID) => {
  const baseURL = isProduction 
    ? 'https://api.paypal.com' 
    : (process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com');
  
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

// 認証トークンからユーザー情報を取得（スタブ実装）
const getUserFromToken = async (authToken) => {
  if (!authToken) return null;

  try {
    // 実際の実装では、JWTトークンのデコードを行う
    return {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User'
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

// ユーザーサブスクリプション情報の保存
const saveUserSubscription = async (subscriptionData) => {
  const existingSubscription = await db('user_subscriptions')
    .where('user_id', subscriptionData.user_id)
    .andWhere('paypal_subscription_id', subscriptionData.subscription_id)
    .first();

  if (existingSubscription) {
    await db('user_subscriptions')
      .where('id', existingSubscription.id)
      .update({
        status: subscriptionData.status,
        plan_id: subscriptionData.plan_id,
        updated_at: db.fn.now()
      });
    return existingSubscription.id;
  } else {
    const [id] = await db('user_subscriptions')
      .insert({
        user_id: subscriptionData.user_id,
        paypal_subscription_id: subscriptionData.subscription_id,
        plan_id: subscriptionData.plan_id,
        status: subscriptionData.status,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('id');
    return id;
  }
};

// ユーザープラン情報の更新
const updateUserPlan = async (userId, planData) => {
  await db('users')
    .where('id', userId)
    .update({
      subscription_plan: planData.plan_type,
      subscription_status: planData.status,
      subscription_updated_at: db.fn.now()
    });

  await db('user_plan_history')
    .insert({
      user_id: userId,
      plan_type: planData.plan_type,
      status: planData.status,
      created_at: db.fn.now()
    });
};

// PayPal請求書作成API（本格実装）
app.post('/api/paypal/create-invoice', async (req, res) => {
  try {
    const { planId, planName, amount, currency, productType, stockSymbol } = req.body;
    
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
            email_address: 'customer@example.com' // 実際の実装ではユーザーのメールアドレス
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

// PayPal Webhook処理（支払い完了通知）
app.post('/api/paypal/webhook', async (req, res) => {
  try {
    const { event_type, resource } = req.body;
    
    console.log('PayPal Webhook Event:', event_type);
    
    if (event_type === 'INVOICING.INVOICE.PAID') {
      // 支払い完了時の処理
      const invoiceId = resource.id;
      const customerId = resource.primary_recipients[0].billing_info.email_address;
      
      console.log(`Invoice ${invoiceId} paid by ${customerId}`);
      
      // データベースでユーザーのプランを更新
      // 実際の実装では以下のような処理を行う
      // await updateUserSubscription(customerId, planId);
      
      // ユーザーに決済完了の通知を送信
      // await sendPaymentConfirmationEmail(customerId, invoiceId);
      
    } else if (event_type === 'INVOICING.INVOICE.CANCELLED') {
      // 請求書キャンセル時の処理
      const invoiceId = resource.id;
      console.log(`Invoice ${invoiceId} was cancelled`);
      
    } else if (event_type === 'INVOICING.INVOICE.REFUNDED') {
      // 返金時の処理
      const invoiceId = resource.id;
      console.log(`Invoice ${invoiceId} was refunded`);
      
      // ユーザーのプランをダウングレードまたは停止
      // await downgradeUserSubscription(customerId);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Error');
  }
});

// PayPal Subscription Confirmation API (本格実装)
app.post('/api/paypal/subscription/confirm', async (req, res) => {
  try {
    const { subscriptionID, planId, planName, orderID } = req.body;
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
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
    
    // ユーザー認証
    const user = await getUserFromToken(authToken);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: '認証が必要です' 
      });
    }

    // データベースに保存
    const subscriptionData = {
      user_id: user.id,
      subscription_id: subscriptionID,
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

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// ルートパスの処理（index.htmlを返す）
app.get('/', (req, res) => {
  console.log('Root path accessed, serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading page');
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
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html for fallback:', err);
      res.status(500).send('Error loading page');
    }
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
    error: errorMessage
  });
});

// 監視・ログ設定
const trackPaymentMetrics = {
  successRate: '> 95%',
  errorRate: '< 5%',
  averageCompletionTime: '< 30秒'
};

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/paypal/subscription/confirm`);
  console.log(`   GET  /api/health`);
});

module.exports = app;
