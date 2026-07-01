const db = require('../../database/db');

const findByUserAndEndpoint = (userId, endpoint) => {
  return db('push_subscriptions')
    .where({ user_id: userId, endpoint })
    .first();
};

const create = (data) => {
  return db('push_subscriptions').insert(data).returning('*');
};

const updateKeys = (id, keys) => {
  return db('push_subscriptions')
    .where({ id })
    .update({ keys, updated_at: db.fn.now() })
    .returning('*');
};

const deleteByUserAndEndpoint = (userId, endpoint) => {
  return db('push_subscriptions')
    .where({ user_id: userId, endpoint })
    .del();
};

const findByUser = (userId) => {
  return db('push_subscriptions').where({ user_id: userId });
};

const findAll = () => {
  return db('push_subscriptions').select('*');
};

module.exports = { findByUserAndEndpoint, create, updateKeys, deleteByUserAndEndpoint, findByUser, findAll };
