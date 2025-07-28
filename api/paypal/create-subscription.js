// PayPal Subscription Creation API
// This would typically be a Next.js API route or Express endpoint

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Create subscription plan if not exists
async function createSubscriptionPlan(planData, accessToken) {
  const planPayload = {
    product_id: `ai-stock-analysis-${planData.planType}`,
    name: `AI Stock Analysis - ${planData.planType}`,
    description: `AI-powered stock analysis subscription - ${planData.planType} plan`,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: {
          interval_unit: planData.interval === 'month' ? 'MONTH' : 'YEAR',
          interval_count: 1,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: planData.amount.toString(),
            currency_code: planData.currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(planPayload),
  });

  return await response.json();
}

// Create subscription
async function createSubscription(planId, accessToken) {
  const subscriptionPayload = {
    plan_id: planId,
    start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
    subscriber: {
      name: {
        given_name: 'Subscriber',
        surname: 'User',
      },
    },
    application_context: {
      brand_name: 'AI Stock Analysis',
      locale: 'ja-JP',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(subscriptionPayload),
  });

  return await response.json();
}

// Main API handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, planType, amount, currency, interval } = req.body;

    if (!planId || !planType || !amount || !currency || !interval) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Create or get subscription plan
    let plan;
    try {
      // Try to get existing plan first
      const existingPlanResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (existingPlanResponse.ok) {
        plan = await existingPlanResponse.json();
      } else {
        // Create new plan
        plan = await createSubscriptionPlan({ planType, amount, currency, interval }, accessToken);
      }
    } catch (error) {
      // Create new plan if not found
      plan = await createSubscriptionPlan({ planType, amount, currency, interval }, accessToken);
    }

    // Create subscription
    const subscription = await createSubscription(plan.id, accessToken);

    if (subscription.error) {
      throw new Error(subscription.error.message || 'Failed to create subscription');
    }

    // Store subscription in database (implement your DB logic here)
    // await saveSubscriptionToDatabase({
    //   userId: req.user?.id, // Assuming you have user context
    //   paypalSubscriptionId: subscription.id,
    //   planType,
    //   status: 'PENDING',
    //   createdAt: new Date(),
    // });

    res.status(200).json({
      subscriptionId: subscription.id,
      approvalUrl: subscription.links.find(link => link.rel === 'approve')?.href,
      planId: plan.id,
    });

  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
}

// Alternative export for different frameworks
module.exports = handler;
