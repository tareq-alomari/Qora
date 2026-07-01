const notifModel = require('./notifications.model');

const list = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;

  const rows = await notifModel.findByUser(userId, { page, limit });
  const totalResult = await notifModel.countByUser(userId);
  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const create = async (data) => {
  const [notification] = await notifModel.create({
    user_id: data.user_id,
    order_id: data.order_id || null,
    type: data.type,
    channel: data.channel || 'pwa',
    title: data.title,
    body: data.body || null,
    status: 'pending',
  });
  return notification;
};

const markAsRead = async (id, userId) => {
  const [notification] = await notifModel.markAsRead(id, userId);
  return notification;
};

const unreadCount = async (userId) => {
  const result = await notifModel.unreadByUser(userId);
  return parseInt(result.total) || 0;
};

module.exports = { list, create, markAsRead, unreadCount };
