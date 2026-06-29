# دليل الترميز - Coding Conventions

## Qor3a — كيف نكتب كود نظيف ومتسق

---

## 1. القواعد الذهبية

```
1️⃣ لا تكرر نفسك (DRY)
2️⃣ الـ Service فيه كل المنطق — الـ Controller لا يحتوي منطق
3️⃣ الـ Error التقطه في Controller، ليس في Service
4️⃣ كل دالة تفعل شيئاً واحداً فقط
5️⃣ التسمية تعبّر عن الوظيفة (لا اختصارات)
6️⃣ الاختبارات قبل أو مع الكود
```

---

## 2. هيكل الموديول

```
modules/{module}/
├── {module}.routes.js      # تعريف endpoints فقط
├── {module}.controller.js  # معالجة request/response
├── {module}.service.js     # منطق العمل (Business Logic)
├── {module}.model.js       # استعلامات قاعدة البيانات
└── {module}.validation.js  # Joi schemas
```

### 2.1 Routes — فقط تعريف

```javascript
// ✅ صحيح
const router = require('express').Router()
const controller = require('./orders.controller')
const auth = require('../../common/auth.middleware')
const validate = require('../../common/validate.middleware')
const { createOrderSchema } = require('./orders.validation')

router.post('/', auth.required, validate(createOrderSchema), controller.create)
router.get('/', auth.required, controller.list)
router.get('/:id', auth.required, controller.getById)
router.patch('/:id/personal-data', auth.required, controller.updatePersonalData)

module.exports = router
```

```javascript
// ❌ خطأ — لا تضع منطق هنا
router.post('/', auth.required, async (req, res) => {
  if (req.body.age < 18) return res.status(400).json(...) // ❌
  const order = await orderModel.create(req.body)          // ❌
  res.status(201).json(order)                               // ❌
})
```

### 2.2 Controller — فقط try/catch + استدعاء Service

```javascript
// ✅ صحيح
const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.user.id, req.body)
    res.status(201).json({ data: order, message: 'تم إنشاء الطلب' })
  } catch (err) {
    next(err) // يُمرر إلى error-handler
  }
}

const list = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    const result = await orderService.list(req.user, { page, limit, status })
    res.json({ data: result.orders, meta: result.meta })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, list, getById, updatePersonalData }
```

```javascript
// ❌ خطأ — منطق في الـ Controller
const create = async (req, res) => {
  if (req.body.age < 18) {                          // ❌ منطق
    return res.status(400).json({ error: 'young' }) // ❌
  }
  const status = req.body.photo ? 'photo_pending' : 'data_entry_complete' // ❌
  const order = await db('orders').insert({ ... })  // ❌ اتصال مباشر بـ DB
}
```

### 2.3 Service — كل المنطق هنا

```javascript
// ✅ صحيح
const create = async (userId, data) => {
  const existing = await orderModel.findActiveByUserId(userId)
  if (existing) {
    throw new AppError('DUPLICATE_ENTRY', 'لديك طلب نشط بالفعل', 409)
  }

  const order = await orderModel.create({
    user_id: userId,
    status: 'draft',
    total_price: PRICING.DV_LOTTERY,
    currency: 'YER'
  })

  await auditLogService.log({
    order_id: order.id,
    user_id: userId,
    action: 'order_created',
    from_status: null,
    to_status: 'draft'
  })

  await notificationService.send(userId, 'order_created', { order_id: order.id })

  return order
}

module.exports = { create, list, getById, updatePersonalData, changeStatus }
```

```javascript
// ❌ خطأ — Service لا يمسك errors (يتركها تتصاعد)
const create = async (userId, data) => {
  try { // ❌ لا تمسك error في Service
    ...
  } catch (err) {
    res.status(500).json(...) // ❌ Service لا يعرف res
  }
}
```

### 2.4 Model — فقط استعلامات

```javascript
// ✅ صحيح
const db = require('../../database/db')

const create = async (data) => {
  const [order] = await db('orders').insert(data).returning('*')
  return order
}

const findById = async (id) => {
  return db('orders').where({ id }).first()
}

const findByUserId = async (userId, { page = 1, limit = 20, status } = {}) => {
  const query = db('orders').where({ user_id: userId })

  if (status) query.andWhere({ status })

  const total = await query.clone().count('id as count').first()
  const orders = await query
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit)

  return {
    orders,
    meta: { page, limit, total: parseInt(total.count) }
  }
}

module.exports = { create, findById, findByUserId }
```

```javascript
// ❌ خطأ — منطق في الـ Model
const create = async (data) => {
  if (data.age < 18) throw new Error('young') // ❌ منطق — الـ Service مسؤول
  const [order] = await db('orders').insert(data).returning('*')
  await auditLogService.log(...) // ❌ لا — audit في Service
  return order
}
```

---

## 3. التسمية (Naming Conventions)

### 3.1 الملفات

```
✅ orders.routes.js        ❌ orderRoutes.js
✅ orders.controller.js    ❌ orderController.js
✅ orders.service.js       ❌ orderService.js
✅ orders.model.js         ❌ orderModel.js
✅ orders.validation.js    ❌ orderValidation.js
```

### 3.2 المتغيرات والدوال

```javascript
// ✅ camelCase للمتغيرات والدوال
const order = await orderService.create(userId, data)
const activeOrders = await orderModel.findByStatus('active')

// ✅ PascalCase للـ Classes
class AppError extends Error { ... }

// ✅ UPPER_SNAKE_CASE للثوابت
const PRICING = { DV_LOTTERY: 1000, TRANSLATION: 2000 }
const STATUS = { DRAFT: 'draft', COMPLETED: 'completed' }

// ✅ أسماء دوال تعبّر عن الوظيفة
const createOrder = async (...) => ...
const verifyPayment = async (...) => ...
const findOrdersByUserId = async (...) => ...
```

