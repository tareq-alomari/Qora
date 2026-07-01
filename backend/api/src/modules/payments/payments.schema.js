const Joi = require('joi');

const listReceiptsSchema = Joi.object({
  status: Joi.string().valid('pending', 'verified', 'rejected', 'refunded').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).unknown(false);

module.exports = { listReceiptsSchema };
