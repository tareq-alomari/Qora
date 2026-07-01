const { Router } = require('express');
const controller = require('./push-subscriptions.controller');
const { authenticate } = require('../../common/auth.middleware');
const { validate } = require('../../common/validate.middleware');
const { createPushSubscriptionSchema } = require('./push-subscriptions.schema');

const router = Router();

router.post('/', authenticate, validate(createPushSubscriptionSchema), controller.subscribe);
router.delete('/', authenticate, controller.unsubscribe);

module.exports = router;
