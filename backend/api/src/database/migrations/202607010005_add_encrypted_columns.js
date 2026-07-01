exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE applicant_data ADD COLUMN IF NOT EXISTS encrypted_passport_number TEXT;
    ALTER TABLE applicant_data ADD COLUMN IF NOT EXISTS encrypted_spouse_data TEXT;
    ALTER TABLE applicant_data ADD COLUMN IF NOT EXISTS encrypted_children_data TEXT;

    ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_email TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_phone TEXT;

    COMMENT ON COLUMN applicant_data.encrypted_passport_number IS 'AES-256-GCM encrypted passport_number';
    COMMENT ON COLUMN applicant_data.encrypted_spouse_data IS 'AES-256-GCM encrypted spouse_data JSON';
    COMMENT ON COLUMN applicant_data.encrypted_children_data IS 'AES-256-GCM encrypted children_data JSON';
    COMMENT ON COLUMN users.encrypted_email IS 'AES-256-GCM encrypted email';
    COMMENT ON COLUMN users.encrypted_phone IS 'AES-256-GCM encrypted phone';
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE applicant_data DROP COLUMN IF EXISTS encrypted_passport_number;
    ALTER TABLE applicant_data DROP COLUMN IF EXISTS encrypted_spouse_data;
    ALTER TABLE applicant_data DROP COLUMN IF EXISTS encrypted_children_data;
    ALTER TABLE users DROP COLUMN IF EXISTS encrypted_email;
    ALTER TABLE users DROP COLUMN IF EXISTS encrypted_phone;
  `);
};
