-- PayPal Subscription Database Schema
-- Execute this SQL to create the required tables

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  paypal_subscription_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'ACTIVE', 'CANCELLED', 'SUSPENDED', 'EXPIRED', 'PAYMENT_FAILED'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,
  last_payment_date TIMESTAMP,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'JPY',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_user_subscriptions_user_id (user_id),
  INDEX idx_user_subscriptions_paypal_id (paypal_subscription_id),
  INDEX idx_user_subscriptions_status (status),
  INDEX idx_user_subscriptions_period_end (current_period_end)
);

-- Subscription events log (for audit trail)
CREATE TABLE subscription_events (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'CREATED', 'ACTIVATED', 'CANCELLED', 'PAYMENT_COMPLETED', etc.
  event_data JSON,
  paypal_event_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_subscription_events_subscription_id (subscription_id),
  INDEX idx_subscription_events_type (event_type),
  INDEX idx_subscription_events_created_at (created_at)
);

-- Payment history table
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  paypal_payment_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'JPY',
  status VARCHAR(50) NOT NULL, -- 'COMPLETED', 'FAILED', 'PENDING', 'REFUNDED'
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_payment_history_subscription_id (subscription_id),
  INDEX idx_payment_history_paypal_id (paypal_payment_id),
  INDEX idx_payment_history_status (status),
  INDEX idx_payment_history_payment_date (payment_date)
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to user_subscriptions table
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample queries for common operations:

-- Get active subscription for a user
-- SELECT * FROM user_subscriptions 
-- WHERE user_id = ? AND status = 'ACTIVE' AND current_period_end > NOW()
-- ORDER BY created_at DESC LIMIT 1;

-- Get subscription history for a user
-- SELECT s.*, p.amount, p.payment_date 
-- FROM user_subscriptions s
-- LEFT JOIN payment_history p ON s.id = p.subscription_id
-- WHERE s.user_id = ?
-- ORDER BY s.created_at DESC;

-- Get subscriptions expiring soon (for notifications)
-- SELECT u.email, s.* 
-- FROM user_subscriptions s
-- JOIN users u ON s.user_id = u.id
-- WHERE s.status = 'ACTIVE' 
-- AND s.current_period_end BETWEEN NOW() AND NOW() + INTERVAL '3 days';
