# RevenueCat Web Billing Setup Guide

## 1. RevenueCat Dashboard Configuration

### Create RevenueCat Account and Project
1. Sign up at https://app.revenuecat.com
2. Create new project: "AI株式アナリスト"
3. Select "Web" platform

### Configure Products and Packages
1. Go to "Products" tab
2. Create products for each plan:
   - **梅プラン**: Product ID `basic_ume_monthly`, Price ¥480, Billing Period: Monthly
   - **竹プラン**: Product ID `standard_take_monthly`, Price ¥980, Billing Period: Monthly  
   - **松プラン**: Product ID `premium_matsu_monthly`, Price ¥2,480, Billing Period: Monthly
   - **単発購入**: Product ID `single_stock_purchase`, Price ¥150, One-time purchase

### Create Entitlements
1. Go to "Entitlements" tab
2. Create entitlements:
   - `basic_access` - Attached to basic_ume_monthly
   - `standard_access` - Attached to standard_take_monthly
   - `premium_access` - Attached to premium_matsu_monthly
   - `single_stock_access` - Attached to single_stock_purchase

### Configure Offerings
1. Go to "Offerings" tab
2. Create "Current" offering
3. Add packages:
   - Package ID: `basic_ume_monthly`, Product: basic_ume_monthly
   - Package ID: `standard_take_monthly`, Product: standard_take_monthly
   - Package ID: `premium_matsu_monthly`, Product: premium_matsu_monthly
   - Package ID: `single_stock_purchase`, Product: single_stock_purchase

### Get API Keys
1. Go to "API Keys" tab
2. Copy "Public App-Specific API Key" for Web platform
3. This will be used as VITE_REVENUECAT_API_KEY

## 2. Stripe Integration
RevenueCat Web Billing uses Stripe as the payment processor:
1. Connect your Stripe account in RevenueCat dashboard
2. Configure webhook endpoints
3. Test payment flow in sandbox mode first

## 3. Environment Variables
Add to Netlify environment variables:
```
VITE_REVENUECAT_API_KEY=your_revenuecat_public_api_key_here
```

## 4. Testing
- Local development automatically uses mock mode
- Production deployment requires valid RevenueCat API key
- Test 梅プラン (¥480/month) subscription flow first

## 5. Plan Mapping
The application maps RevenueCat product IDs to internal plan IDs:
- RevenueCat: `basic_ume_monthly` → App: `basic_ume` (梅プラン)
- RevenueCat: `standard_take_monthly` → App: `standard_take` (竹プラン)
- RevenueCat: `premium_matsu_monthly` → App: `premium_matsu` (松プラン)
- RevenueCat: `single_stock_purchase` → App: Single stock purchase

## 6. 梅プラン Features
- Price: ¥480/month
- 10 stock registrations
- Basic analysis
- 4 technical indicators
- 3-year chart history
- Monthly billing cycle
