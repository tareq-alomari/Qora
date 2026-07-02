const crypto = require('crypto');
const db = require('../../database/db');
const orderModel = require('./orders.model');
const { AppError } = require('../../common/error-handler');
const { assertTransition, checkGuard, ACTIONS } = require('../../common/state-machine');
const storage = require('../../common/storage');
const notifier = require('../../common/notifier');
const { encrypt, decrypt } = require('../../common/encryption');
const fraudDetector = require('../../common/fraud-detector');
const aiService = require('../../common/ai-service');

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

  if (data.personal_data) {
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
      email: data.contact ? data.contact.email || null : null,
      phone: data.contact ? data.contact.phone : null,
      alt_phone: data.contact ? data.contact.alt_phone || null : null,
      address_line1: data.address ? data.address.street : null,
      address_line2: data.address ? data.address.district || null : null,
      city: data.address ? data.address.city : null,
      country: data.address ? data.address.country || 'YEMEN' : null,
      postal_code: data.address ? data.address.postal_code || null : null,
      district: data.address ? data.address.district || null : null,
    });
  } else {
    await db('applicant_data').insert({ order_id: order.id });
  }

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
  const limit = Math.min(parseInt(query.limit) || 20, 100);
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

  const paymentStatus = payment ? payment.status : null;

  let photoValidation = null;
  let photoUrl = null;
  if (applicantData) {
    if (applicantData.photo_validation) {
      try {
        photoValidation = typeof applicantData.photo_validation === 'string'
          ? JSON.parse(applicantData.photo_validation)
          : applicantData.photo_validation;
      } catch {
        photoValidation = applicantData.photo_validation;
      }
    }
    if (applicantData.photo_path) {
      photoUrl = storage.getUrl(applicantData.photo_path);
    }
  }

  return {
    order_id: order.id,
    order_number: order.order_number,
    status: order.status,
    service_type: order.service_type,
    total_price: order.total_price,
    currency: order.currency,
    is_active: order.is_active,
    result: order.result,
    fraud_level: order.fraud_level,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
    personal_data: applicantData ? {
      first_name: applicantData.first_name,
      middle_name: applicantData.middle_name,
      last_name: applicantData.last_name,
      gender: applicantData.gender,
      birth_date: applicantData.birth_date,
      birth_city: applicantData.birth_city,
      birth_country: applicantData.birth_country,
      country_of_eligibility: applicantData.country_of_eligibility,
    } : null,
    contact_info: applicantData ? {
      phone: applicantData.phone,
      email: applicantData.email,
      alt_phone: applicantData.alt_phone,
      street: applicantData.address_line1,
      city: applicantData.city,
      district: applicantData.district,
      postal_code: applicantData.postal_code,
    } : null,
    education_status: applicantData ? {
      education_level: applicantData.education_level,
      marital_status: applicantData.marital_status,
      passport_number: applicantData.passport_number,
      passport_expiry: applicantData.passport_expiry,
    } : null,
    spouse_data: applicantData ? applicantData.spouse_data : null,
    children_data: applicantData ? applicantData.children_data : null,
    photo_status: applicantData ? (applicantData.photo_path ? 'uploaded' : null) : null,
    photo_path: applicantData ? applicantData.photo_path : null,
    photo_url: photoUrl,
    photo_validation: photoValidation,
    confirmation_number: applicantData ? applicantData.confirmation_number : null,
    payment_status: paymentStatus,
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

  const aiResult = await aiService.validatePhoto(file.buffer);

  if (aiResult.success) {
    const validation = {
      status: aiResult.data.valid ? 'accepted' : 'rejected',
      confidence: aiResult.data.confidence,
      checks: aiResult.data.checks,
      reasons: aiResult.data.reasons || [],
      suggestions: aiResult.data.suggestions || [],
      checked_at: new Date().toISOString(),
    };

    await db('applicant_data').where({ order_id: orderId }).update({ photo_validation: JSON.stringify(validation) });

    const newStatus = aiResult.data.valid ? 'photo_accepted' : 'photo_rejected';
    const action = aiResult.data.valid ? 'ai_validation_pass' : 'ai_validation_fail';

    await orderModel.update(orderId, { status: newStatus });

    await db('audit_logs').insert({
      order_id: orderId,
      user_id: userId,
      action,
      from_status: 'photo_pending',
      to_status: newStatus,
      metadata: { confidence: aiResult.data.confidence, reasons: aiResult.data.reasons },
    });

    return {
      photo_path: photoPath,
      photo_url: storage.getUrl(photoPath),
      status: newStatus,
      ai_check: {
        status: validation.status,
        confidence: validation.confidence,
        reasons: validation.reasons,
        suggestions: validation.suggestions,
        checked_at: validation.checked_at,
      },
    };
  }

  const pendingStatus = 'photo_pending';
  await orderModel.update(orderId, { status: pendingStatus });

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action: 'upload_photo',
    from_status: order.status,
    to_status: pendingStatus,
    metadata: { ai_error: aiResult.error },
  });

  return { photo_path: photoPath, photo_url: storage.getUrl(photoPath), status: pendingStatus, ai_check: { status: 'processing', estimated_time: 3 } };
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

  const transition = ACTIONS[action];
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
    await db('payments').where({ order_id: orderId }).update({ status: 'verified', verified_at: db.fn.now(), verified_by: userId });

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

