/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('payments', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.decimal('amount', 10, 2).notNullable();
      table.string('currency', 255).notNullable();
      table.enum('status', ['succeeded', 'pending', 'failed', 'REFUNDED']).notNullable();
      table.string('charge_id');
      table.string('paypal_subscription_id');
      table.timestamps(true, true);
    })
    .createTable('payment_failures', function (table) {
      table.increments('id').primary();
      table.string('paypal_payment_id');
      table.string('paypal_subscription_id');
      table.string('error_code');
      table.text('error_message');
      table.json('raw_payload');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('payment_failures')
    .dropTable('payments');
};