import { loadScript } from '@paypal/paypal-js';

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

// Subscription plan definitions
export const PAYPAL_PLANS = {
  monthly: {
    id: 'monthly_1000',
    name: '月額プラン',
    price: 1000,
    currency: 'JPY',
    interval: 'month'
  },
  yearly: {
    id: 'yearly_10000', 
    name: '年額プラン',
    price: 10000,
    currency: 'JPY',
    interval: 'year'
  }
} as const;

export type PayPalPlanType = keyof typeof PAYPAL_PLANS;

// PayPal SDK initialization
let paypalInstance: any = null;

export async function initializePayPal() {
  if (!PAYPAL_CLIENT_ID) {
    throw new Error('PayPal Client ID is not configured');
  }

  if (paypalInstance) {
    return paypalInstance;
  }

  try {
    paypalInstance = await loadScript({
      clientId: PAYPAL_CLIENT_ID,
      components: 'buttons,funding-eligibility',
      currency: 'JPY',
      intent: 'subscription',
      vault: true
    });

    return paypalInstance;
  } catch (error) {
    console.error('Failed to load PayPal SDK:', error);
    throw error;
  }
}

// Create subscription
export async function createPayPalSubscription(planType: PayPalPlanType) {
  const plan = PAYPAL_PLANS[planType];
  
  try {
    const response = await fetch('/api/paypal/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: plan.id,
        planType,
        amount: plan.price,
        currency: plan.currency,
        interval: plan.interval
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw error;
  }
}

// Get subscription status
export async function getSubscriptionStatus(userId: string) {
  try {
    const response = await fetch(`/api/user/subscription-status?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch('/api/paypal/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

// Change subscription plan
export async function changeSubscriptionPlan(subscriptionId: string, newPlanId: string) {
  try {
    const response = await fetch('/api/paypal/change-subscription-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId, newPlanId }),
    });

    if (!response.ok) {
      throw new Error('Failed to change subscription plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    throw error;
  }
}

// Format price for display
export function formatPayPalPrice(amount: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