const updateApplicantFields = async (orderId, userId, fields) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status === 'cancelled') throw new AppError('Order is cancelled', 400, 'ORDER_CANCELLED');
  if (!['draft', 'needs_correction'].includes(order.status)) {
    throw new AppError('Cannot edit data in current status', 409, 'INVALID_STATE');
  }

  const existing = await db('applicant_data').where({ order_id: orderId }).first();
  if (existing) {
    await db('applicant_data').where({ order_id: orderId }).update(fields);
  } else {
    await db('applicant_data').insert({ order_id: orderId, ...fields });
  }

  return orderModel.findById(orderId);
};

const updateContactInfo = async (orderId, userId, data) => {
  const fields = {};
  if (data.phone) fields.phone = data.phone;
  if (data.email !== undefined) fields.email = data.email || null;
  if (data.alt_phone !== undefined) fields.alt_phone = data.alt_phone || null;
  if (data.street) fields.address_line1 = data.street;
  if (data.city) fields.city = data.city;
  if (data.district !== undefined) fields.district = data.district || null;
  if (data.district !== undefined) fields.address_line2 = data.district || null;
  if (data.postal_code !== undefined) fields.postal_code = data.postal_code || null;
  if (data.country) fields.country = data.country;

  const order = await updateApplicantFields(orderId, userId, fields);
  return { order_id: order.id, status: order.status };
};

const updateEducationStatus = async (orderId, userId, data) => {
  const fields = {};
  if (data.education_level) fields.education_level = String(data.education_level);
  if (data.marital_status) fields.marital_status = data.marital_status;
  if (data.passport_number) {
    fields.passport_number = data.passport_number;
    fields.encrypted_passport_number = encrypt(data.passport_number);
  }
  if (data.passport_expiry) fields.passport_expiry = data.passport_expiry;

  const order = await updateApplicantFields(orderId, userId, fields);
  return { order_id: order.id, status: order.status };
};

const updateSpouseData = async (orderId, userId, data) => {
  const fields = {
    spouse_data: data,
    encrypted_spouse_data: encrypt(data),
  };

  const order = await updateApplicantFields(orderId, userId, fields);
  return { order_id: order.id, status: order.status };
};

const updateChildrenData = async (orderId, userId, data) => {
  const fields = {
    children_data: data || [],
    encrypted_children_data: encrypt(data || []),
  };

  const order = await updateApplicantFields(orderId, userId, fields);
  return { order_id: order.id, status: order.status };
};

const submitOrder = async (orderId, userId) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.user_id !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  // If already past draft, just confirm success (order is already submitted/processing)
  if (order.status !== 'draft' && order.status !== 'needs_correction') {
    return { order_id: order.id, order_number: order.order_number, status: order.status };
  }

  await checkGuard('submit_data', order);
  assertTransition(order.status, 'data_entry_complete', 'client');

  await orderModel.update(orderId, { status: 'data_entry_complete' });
  await db('audit_logs').insert({
    order_id: orderId, user_id: userId,
    action: 'submit_data',
    from_status: order.status, to_status: 'data_entry_complete',
    metadata: {},
  });

  const speedCheck = await fraudDetector.checkSubmissionSpeed(orderId, userId);
  if (speedCheck.flagged) {
    await fraudDetector.flagOrder(orderId, userId,
      `إدخال سريع جداً - ${speedCheck.timeSeconds} ثانية فقط بين الخطوات`, 1);
  }

  return { order_id: order.id, order_number: order.order_number, status: 'data_entry_complete' };
};

module.exports = {
  create,
  list,
  getById,
  updatePersonalData,
  updateContactInfo,
  updateEducationStatus,
  updateSpouseData,
  updateChildrenData,
  submitOrder,
  uploadPhoto,
  getPhotoStatus,
  uploadPassportScan,
  uploadReceipt,
  changeStatus,
};
