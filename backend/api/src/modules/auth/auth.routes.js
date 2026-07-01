const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../common/auth.middleware');
const { validate } = require('../../common/validate.middleware');
const { registerSchema, verifyOtpSchema, loginSchema } = require('./auth.schema');
const rateLimit = require('express-rate-limit');

const router = Router();

const registerLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW) || (60 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX) || 3,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } },
});

const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } },
});

const verifyOtpLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_VERIFY_OTP_WINDOW) || (60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_VERIFY_OTP_MAX) || 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } },
});

const refreshLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_REFRESH_WINDOW) || (60 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_REFRESH_MAX) || 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many refresh requests', details: [] } },
});

router.post('/register', registerLimiter, validate(registerSchema), controller.register);
router.post('/verify-otp', verifyOtpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/refresh', refreshLimiter, controller.refresh);
router.post('/logout', authenticate, controller.logout);

module.exports = router;
