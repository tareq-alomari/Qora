# نموذج موديول كامل - Module Blueprint

## Qor3a — الـ Orders Module كمرجع متكامل

---

## 1. هيكل الملفات

```
backend/api/src/modules/orders/
├── orders.routes.js          ← التعريف بالـ endpoints
├── orders.controller.js      ← معالجة request/response
├── orders.service.js         ← منطق العمل + State Machine
├── orders.model.js           ← استعلامات قاعدة البيانات
├── orders.validation.js      ← Joi schemas
└── orders.state-machine.js   ← تعريف الـ State Machine
```

---

## 2. orders.state-machine.js

```javascript
const { AppError } = require('../../common/errors')

const TRANSITIONS = {
  draft:                ['data_entry_complete'],
  data_entry_complete:  ['photo_pending'],
  photo_pending:        ['photo_accepted', 'photo_rejected'],
  photo_rejected:       ['photo_pending'],
  photo_accepted:       ['payment_pending'],
  payment_pending:      ['payment_verification'],
  payment_verification: ['approved', 'needs_correction'],
  needs_correction:     ['draft', 'photo_pending', 'payment_pending'],
  approved:             ['submitted', 'cancelled'],
  submitted:            ['completed'],
  completed:            [],
  cancelled:            []
}

const GUARDS = {
  draft: {
    data_entry_complete: (order) => {
      return order.applicant?.first_name
        && order.applicant?.last_name
        && order.applicant?.birth_date
        && order.applicant?.passport_number
    }
  },
  payment_verification: {
    approved: (order) => order.payment?.status === 'verified'
  },
  approved: {
    submitted: (order) => !!order.applicant?.confirmation_number
  },
  payment_verification: {
    needs_correction: (_, user) => user.role === 'employee'
  },
  any: {
    cancelled: (_, user) => user.role === 'admin'
  }
}

const changeStatus = async (orderId, fromStatus, toStatus, user, extra = {}) => {
  const allowed = TRANSITIONS[fromStatus]
  if (!allowed || !allowed.includes(toStatus)) {
    throw new AppError('INVALID_STATE',
      `لا يمكن الانتقال من ${fromStatus} إلى ${toStatus}`, 409)
  }

  const guardPath = GUARDS[fromStatus]?.[toStatus]
    || GUARDS['any']?.[toStatus]
  if (guardPath) {
    const order = await orderModel.findById(orderId)
    const canTransition = await guardPath(order, user, extra)
    if (!canTransition) {
      throw new AppError('GUARD_FAILED',
        'لم تتحقق شروط الانتقال', 409)
    }
  }

  const updated = await orderModel.updateStatus(orderId, toStatus)
  await auditLogService.log({
    order_id: orderId,
    user_id: user.id,
    action: 'status_change',
    from_status: fromStatus,
    to_status: toStatus,
    metadata: { ...extra, ip_address: extra.ip }
  })

  return updated
}

module.exports = { TRANSITIONS, changeStatus }
```

---

## 3. orders.validation.js

```javascript
const Joi = require('joi')

const personalDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  middle_name: Joi.string().max(50).optional().allow(''),
  last_name: Joi.string().min(2).max(50).required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_date: Joi.date().max('now').min('1920-01-01').required(),
  birth_city: Joi.string().min(2).max(100).required(),
  birth_country: Joi.string().valid('YEMEN').default('YEMEN'),
  marital_status: Joi.string()
    .valid('single', 'married', 'divorced', 'widowed').required(),
  passport_number: Joi.string().alphanum().min(6).max(20).required(),
  passport_expiry: Joi.date().greater('now').required()
})

const spouseDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().max('now').required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_city: Joi.string().max(100).required()
}).optional()

const childSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().max('now').required(),
  gender: Joi.string().valid('male', 'female').required()
})

const addressSchema = Joi.object({
  street: Joi.string().min(3).max(200).required(),
  city: Joi.string().min(2).max(100).required(),
  district: Joi.string().max(100).optional().allow(''),
  postal_code: Joi.string().max(20).optional().allow(''),
  country: Joi.string().valid('YEMEN').default('YEMEN')
})

const contactSchema = Joi.object({
  phone: Joi.string().pattern(/^967[73]\d{8}$/),
  email: Joi.string().email().optional().allow(''),
  alt_phone: Joi.string().pattern(/^967[73]\d{8}$/).optional().allow('')
})

const createOrderSchema = Joi.object({
  personal_data: personalDataSchema.required(),
  spouse_data: spouseDataSchema.when('personal_data.marital_status', {
    is: 'married', then: Joi.required(), otherwise: Joi.optional()
  }),
  children_data: Joi.array().items(childSchema).max(20).optional(),
  address: addressSchema.required(),
  contact: contactSchema.required()
})

const updatePersonalDataSchema = Joi.object({
  personal_data: personalDataSchema.optional(),
  spouse_data: spouseDataSchema.optional(),
  children_data: Joi.array().items(childSchema).max(20).optional(),
  address: addressSchema.optional(),
  contact: contactSchema.optional()
}).min(1)

const changeStatusSchema = Joi.object({
  action: Joi.string().valid(
    'verify_payment', 'approve', 'reject_photo', 'approve_photo',
    'needs_correction', 'submit_official', 'mark_completed', 'cancel'
  ).required(),
  notes: Joi.string().max(500).optional().allow(''),
  receipt_id: Joi.string().uuid().when('action', {
    is: 'verify_payment', then: Joi.required(), otherwise: Joi.optional()
  }),
  confirmation_number: Joi.string()
    .pattern(/^2026[A-Z]{2}\d{7}$/).when('action', {
      is: 'submit_official', then: Joi.required(), otherwise: Joi.optional()
    })
})

module.exports = {
  createOrderSchema,
  updatePersonalDataSchema,
  changeStatusSchema
}
```

