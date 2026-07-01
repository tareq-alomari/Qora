const Joi = require('joi');

const updateResultSchema = Joi.object({
  result: Joi.string().valid('winner', 'loser', 'error', 'no_confirmation').required(),
  case_number: Joi.string().max(50).optional().allow(null, ''),
  error_message: Joi.string().max(500).optional().allow(null, ''),
  checked_at: Joi.date().iso().optional(),
  raw_data: Joi.object().optional().default({}),
});

const updateConfirmationSchema = Joi.object({
  confirmation_number: Joi.string()
    .pattern(/^2026[A-Z]{2}\d{7}$/)
    .required(),
});

module.exports = { updateResultSchema, updateConfirmationSchema };
