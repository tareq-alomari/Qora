exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE applicant_data ADD COLUMN IF NOT EXISTS photo_hash VARCHAR(64);
    CREATE INDEX IF NOT EXISTS idx_applicant_data_photo_hash ON applicant_data(photo_hash) WHERE photo_hash IS NOT NULL;

    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS flag_level INTEGER CHECK (flag_level >= 0 AND flag_level <= 4);
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_value JSONB;
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_value JSONB;
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_id UUID;
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_applicant_data_photo_hash;
    ALTER TABLE applicant_data DROP COLUMN IF EXISTS photo_hash;
    ALTER TABLE audit_logs DROP COLUMN IF EXISTS flag_level;
    ALTER TABLE audit_logs DROP COLUMN IF EXISTS old_value;
    ALTER TABLE audit_logs DROP COLUMN IF EXISTS new_value;
    ALTER TABLE audit_logs DROP COLUMN IF EXISTS resource_type;
    ALTER TABLE audit_logs DROP COLUMN IF EXISTS resource_id;
  `);
};