---

## 4. orders.model.js

```javascript
const db = require('../../database/db')

const TABLE = 'orders'

const create = async (data) => {
  const [order] = await db(TABLE).insert({
    user_id: data.user_id,
    status: 'draft',
    total_price: 1000,
    currency: 'YER'
  }).returning('*')
  return order
}

const findById = async (id) => {
  return db(TABLE)
    .leftJoin('applicant_data', 'orders.id', 'applicant_data.order_id')
    .leftJoin('payments', 'orders.id', 'payments.order_id')
    .select(
      'orders.*',
      'applicant_data.*',
      db.raw('json_build_object(\'status\', payments.status, \'method\', payments.method, \'amount\', payments.amount) as payment')
    )
    .where('orders.id', id)
    .first()
}

const findByUserId = async (userId, { page = 1, limit = 20, status } = {}) => {
  const query = db(TABLE).where({ user_id: userId })
  if (status) query.andWhere({ status })

  const total = await query.clone().count('id as count').first()
  const orders = await query
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit)

  return {
    orders,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total.count),
      total_pages: Math.ceil(parseInt(total.count) / limit)
    }
  }
}

const findAll = async ({ page = 1, limit = 20, status, search } = {}) => {
  const query = db(TABLE)
    .leftJoin('users', 'orders.user_id', 'users.id')
    .select('orders.*', 'users.phone', 'users.full_name')

  if (status) query.andWhere('orders.status', status)
  if (search) {
    query.andWhere(function () {
      this.where('users.phone', 'like', `%${search}%`)
        .orWhere('users.full_name', 'like', `%${search}%`)
        .orWhere('orders.id', 'like', `%${search}%`)
    })
  }

  const total = await query.clone().count('orders.id as count').first()
  const orders = await query
    .orderBy('orders.created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit)

  return {
    orders,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total.count),
      total_pages: Math.ceil(parseInt(total.count) / limit)
    }
  }
}

const updateStatus = async (id, status) => {
  const [order] = await db(TABLE)
    .where({ id })
    .update({ status, updated_at: db.fn.now() })
    .returning('*')
  return order
}

module.exports = { create, findById, findByUserId, findAll, updateStatus }
```

---

## 5. orders.service.js

```javascript
const orderModel = require('./orders.model')
const applicantModel = require('./orders.applicant.model')
const stateMachine = require('./orders.state-machine')
const auditLogService = require('../audit/audit.service')
const notificationService = require('../notifications/notifications.service')
const { AppError } = require('../../common/errors')
const PRICING = require('../../common/pricing')

const create = async (userId, data) => {
  const existing = await orderModel.findByUserId(userId)
  const activeOrder = existing.orders.find(
    o => !['completed', 'cancelled'].includes(o.status)
  )
  if (activeOrder) {
    throw new AppError('DUPLICATE_ENTRY',
      `لديك طلب نشط بالفعل (#${activeOrder.id})`, 409)
  }

  const order = await orderModel.create({ user_id: userId })

  await applicantModel.create({
    order_id: order.id,
    ...data.personal_data,
    spouse_data: data.spouse_data || {},
    children_data: data.children_data || [],
    ...data.address,
    ...data.contact
  })

  return order
}

const updatePersonalData = async (orderId, userId, data) => {
  const order = await orderModel.findById(orderId)
  if (!order) throw new AppError('NOT_FOUND', 'الطلب غير موجود', 404)
  if (order.user_id !== userId) {
    throw new AppError('FORBIDDEN', 'ليس لديك صلاحية', 403)
  }

  await stateMachine.changeStatus(
    orderId, order.status, 'data_entry_complete',
    { id: userId, role: 'client' }
  )

  await applicantModel.update(orderId, data)
  return orderModel.findById(orderId)
}

