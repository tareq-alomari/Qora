const Joi = require('joi');

const phonePattern = /^967[73]\d{8}$/;

const registerSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'رقم الهاتف يجب أن يكون يمنياً (967XXXXXXXXX)',
    'any.required': 'رقم الهاتف مطلوب',
  }),
  full_name: Joi.string().min(2).max(100).optional(),
});

const registerEmailSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'الاسم الكامل مطلوب',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
  phone: Joi.string().pattern(phonePattern).optional().allow('').empty('').messages({
    'string.pattern.base': 'رقم الهاتف يجب أن يكون يمنياً (967XXXXXXXXX)',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
});

const emailLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
  password: Joi.string().required().messages({
    'any.required': 'كلمة المرور مطلوبة',
  }),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'رمز التحقق يجب أن يكون 6 أرقام',
    'any.required': 'رمز التحقق مطلوب',
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'رقم الهاتف غير صحيح',
    'any.required': 'رقم الهاتف مطلوب',
  }),
});

const googleAuthSchema = Joi.object({
  id_token: Joi.string().required().messages({
    'any.required': 'رمز Google مطلوب',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(phonePattern).optional(),
}).or('email', 'phone').messages({
  'object.missing': 'البريد الإلكتروني أو رقم الهاتف مطلوب',
});

const resetPasswordSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'رقم الهاتف غير صحيح',
    'any.required': 'رقم الهاتف مطلوب',
  }),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'رمز التحقق يجب أن يكون 6 أرقام',
    'any.required': 'رمز التحقق مطلوب',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
});

const sendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'رمز التحقق من البريد مطلوب',
  }),
});

module.exports = { registerSchema, registerEmailSchema, emailLoginSchema, verifyOtpSchema, loginSchema, googleAuthSchema, forgotPasswordSchema, resetPasswordSchema, sendVerificationSchema, verifyEmailSchema };
