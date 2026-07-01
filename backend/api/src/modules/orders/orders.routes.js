const { Router } = require('express');
const controller = require('./orders.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');
const { validate } = require('../../common/validate.middleware');
const { uploadPhoto, uploadReceipt, uploadPassport } = require('../../common/upload.middleware');
const { createOrderSchema, updatePersonalDataSchema, changeStatusSchema } = require('./orders.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const orderLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_ORDER_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_ORDER_MAX) || 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests', details: [] } },
});

const photoLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_PHOTO_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_PHOTO_MAX) || 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many uploads', details: [] } },
});

const receiptLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_RECEIPT_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_RECEIPT_MAX) || 3,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many receipt uploads', details: [] } },
});

const passportLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_PASSPORT_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_PASSPORT_MAX) || 3,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many passport uploads', details: [] } },
});

const statusLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_STATUS_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_STATUS_MAX) || 30,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many status changes', details: [] } },
});

router.post('/', authenticate, orderLimiter, validate(createOrderSchema), controller.create);
router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.patch('/:id/personal-data', authenticate, validate(updatePersonalDataSchema), controller.updatePersonalData);
router.post('/:id/photo', authenticate, photoLimiter, uploadPhoto.single('photo'), controller.uploadPhoto);
router.get('/:id/photo/status', authenticate, controller.getPhotoStatus);
router.post('/:id/passport-scan', authenticate, passportLimiter, uploadPassport.single('passport_scan'), controller.uploadPassportScan);
router.post('/:id/payment/receipt', authenticate, receiptLimiter, uploadReceipt.single('receipt'), controller.uploadReceipt);
router.patch('/:id/status', authenticate, authorize('employee', 'admin'), statusLimiter, validate(changeStatusSchema), controller.changeStatus);

module.exports = router;
