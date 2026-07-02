const db = require('../../database/db');

const findByUser = (userId, { page, limit }) => {
  const offset = (page - 1) * limit;
  return db('notifications')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
};

const countByUser = (userId) => {
  return db('notifications')
    .where({ user_id: userId })
    .count('id as total')
    .first();
};

const unreadByUser = (userId) => {
  return db('notifications')
    .where({ user_id: userId, status: 'pending' })
    .count('id as total')
    .first();
};

const create = (data) => {
  return db('notifications').insert(data).returning('*');
};

const markAsRead = (id, userId) => {
  return db('notifications')
    .where({ id, user_id: userId })
    .update({ status: 'read', read_at: db.fn.now() })
    .returning('*');
};

const markAllAsRead = (userId) => {
  return db('notifications')
    .where({ user_id: userId, status: 'pending' })
    .update({ status: 'read', read_at: db.fn.now() })
    .returning('*');
};

module.exports = { findByUser, countByUser, unreadByUser, create, markAsRead, markAllAsRead };
