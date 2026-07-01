exports.up = function (knex) {
  return knex.schema
    .createTable('push_subscriptions', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.text('endpoint').notNullable();
      t.jsonb('keys').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['user_id', 'endpoint']);
    })
    .then(() =>
      knex.raw(`
        CREATE TRIGGER update_push_subscriptions_updated_at
          BEFORE UPDATE ON push_subscriptions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `)
    );
};

exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
  `).then(() => knex.schema.dropTableIfExists('push_subscriptions'));
};
