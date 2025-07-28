// ビルド時環境変数設定スクリプト
const fs = require('fs');
const path = require('path');

// NODE_ENVに基づいて適切な環境変数ファイルを読み込む
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, envFile);

console.log(`📦 環境設定: ${process.env.NODE_ENV || 'development'} (${envFile}を使用)`); 
console.log(`📂 環境変数ファイルパス: ${envPath}`);

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`✅ 環境変数ファイル読み込み成功: ${envPath}`);
} else {
  console.error(`❌ 環境変数ファイルが見つかりません: ${envPath}`);
  process.exit(1);
}

// 環境変数を取得（VITE_プレフィックス対応）
const paypalClientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
const paypalBasicPlanId = process.env.VITE_PAYPAL_BASIC_PLAN_ID || process.env.REACT_APP_PAYPAL_BASIC_PLAN_ID;
const paypalStandardPlanId = process.env.VITE_PAYPAL_STANDARD_PLAN_ID || process.env.REACT_APP_PAYPAL_STANDARD_PLAN_ID;
const paypalPremiumPlanId = process.env.VITE_PAYPAL_PREMIUM_PLAN_ID || process.env.REACT_APP_PAYPAL_PREMIUM_PLAN_ID;

console.log('🔧 ビルド時環境変数設定:');
console.log(`   PayPal Client ID: ${paypalClientId ? paypalClientId.substring(0, 20) + '...' : '未設定'}`);
console.log(`   Basic Plan ID: ${paypalBasicPlanId || '未設定'}`);
console.log(`   Standard Plan ID: ${paypalStandardPlanId || '未設定'}`);
console.log(`   Premium Plan ID: ${paypalPremiumPlanId || '未設定'}`);

// 環境変数設定ファイルを生成
const configContent = `// 自動生成された環境変数設定ファイル
// このファイルは build-config.js によって生成されます

export const PAYPAL_CONFIG = {
  CLIENT_ID: '${paypalClientId || ''}',
  BASIC_PLAN_ID: '${paypalBasicPlanId || ''}',
  STANDARD_PLAN_ID: '${paypalStandardPlanId || ''}',
  PREMIUM_PLAN_ID: '${paypalPremiumPlanId || ''}',
  BASE_URL: 'https://www.paypal.com/sdk/js',
  CURRENCY: 'JPY'
};

export default PAYPAL_CONFIG;
`;

// 設定ファイルを保存
const configPath = path.join(__dirname, 'utils', 'PayPalConfig.js');
fs.writeFileSync(configPath, configContent);

console.log('✅ PayPal設定ファイルを生成しました:', configPath);
