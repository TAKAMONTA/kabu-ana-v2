#!/usr/bin/env node
// PayPal 4段階課金プラン自動作成スクリプト
// 使用方法: node paypal-setup.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.development' });

// Node.js 18未満の場合はnode-fetchを使用
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.log('node-fetchが見つかりません。グローバルfetchを使用します。');
  fetch = globalThis.fetch;
}

// PayPal認証情報の検証
const validateCredentials = () => {
  console.log('🔐 環境変数デバッグ:');
  console.log('   PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'SET' : 'NOT_SET');
  console.log('   PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'NOT_SET');
  console.log('   PAYPAL_MODE:', process.env.PAYPAL_MODE);
  console.log('   PAYPAL_BASE_URL:', process.env.PAYPAL_BASE_URL);
  
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('❌ PayPal認証情報が設定されていません');
    console.log('必要な環境変数:');
    console.log('  PAYPAL_CLIENT_ID=' + (clientId || 'NOT_SET'));
    console.log('  PAYPAL_CLIENT_SECRET=' + (clientSecret || 'NOT_SET'));
    throw new Error('PayPal認証情報が設定されていません。.env.developmentファイルを確認してください。');
  }
  
  console.log('✅ PayPal認証情報が確認されました');
  return { clientId, clientSecret };
};

// PayPalアクセストークン取得
const getPayPalAccessToken = async () => {
  const { clientId, clientSecret } = validateCredentials();
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('🔑 PayPalアクセストークン取得中...');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  console.log('🔑 PayPalアクセストークン取得中...');
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
  console.log('✅ アクセストークン取得成功');
  return data.access_token;
};

// 1. 商品作成
const createProduct = async (accessToken) => {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('📦 PayPal商品作成中...');
  const productData = {
    name: '株式分析サービス',
    description: 'AI駆動の株式テクニカル分析プラットフォーム - 日本株・米国株の詳細分析とスコア評価',
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
    const errorText = await response.text();
    throw new Error(`商品作成エラー (${response.status}): ${errorText}`);
  }

  const product = await response.json();
  console.log(`✅ 商品作成完了: ${product.id}`);
  return product;
};

// 2. ベーシックプラン作成（¥480/月）
const createBasicPlan = async (accessToken, productId) => {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('💰 ベーシックプラン作成中...');
  const planData = {
    product_id: productId,
    name: 'ベーシックプラン',
    description: '月10件まで分析可能、広告なし、銘柄保存機能付き - ライトユーザー向け',
    status: 'ACTIVE',
    billing_cycles: [{
      frequency: {
        interval_unit: 'MONTH',
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: '480',
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
      percentage: '10',
      inclusive: true
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
    const errorText = await response.text();
    throw new Error(`ベーシックプラン作成エラー (${response.status}): ${errorText}`);
  }

  const plan = await response.json();
  console.log(`✅ ベーシックプラン作成完了: ${plan.id}`);
  return plan;
};

// 3. スタンダードプラン作成（¥1,480/月）
const createStandardPlan = async (accessToken, productId) => {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('💰 スタンダードプラン作成中...');
  const planData = {
    product_id: productId,
    name: 'スタンダードプラン',
    description: '月30件まで分析、酒田五法・画像アップロード対応 - 中～上級者向け',
    status: 'ACTIVE',
    billing_cycles: [{
      frequency: {
        interval_unit: 'MONTH',
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: '1480',
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
      percentage: '10',
      inclusive: true
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
    const errorText = await response.text();
    throw new Error(`スタンダードプラン作成エラー (${response.status}): ${errorText}`);
  }

  const plan = await response.json();
  console.log(`✅ スタンダードプラン作成完了: ${plan.id}`);
  return plan;
};

// 4. プレミアムプラン作成（¥3,980/月）
const createPremiumPlan = async (accessToken, productId) => {
  const baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('💰 プレミアムプラン作成中...');
  const planData = {
    product_id: productId,
    name: 'プレミアムプラン',
    description: '無制限分析、高速レスポンス保証、分析履歴管理 - アクティブ利用者向け',
    status: 'ACTIVE',
    billing_cycles: [{
      frequency: {
        interval_unit: 'MONTH',
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: '3980',
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
      percentage: '10',
      inclusive: true
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
    const errorText = await response.text();
    throw new Error(`プレミアムプラン作成エラー (${response.status}): ${errorText}`);
  }

  const plan = await response.json();
  console.log(`✅ プレミアムプラン作成完了: ${plan.id}`);
  return plan;
};

// 環境変数ファイルに自動追加
const updateEnvironmentFile = (result) => {
  const envPath = path.join(__dirname, '.env.development');
  
  console.log('📝 環境変数ファイル更新中...');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 既存のプランIDを置き換えまたは追加（VITE_プレフィックス対応）
    const updates = {
      'PAYPAL_PRODUCT_ID': result.product_id,
      'PAYPAL_BASIC_PLAN_ID': result.plans.basic.id,
      'PAYPAL_STANDARD_PLAN_ID': result.plans.standard.id,
      'PAYPAL_PREMIUM_PLAN_ID': result.plans.premium.id,
      'VITE_PAYPAL_BASIC_PLAN_ID': result.plans.basic.id,
      'VITE_PAYPAL_STANDARD_PLAN_ID': result.plans.standard.id,
      'VITE_PAYPAL_PREMIUM_PLAN_ID': result.plans.premium.id
    };
    
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ 環境変数ファイル更新完了');
    
  } catch (error) {
    console.warn('⚠️ 環境変数ファイル更新に失敗:', error.message);
    console.log('手動で以下の環境変数を追加してください:');
    Object.entries(updates).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }
};

// 5. 全プラン作成メイン関数
const setupAllPlans = async () => {
  try {
    console.log('🚀 PayPal 4段階課金プラン作成を開始...');
    console.log('=' .repeat(60));
    
    // アクセストークン取得
    const accessToken = await getPayPalAccessToken();
    
    // 商品作成
    const product = await createProduct(accessToken);
    
    // 各プラン作成
    const basicPlan = await createBasicPlan(accessToken, product.id);
    const standardPlan = await createStandardPlan(accessToken, product.id);
    const premiumPlan = await createPremiumPlan(accessToken, product.id);
    
    // 結果をまとめる
    const result = {
      product_id: product.id,
      plans: {
        basic: {
          id: basicPlan.id,
          name: basicPlan.name,
          price: '¥480/月',
          features: ['月10件まで分析', '広告なし', '銘柄保存可', 'AI分析の待機時間短縮']
        },
        standard: {
          id: standardPlan.id,
          name: standardPlan.name,
          price: '¥1,480/月',
          features: ['月30件まで分析', '酒田五法対応', '画像アップロード分析']
        },
        premium: {
          id: premiumPlan.id,
          name: premiumPlan.name,
          price: '¥3,980/月',
          features: ['無制限分析', '高速レスポンス保証', '分析履歴管理']
        }
      },
      created_at: new Date().toISOString()
    };
    
    // 設定ファイルに保存
    const configPath = path.join(__dirname, 'config', 'paypal-plans.json');
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(result, null, 2));
    
    // 環境変数ファイル更新
    updateEnvironmentFile(result);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 PayPal 4段階課金プラン作成が完了しました！');
    console.log('=' .repeat(60));
    
    console.log('\n📋 作成されたプラン:');
    console.log(`   商品ID: ${result.product_id}`);
    console.log(`   ベーシックプラン: ${result.plans.basic.id} (${result.plans.basic.price})`);
    console.log(`   スタンダードプラン: ${result.plans.standard.id} (${result.plans.standard.price})`);
    console.log(`   プレミアムプラン: ${result.plans.premium.id} (${result.plans.premium.price})`);
    
    console.log('\n📄 設定ファイル: ' + configPath);
    
    console.log('\n🔧 次のステップ:');
    console.log('1. PayPal Developer Dashboard でWebhookを設定');
    console.log('   URL: https://your-domain.com/api/paypal/webhook');
    console.log('2. フロントエンドでプランIDを使用');
    console.log('3. 決済フローのテスト実行');
    
    console.log('\n✨ セットアップ完了！');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ セットアップエラー:', error.message);
    console.error('\n🔍 トラブルシューティング:');
    console.error('1. .env.development ファイルの認証情報を確認');
    console.error('2. PayPal Developer Dashboard の設定を確認');
    console.error('3. インターネット接続を確認');
    throw error;
  }
};

// スクリプト実行
if (require.main === module) {
  setupAllPlans()
    .then(() => {
      console.log('\n🎯 PayPal課金プラン作成が正常に完了しました！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 PayPal課金プラン作成に失敗しました:', error.message);
      process.exit(1);
    });
}

module.exports = {
  setupAllPlans,
  getPayPalAccessToken,
  createProduct,
  createBasicPlan,
  createStandardPlan,
  createPremiumPlan
};
