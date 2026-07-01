const { Router } = require('express');
const controller = require('./payments.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');
const { validate } = require('../../common/validate.middleware');
const { listReceiptsSchema } = require('./payments.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests', details: [] } },
});

router.use(paymentLimiter);
router.get('/methods', controller.getMethods);
router.get('/receipts', authenticate, authorize('employee', 'admin'), validate(listReceiptsSchema), controller.listReceipts);

module.exports = router;
