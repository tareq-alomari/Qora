const db = require('../../database/db');
const uuid = require('uuid');

const isSQLite = process.env.NODE_ENV === 'test';

const getStats = async () => {
  const totalOrders = await db('orders').count('id as total').first();
  const ordersToday = await db('orders')
    .whereRaw('created_at >= date(\'now\')')
    .count('id as total').first();

  let ordersThisWeek;
  if (isSQLite) {
    ordersThisWeek = await db('orders')
      .whereRaw('created_at >= date(\'now\', \'weekday 0\', \'-7 days\')')
      .count('id as total').first();
  } else {
    ordersThisWeek = await db('orders')
      .whereRaw('created_at >= date_trunc(\'week\', CURRENT_DATE)')
      .count('id as total').first();
  }

  let ordersThisMonth;
  if (isSQLite) {
    ordersThisMonth = await db('orders')
      .whereRaw('created_at >= date(\'now\', \'start of month\')')
      .count('id as total').first();
  } else {
    ordersThisMonth = await db('orders')
      .whereRaw('created_at >= date_trunc(\'month\', CURRENT_DATE)')
      .count('id as total').first();
  }

  const byStatus = await db('orders')
    .select('status')
    .count('id as count')
    .groupBy('status');

  const revenueTotal = await db('payments')
    .where('status', 'verified')
    .sum('amount as total').first();

  const revenueToday = await db('payments')
    .where('status', 'verified')
    .whereRaw('created_at >= date(\'now\')')
    .sum('amount as total').first();

  let revenueThisWeek;
  if (isSQLite) {
    revenueThisWeek = await db('payments')
      .where('status', 'verified')
      .whereRaw('created_at >= date(\'now\', \'weekday 0\', \'-7 days\')')
      .sum('amount as total').first();
  } else {
    revenueThisWeek = await db('payments')
      .where('status', 'verified')
      .whereRaw('created_at >= date_trunc(\'week\', CURRENT_DATE)')
      .sum('amount as total').first();
  }

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
    revenueToday: parseFloat(revenueToday.total) || 0,
    revenueThisWeek: parseFloat(revenueThisWeek.total) || 0,
    byPaymentMethod,
    ai_stats: {
      total_checked: 0,
      accepted: 0,
      rejected: 0,
      accuracy: 0,
      avg_time_ms: 0,
    },
  };
};

const findUsers = async ({ role, search, page, limit }) => {
  const offset = (page - 1) * limit;
  const rows = await db('users')
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

  const usersWithCounts = await Promise.all(rows.map(async (user) => {
    const { count } = await db('orders').where({ user_id: user.id }).count('id as count').first();
    return { ...user, orders_count: parseInt(count) || 0 };
  }));

  return usersWithCounts;
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

const DEFAULT_SETTINGS = {
  pricing: { lottery_registration: 1000, result_checking: 0 },
  payment_accounts: [
    { method: 'kuraimi', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true },
    { method: 'jeeb', account_number: '9876543210', account_name: 'Qor3a Yemen', is_active: true },
    { method: 'one_cash', account_number: '5555555555', account_name: 'Qor3a', is_active: true },
    { method: 'mobile_money', account_number: '7777777777', account_name: 'Qor3a', is_active: false },
  ],
  season: { is_open: true, opens_at: '2026-09-01T08:00:00Z', closes_at: '2026-10-31T23:59:59Z' },
  rate_limits: {
    login_per_ip_per_min: 5,
    register_per_ip_per_hour: 3,
    orders_per_user_per_min: 10,
  },
};

const getSettings = async () => {
  const rows = await db('settings').select('key', 'value');
  if (rows.length === 0) return DEFAULT_SETTINGS;

  const settings = {};
  for (const row of rows) {
    settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  }
  const result = { ...DEFAULT_SETTINGS, ...settings };
  return result;
};

const updateSettings = async (data, userId) => {
  const keyValues = {};
  for (const [key, value] of Object.entries(data)) {
    keyValues[key] = value;
  }

  const existing = await db('settings').select('key');
  const existingKeys = existing.map(r => r.key);

  for (const [key, value] of Object.entries(keyValues)) {
    if (existingKeys.includes(key)) {
      await db('settings').where({ key }).update({ value: JSON.stringify(value), updated_by: userId });
    } else {
      await db('settings').insert({ id: uuid.v4(), key, value: JSON.stringify(value), updated_by: userId });
    }
  }

  return getSettings();
};

module.exports = { getStats, findUsers, countUsers, updateUser, getSettings, updateSettings };
