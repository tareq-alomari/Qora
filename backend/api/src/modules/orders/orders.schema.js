const Joi = require('joi');

const personalDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  middle_name: Joi.string().max(50).optional().allow(null, ''),
  last_name: Joi.string().min(2).max(50).required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_date: Joi.date().max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)).min('1920-01-01').required(),
  birth_city: Joi.string().min(2).max(100).required(),
  birth_country: Joi.string().valid('YEMEN').default('YEMEN'),
  country_of_eligibility: Joi.string().valid('YEMEN').default('YEMEN'),
  marital_status: Joi.string().valid('single', 'married', 'married_usc_lpr', 'divorced', 'widowed', 'legally_separated').required(),
  passport_number: Joi.string().alphanum().min(6).max(20).required(),
  passport_expiry: Joi.date().greater('now').required(),
  education_level: Joi.number().integer().min(1).max(10).required(),
});

const spouseDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().max('now').required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_city: Joi.string().min(2).max(100).required(),
  photo: Joi.any().optional().allow(null),
}).optional().allow(null);

const childrenItemSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().max('now').required(),
  gender: Joi.string().valid('male', 'female').required(),
});

const createOrderSchema = Joi.object({
  personal_data: personalDataSchema.required(),
  spouse_data: spouseDataSchema,
  children_data: Joi.array().items(childrenItemSchema).max(20).optional().default([]),
  address: Joi.object({
    street: Joi.string().min(3).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    district: Joi.string().max(100).optional().allow(null, ''),
    postal_code: Joi.string().max(20).optional().allow(null, ''),
    country: Joi.string().valid('YEMEN').default('YEMEN'),
  }).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967[73]\d{8}$/).required(),
    email: Joi.string().email().optional().allow(null, ''),
    alt_phone: Joi.string().pattern(/^967[73]\d{8}$/).optional().allow(null, ''),
  }).required(),
});

const updatePersonalDataSchema = Joi.object({
  personal_data: personalDataSchema.optional(),
  spouse_data: spouseDataSchema,
  children_data: Joi.array().items(childrenItemSchema).max(20).optional(),
  address: Joi.object({
    street: Joi.string().min(3).max(200),
    city: Joi.string().min(2).max(100),
    district: Joi.string().max(100).optional().allow(null, ''),
    postal_code: Joi.string().max(20).optional().allow(null, ''),
    country: Joi.string().valid('YEMEN'),
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967[73]\d{8}$/),
    email: Joi.string().email().optional().allow(null, ''),
    alt_phone: Joi.string().pattern(/^967[73]\d{8}$/).optional().allow(null, ''),
  }).optional(),
}).min(1);

const changeStatusSchema = Joi.object({
  action: Joi.string().valid(
    'verify_payment', 'approve', 'reject_photo', 'approve_photo',
    'request_correction', 'resubmit_data', 'resubmit_photo', 'retry_payment',
    'submit_official', 'mark_completed', 'cancel',
  ).required(),
  notes: Joi.string().max(500).optional().allow(null, ''),
  receipt_id: Joi.string().uuid().when('action', {
    is: 'verify_payment',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  confirmation_number: Joi.string()
    .pattern(/^2026[A-Z]{2}\d{7}$/)
    .when('action', {
      is: 'submit_official',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
}).min(1);

module.exports = { createOrderSchema, updatePersonalDataSchema, changeStatusSchema };
