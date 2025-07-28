const knex = require('knex');
const db = knex(require('../knexfile')[process.env.NODE_ENV || 'development']);

// ユーザーサブスクリプション情報の保存
const saveUserSubscription = async (subscriptionData) => {
  if (!db) {
    console.warn('Database not available, skipping subscription save');
    return null;
  }

  try {
    const existingSubscription = await db('user_subscriptions')
      .where('user_id', subscriptionData.user_id)
      .andWhere('paypal_subscription_id', subscriptionData.paypal_subscription_id)
      .first();

    if (existingSubscription) {
      await db('user_subscriptions')
        .where('id', existingSubscription.id)
        .update({
          status: subscriptionData.status,
          plan_id: subscriptionData.plan_id,
          updated_at: db.fn.now()
        });
      return existingSubscription.id;
    } else {
      const [id] = await db('user_subscriptions')
        .insert({
          user_id: subscriptionData.user_id,
          paypal_subscription_id: subscriptionData.paypal_subscription_id,
          plan_id: subscriptionData.plan_id,
          status: subscriptionData.status,
          created_at: db.fn.now(),
          updated_at: db.fn.now()
        })
        .returning('id');
      return id;
    }
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
};

// ユーザープラン情報の更新
const updateUserPlan = async (userId, planData) => {
  if (!db) {
    console.warn('Database not available, skipping user plan update');
    return;
  }

  try {
    await db('users')
      .where('id', userId)
      .update({
        subscription_plan: planData.plan_type,
        subscription_status: planData.status,
        subscription_updated_at: db.fn.now()
      });

    await db('user_plan_history')
      .insert({
        user_id: userId,
        plan_type: planData.plan_type,
        status: planData.status,
        created_at: db.fn.now()
      });
  } catch (error) {
    console.error('User plan update error:', error);
    throw error;
  }
};

module.exports = {
  saveUserSubscription,
  updateUserPlan
};
