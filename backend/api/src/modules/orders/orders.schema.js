const Joi = require('joi');

const personalDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  middle_name: Joi.string().max(50).optional().allow(null, ''),
  last_name: Joi.string().min(2).max(50).required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_date: Joi.date().max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)).required(),
  birth_city: Joi.string().min(2).max(100).required(),
  birth_country: Joi.string().length(5).required(),
  country_of_eligibility: Joi.string().length(5).required(),
  marital_status: Joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
  passport_number: Joi.string().alphanum().min(6).max(20).required(),
  passport_expiry: Joi.date().greater('now').required(),
});

const spouseDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_city: Joi.string().min(2).max(100).required(),
  photo: Joi.any().optional().allow(null),
}).optional().allow(null);

const childrenItemSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
});

const createOrderSchema = Joi.object({
  personal_data: personalDataSchema.required(),
  spouse_data: spouseDataSchema,
  children_data: Joi.array().items(childrenItemSchema).optional().default([]),
  address: Joi.object({
    street: Joi.string().min(2).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    district: Joi.string().max(100).optional().allow(null, ''),
    postal_code: Joi.string().max(20).optional().allow(null, ''),
    country: Joi.string().length(5).required(),
  }).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967\d{7,9}$/).required(),
    email: Joi.string().email().optional().allow(null, ''),
    alt_phone: Joi.string().pattern(/^967\d{7,9}$/).optional().allow(null, ''),
  }).required(),
});

const updatePersonalDataSchema = Joi.object({
  personal_data: personalDataSchema.optional(),
  spouse_data: spouseDataSchema,
  children_data: Joi.array().items(childrenItemSchema).optional(),
  address: Joi.object({
    street: Joi.string().min(2).max(200),
    city: Joi.string().min(2).max(100),
    district: Joi.string().max(100).optional().allow(null, ''),
    postal_code: Joi.string().max(20).optional().allow(null, ''),
    country: Joi.string().length(5),
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967\d{7,9}$/),
    email: Joi.string().email().optional().allow(null, ''),
    alt_phone: Joi.string().pattern(/^967\d{7,9}$/).optional().allow(null, ''),
  }).optional(),
}).min(1);

const changeStatusSchema = Joi.object({
  action: Joi.string().valid(
    'accept_photo', 'reject_photo', 'verify_payment',
    'approve', 'request_correction', 'submit_official',
    'mark_completed', 'cancel',
  ).required(),
  notes: Joi.string().max(500).optional().allow(null, ''),
  confirmation_number: Joi.string().max(50).optional().when('action', {
    is: 'submit_official',
    then: Joi.required(),
  }),
}).min(1);

module.exports = { createOrderSchema, updatePersonalDataSchema, changeStatusSchema };
