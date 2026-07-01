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

const getSettings = async () => {
  return adminModel.getSettings();
};

const updateSettings = async (data, userId) => {
  return adminModel.updateSettings(data, userId);
};

module.exports = { getStats, listUsers, updateUser, getSettings, updateSettings };
