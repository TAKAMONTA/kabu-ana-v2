// PayPal サブスクリプションプラン作成API
// /api/paypal/create-plan

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planType } = req.body;

    // PayPalアクセストークンを取得
    const accessToken = await getPayPalAccessToken();

    // 商品作成
    const product = await createPayPalProduct(accessToken);
    
    // プラン作成
    const plan = await createPayPalPlan(accessToken, product.id, planType);

    res.status(200).json({
      success: true,
      product,
      plan
    });

  } catch (error) {
    console.error('PayPal プラン作成エラー:', error);
    res.status(500).json({
      error: 'プラン作成に失敗しました',
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

// PayPal商品作成
async function createPayPalProduct(accessToken) {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

  const productData = {
    name: '株式分析サービス',
    description: 'AI駆動の株式テクニカル分析サービス',
    type: 'SERVICE',
    category: 'SOFTWARE',
    image_url: 'https://your-domain.com/logo.png', // 実際のロゴURLに置き換え
    home_url: 'https://your-domain.com'
  };

  const response = await fetch(`${baseURL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`商品作成エラー: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

// PayPalプラン作成
async function createPayPalPlan(accessToken, productId, planType) {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

  // プランタイプに応じた設定
  const planConfigs = {
    monthly: {
      name: '株式分析 月額プラン',
      description: 'AI駆動株式分析サービス月額プラン（1,000円/月）',
      interval_unit: 'MONTH',
      interval_count: 1,
      price: '1000'
    },
    yearly: {
      name: '株式分析 年額プラン',
      description: 'AI駆動株式分析サービス年額プラン（10,000円/年）',
      interval_unit: 'YEAR',
      interval_count: 1,
      price: '10000'
    }
  };

  const config = planConfigs[planType];
  if (!config) {
    throw new Error(`無効なプランタイプ: ${planType}`);
  }

  const planData = {
    product_id: productId,
    name: config.name,
    description: config.description,
    status: 'ACTIVE',
    billing_cycles: [{
      frequency: {
        interval_unit: config.interval_unit,
        interval_count: config.interval_count
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0, // 無制限
      pricing_scheme: {
        fixed_price: {
          value: config.price,
          currency_code: 'JPY'
        }
      }
    }],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3
    },
    taxes: {
      percentage: '10', // 消費税10%
      inclusive: false
    }
  };

  const response = await fetch(`${baseURL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(planData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`プラン作成エラー: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}
