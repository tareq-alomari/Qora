const { Router } = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../common/validate.middleware');
const { registerSchema, verifyOtpSchema, loginSchema } = require('./auth.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } },
});

router.post('/register', registerLimiter, validate(registerSchema), controller.register);
router.post('/verify-otp', validate(verifyOtpSchema), controller.verifyOtp);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);

module.exports = router;
