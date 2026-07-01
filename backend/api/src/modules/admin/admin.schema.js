const Joi = require('joi');

const updateUserSchema = Joi.object({
  role: Joi.string().valid('client', 'employee', 'admin').optional(),
  is_active: Joi.boolean().optional(),
  full_name: Joi.string().min(2).max(255).optional(),
}).min(1).unknown(false);

const paymentAccountSchema = Joi.object({
  method: Joi.string().valid('kuraimi', 'jeeb', 'one_cash', 'mobile_money').required(),
  account_number: Joi.string().required(),
  account_name: Joi.string().required(),
  is_active: Joi.boolean().default(true),
});

const updateSettingsSchema = Joi.object({
  pricing: Joi.object({
    lottery_registration: Joi.number().min(0).optional(),
    result_checking: Joi.number().min(0).optional(),
  }).optional(),
  payment_accounts: Joi.array().items(paymentAccountSchema).optional(),
  season: Joi.object({
    is_open: Joi.boolean().optional(),
    opens_at: Joi.date().iso().optional(),
    closes_at: Joi.date().iso().optional(),
  }).optional(),
  rate_limits: Joi.object({
    login_per_ip_per_min: Joi.number().min(1).optional(),
    register_per_ip_per_hour: Joi.number().min(1).optional(),
    orders_per_user_per_min: Joi.number().min(1).optional(),
  }).optional(),
}).min(1).unknown(false);

module.exports = { updateUserSchema, updateSettingsSchema };
