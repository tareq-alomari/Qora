const db = require('../../database/db');

const findById = (id) => {
  return db('users').where({ id }).select('id', 'phone', 'email', 'full_name', 'role', 'is_verified', 'is_active', 'last_login_at', 'created_at').first();
};

const update = (id, data) => {
  return db('users').where({ id }).update(data).returning(['id', 'phone', 'email', 'full_name', 'role']);
};

module.exports = { findById, update };
