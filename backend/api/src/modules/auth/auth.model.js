const db = require('../../database/db');
const uuid = require('uuid');

const findByPhone = (phone) => {
  return db('users').where({ phone }).first();
};

const findByEmail = (email) => {
  return db('users').where({ email }).first();
};

const findByGoogleId = (googleId) => {
  return db('users').where({ google_id: googleId }).first();
};

const findById = (id) => {
  return db('users').where({ id }).first();
};

const create = (data) => {
  return db('users').insert({ id: uuid.v4(), ...data }).returning('*');
};

const update = (id, data) => {
  return db('users').where({ id }).update(data);
};

const updateLastLogin = (id) => {
  return db('users').where({ id }).update({ last_login_at: db.fn.now() });
};

module.exports = {
  findByPhone,
  findByEmail,
  findByGoogleId,
  findById,
  create,
  update,
  updateLastLogin,
};
