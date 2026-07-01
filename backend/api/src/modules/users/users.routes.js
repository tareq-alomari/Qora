const { Router } = require('express');
const controller = require('./users.controller');
const { authenticate } = require('../../common/auth.middleware');
const { validate } = require('../../common/validate.middleware');
const { updateProfileSchema } = require('./users.schema');

const router = Router();

router.get('/profile', authenticate, controller.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), controller.updateProfile);

module.exports = router;
