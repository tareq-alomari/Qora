const notifService = require('./notifications.service');

const list = async (req, res, next) => {
  try {
    const result = await notifService.list(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const notification = await notifService.create(req.body);
    res.status(201).json({ data: notification, message: 'تم إنشاء الإشعار' });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notifService.markAsRead(req.params.id, req.user.id);
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
};

const unreadCount = async (req, res, next) => {
  try {
    const count = await notifService.unreadCount(req.user.id);
    res.json({ data: { unread_count: count } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, markAsRead, unreadCount };
