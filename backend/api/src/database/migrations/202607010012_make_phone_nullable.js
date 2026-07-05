exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
  `);
};
