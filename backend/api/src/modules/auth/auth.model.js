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

const updateLastLogin = (id) => {
  return db('users').where({ id }).update({ last_login_at: db.fn.now() });
};

module.exports = {
  findByPhone,
  findById,
  create,
  updateLastLogin,
};
