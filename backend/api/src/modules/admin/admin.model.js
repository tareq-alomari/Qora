const db = require('../../database/db');

const getStats = async () => {
  const totalOrders = await db('orders').count('id as total').first();
  const ordersToday = await db('orders')
    .whereRaw('created_at >= CURRENT_DATE')
    .count('id as total').first();
  const ordersThisWeek = await db('orders')
    .whereRaw('created_at >= date_trunc(\'week\', CURRENT_DATE)')
    .count('id as total').first();
  const ordersThisMonth = await db('orders')
    .whereRaw('created_at >= date_trunc(\'month\', CURRENT_DATE)')
    .count('id as total').first();

  const byStatus = await db('orders')
    .select('status')
    .count('id as count')
    .groupBy('status');

  const revenueTotal = await db('payments')
    .where('status', 'verified')
    .sum('amount as total').first();

  const byPaymentMethod = await db('payments')
    .select('provider')
    .count('id as count')
    .sum('amount as revenue')
    .where('status', 'verified')
    .groupBy('provider');

  return {
    totalOrders: parseInt(totalOrders.total) || 0,
    ordersToday: parseInt(ordersToday.total) || 0,
    ordersThisWeek: parseInt(ordersThisWeek.total) || 0,
    ordersThisMonth: parseInt(ordersThisMonth.total) || 0,
    byStatus,
    revenueTotal: parseFloat(revenueTotal.total) || 0,
    byPaymentMethod,
  };
};

const findUsers = ({ role, search, page, limit }) => {
  const offset = (page - 1) * limit;
  return db('users')
    .select('id', 'phone', 'email', 'full_name', 'role', 'is_active', 'created_at', 'last_login_at')
    .modify((qb) => {
      if (role) qb.where('role', role);
      if (search) {
        qb.where(function () {
          this.whereILike('full_name', `%${search}%`)
            .orWhereILike('phone', `%${search}%`);
        });
      }
    })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
};

const countUsers = ({ role, search }) => {
  return db('users')
    .modify((qb) => {
      if (role) qb.where('role', role);
      if (search) {
        qb.where(function () {
          this.whereILike('full_name', `%${search}%`)
            .orWhereILike('phone', `%${search}%`);
        });
      }
    })
    .count('id as total')
    .first();
};

const updateUser = (id, data) => {
  return db('users').where({ id }).update(data).returning(['id', 'phone', 'email', 'full_name', 'role', 'is_active']);
};

module.exports = { getStats, findUsers, countUsers, updateUser };
