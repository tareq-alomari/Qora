const db = require('../../database/db');

const findByPhone = (phone) => {
  return db('users').where({ phone }).first();
};

const findById = (id) => {
  return db('users').where({ id }).first();
};

const create = (data) => {
  return db('users').insert(data).returning('*');
};

const updateMetadata = (id, metadata) => {
  return db('users').where({ id }).update({ metadata }).returning('*');
};

const updateLastLogin = (id) => {
  return db('users').where({ id }).update({ last_login_at: db.fn.now() });
};

const storeRefreshToken = (userId, token) => {
  return db('users').where({ id: userId }).update({
    metadata: db.raw('metadata || ?::jsonb', JSON.stringify({ refresh_token: token })),
  });
};

const findRefreshToken = async (token) => {
  const users = await db('users')
    .whereRaw('metadata->>\'refresh_token\' = ?', [token])
    .select('id', 'role', 'phone');
  return users[0] || null;
};

module.exports = {
  findByPhone,
  findById,
  create,
  updateMetadata,
  updateLastLogin,
  storeRefreshToken,
  findRefreshToken,
};
