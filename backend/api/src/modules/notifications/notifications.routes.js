const { Router } = require('express');
const controller = require('./notifications.controller');
const { authenticate } = require('../../common/auth.middleware');
const { validate } = require('../../common/validate.middleware');
const { createNotificationSchema } = require('./notifications.schema');

const router = Router();

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate(createNotificationSchema), controller.create);
router.patch('/:id/read', authenticate, controller.markAsRead);
router.get('/unread-count', authenticate, controller.unreadCount);
router.post('/read-all', authenticate, controller.markAllAsRead);

module.exports = router;
