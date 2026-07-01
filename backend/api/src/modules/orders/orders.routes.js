const { Router } = require('express');
const controller = require('./orders.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');
const { validate } = require('../../common/validate.middleware');
const { upload } = require('../../common/upload.middleware');
const { createOrderSchema, updatePersonalDataSchema, changeStatusSchema } = require('./orders.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests', details: [] } },
});

const photoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many uploads', details: [] } },
});

const statusLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many status changes', details: [] } },
});

router.post('/', authenticate, orderLimiter, validate(createOrderSchema), controller.create);
router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.patch('/:id/personal-data', authenticate, validate(updatePersonalDataSchema), controller.updatePersonalData);
router.post('/:id/photo', authenticate, photoLimiter, upload.single('photo'), controller.uploadPhoto);
router.get('/:id/photo/status', authenticate, controller.getPhotoStatus);
router.post('/:id/payment/receipt', authenticate, upload.single('receipt'), controller.uploadReceipt);
router.patch('/:id/status', authenticate, authorize('employee', 'admin'), statusLimiter, validate(changeStatusSchema), controller.changeStatus);

module.exports = router;
