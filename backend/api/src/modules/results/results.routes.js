const { Router } = require('express');
const controller = require('./results.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');
const { authenticateApiKey } = require('../../common/api-key.middleware');
const { validate } = require('../../common/validate.middleware');
const { updateResultSchema, updateConfirmationSchema } = require('./results.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const checkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many check requests', details: [] } },
});

const publicLookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many lookup requests', details: [] } },
});

router.post('/:id/check-result', authenticate, checkLimiter, controller.check);
router.get('/:id/result', authenticate, controller.getResult);
router.get('/check-result/:confirmation', publicLookupLimiter, controller.getResultByConfirmation);
router.patch('/:id/result', authenticateApiKey, validate(updateResultSchema), controller.updateResult);
router.patch('/:id/confirmation', authenticateApiKey, validate(updateConfirmationSchema), controller.updateConfirmation);

module.exports = router;
