#!/usr/bin/env node
// PayPal サブスクリプションプラン作成スクリプト
// 使用方法: node scripts/create-paypal-plans.js

// Node.js 18未満の場合はnode-fetchを使用
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.log('node-fetchが見つかりません。グローバルfetchを使用します。');
  fetch = globalThis.fetch;
}

require('dotenv').config({ path: '.env.development' });

async function main() {
  try {
    console.log('🚀 PayPal サブスクリプションプラン作成を開始...');
    
    // 環境変数の確認
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal認証情報が設定されていません');
    }

    // アクセストークン取得
    console.log('📝 PayPalアクセストークンを取得中...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ アクセストークン取得完了');

    // 商品作成
    console.log('📦 PayPal商品を作成中...');
    const product = await createPayPalProduct(accessToken);
    console.log('✅ 商品作成完了:', product.id);

    // ベーシックプラン作成（¥480/月）
    console.log('💰 ベーシックプランを作成中...');
    const basicPlan = await createPayPalPlan(accessToken, product.id, 'basic');
    console.log('✅ ベーシックプラン作成完了:', basicPlan.id);

    // スタンダードプラン作成（¥1,480/月）
    console.log('💰 スタンダードプランを作成中...');
    const standardPlan = await createPayPalPlan(accessToken, product.id, 'standard');
    console.log('✅ スタンダードプラン作成完了:', standardPlan.id);

    // プレミアムプラン作成（¥3,980/月）
    console.log('💰 プレミアムプランを作成中...');
    const premiumPlan = await createPayPalPlan(accessToken, product.id, 'premium');
    console.log('✅ プレミアムプラン作成完了:', premiumPlan.id);

    // 結果をファイルに保存
    const result = {
      product_id: product.id,
      plans: {
        free: {
          id: null,
          name: '無料プラン',
          price: '¥0/月',
          features: ['月3件まで分析', '広告あり', '銘柄登録制限あり'],
          description: '初心者・お試し向け'
        },
        basic: {
          id: basicPlan.id,
          name: basicPlan.name,
          price: '¥480/月',
          features: ['月10件まで分析', '広告なし', '銘柄保存可', 'AI分析の待機時間短縮'],
          description: 'ライトユーザー向け'
        },
        standard: {
          id: standardPlan.id,
          name: standardPlan.name,
          price: '¥1,480/月',
          features: ['月30件まで分析', '酒田五法対応', '画像アップロード分析'],
          description: '中～上級者向け'
        },
        premium: {
          id: premiumPlan.id,
          name: premiumPlan.name,
          price: '¥3,980/月',
          features: ['無制限分析', '高速レスポンス保証', '分析履歴管理'],
          description: 'アクティブ利用者向け'
        }
      },
      created_at: new Date().toISOString()
    };

    // 設定ファイルに保存
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '..', 'config', 'paypal-plans.json');
    
    // configディレクトリが存在しない場合は作成
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(result, null, 2));

    console.log('\n🎉 PayPalプラン作成が完了しました！');
    console.log('📄 設定ファイル:', configPath);
    console.log('\n📋 作成されたプラン:');
    console.log(`   商品ID: ${result.product_id}`);
    console.log(`   無料プラン: ${result.plans.free.price} (プランID不要)`);
    console.log(`   ベーシックプラン: ${result.plans.basic.id} (${result.plans.basic.price})`);
    console.log(`   スタンダードプラン: ${result.plans.standard.id} (${result.plans.standard.price})`);
    console.log(`   プレミアムプラン: ${result.plans.premium.id} (${result.plans.premium.price})`);
    
    console.log('\n🔧 次のステップ:');
    console.log('1. PayPal Developer Dashboard でWebhookを設定');
    console.log('2. 環境変数にプランIDを追加:');
    console.log(`   PAYPAL_BASIC_PLAN_ID=${result.plans.basic.id}`);
    console.log(`   PAYPAL_STANDARD_PLAN_ID=${result.plans.standard.id}`);
    console.log(`   PAYPAL_PREMIUM_PLAN_ID=${result.plans.premium.id}`);
    console.log('3. フロントエンドでプランIDを使用');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// PayPalアクセストークン取得
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

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
    description: 'AI駆動の株式テクニカル分析サービス - 日本株・米国株の詳細分析とスコア評価',
    type: 'SERVICE',
    category: 'SOFTWARE',
    image_url: 'https://your-domain.com/logo.png',
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

  const planConfigs = {
    basic: {
      name: 'ベーシックプラン',
      description: '月10件まで分析可能、広告なし、銘柄保存機能付き - ライトユーザー向け',
      interval_unit: 'MONTH',
      interval_count: 1,
      price: '480'
    },
    standard: {
      name: 'スタンダードプラン',
      description: '月30件まで分析、酒田五法・画像アップロード対応 - 中～上級者向け',
      interval_unit: 'MONTH',
      interval_count: 1,
      price: '1480'
    },
    premium: {
      name: 'プレミアムプラン',
      description: '無制限分析、高速レスポンス保証、分析履歴管理 - アクティブ利用者向け',
      interval_unit: 'MONTH',
      interval_count: 1,
      price: '3980'
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

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  getPayPalAccessToken,
  createPayPalProduct,
  createPayPalPlan
};
