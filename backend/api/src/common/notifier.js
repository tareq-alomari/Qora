const db = require('../database/db');
const { logger } = require('./logger');
const { enqueue } = require('./notification-queue');
const whatsapp = require('./whatsapp');

const send = async (userId, { type, title, body, orderId, phone }, priority = 3) => {
  const priorityMap = {
    otp: 1,
    payment_confirmed: 2,
    status_change: 2,
    winner: 1,
    reminder: 4,
  };
  const resolvedPriority = priorityMap[type] || priority;
  try {
    const [notification] = await db('notifications').insert({
      user_id: userId,
      order_id: orderId || null,
      type: type || 'general',
      channel: 'pwa',
      title,
      body: body || null,
      status: 'pending',
    }).returning('*');

    logger.info(`Notification created for user ${userId}: ${title}`);

    await enqueue({
      userId,
      notificationId: notification.id,
      phone: phone || null,
      title,
      body,
    }, resolvedPriority);

    return notification;
  } catch (err) {
    logger.error(`Failed to create notification: ${err.message}`);
    return null;
  }
};

const sendOtp = async (userId, phone, otp) => {
  const [notification] = await db('notifications').insert({
    user_id: userId,
    type: 'otp',
    channel: 'whatsapp',
    title: '🔐 رمز التحقق',
    body: `رمزك: ${otp}`,
    status: 'pending',
  }).returning('*');

  const sent = await whatsapp.sendOtp(phone, otp);
  if (sent) {
    await db('notifications').where({ id: notification.id }).update({
      channel: 'whatsapp',
      status: 'sent',
      sent_at: db.fn.now(),
    });
  } else {
    await db('notifications').where({ id: notification.id }).update({ status: 'failed' });
  }

  return notification;
};

const STATUS_PRIORITY = {
  approved: 2,
  submitted: 2,
  completed: 2,
  cancelled: 1,
  needs_correction: 3,
  photo_rejected: 3,
  payment_pending: 3,
  data_entry_complete: 3,
  photo_accepted: 3,
};

const sendStatusUpdate = async (userId, orderId, status, notes, phone, confirmationNumber) => {
  const statusMessages = {
    approved: { title: 'تم اعتماد الطلب', body: notes || 'تم اعتماد طلبك، جاري التجهيز للتسجيل الرسمي' },
    submitted: { title: 'تم التسجيل رسمياً', body: `تم إدخال طلبك في الموقع الرسمي بنجاح. رقم التأكيد: ${confirmationNumber || ''}` },
    completed: { title: 'اكتمل الطلب', body: 'اكتمل طلبك، يمكنك متابعة النتيجة من حسابك' },
    cancelled: { title: 'تم إلغاء الطلب', body: notes || 'تم إلغاء الطلب' },
    needs_correction: { title: 'الطلب يحتاج تعديل', body: notes || 'يرجى مراجعة بيانات الطلب وتعديلها' },
    photo_rejected: { title: 'الصورة مرفوضة', body: notes || 'الصورة غير مطابقة للمواصفات، يرجى إعادة رفع صورة جديدة' },
    payment_pending: { title: 'في انتظار تأكيد الدفع', body: 'تم استلام إيصال الدفع، في انتظار التأكيد' },
    data_entry_complete: { title: 'تم إكمال البيانات', body: 'تم استلام بياناتك بنجاح، يمكنك الآن رفع الصورة' },
    photo_accepted: { title: 'تم قبول الصورة', body: 'تم قبول الصورة، يمكنك الآن إتمام عملية الدفع' },
  };

  const msg = statusMessages[status];
  if (!msg) return null;

  const priority = STATUS_PRIORITY[status] || 3;

  return send(userId, {
    type: 'status_change',
    title: msg.title,
    body: msg.body,
    orderId,
    phone,
  }, priority);
};

module.exports = { send, sendOtp, sendStatusUpdate };
