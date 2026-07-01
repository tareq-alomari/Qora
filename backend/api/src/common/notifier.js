const db = require('../database/db');
const { logger } = require('./logger');

const send = async (userId, { type, title, body, orderId }) => {
  try {
    const [notification] = await db('notifications').insert({
      user_id: userId,
      order_id: orderId || null,
      type: type || 'general',
      channel: 'in_app',
      title,
      body: body || null,
      status: 'pending',
    }).returning('*');

    logger.info(`Notification created for user ${userId}: ${title}`);

    return notification;
  } catch (err) {
    logger.error(`Failed to create notification: ${err.message}`);
    return null;
  }
};

const sendStatusUpdate = async (userId, orderId, status, notes) => {
  const statusMessages = {
    approved: { title: 'تم اعتماد الطلب', body: notes || 'تم اعتماد طلبك، جاري التجهيز للتسجيل الرسمي' },
    submitted: { title: 'تم التسجيل رسمياً', body: 'تم إدخال طلبك في الموقع الرسمي بنجاح' },
    completed: { title: 'اكتمل الطلب', body: 'اكتمل طلبك، يمكنك متابعة النتيجة من حسابك' },
    cancelled: { title: 'تم إلغاء الطلب', body: notes || 'تم إلغاء الطلب' },
    needs_correction: { title: 'الطلب يحتاج تعديل', body: notes || 'يرجى مراجعة بيانات الطلب وتعديلها' },
    photo_rejected: { title: 'الصورة مرفوضة', body: notes || 'الصورة غير مطابقة للمواصفات، يرجى إعادة رفع صورة جديدة' },
    payment_pending: { title: 'في انتظار تأكيد الدفع', body: 'تم استلام إيصال الدفع، في انتظار التأكيد' },
  };

  const msg = statusMessages[status];
  if (msg) {
    return send(userId, {
      type: 'status_update',
      title: msg.title,
      body: msg.body,
      orderId,
    });
  }
  return null;
};

module.exports = { send, sendStatusUpdate };
