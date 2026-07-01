const { Router } = require('express');
const controller = require('./payments.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');

const router = Router();

router.get('/methods', controller.getMethods);
router.get('/receipts', authenticate, authorize('employee', 'admin'), controller.listReceipts);

module.exports = router;