const getById = async (orderId, user) => {
  const order = await orderModel.findById(orderId)
  if (!order) throw new AppError('NOT_FOUND', 'الطلب غير موجود', 404)
  if (user.role === 'client' && order.user_id !== user.id) {
    throw new AppError('FORBIDDEN', 'ليس لديك صلاحية', 403)
  }
  return order
}

const list = async (user, query) => {
  if (user.role === 'client') {
    return orderModel.findByUserId(user.id, query)
  }
  return orderModel.findAll(query)
}

const changeStatus = async (orderId, user, body) => {
  const order = await orderModel.findById(orderId)
  if (!order) throw new AppError('NOT_FOUND', 'الطلب غير موجود', 404)

  const actionMap = {
    verify_payment: { from: 'payment_verification', to: 'approved' },
    approve_photo: { from: 'photo_pending', to: 'photo_accepted' },
    reject_photo: { from: 'photo_pending', to: 'photo_rejected' },
    needs_correction: { from: 'payment_verification', to: 'needs_correction' },
    submit_official: { from: 'approved', to: 'submitted' },
    mark_completed: { from: 'submitted', to: 'completed' },
    cancel: { from: order.status, to: 'cancelled' }
  }

  const transition = actionMap[body.action]
  if (!transition) {
    throw new AppError('INVALID_ACTION', 'الإجراء غير صحيح', 400)
  }

  const updated = await stateMachine.changeStatus(
    orderId, order.status, transition.to, user,
    { action: body.action, notes: body.notes, ...body }
  )

  if (body.confirmation_number) {
    await applicantModel.update(orderId, {
      confirmation_number: body.confirmation_number,
      submitted_at: new Date().toISOString(),
      submitted_by: user.id
    })
  }

  return updated
}

module.exports = { create, updatePersonalData, getById, list, changeStatus }
```

---

## 6. orders.controller.js

```javascript
const orderService = require('./orders.service')

const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.user.id, req.body)
    res.status(201).json({
      data: order,
      message: 'تم إنشاء الطلب'
    })
  } catch (err) { next(err) }
}

const list = async (req, res, next) => {
  try {
    const result = await orderService.list(req.user, req.query)
    res.json({ data: result.orders, meta: result.meta })
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id, req.user)
    res.json({ data: order })
  } catch (err) { next(err) }
}

const updatePersonalData = async (req, res, next) => {
  try {
    const order = await orderService.updatePersonalData(
      req.params.id, req.user.id, req.body
    )
    res.json({ data: order, message: 'تم تحديث البيانات' })
  } catch (err) { next(err) }
}

const changeStatus = async (req, res, next) => {
  try {
    const order = await orderService.changeStatus(
      req.params.id, req.user, req.body
    )
    res.json({ data: order, message: 'تم تغيير الحالة' })
  } catch (err) { next(err) }
}

module.exports = { create, list, getById, updatePersonalData, changeStatus }
```

---

## 7. orders.routes.js

```javascript
const router = require('express').Router()
const controller = require('./orders.controller')
const auth = require('../../common/auth.middleware')
const role = require('../../common/role.middleware')
const validate = require('../../common/validate.middleware')
const rateLimit = require('../../common/rate-limit.middleware')
const {
  createOrderSchema,
  updatePersonalDataSchema,
  changeStatusSchema
} = require('./orders.validation')

router.post('/',
  auth.required,
  rateLimit('orders_create', 10, 60),
  validate(createOrderSchema),
  controller.create
)

router.get('/',
  auth.required,
  controller.list
)

router.get('/:id',
  auth.required,
  controller.getById
)

router.patch('/:id/personal-data',
  auth.required,
  validate(updatePersonalDataSchema),
  controller.updatePersonalData
)

router.patch('/:id/status',
  auth.required,
  role('employee', 'admin'),
  validate(changeStatusSchema),
  controller.changeStatus
)

module.exports = router
```

---

## 8. تدفق البيانات الكامل

```
Request → POST /api/v1/orders
  │
  ├── Rate Limiting (10/min/user)
  ├── Auth Middleware (decodes JWT → req.user)
  ├── Validate (Joi schema → sanitized body)
  │
  ▼
Controller.create(req, res, next)
  │
  ├── try { orderService.create(userId, body) }
  │
  ▼
Service.create(userId, data)
  │
  ├── check for duplicate order
  │     └── orderModel.findByUserId(userId)
  │
  ├── create order (draft)
  │     └── orderModel.create({ user_id, status: 'draft' })
  │
  ├── create applicant data
  │     └── applicantModel.create({ order_id, ... })
  │
  ├── log audit trail
  │     └── auditLogService.log({ action: 'order_created' })
  │
  └── return order
  │
  ▼
Controller → res.status(201).json({ data: order })
```

---

*نموذج موديول كامل - يوليو 2026*
*Qor3a (قرعة)*
