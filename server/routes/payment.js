const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

// 支払い成功時の処理
router.post('/payment-success', async (req, res) => {
  try {
    const { orderId, planType, amount } = req.body;
    
    console.log('Payment success received:', { orderId, planType, amount });

    // バリデーション
    if (!orderId || !planType || !amount) {
      return res.status(400).json({
        success: false,
        error: '必要なパラメータが不足しています'
      });
    }

    // 金額の検証（セキュリティ対策）
    const expectedAmount = planType === 'premium' ? 1000 : 1000;
    if (amount !== expectedAmount) {
      console.error('Amount mismatch:', { expected: expectedAmount, received: amount });
      return res.status(400).json({
        success: false,
        error: '金額が一致しません'
      });
    }

    // 支払い記録をデータベースに保存
    const paymentData = {
      payment_id: orderId,
      plan_type: planType,
      amount: amount,
      currency: 'JPY',
      status: 'completed',
      payment_method: 'paypal',
      created_at: new Date()
    };

    await db('payments').insert(paymentData);
    console.log('Payment record saved:', paymentData);

    // ユーザーのプレミアムステータスを更新
    // 実際の実装では、認証されたユーザーのIDを使用
    const userId = req.user?.id || 1; // 仮のユーザーID
    
    await db('users')
      .where({ id: userId })
      .update({
        is_premium: true,
        premium_plan: planType,
        premium_start_date: new Date(),
        updated_at: new Date()
      });

    console.log('User premium status updated for user:', userId);

    res.json({
      success: true,
      message: '支払い処理が完了しました',
      orderId,
      planType,
      amount
    });

  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({
      success: false,
      error: '支払い処理中にエラーが発生しました'
    });
  }
});

// サブスクリプション成功時の処理
router.post('/subscription-success', async (req, res) => {
  try {
    const { subscriptionId, planType, amount } = req.body;
    
    console.log('Subscription success received:', { subscriptionId, planType, amount });

    // バリデーション
    if (!subscriptionId || !planType || !amount) {
      return res.status(400).json({
        success: false,
        error: '必要なパラメータが不足しています'
      });
    }

    // 金額の検証（セキュリティ対策）
    const expectedAmount = planType === 'premium' ? 1000 : 1000;
    if (amount !== expectedAmount) {
      console.error('Amount mismatch:', { expected: expectedAmount, received: amount });
      return res.status(400).json({
        success: false,
        error: '金額が一致しません'
      });
    }

    // サブスクリプション記録をデータベースに保存
    const subscriptionData = {
      subscription_id: subscriptionId,
      plan_type: planType,
      amount: amount,
      currency: 'JPY',
      status: 'active',
      payment_method: 'paypal',
      created_at: new Date()
    };

    await db('user_subscriptions').insert(subscriptionData);
    console.log('Subscription record saved:', subscriptionData);

    // ユーザーのプレミアムステータスを更新
    // 実際の実装では、認証されたユーザーのIDを使用
    const userId = req.user?.id || 1; // 仮のユーザーID
    
    await db('users')
      .where({ id: userId })
      .update({
        is_premium: true,
        premium_plan: planType,
        subscription_id: subscriptionId,
        premium_start_date: new Date(),
        updated_at: new Date()
      });

    console.log('User subscription status updated for user:', userId);

    res.json({
      success: true,
      message: 'サブスクリプション処理が完了しました',
      subscriptionId,
      planType,
      amount
    });

  } catch (error) {
    console.error('Subscription success error:', error);
    res.status(500).json({
      success: false,
      error: 'サブスクリプション処理中にエラーが発生しました'
    });
  }
});

// 支払い履歴の取得
router.get('/payment-history', async (req, res) => {
  try {
    // 実際の実装では、認証されたユーザーのIDを使用
    const userId = req.user?.id || 1;
    
    const payments = await db('payments')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(10);

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: '支払い履歴の取得に失敗しました'
    });
  }
});

// サブスクリプション状態の取得
router.get('/subscription-status', async (req, res) => {
  try {
    // 実際の実装では、認証されたユーザーのIDを使用
    const userId = req.user?.id || 1;
    
    const user = await db('users')
      .where({ id: userId })
      .first();

    const subscription = await db('user_subscriptions')
      .where({ user_id: userId, status: 'active' })
      .first();

    res.json({
      success: true,
      isPremium: user?.is_premium || false,
      subscription
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'サブスクリプション状態の取得に失敗しました'
    });
  }
});

module.exports = router; 