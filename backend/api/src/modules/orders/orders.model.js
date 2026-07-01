const db = require('../../database/db');

const findById = (id) => {
  return db('orders').where({ id }).first();
};

const findByUser = (userId, { status, page: _page, limit: _limit, search, sort, order }) => {
  const query = db('orders')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .where('orders.user_id', userId)
    .select(
      'orders.*',
      'applicant_data.first_name',
      'applicant_data.last_name',
      'applicant_data.photo_path',
      'applicant_data.photo_validation',
      'applicant_data.confirmation_number',
      'applicant_data.submitted_at',
    );

  if (status) query.where('orders.status', status);
  if (search) {
    query.where(function () {
      this.whereILike('applicant_data.first_name', `%${search}%`)
        .orWhereILike('applicant_data.last_name', `%${search}%`);
    });
  }

  query.orderBy(sort || 'orders.created_at', order || 'desc');

  return query;
};

const findAll = ({ status, page: _page, limit: _limit, search, sort, order }) => {
  const query = db('orders')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('payments', 'orders.id', 'payments.order_id')
    .select(
      'orders.*',
      'applicant_data.first_name',
      'applicant_data.last_name',
      'applicant_data.photo_path',
      'applicant_data.confirmation_number',
      'applicant_data.submitted_at',
      'users.phone as client_phone',
      'users.full_name as client_name',
      'payments.amount as payment_amount',
      'payments.method as payment_method',
      'payments.status as payment_status',
    );

  if (status) query.where('orders.status', status);
  if (search) {
    query.where(function () {
      this.whereILike('applicant_data.first_name', `%${search}%`)
        .orWhereILike('applicant_data.last_name', `%${search}%`)
        .orWhereILike('orders.order_number', `%${search}%`);
    });
  }

  query.orderBy(sort || 'orders.created_at', order || 'desc');

  return query;
};

const countByUser = (userId, { status, search }) => {
  const query = db('orders')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .where('orders.user_id', userId);

  if (status) query.where('orders.status', status);
  if (search) {
    query.where(function () {
      this.whereILike('applicant_data.first_name', `%${search}%`)
        .orWhereILike('applicant_data.last_name', `%${search}%`);
    });
  }

  return query.count('orders.id as total').first();
};

const countAll = ({ status, search }) => {
  const query = db('orders')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id');

  if (status) query.where('orders.status', status);
  if (search) {
    query.where(function () {
      this.whereILike('applicant_data.first_name', `%${search}%`)
        .orWhereILike('applicant_data.last_name', `%${search}%`);
    });
  }

  return query.count('orders.id as total').first();
};

const create = (data) => {
  return db('orders').insert(data).returning('*');
};

const update = (id, data) => {
  return db('orders').where({ id }).update(data).returning('*');
};

const getActiveOrder = (userId) => {
  return db('orders')
    .where({ user_id: userId })
    .whereNotIn('status', ['completed', 'cancelled'])
    .first();
};

const getOrderNumber = async () => {
  const year = new Date().getFullYear();
  const result = await db('orders')
    .whereRaw('order_number LIKE ?', [`QR-${year}-%`])
    .count('id as total')
    .first();
  const count = (parseInt(result.total) || 0) + 1;
  return `QR-${year}-${String(count).padStart(4, '0')}`;
};

module.exports = {
  findById,
  findByUser,
  findAll,
  countByUser,
  countAll,
  create,
  update,
  getActiveOrder,
  getOrderNumber,
};
