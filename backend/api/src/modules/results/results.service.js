const db = require('../../database/db');
const orderModel = require('../orders/orders.model');
const { AppError } = require('../../common/error-handler');

const check = async (orderId, userId) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  const user = await db('users').where({ id: userId }).select('role').first();
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (user.role === 'client' && order.user_id !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const applicantData = await db('applicant_data').where({ order_id: orderId }).first();
  if (!applicantData || !applicantData.confirmation_number) {
    throw new AppError('Order has no confirmation number yet', 400, 'NO_CONFIRMATION');
  }

  const existing = await db('check_results').where({ order_id: orderId }).first();
  if (existing && existing.result !== 'pending' && existing.result !== 'error') {
    throw new AppError('Result already checked', 409, 'ALREADY_CHECKED');
  }

  if (existing) {
    await db('check_results').where({ order_id: orderId }).update({
      result: 'pending',
      error_message: null,
      checked_at: null,
      updated_at: db.fn.now(),
    });
  } else {
    await db('check_results').insert({
      order_id: orderId,
      confirmation_number: applicantData.confirmation_number,
      result: 'pending',
    });
  }

  await db('applicant_data').where({ order_id: orderId }).update({
    result_status: 'pending_check',
  });

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action: 'check_result',
    from_status: order.status,
    to_status: order.status,
    metadata: { action: 'queued_for_check' },
  });

  return {
    status: 'queued',
    message: 'تمت إضافة الطلب إلى قائمة الانتظار',
  };
};

const getResult = async (orderId, userId) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  const user = await db('users').where({ id: userId }).select('role').first();
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (user.role === 'client' && order.user_id !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const checkResult = await db('check_results').where({ order_id: orderId }).first();
  if (!checkResult) {
    return {
      status: 'not_checked',
      result: null,
      message: 'لم يتم فحص النتيجة بعد',
    };
  }

  return {
    status: checkResult.result === 'pending' ? 'pending' : 'completed',
    result: checkResult.result,
    case_number: checkResult.case_number,
    checked_at: checkResult.checked_at,
    raw_data: checkResult.raw_data,
    message: checkResult.result === 'winner'
      ? 'مبروك! لقد تم اختيارك'
      : checkResult.result === 'loser'
        ? 'لم يتم اختيارك هذه المرة'
        : checkResult.result === 'error'
          ? 'حدث خطأ أثناء الفحص'
          : 'النتيجة قيد الفحص',
  };
};

const getResultByConfirmation = async (confirmationNumber) => {
  let checkResult = await db('check_results').where({ confirmation_number: confirmationNumber }).first();

  if (!checkResult) {
    const applicantData = await db('applicant_data').where({ confirmation_number: confirmationNumber }).first();
    if (!applicantData) {
      throw new AppError('Confirmation number not found', 404, 'NOT_FOUND');
    }

    checkResult = await db('check_results').where({ order_id: applicantData.order_id }).first();
    if (!checkResult) {
      return {
        status: 'not_checked',
        result: null,
        message: 'لم يتم فحص النتيجة بعد',
      };
    }
  }

  return {
    status: checkResult.result === 'pending' ? 'pending' : 'completed',
    result: checkResult.result,
    case_number: checkResult.case_number,
    checked_at: checkResult.checked_at,
    message: checkResult.result === 'winner'
      ? 'مبروك! لقد تم اختيارك'
      : checkResult.result === 'loser'
        ? 'لم يتم اختيارك هذه المرة'
        : checkResult.result === 'error'
          ? 'حدث خطأ أثناء الفحص'
          : 'النتيجة قيد الفحص',
  };
};

const updateResult = async (orderId, resultData) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  const { result, case_number, error_message, checked_at, raw_data } = resultData;

  await db('check_results').where({ order_id: orderId }).update({
    result: result,
    case_number: case_number || null,
    error_message: error_message || null,
    checked_at: checked_at || db.fn.now(),
    raw_data: raw_data ? db.raw('?::jsonb', [JSON.stringify(raw_data)]) : undefined,
    updated_at: db.fn.now(),
  });

  const resultStatusMap = {
    winner: 'winner',
    loser: 'loser',
    error: 'error',
    no_confirmation: 'pending_check',
  };

  await db('applicant_data').where({ order_id: orderId }).update({
    result_status: resultStatusMap[result] || 'checked',
  });

  const notificationData = {
    user_id: order.user_id,
    order_id: order.id,
    type: result === 'winner' ? 'winner' : 'result_update',
    title: result === 'winner' ? '🎉 مبروك! تم اختيارك' : 'نتيجة القرعة',
    body: result === 'winner'
      ? 'تهانينا! لقد تم اختيارك في قرعة اللوتري'
      : result === 'loser'
        ? 'نأسف، لم يتم اختيارك هذه المرة'
        : result === 'error'
          ? 'حدث خطأ أثناء فحص النتيجة'
          : 'تم تحديث نتيجة القرعة',
    channel: 'pwa',
    status: 'pending',
  };

  await db('notifications').insert(notificationData);

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: order.user_id,
    action: 'result_updated',
    from_status: order.status,
    to_status: order.status,
    metadata: { result },
  });

  return { success: true, result };
};

const updateConfirmation = async (orderId, confirmationNumber) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  await db('applicant_data').where({ order_id: orderId }).update({
    confirmation_number: confirmationNumber,
  });

  await db('check_results').where({ order_id: orderId }).update({
    confirmation_number: confirmationNumber,
    updated_at: db.fn.now(),
  });

  return { success: true, confirmation_number: confirmationNumber };
};

module.exports = {
  check,
  getResult,
  getResultByConfirmation,
  updateResult,
  updateConfirmation,
};
