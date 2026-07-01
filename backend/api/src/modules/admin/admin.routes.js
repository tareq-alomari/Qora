const { Router } = require('express');
const controller = require('./admin.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');
const { validate } = require('../../common/validate.middleware');
const { updateUserSchema, updateSettingsSchema } = require('./admin.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests', details: [] } },
});

router.use(authenticate, authorize('admin'), adminLimiter);

router.get('/stats', controller.getStats);
router.get('/users', controller.listUsers);
router.patch('/users/:id', validate(updateUserSchema), controller.updateUser);
router.get('/settings', controller.getSettings);
router.patch('/settings', validate(updateSettingsSchema), controller.updateSettings);

module.exports = router;
