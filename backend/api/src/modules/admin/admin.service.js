const adminModel = require('./admin.model');
const bcrypt = require('bcrypt');
const { AppError } = require('../../common/error-handler');

const getStats = async () => {
  return adminModel.getStats();
};

const listUsers = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

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
  const limit = Math.min(parseInt(query.limit) || 20, 100);
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

const enqueueSubmission = async () => {
  const db = require('../../database/db');
  const { enqueueSubmission: queueSubmission } = require('../../common/headless-queue');

  const orders = await db('orders')
    .join('applicant_data', 'orders.id', 'applicant_data.order_id')
    .where('orders.status', 'approved')
    .select(
      'orders.id',
      'orders.user_id',
      'applicant_data.first_name',
      'applicant_data.last_name',
      'applicant_data.gender',
      'applicant_data.birth_date',
      'applicant_data.birth_city',
      'applicant_data.birth_country',
      'applicant_data.country_of_eligibility',
      'applicant_data.marital_status',
      'applicant_data.education_level',
      'applicant_data.passport_number',
      'applicant_data.passport_expiry',
      'applicant_data.photo_path',
      'applicant_data.spouse_data',
      'applicant_data.children_data',
      'applicant_data.street',
      'applicant_data.city',
      'applicant_data.district',
      'applicant_data.postal_code',
      'applicant_data.native_language',
    );

  if (orders.length === 0) throw new AppError('لا يوجد طلبات جاهزة للتقديم', 404, 'NO_ORDERS');

  let enqueued = 0;
  for (const order of orders) {
    await queueSubmission(order.id, order);
    enqueued++;
  }
  return { enqueued, total: orders.length };
};

const enqueueResultCheck = async () => {
  const db = require('../../database/db');
  const { enqueueResultCheck: queueCheck } = require('../../common/headless-queue');

  const orders = await db('orders')
    .join('applicant_data', 'orders.id', 'applicant_data.order_id')
    .where('orders.status', 'submitted')
    .whereNull('orders.result')
    .select(
      'orders.id',
      'applicant_data.confirmation_number',
      'applicant_data.last_name',
      db.raw("EXTRACT(YEAR FROM applicant_data.birth_date) as birth_year"),
    );

  if (orders.length === 0) throw new AppError('لا يوجد طلبات لفحص النتائج', 404, 'NO_ORDERS');

  const result = await queueCheck(orders);
  return { enqueued: orders.length, ...result };
};

const getQueueStatus = async () => {
  const { getQueueStatus: queueStatus } = require('../../common/headless-queue');
  return queueStatus();
};

const createUser = async (data) => {
  const existing = await adminModel.findUserByPhone(data.phone);
  if (existing) throw new AppError('رقم الهاتف موجود مسبقاً', 409, 'DUPLICATE_PHONE');

  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 12);
    delete data.password;
  }
  const [user] = await adminModel.createUser(data);
  return user;
};

const listAuditLogs = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 30, 100);
  const offset = (page - 1) * limit;

  const rows = await adminModel.findAuditLogs({ limit, offset, date_from: query.date_from, date_to: query.date_to });
  const totalResult = await adminModel.countAuditLogs({ date_from: query.date_from, date_to: query.date_to });
  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id) => {
  const user = await adminModel.findUserById(id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};

module.exports = { getStats, listUsers, updateUser, createUser, getUserById, getSettings, updateSettings, getFraudFlags, sendBulkNotification, exportOrders, enqueueSubmission, enqueueResultCheck, getQueueStatus, listAuditLogs };
