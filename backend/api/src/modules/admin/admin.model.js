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

const createUser = (data) => {
  return db('users').insert(data).returning(['id', 'full_name', 'phone', 'email', 'role', 'is_active']);
};

const findFraudFlags = async ({ level, limit, offset }) => {
  const query = db('orders')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .where('orders.fraud_level', '>', 0)
    .select(
      'orders.id',
      'orders.order_number',
      'orders.status',
      'orders.fraud_level',
      'orders.fraud_reason',
      'orders.flagged_at',
      'orders.created_at',
      'users.id as user_id',
      'users.phone as user_phone',
      'users.full_name as user_name',
      'applicant_data.first_name',
      'applicant_data.last_name',
    )
    .modify((qb) => {
      if (level) {
        qb.where('orders.fraud_level', level);
      }
    })
    .orderBy('orders.flagged_at', 'desc')
    .limit(limit)
    .offset(offset);

  return query;
};

const countFraudFlags = async (level) => {
  const query = db('orders')
    .where('fraud_level', '>', 0)
    .modify((qb) => {
      if (level) {
        qb.where('fraud_level', level);
      }
    })
    .count('id as total')
    .first();

  return query;
};

const findUsersByFilter = ({ role, status }) => {
  return db('users')
    .select('id', 'full_name', 'phone')
    .where('is_active', true)
    .modify((qb) => {
      if (role) qb.where('role', role);
      if (status) {
        qb.whereExists(function () {
          this.select('id')
            .from('orders')
            .whereRaw('orders.user_id = users.id')
            .andWhere('orders.status', status);
        });
      }
    });
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

const exportOrders = ({ status, date_from, date_to }) => {
  const query = db('orders')
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('payments', 'orders.id', 'payments.order_id')
    .select(
      'orders.id',
      'orders.order_number',
      'orders.status',
      'orders.amount',
      'orders.created_at',
      'users.full_name as client_name',
      'users.phone as client_phone',
      'applicant_data.first_name',
      'applicant_data.last_name',
      'payments.amount as payment_amount',
    )
    .modify((qb) => {
      if (status) qb.where('orders.status', status);
      if (date_from) qb.where('orders.created_at', '>=', date_from);
      if (date_to) qb.where('orders.created_at', '<=', date_to);
    })
    .orderBy('orders.created_at', 'desc');

  return query;
};

const findUserById = async (id) => {
  const user = await db('users')
    .select('id', 'phone', 'email', 'full_name', 'role', 'is_active', 'is_email_verified', 'created_at', 'last_login_at')
    .where({ id })
    .first();

  if (!user) return null;

  const { count } = await db('orders').where({ user_id: id }).count('id as count').first();
  const activeOrder = await db('orders').where({ user_id: id, is_active: true }).whereNotIn('status', ['cancelled', 'completed']).select('id', 'status', 'order_number').first();

  return { ...user, orders_count: parseInt(count) || 0, active_order: activeOrder || null };
};

const findUserByPhone = (phone) => {
  return db('users').where({ phone }).first();
};

const findAuditLogs = ({ limit, offset, date_from, date_to }) => {
  const query = db('audit_logs')
    .leftJoin('users', 'audit_logs.user_id', 'users.id')
    .select(
      'audit_logs.*',
      'users.full_name as user_name',
      'users.email as user_email',
    )
    .orderBy('audit_logs.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (date_from) query.where('audit_logs.created_at', '>=', date_from);
  if (date_to) query.where('audit_logs.created_at', '<=', date_to);

  return query;
};

const countAuditLogs = ({ date_from, date_to }) => {
  const query = db('audit_logs');

  if (date_from) query.where('created_at', '>=', date_from);
  if (date_to) query.where('created_at', '<=', date_to);

  return query.count('id as total').first();
};

module.exports = { getStats, findUsers, countUsers, updateUser, createUser, getSettings, updateSettings, findFraudFlags, countFraudFlags, findUsersByFilter, exportOrders, findUserById, findUserByPhone, findAuditLogs, countAuditLogs };
