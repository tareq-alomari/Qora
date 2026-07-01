const Joi = require('joi');

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional().allow(null, ''),
}).min(1);

module.exports = { updateProfileSchema };
