/**
 * user_plan_historyテーブル作成マイグレーション
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_plan_history', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('plan_type', 50).notNullable();
    table.string('status', 50).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // インデックス
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_plan_history');
};
