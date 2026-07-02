const adminService = require('./admin.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const result = await adminService.listUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.json({ data: user, message: 'تم تحديث المستخدم' });
  } catch (err) {
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await adminService.getSettings();
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await adminService.updateSettings(req.body, req.user.id);
    res.json({ data: settings, message: 'تم تحديث الإعدادات' });
  } catch (err) {
    next(err);
  }
};

const getFraudFlags = async (req, res, next) => {
  try {
    const result = await adminService.getFraudFlags(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const sendBulkNotification = async (req, res, next) => {
  try {
    const result = await adminService.sendBulkNotification(req.body);
    res.json({ data: result, message: `تم إرسال ${result.sent} إشعار بنجاح` });
  } catch (err) {
    next(err);
  }
};

const exportOrders = async (req, res, next) => {
  try {
    const orders = await adminService.exportOrders(req.query);
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

const enqueueSubmission = async (req, res, next) => {
  try {
    const result = await adminService.enqueueSubmission();
    res.json({ data: result, message: `تمت إضافة ${result.enqueued} طلب إلى قائمة التقديم` });
  } catch (err) {
    next(err);
  }
};

const enqueueResultCheck = async (req, res, next) => {
  try {
    const result = await adminService.enqueueResultCheck();
    res.json({ data: result, message: `تمت إضافة ${result.enqueued} طلب إلى قائمة فحص النتائج` });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ data: user, message: 'تم إنشاء المستخدم' });
  } catch (err) {
    next(err);
  }
};

const listAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.listAuditLogs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getQueueStatus = async (req, res, next) => {
  try {
    const status = await adminService.getQueueStatus();
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, listUsers, updateUser, createUser, getUserById, getSettings, updateSettings, getFraudFlags, sendBulkNotification, exportOrders, enqueueSubmission, enqueueResultCheck, getQueueStatus, listAuditLogs };