```javascript
// ❌ اختصارات غير واضحة
const getOrd = async (id) => ...           // ord = order?
const chkPay = async (id) => ...           // chk = check?
const dlt = async (id) => ...              // dlt = delete?
```

### 3.3 قاعدة البيانات

```javascript
// ✅ snake_case للأعمدة
// user_id, order_id, created_at, is_active
await db('orders').where({ user_id: userId })

// ❌ camelCase في DB
// userId, orderId, createdAt ❌
```

---

## 4. معالجة الأخطاء (Error Handling)

### 4.1 AppError Class

```javascript
// common/errors.js
class AppError extends Error {
  constructor(code, message, statusCode = 400, details = []) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
  }
}

const ERRORS = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  DUPLICATE_ENTRY: { code: 'DUPLICATE_ENTRY', status: 409 },
  INVALID_STATE: { code: 'INVALID_STATE', status: 409 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429 },
  PAYMENT_REQUIRED: { code: 'PAYMENT_REQUIRED', status: 402 },
}

module.exports = { AppError, ERRORS }
```

### 4.2 Error Handler Middleware

```javascript
// common/error-handler.js
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  })

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    })
  }

  // خطأ غير متوقع
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'حدث خطأ غير متوقع',
      details: []
    }
  })
}

module.exports = errorHandler
```

### 4.3 كيف نستخدمها في الـ Service

```javascript
// ✅ صحيح
const getById = async (orderId, user) => {
  const order = await orderModel.findById(orderId)
  if (!order) throw new AppError('NOT_FOUND', 'الطلب غير موجود', 404)

  // client يرى طلبه فقط
  const { role, id } = user
  if (role === 'client' && order.user_id !== id) {
    throw new AppError('FORBIDDEN', 'ليس لديك صلاحية', 403)
  }

  return order
}
```

---

## 5. الـ State Machine Pattern

### 5.1 التعريف

```javascript
// modules/orders/state-machine.js
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
  draft: { data_entry_complete: (order, data) => validatePersonalData(data) },
  payment_verification: { approved: (order) => order.payment?.status === 'verified' },
  approved: { submitted: (order) => !!order.applicant?.confirmation_number },
  approved: { cancelled: (order, user) => user.role === 'admin' }
}

const changeStatus = async (orderId, fromStatus, toStatus, user, extra = {}) => {
  // 1. تحقق من وجود الانتقال
  const allowed = TRANSITIONS[fromStatus]
  if (!allowed || !allowed.includes(toStatus)) {
    throw new AppError('INVALID_STATE',
      `لا يمكن الانتقال من ${fromStatus} إلى ${toStatus}`, 409)
  }

  // 2. تحقق من الـ Guard
  const guard = GUARDS[fromStatus]?.[toStatus]
  if (guard) {
    const order = await orderModel.findById(orderId)
    const passed = await guard(order, user, extra)
    if (!passed) {
      throw new AppError('INVALID_STATE', 'الشرط لم يتحقق', 409)
    }
  }

  // 3. تنفيذ الانتقال
  const updated = await orderModel.updateStatus(orderId, toStatus)

  // 4. تسجيل في audit log
  await auditLogService.log({
    order_id: orderId,
    user_id: user.id,
    action: 'status_change',
    from_status: fromStatus,
    to_status: toStatus,
    metadata: extra
  })

  // 5. إرسال إشعار
  await notificationService.sendStatusUpdate(orderId, toStatus)

  return updated
}

module.exports = { TRANSITIONS, changeStatus }
```

### 5.2 الاستخدام في الـ Service

```javascript
const verifyPayment = async (orderId, employeeId, data) => {
  const order = await orderModel.findById(orderId)
  if (!order) throw new AppError('NOT_FOUND', 'الطلب غير موجود', 404)

  if (data.verified) {
    await paymentModel.updateStatus(data.receiptId, 'verified', employeeId)
    return stateMachine.changeStatus(orderId, 'payment_verification', 'approved', employee)
  } else {
    await paymentModel.updateStatus(data.receiptId, 'rejected', employeeId, data.reason)
    return stateMachine.changeStatus(orderId, 'payment_verification', 'needs_correction', employee)
  }
}
```

---

## 6. تنظيم الملفات (Imports Order)

```javascript
// الترتيب الصحيح للـ imports:
// 1. المكتبات الخارجية
const express = require('express')
const Joi = require('joi')

// 2. الموديولات الداخلية
const db = require('../../database/db')
const auth = require('../../common/auth.middleware')

// 3. الملفات المحلية
const stateMachine = require('./orders.state-machine')
const orderModel = require('./orders.model')
```

---

## 7. الـ Async/Await

```javascript
// ✅ صحيح — async/await مع try/catch
const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id, req.user)
    res.json({ data: order })
  } catch (err) {
    next(err)
  }
}

// ❌ خطأ — mix of promises
const getById = (req, res) => {
  orderService.getById(req.params.id, req.user)
    .then(order => res.json(order))          // ❌
    .catch(err => res.status(500).json(err)) // ❌
}

// ❌ خطأ — بدون try/catch
const getById = async (req, res) => {
  const order = await orderService.getById(...) // إذا فشلت، يموت السيرفر
  res.json(order)
}
```

---

*دليل الترميز - يوليو 2026*
*Qor3a (قرعة)*
