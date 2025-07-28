/**
 * user_subscriptionsテーブル作成マイグレーション
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_subscriptions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('paypal_subscription_id', 255).notNullable();
    table.string('plan_type', 50).notNullable();
    table.string('status', 50).notNullable();
    table.timestamp('current_period_start').nullable();
    table.timestamp('current_period_end').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // インデックス
    table.index('user_id');
    table.index('paypal_subscription_id');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_subscriptions');
};
