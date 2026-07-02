const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../common/auth.middleware');
const { validate } = require('../../common/validate.middleware');
const { registerSchema, registerEmailSchema, emailLoginSchema, verifyOtpSchema, loginSchema, googleAuthSchema, forgotPasswordSchema, resetPasswordSchema, sendVerificationSchema, verifyEmailSchema } = require('./auth.schema');
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

// OTP-based auth (existing)
router.post('/register', registerLimiter, validate(registerSchema), controller.register);
router.post('/verify-otp', verifyOtpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/refresh', refreshLimiter, controller.refresh);
router.post('/logout', authenticate, controller.logout);

// Email/password auth (new)
const emailRegisterLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });
const emailLoginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });

router.post('/register-email', emailRegisterLimiter, validate(registerEmailSchema), controller.registerWithEmail);
router.post('/login-email', emailLoginLimiter, validate(emailLoginSchema), controller.loginWithEmail);

// Google OAuth (new)
const googleLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });
router.post('/google', googleLimiter, validate(googleAuthSchema), controller.googleAuth);

// Password recovery
const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });
const resetLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });

router.post('/forgot-password', forgotLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', resetLimiter, validate(resetPasswordSchema), controller.resetPassword);

// Email verification
const sendVerificationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });
const verifyEmailLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts', details: [] } } });

router.post('/send-verification', sendVerificationLimiter, validate(sendVerificationSchema), controller.sendVerification);
router.post('/verify-email', verifyEmailLimiter, validate(verifyEmailSchema), controller.verifyEmail);

module.exports = router;
