const db = require('../../database/db');

const findReceipts = ({ status, page, limit }) => {
  const offset = (page - 1) * limit;
  return db('payments')
    .leftJoin('orders', 'payments.order_id', 'orders.id')
    .select(
      'payments.*',
      'orders.order_number',
      'orders.user_id',
    )
    .modify((qb) => {
      if (status) qb.where('payments.status', status);
    })
    .orderBy('payments.created_at', 'desc')
    .limit(limit)
    .offset(offset);
};

const countReceipts = ({ status }) => {
  return db('payments')
    .modify((qb) => {
      if (status) qb.where('status', status);
    })
    .count('id as total')
    .first();
};

module.exports = { findReceipts, countReceipts };
