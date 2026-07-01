const crypto = require('crypto');
const db = require('../../database/db');
const orderModel = require('./orders.model');
const { AppError } = require('../../common/error-handler');
const { assertTransition, checkGuard } = require('../../common/state-machine');
const storage = require('../../common/storage');
const notifier = require('../../common/notifier');
const { encrypt, decrypt } = require('../../common/encryption');
const fraudDetector = require('../../common/fraud-detector');

const create = async (userId, data, ip = null) => {
  const active = await orderModel.getActiveOrder(userId);
  if (active) {
    throw new AppError('You already have an active order', 409, 'DUPLICATE_ENTRY');
  }

  const orderNumber = await orderModel.getOrderNumber();

  const [order] = await orderModel.create({
    user_id: userId,
    status: 'draft',
    total_price: 1000,
    currency: 'YER',
    order_number: orderNumber,
  });

  await db('applicant_data').insert({
    order_id: order.id,
    first_name: data.personal_data.first_name,
    middle_name: data.personal_data.middle_name || null,
    last_name: data.personal_data.last_name,
    gender: data.personal_data.gender,
    birth_date: data.personal_data.birth_date,
    birth_city: data.personal_data.birth_city,
    birth_country: data.personal_data.birth_country || 'YEMEN',
    country_of_eligibility: data.personal_data.country_of_eligibility || 'YEMEN',
    marital_status: data.personal_data.marital_status,
    education_level: String(data.personal_data.education_level),
    passport_number: data.personal_data.passport_number,
    encrypted_passport_number: encrypt(data.personal_data.passport_number),
    passport_expiry: data.personal_data.passport_expiry,
    spouse_data: data.spouse_data || {},
    encrypted_spouse_data: encrypt(data.spouse_data || {}),
    children_data: data.children_data || [],
    encrypted_children_data: encrypt(data.children_data || []),
    email: data.contact.email || null,
    phone: data.contact.phone,
    alt_phone: data.contact.alt_phone || null,
    address_line1: data.address.street,
    address_line2: data.address.district || null,
    city: data.address.city,
    country: data.address.country || 'YEMEN',
    postal_code: data.address.postal_code || null,
    district: data.address.district || null,
  });

  await db('audit_logs').insert({
    order_id: order.id,
    user_id: userId,
    action: 'create',
    from_status: null,
    to_status: 'draft',
    metadata: {},
  });

  const accountCheck = await fraudDetector.checkNewAccountOrderRate(userId);
  if (accountCheck.flagged) {
    await fraudDetector.flagOrder(
      order.id, userId,
      'حساب جديد قدّم عدد طلبات كبير في اليوم الأول',
      2,
    );
  }

  if (ip) {
    const ipCheck = await fraudDetector.checkIpAccountCount(ip);
    if (ipCheck.flagged) {
      await fraudDetector.flagOrder(
        order.id, userId,
        `حسابات متعددة من نفس الـ IP (${ipCheck.count} حساب)`,
        1,
      );
    }
  }

  return order;
};


