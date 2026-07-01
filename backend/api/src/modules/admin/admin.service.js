const adminModel = require('./admin.model');
const { AppError } = require('../../common/error-handler');

const getStats = async () => {
  return adminModel.getStats();
};

const listUsers = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;

  const rows = await adminModel.findUsers(query);
  const totalResult = await adminModel.countUsers(query);
  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const updateUser = async (id, data) => {
  if (data.role && !['client', 'employee', 'admin'].includes(data.role)) {
    throw new AppError('Invalid role', 400, 'VALIDATION_ERROR');
  }
  const [user] = await adminModel.updateUser(id, data);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};

const SETTINGS = {
  pricing: { lottery_registration: 1000, result_checking: 0 },
  payment_accounts: [
    { method: 'kuraimi', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true },
    { method: 'jeeb', account_number: '9876543210', account_name: 'Qor3a Yemen', is_active: true },
    { method: 'one_cash', account_number: '5555555555', account_name: 'Qor3a', is_active: true },
    { method: 'mobile_money', account_number: '7777777777', account_name: 'Qor3a', is_active: false },
  ],
  season: { is_open: true, opens_at: '2026-09-01T08:00:00Z', closes_at: '2026-10-31T23:59:59Z' },
};

const getSettings = () => SETTINGS;

const updateSettings = (data) => {
  Object.assign(SETTINGS, data);
  return SETTINGS;
};

module.exports = { getStats, listUsers, updateUser, getSettings, updateSettings };
