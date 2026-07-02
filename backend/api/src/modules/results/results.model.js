const db = require('../../database/db');

const TABLE_NAME = 'check_results';

const create = async (data) => {
  const [row] = await db(TABLE_NAME).insert(data).returning('*');
  return row;
};

const findByOrderId = async (orderId) => {
  return db(TABLE_NAME).where({ order_id: orderId }).first();
};

const findByConfirmationNumber = async (confirmationNumber) => {
  return db(TABLE_NAME).where({ confirmation_number: confirmationNumber }).first();
};

const updateByOrderId = async (orderId, data) => {
  const [row] = await db(TABLE_NAME).where({ order_id: orderId }).update(data).returning('*');
  return row;
};

const findAll = async ({ page, limit } = {}) => {
  const query = db(TABLE_NAME).orderBy('created_at', 'desc');
  if (page && limit) {
    query.offset((page - 1) * limit).limit(limit);
  }
  return query;
};

const countAll = async () => {
  const [row] = await db(TABLE_NAME).count('* as total');
  return parseInt(row.total) || 0;
};

module.exports = {
  create,
  findByOrderId,
  findByConfirmationNumber,
  updateByOrderId,
  findAll,
  countAll,
};
