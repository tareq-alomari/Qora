exports.up = async (knex) => {
  const hasToken = await knex.schema.hasColumn('users', 'email_verification_token');
  const hasExpiry = await knex.schema.hasColumn('users', 'email_verification_expires_at');

  await knex.schema.alterTable('users', (t) => {
    if (!hasToken) t.string('email_verification_token', 255).nullable();
    if (!hasExpiry) t.timestamp('email_verification_expires_at').nullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('email_verification_token');
    t.dropColumn('email_verification_expires_at');
  });
};
