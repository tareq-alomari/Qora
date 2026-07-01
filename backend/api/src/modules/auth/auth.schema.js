const Joi = require('joi');

const phonePattern = /^967[73]\d{8}$/;

const registerSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'رقم الهاتف يجب أن يكون يمنياً (967XXXXXXXXX)',
    'any.required': 'رقم الهاتف مطلوب',
  }),
  full_name: Joi.string().min(2).max(100).optional(),
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

module.exports = { registerSchema, verifyOtpSchema, loginSchema };
