const Joi = require('joi');

const createNotificationSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  order_id: Joi.string().uuid().optional().allow(null),
  type: Joi.string().max(50).required(),
  channel: Joi.string().valid('email', 'sms', 'whatsapp', 'in_app').default('in_app'),
  title: Joi.string().max(255).required(),
  body: Joi.string().optional().allow(null, ''),
});

module.exports = { createNotificationSchema };
