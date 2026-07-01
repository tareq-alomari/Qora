exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE applicant_data DROP CONSTRAINT IF EXISTS chk_marital_status;
    ALTER TABLE applicant_data ADD CONSTRAINT chk_marital_status CHECK (
      marital_status IN ('single', 'married', 'married_usc_lpr', 'divorced', 'widowed', 'legally_separated')
    );
    ALTER TABLE applicant_data ADD COLUMN IF NOT EXISTS passport_scan_path VARCHAR(500);
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE applicant_data DROP CONSTRAINT IF EXISTS chk_marital_status;
    ALTER TABLE applicant_data ADD CONSTRAINT chk_marital_status CHECK (
      marital_status IN ('single', 'married', 'divorced', 'widowed')
    );
    ALTER TABLE applicant_data DROP COLUMN IF EXISTS passport_scan_path;
  `);
};
