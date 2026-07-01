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

module.exports = { getStats, listUsers, updateUser, getSettings, updateSettings };
