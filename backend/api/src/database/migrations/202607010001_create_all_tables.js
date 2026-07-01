exports.up = function (knex) {
  return knex.raw(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TYPE user_role AS ENUM ('client', 'employee', 'admin');
    CREATE TYPE order_status AS ENUM (
      'draft', 'data_entry_complete', 'photo_pending', 'photo_rejected',
      'photo_accepted', 'payment_pending', 'payment_verification',
      'needs_correction', 'approved', 'submitted', 'completed', 'cancelled'
    );
    CREATE TYPE payment_method AS ENUM ('deposit', 'wallet');
    CREATE TYPE payment_provider AS ENUM ('kuraimi', 'jeeb', 'one_cash', 'mobile_money');
    CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected', 'refunded');
    CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'pwa');
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
    CREATE TYPE service_type AS ENUM ('dv_lottery', 'visa', 'translation', 'passport');
  `)
    .then(() => knex.schema
      .createTable('users', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.string('email', 255).unique();
        t.string('phone', 20).unique().notNullable();
        t.string('password_hash', 255);
        t.string('full_name', 255);
        t.specificType('role', 'user_role').defaultTo('client');
        t.boolean('is_verified').defaultTo(false);
        t.boolean('is_active').defaultTo(true);
        t.timestamp('last_login_at');
        t.jsonb('metadata').defaultTo('{}');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('orders', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        t.specificType('service_type', 'service_type').defaultTo('dv_lottery');
        t.specificType('status', 'order_status').defaultTo('draft');
        t.decimal('total_price', 10, 2).notNullable().defaultTo(1000);
        t.string('order_number', 20).unique();
        t.string('currency', 3).defaultTo('YER');
        t.text('notes');
        t.jsonb('metadata').defaultTo('{}');
        t.boolean('is_active').defaultTo(true);
        t.string('result', 10);
        t.timestamp('result_checked_at');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('applicant_data', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.uuid('order_id').notNullable().unique().references('id').inTable('orders').onDelete('CASCADE');
        t.string('first_name', 100);
        t.string('last_name', 100);
        t.string('middle_name', 100);
        t.string('gender', 10);
        t.date('birth_date');
        t.string('birth_country', 100);
        t.string('birth_city', 100);
        t.string('email', 255);
        t.string('phone', 20);
        t.text('address_line1');
        t.text('address_line2');
        t.string('country', 100);
        t.string('city', 100);
        t.string('postal_code', 20);
        t.string('district', 100);
        t.string('education_level', 100);
        t.string('marital_status', 20);
        t.jsonb('spouse_data').defaultTo('{}');
        t.jsonb('children_data').defaultTo('[]');
        t.string('country_of_eligibility', 100);
        t.string('passport_number', 50);
        t.date('passport_expiry');
        t.string('alt_phone', 20);
        t.string('photo_path', 500);
        t.jsonb('photo_validation').defaultTo('{}');
        t.string('confirmation_number', 50);
        t.timestamp('submitted_at');
        t.uuid('submitted_by').references('id').inTable('users');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('payments', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
        t.decimal('amount', 10, 2).notNullable();
        t.string('currency', 3).defaultTo('YER');
        t.specificType('method', 'payment_method').defaultTo('deposit');
        t.specificType('provider', 'payment_provider');
        t.string('transfer_number', 100);
        t.string('receipt_image_path', 500);
        t.string('receipt_hash', 64);
        t.specificType('status', 'payment_status').defaultTo('pending');
        t.uuid('verified_by').references('id').inTable('users');
        t.timestamp('verified_at');
        t.text('rejection_reason');
        t.text('notes');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('notifications', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        t.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
        t.string('type', 50).notNullable();
        t.specificType('channel', 'notification_channel').defaultTo('pwa');
        t.string('title', 255).notNullable();
        t.text('body');
        t.jsonb('metadata').defaultTo('{}');
        t.specificType('status', 'notification_status').defaultTo('pending');
        t.timestamp('sent_at');
        t.timestamp('read_at');
        t.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('audit_logs', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
        t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
        t.string('action', 100).notNullable();
        t.specificType('from_status', 'order_status');
        t.specificType('to_status', 'order_status');
        t.jsonb('metadata').defaultTo('{}');
        t.specificType('ip_address', 'INET');
        t.text('user_agent');
        t.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('settings', (t) => {
        t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        t.string('key', 100).unique().notNullable();
        t.jsonb('value').notNullable();
        t.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
      }),
    )
    .then(() => knex.raw(`
      ALTER TABLE applicant_data ADD CONSTRAINT chk_gender CHECK (gender IN ('male', 'female'));
      ALTER TABLE applicant_data ADD CONSTRAINT chk_marital_status CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));
      ALTER TABLE orders ADD CONSTRAINT chk_result CHECK (result IN ('winner', 'loser'));

      CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
      CREATE INDEX idx_users_phone ON users(phone);
      CREATE INDEX idx_orders_user_id ON orders(user_id);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_created_at ON orders(created_at);
      CREATE INDEX idx_applicant_data_order_id ON applicant_data(order_id);
      CREATE INDEX idx_payments_order_id ON payments(order_id);
      CREATE INDEX idx_payments_status ON payments(status);
      CREATE INDEX idx_payments_transfer_number ON payments(transfer_number) WHERE transfer_number IS NOT NULL;
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_status ON notifications(status);
      CREATE INDEX idx_audit_logs_order_id ON audit_logs(order_id);
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
      CREATE INDEX idx_orders_user_id_created ON orders(user_id, created_at DESC);
      CREATE INDEX idx_orders_is_active ON orders(is_active);
      CREATE INDEX idx_payments_status_created ON payments(status, created_at ASC);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_applicant_data_updated_at BEFORE UPDATE ON applicant_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE applicant_data ENABLE ROW LEVEL SECURITY;
      ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    `));
};

exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    DROP TRIGGER IF EXISTS update_applicant_data_updated_at ON applicant_data;
    DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
    DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
    DROP FUNCTION IF EXISTS update_updated_at_column();
    DROP TABLE IF EXISTS settings CASCADE;
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS applicant_data CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TYPE IF EXISTS service_type;
    DROP TYPE IF EXISTS notification_status;
    DROP TYPE IF EXISTS notification_channel;
    DROP TYPE IF EXISTS payment_status;
    DROP TYPE IF EXISTS payment_provider;
    DROP TYPE IF EXISTS payment_method;
    DROP TYPE IF EXISTS order_status;
    DROP TYPE IF EXISTS user_role;
  `);
};
