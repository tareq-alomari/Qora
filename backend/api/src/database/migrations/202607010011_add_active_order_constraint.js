exports.up = async (knex) => {
  await knex.schema.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_active 
    ON orders(user_id) WHERE is_active = true AND status != 'cancelled' AND status != 'completed'
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_orders_user_active');
};
