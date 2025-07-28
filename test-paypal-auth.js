#!/usr/bin/env node
// PayPal認証テストスクリプト
// 使用方法: node test-paypal-auth.js

require('dotenv').config({ path: '.env.development' });

// Node.js 18未満の場合はnode-fetchを使用
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.log('node-fetchが見つかりません。グローバルfetchを使用します。');
  fetch = globalThis.fetch;
}

const testPayPalAuth = async () => {
  console.log('🔐 PayPal認証テスト開始...');
  console.log('=====================================');
  
  // 環境変数の確認
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
  
  console.log('📋 設定確認:');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Client ID: ${clientId ? clientId.substring(0, 20) + '...' : '❌ 未設定'}`);
  console.log(`   Client Secret: ${clientSecret ? clientSecret.substring(0, 10) + '...' : '❌ 未設定'}`);
  console.log('');
  
  if (!clientId || !clientSecret) {
    console.error('❌ PayPal認証情報が設定されていません');
    console.log('');
    console.log('🔧 解決方法:');
    console.log('1. PayPal Developer Dashboard (https://developer.paypal.com) にアクセス');
    console.log('2. Apps & Credentials → kabu-ana アプリをクリック');
    console.log('3. Sandbox セクションで Client ID と Client Secret を取得');
    console.log('4. .env.development ファイルに正確な値を設定');
    console.log('');
    console.log('必要な環境変数:');
    console.log('  PAYPAL_CLIENT_ID=<正確なClient ID>');
    console.log('  PAYPAL_CLIENT_SECRET=<正確なClient Secret>');
    return false;
  }
  
  // 認証情報の詳細チェック
  console.log('🔍 認証情報の詳細チェック:');
  console.log(`   Client ID 長さ: ${clientId.length} 文字`);
  console.log(`   Client Secret 長さ: ${clientSecret.length} 文字`);
  console.log(`   Client ID 形式: ${clientId.includes('A') && clientId.length > 50 ? '✅ 正常' : '⚠️ 要確認'}`);
  console.log('');
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    console.log('🔑 PayPalアクセストークン取得テスト中...');
    
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      },
      body: 'grant_type=client_credentials'
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ PayPal認証成功!');
      console.log(`   Access Token: ${data.access_token?.substring(0, 20)}...`);
      console.log(`   Token Type: ${data.token_type}`);
      console.log(`   Expires In: ${data.expires_in} 秒`);
      console.log(`   Scope: ${data.scope}`);
      console.log('');
      console.log('🎉 認証情報は正常です。paypal-setup.js を実行できます！');
      return true;
    } else {
      const errorData = await response.text();
      console.log('❌ PayPal認証失敗:');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorData}`);
      console.log('');
      
      if (response.status === 401) {
        console.log('🔧 401エラーの解決方法:');
        console.log('1. PayPal Developer Dashboard で認証情報を再確認');
        console.log('2. Client ID と Client Secret が正確にコピーされているか確認');
        console.log('3. サンドボックス環境のアプリケーションを使用しているか確認');
        console.log('4. 必要に応じて新しいアプリケーションを作成');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ 認証テストエラー:', error.message);
    console.log('');
    console.log('🔧 ネットワークエラーの解決方法:');
    console.log('1. インターネット接続を確認');
    console.log('2. ファイアウォール設定を確認');
    console.log('3. プロキシ設定を確認（企業ネットワークの場合）');
    return false;
  }
};

// スクリプト実行
if (require.main === module) {
  testPayPalAuth()
    .then((success) => {
      if (success) {
        console.log('');
        console.log('🚀 次のステップ: node paypal-setup.js を実行してプランを作成してください');
        process.exit(0);
      } else {
        console.log('');
        console.log('⚠️  認証情報を修正してから再度テストしてください');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 予期しないエラー:', error);
      process.exit(1);
    });
}

module.exports = { testPayPalAuth };