const list = async (userId, role, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  let rows;
  let totalResult;

  if (role === 'client') {
    rows = await orderModel.findByUser(userId, { ...query, limit, offset });
    totalResult = await orderModel.countByUser(userId, query);
  } else {
    rows = await orderModel.findAll({ ...query, limit, offset });
    totalResult = await orderModel.countAll(query);
  }

  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

const getById = async (orderId, userId, role) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  if (role === 'client' && order.user_id !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const applicantData = await db('applicant_data').where({ order_id: orderId }).first();
  const payment = await db('payments').where({ order_id: orderId }).first();
  const auditLog = await db('audit_logs').where({ order_id: orderId }).orderBy('created_at', 'desc');

  if (applicantData) {
    if (applicantData.encrypted_passport_number) {
      const decrypted = decrypt(applicantData.encrypted_passport_number);
      if (decrypted !== null) applicantData.passport_number = decrypted;
    }
    if (applicantData.encrypted_spouse_data) {
      const decrypted = decrypt(applicantData.encrypted_spouse_data);
      if (decrypted !== null) applicantData.spouse_data = decrypted;
    }
    if (applicantData.encrypted_children_data) {
      const decrypted = decrypt(applicantData.encrypted_children_data);
      if (decrypted !== null) applicantData.children_data = decrypted;
    }
  }

  return {
    ...order,
    personal_data: applicantData || null,
    payment: payment || null,
    audit_log: auditLog || [],
  };
};

const updatePersonalData = async (orderId, userId, data, ip = null) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }
  if (order.user_id !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  }
  if (!['draft', 'needs_correction'].includes(order.status)) {
    throw new AppError('Cannot edit data in current status', 409, 'INVALID_STATE');
  }

  const updateFields = {};
  if (data.personal_data) {
    Object.assign(updateFields, {
      first_name: data.personal_data.first_name,
      middle_name: data.personal_data.middle_name,
      last_name: data.personal_data.last_name,
      gender: data.personal_data.gender,
      birth_date: data.personal_data.birth_date,
      birth_city: data.personal_data.birth_city,
      birth_country: data.personal_data.birth_country,
      country_of_eligibility: data.personal_data.country_of_eligibility,
      marital_status: data.personal_data.marital_status,
      education_level: data.personal_data.education_level ? String(data.personal_data.education_level) : undefined,
      passport_number: data.personal_data.passport_number,
      encrypted_passport_number: encrypt(data.personal_data.passport_number),
      passport_expiry: data.personal_data.passport_expiry,
    });
  }
  if (data.spouse_data !== undefined) {
    updateFields.spouse_data = data.spouse_data;
    updateFields.encrypted_spouse_data = encrypt(data.spouse_data);
  }
  if (data.children_data !== undefined) {
    updateFields.children_data = data.children_data;
    updateFields.encrypted_children_data = encrypt(data.children_data);
  }
  if (data.address) {
    updateFields.address_line1 = data.address.street;
    updateFields.address_line2 = data.address.district || null;
    updateFields.city = data.address.city;
    updateFields.country = data.address.country;
    updateFields.postal_code = data.address.postal_code || null;
    updateFields.district = data.address.district || null;
  }
  if (data.contact) {
    updateFields.email = data.contact.email || null;
    updateFields.phone = data.contact.phone;
    updateFields.alt_phone = data.contact.alt_phone || null;
  }

  if (Object.keys(updateFields).length > 0) {
    await db('applicant_data').where({ order_id: orderId }).update(updateFields);
  }

  let newStatus = order.status;
  if (order.status === 'draft') {
    assertTransition('draft', 'data_entry_complete', 'client');
    newStatus = 'data_entry_complete';
  } else if (order.status === 'data_entry_complete') {
    assertTransition('data_entry_complete', 'draft', 'client');
    newStatus = 'draft';
  } else if (order.status === 'needs_correction') {
    assertTransition('needs_correction', 'data_entry_complete', 'client');
    newStatus = 'data_entry_complete';
  }
  if (newStatus !== order.status) {
    await orderModel.update(orderId, { status: newStatus });
    const action = order.status === 'draft' ? 'submit_data' : order.status === 'needs_correction' ? 'resubmit_data' : 'edit_data';
    await db('audit_logs').insert({
      order_id: orderId,
      user_id: userId,
      action,
      from_status: order.status,
      to_status: newStatus,
      metadata: {},
    });

    if (newStatus === 'data_entry_complete') {
      const speedCheck = await fraudDetector.checkSubmissionSpeed(orderId, userId);
      if (speedCheck.flagged) {
        await fraudDetector.flagOrder(
          orderId, userId,
          `إدخال سريع جداً - ${speedCheck.timeSeconds} ثانية فقط بين الخطوات`,
          1,
        );
      }
    }
  }

  return orderModel.findById(orderId);
};

const uploadPhoto = async (orderId, userId, file) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  }
  if (order.status !== 'data_entry_complete' && order.status !== 'photo_rejected' && order.status !== 'needs_correction') {
    throw new AppError('Cannot upload photo in current status', 409, 'INVALID_STATE');
  }

  const photoHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const dupPhoto = await db('applicant_data').where({ photo_hash: photoHash }).whereNotNull('photo_path').first();
  if (dupPhoto) {
    throw new AppError('These photos were already used in another order', 409, 'DUPLICATE_PHOTO');
  }

  const photoPath = `orders/${orderId}/photo.jpg`;
  await storage.save(file.buffer, photoPath);
  await db('applicant_data').where({ order_id: orderId }).update({ photo_path: photoPath, photo_hash: photoHash });

  const newStatus = 'photo_pending';
  await orderModel.update(orderId, { status: newStatus });

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action: 'upload_photo',
    from_status: order.status,
    to_status: newStatus,
    metadata: {},
  });

  return { photo_path: photoPath, photo_url: storage.getUrl(photoPath), status: newStatus, ai_check: { status: 'processing', estimated_time: 3 } };
};

const uploadPassportScan = async (orderId, userId, file) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  }

  const passportPath = `orders/${orderId}/passport.jpg`;
  await storage.save(file.buffer, passportPath);
  await db('applicant_data').where({ order_id: orderId }).update({ passport_scan_path: passportPath });

  return { passport_scan_path: passportPath, passport_scan_url: storage.getUrl(passportPath) };
};

