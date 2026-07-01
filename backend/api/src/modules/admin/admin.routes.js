const { Router } = require('express');
const controller = require('./admin.controller');
const { authenticate } = require('../../common/auth.middleware');
const { authorize } = require('../../common/role.middleware');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', controller.getStats);
router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUser);
router.get('/settings', controller.getSettings);
router.patch('/settings', controller.updateSettings);

module.exports = router;
