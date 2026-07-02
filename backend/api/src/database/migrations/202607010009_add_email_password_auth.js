exports.up = async (knex) => {
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  const hasPwd = await knex.schema.hasColumn('users', 'password_hash');
  const hasGoogle = await knex.schema.hasColumn('users', 'google_id');
  const hasAvatar = await knex.schema.hasColumn('users', 'avatar_url');
  const hasEmailVerified = await knex.schema.hasColumn('users', 'is_email_verified');

  await knex.schema.alterTable('users', (t) => {
    if (!hasEmail) t.string('email', 255).nullable();
    else t.string('email', 255).nullable().alter();
    if (!hasPwd) t.string('password_hash', 255).nullable();
    if (!hasGoogle) t.string('google_id', 255).nullable();
    if (!hasAvatar) t.string('avatar_url', 500).nullable();
    if (!hasEmailVerified) t.boolean('is_email_verified').defaultTo(false);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('password_hash');
    t.dropColumn('google_id');
    t.dropColumn('avatar_url');
    t.dropColumn('is_email_verified');
  });
};
