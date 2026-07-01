exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS fraud_level INTEGER DEFAULT 0 CHECK (fraud_level >= 0 AND fraud_level <= 4);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS fraud_reason VARCHAR(255);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_orders_fraud_level ON orders(fraud_level) WHERE fraud_level > 0;
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_orders_fraud_level;
    ALTER TABLE orders DROP COLUMN IF EXISTS flagged_at;
    ALTER TABLE orders DROP COLUMN IF EXISTS fraud_reason;
    ALTER TABLE orders DROP COLUMN IF EXISTS fraud_level;
  `);
};
