const orderService = require('./orders.service');

const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.user.id, req.body, req.ip);
    res.status(201).json({
      data: {
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      message: 'تم إنشاء الطلب',
    });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await orderService.list(req.user.id, req.user.role, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id, req.user.id, req.user.role);
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};

const updatePersonalData = async (req, res, next) => {
  try {
    const order = await orderService.updatePersonalData(req.params.id, req.user.id, req.body, req.ip);
    res.json({
      data: {
        order_id: order.id,
        status: order.status,
        updated_at: order.updated_at,
      },
      message: 'تم تحديث البيانات',
    });
  } catch (err) {
    next(err);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: { code: 'PHOTO_REQUIRED', message: 'الصورة مطلوبة', details: [] },
      });
    }
    const result = await orderService.uploadPhoto(req.params.id, req.user.id, file);
    res.json({ data: result, message: 'تم رفع الصورة، جاري الفحص' });
  } catch (err) {
    next(err);
  }
};

const getPhotoStatus = async (req, res, next) => {
  try {
    const result = await orderService.getPhotoStatus(req.params.id, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

const uploadReceipt = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: { code: 'RECEIPT_REQUIRED', message: 'صورة الإيصال مطلوبة', details: [] },
      });
    }
    const result = await orderService.uploadReceipt(req.params.id, req.user.id, req.body, file);
    res.status(201).json({ data: result, message: 'تم رفع الإيصال، في انتظار التأكيد' });
  } catch (err) {
    next(err);
  }
};

const uploadPassportScan = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: { code: 'PASSPORT_SCAN_REQUIRED', message: 'صورة الجواز مطلوبة', details: [] },
      });
    }
    const result = await orderService.uploadPassportScan(req.params.id, req.user.id, file);
    res.json({ data: result, message: 'تم رفع صورة الجواز' });
  } catch (err) {
    next(err);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const result = await orderService.changeStatus(req.params.id, req.user.id, req.user.role, req.body);
    res.json({ data: result, message: 'تم تغيير حالة الطلب' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create, list, getById, updatePersonalData,
  uploadPhoto, getPhotoStatus, uploadReceipt, uploadPassportScan, changeStatus,
};
