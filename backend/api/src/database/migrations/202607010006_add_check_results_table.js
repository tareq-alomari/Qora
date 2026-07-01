exports.up = function (knex) {
  return knex.schema
    .createTable('check_results', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
      t.string('confirmation_number', 50);
      t.string('result', 20);
      t.string('case_number', 50);
      t.timestamp('checked_at');
      t.jsonb('raw_data').defaultTo('{}');
      t.text('error_message');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique('order_id');
    })
    .then(() => knex.schema.alterTable('applicant_data', (t) => {
      t.string('result_status', 20);
    }))
    .then(() => knex.raw(`
      ALTER TABLE check_results ADD CONSTRAINT chk_check_result CHECK (result IN ('winner', 'loser', 'pending', 'error', 'no_confirmation'));
      ALTER TABLE applicant_data ADD CONSTRAINT chk_applicant_result_status CHECK (result_status IN ('pending_check', 'checked', 'winner', 'loser', 'error'));
      CREATE INDEX IF NOT EXISTS idx_check_results_confirmation ON check_results(confirmation_number);
      CREATE INDEX IF NOT EXISTS idx_check_results_order_id ON check_results(order_id);
      CREATE INDEX IF NOT EXISTS idx_applicant_data_result_status ON applicant_data(result_status);
    `));
};

exports.down = function (knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_applicant_data_result_status;
    DROP INDEX IF EXISTS idx_check_results_order_id;
    DROP INDEX IF EXISTS idx_check_results_confirmation;
    ALTER TABLE applicant_data DROP CONSTRAINT IF EXISTS chk_applicant_result_status;
    ALTER TABLE check_results DROP CONSTRAINT IF EXISTS chk_check_result;
  `)
    .then(() => knex.schema.alterTable('applicant_data', (t) => {
      t.dropColumn('result_status');
    }))
    .then(() => knex.schema.dropTableIfExists('check_results'));
};
