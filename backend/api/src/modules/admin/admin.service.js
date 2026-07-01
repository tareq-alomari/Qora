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

const getFraudFlags = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  const level = query.level ? parseInt(query.level) : null;

  const rows = await adminModel.findFraudFlags({ level, limit, offset });
  const totalResult = await adminModel.countFraudFlags(level);
  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const getSettings = async () => {
  return adminModel.getSettings();
};

const updateSettings = async (data, userId) => {
  return adminModel.updateSettings(data, userId);
};

const sendBulkNotification = async ({ title, body, channel, filters }) => {
  const users = await adminModel.findUsersByFilter(filters);
  if (users.length === 0) throw new AppError('لا يوجد مستخدمون يطابقون الفلتر', 404, 'NO_USERS');

  const notifService = require('../notifications/notifications.service');
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await notifService.create({
        user_id: user.id,
        type: 'bulk',
        channel: channel === 'whatsapp' ? 'whatsapp' : 'pwa',
        title,
        body,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed, total: users.length };
};

const exportOrders = async (query) => {
  return adminModel.exportOrders(query);
};

module.exports = { getStats, listUsers, updateUser, getSettings, updateSettings, getFraudFlags, sendBulkNotification, exportOrders };
