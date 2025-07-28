exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.boolean('is_premium').defaultTo(false);
    table.string('premium_plan');
    table.string('subscription_id');
    table.timestamp('premium_start_date');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('is_premium');
    table.dropColumn('premium_plan');
    table.dropColumn('subscription_id');
    table.dropColumn('premium_start_date');
  });
}; 