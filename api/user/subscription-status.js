// User Subscription Status API
// Returns current subscription status for a user

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

// Get subscription details from PayPal
async function getPayPalSubscriptionDetails(subscriptionId, accessToken) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get subscription details from PayPal');
  }

  return await response.json();
}

// Get user subscription from database
async function getUserSubscriptionFromDatabase(userId) {
  // Implement your database query here
  // This is a mock implementation
  console.log(`Getting subscription for user ${userId}`);
  
  // Example database query (replace with your actual DB logic):
  /*
  const result = await db.query(`
    SELECT * FROM user_subscriptions 
    WHERE user_id = ? AND status IN ('ACTIVE', 'SUSPENDED')
    ORDER BY created_at DESC 
    LIMIT 1
  `, [userId]);
  
  return result[0] || null;
  */
  
  // Mock data for development
  return {
    id: 1,
    user_id: userId,
    paypal_subscription_id: 'I-BW452GLLEP1G',
    plan_type: 'monthly',
    status: 'ACTIVE',
    current_period_start: new Date('2024-01-01'),
    current_period_end: new Date('2024-02-01'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };
}

// Main API handler
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user subscription from database
    const subscription = await getUserSubscriptionFromDatabase(userId);

    if (!subscription) {
      return res.status(200).json({
        hasActiveSubscription: false,
        subscription: null,
        planType: null,
        status: 'NONE'
      });
    }

    // Get latest details from PayPal
    let paypalDetails = null;
    if (subscription.paypal_subscription_id) {
      try {
        const accessToken = await getPayPalAccessToken();
        paypalDetails = await getPayPalSubscriptionDetails(
          subscription.paypal_subscription_id, 
          accessToken
        );
      } catch (error) {
        console.error('Failed to get PayPal subscription details:', error);
        // Continue with database data if PayPal API fails
      }
    }

    // Determine current status
    const isActive = subscription.status === 'ACTIVE' && 
                    new Date() < new Date(subscription.current_period_end);

    const response = {
      hasActiveSubscription: isActive,
      subscription: {
        id: subscription.id,
        planType: subscription.plan_type,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        paypalSubscriptionId: subscription.paypal_subscription_id,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      },
      planType: subscription.plan_type,
      status: subscription.status,
      paypalDetails: paypalDetails ? {
        status: paypalDetails.status,
        nextBillingTime: paypalDetails.billing_info?.next_billing_time,
        lastPayment: paypalDetails.billing_info?.last_payment
      } : null
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Subscription status API error:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription status',
      details: error.message 
    });
  }
}

// Alternative export for different frameworks
module.exports = handler;
