/**
 * usersテーブル作成マイグレーション
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('firebase_uid').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('name');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};