const getPhotoStatus = async (orderId, userId) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  const applicantData = await db('applicant_data').where({ order_id: orderId }).first();
  const validation = applicantData?.photo_validation || {};

  return {
    status: validation.status || 'pending',
    confidence: validation.confidence || null,
    reasons: validation.reasons || [],
    suggestions: validation.suggestions || [],
    checked_at: validation.checked_at || null,
  };
};

const uploadReceipt = async (orderId, userId, body, file) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  }
  if (order.status !== 'photo_accepted' && order.status !== 'needs_correction') {
    throw new AppError('Cannot upload payment receipt in current status', 409, 'INVALID_STATE');
  }

  const amount = parseFloat(body.amount) || 1000;
  if (amount !== 1000) {
    throw new AppError('Amount must be exactly 1,000 YR', 400, 'INVALID_AMOUNT');
  }

  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const duplicate = await db('payments').where({ receipt_hash: fileHash }).first();
  if (duplicate) {
    throw new AppError('This receipt was already submitted', 409, 'DUPLICATE_RECEIPT');
  }

  const transferNumber = body.transfer_number;
  if (transferNumber) {
    const dupTransfer = await db('payments').where({ transfer_number: transferNumber }).first();
    if (dupTransfer) {
      throw new AppError('This transfer number was already used', 409, 'DUPLICATE_TRANSFER');
    }
  }

  const receiptPath = `receipts/${orderId}/receipt.jpg`;
  await storage.save(file.buffer, receiptPath);

  const [payment] = await db('payments').insert({
    order_id: orderId,
    amount,
    currency: 'YER',
    method: 'deposit',
    provider: body.payment_method,
    transfer_number: transferNumber || null,
    receipt_image_path: receiptPath,
    receipt_hash: fileHash,
    status: 'pending',
  }).returning('*');

  await orderModel.update(orderId, { status: 'payment_pending' });

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action: 'initiate_payment',
    from_status: order.status,
    to_status: 'payment_pending',
    metadata: {},
  });

  return {
    receipt_id: payment.id,
    payment_method: body.payment_method,
    amount: payment.amount,
    status: 'pending_verification',
    order_status: 'payment_pending',
  };
};

const changeStatus = async (orderId, userId, role, { action, notes, confirmation_number }) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  }

  const actionMap = {
    approve_photo: { from: 'photo_pending', to: 'photo_accepted' },
    reject_photo: { from: 'photo_pending', to: 'photo_rejected' },
    verify_payment: { from: 'payment_pending', to: 'payment_verification' },
    approve: { from: 'payment_verification', to: 'approved' },
    request_correction: { from: null, to: 'needs_correction' },
    resubmit_data: { from: 'needs_correction', to: 'data_entry_complete' },
    resubmit_photo: { from: 'needs_correction', to: 'photo_pending' },
    retry_payment: { from: 'needs_correction', to: 'payment_pending' },
    submit_official: { from: 'approved', to: 'submitted' },
    mark_completed: { from: 'submitted', to: 'completed' },
    cancel: { from: null, to: 'cancelled' },
  };

  const transition = actionMap[action];
  if (!transition) throw new AppError('Invalid action', 400, 'INVALID_ACTION');

  if (transition.from !== null && order.status !== transition.from) {
    throw new AppError(
      `Cannot perform ${action} from status ${order.status}`,
      409,
      'INVALID_TRANSITION',
    );
  }

  assertTransition(order.status, transition.to, role);
  await checkGuard(action, order);

  if (action === 'verify_payment') {
    const throughputCheck = await fraudDetector.checkEmployeeThroughput(userId);
    if (throughputCheck.flagged) {
      await fraudDetector.flagOrder(
        orderId, userId,
        `نشاط غير طبيعي للموظف - ${throughputCheck.count} تأكيد في الساعة`,
        2,
      );
    }
  }

  if (action === 'submit_official' && confirmation_number) {
    await db('applicant_data').where({ order_id: orderId }).update({
      confirmation_number,
      submitted_at: db.fn.now(),
      submitted_by: userId,
    });
  }

  await orderModel.update(orderId, {
    status: transition.to,
    notes: notes || order.notes,
  });

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action,
    from_status: order.status,
    to_status: transition.to,
    metadata: notes ? { notes } : {},
  });

  if (['approved', 'submitted', 'completed', 'cancelled', 'needs_correction', 'photo_rejected', 'payment_pending', 'photo_accepted', 'data_entry_complete'].includes(transition.to)) {
    const user = await db('users').where({ id: order.user_id }).select('phone').first();
    await notifier.sendStatusUpdate(order.user_id, orderId, transition.to, notes, user?.phone, confirmation_number);
  }

  const updated = await orderModel.findById(orderId);
  return { order: updated };
};

module.exports = {
  create,
  list,
  getById,
  updatePersonalData,
  uploadPhoto,
  uploadPassportScan,
  getPhotoStatus,
  uploadReceipt,
  changeStatus,
};
