# Joi Validation Schemas — مخططات التحقق

## Qor3a — كل Schema لكل Endpoint

---

## 1. Auth Schemas

### 1.1 Register

```javascript
const Joi = require('joi')

const registerSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^967[73]\d{8}$/)  // 9677XXXXXXXX أو 9673XXXXXXXX
    .required()
    .messages({
      'string.pattern.base': 'رقم الهاتف يجب أن يكون يمنياً (967XXXXXXXXX)',
      'any.required': 'رقم الهاتف مطلوب'
    }),

  full_name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'الاسم يجب أن يكون أكثر من حرفين',
      'string.max': 'الاسم يجب أن يكون أقل من 100 حرف'
    })
})

// مثال استخدام:
// POST /api/v1/auth/register
// { "phone": "967712345678", "full_name": "أحمد محمد" }
```

### 1.2 Verify OTP

```javascript
const verifyOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^967[73]\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح',
      'any.required': 'رقم الهاتف مطلوب'
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'رمز التحقق يجب أن يكون 6 أرقام',
      'string.pattern.base': 'رمز التحقق أرقام فقط',
      'any.required': 'رمز التحقق مطلوب'
    })
})
```

### 1.3 Login

```javascript
const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^967[73]\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح',
      'any.required': 'رقم الهاتف مطلوب'
    })
})
```

---

## 2. Orders Schemas

### 2.1 Create Order

```javascript
const personalDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'الاسم الأول يجب أن يكون أكثر من حرفين',
    'any.required': 'الاسم الأول مطلوب'
  }),
  middle_name: Joi.string().max(50).optional().allow(''),
  last_name: Joi.string().min(2).max(50).required(),
  gender: Joi.string().valid('male', 'female').required(),
  birth_date: Joi.date().max('now').min('1920-01-01').required(),
  birth_city: Joi.string().min(2).max(100).required(),
  birth_country: Joi.string().valid('YEMEN').default('YEMEN'),
  country_of_eligibility: Joi.string().valid('YEMEN').default('YEMEN'),
  marital_status: Joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
  passport_number: Joi.string().alphanum().min(6).max(20).required(),
  passport_expiry: Joi.date().greater('now').required()
})

const spouseDataSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).when('$marital_status', {
    is: 'married', then: Joi.required(), otherwise: Joi.optional()
  }),
  last_name: Joi.string().min(2).max(50),
  birth_date: Joi.date().max('now'),
  gender: Joi.string().valid('male', 'female'),
  birth_city: Joi.string().max(100),
  photo: Joi.any().optional()
})

const childSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  birth_date: Joi.date().max('now').required(),
  gender: Joi.string().valid('male', 'female').required()
})

const createOrderSchema = Joi.object({
  personal_data: personalDataSchema.required(),
  spouse_data: spouseDataSchema.optional(),
  children_data: Joi.array().items(childSchema).max(20).optional(),
  address: Joi.object({
    street: Joi.string().min(3).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    district: Joi.string().max(100).optional().allow(''),
    postal_code: Joi.string().max(20).optional().allow(''),
    country: Joi.string().valid('YEMEN').default('YEMEN')
  }).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967[73]\d{8}$/).required(),
    email: Joi.string().email().optional().allow(''),
    alt_phone: Joi.string().pattern(/^967[73]\d{8}$/).optional().allow('')
  }).required()
})
```

### 2.2 Update Personal Data (PATCH)

```javascript
const updatePersonalDataSchema = Joi.object({
  personal_data: personalDataSchema.optional(),
  spouse_data: spouseDataSchema.optional(),
  children_data: Joi.array().items(childSchema).max(20).optional(),
  address: Joi.object({
    street: Joi.string().min(3).max(200),
    city: Joi.string().min(2).max(100),
    district: Joi.string().max(100).optional().allow(''),
    postal_code: Joi.string().max(20).optional().allow(''),
    country: Joi.string().valid('YEMEN')
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^967[73]\d{8}$/),
    email: Joi.string().email().optional().allow(''),
    alt_phone: Joi.string().pattern(/^967[73]\d{8}$/).optional().allow('')
  }).optional()
}).min(1).messages({
  'object.min': 'يجب تحديث حقل واحد على الأقل'
})

// ملاحظة: هذا الـ endpoint يستخدم للـ auto-save في الـ 8-Step Wizard.
// العميل قد يرسل حقل واحد فقط في كل خطوة.
```

### 2.3 Change Status (Employee)

```javascript
const changeStatusSchema = Joi.object({
  action: Joi.string().valid(
    'verify_payment',
    'approve',
    'reject_photo',
    'approve_photo',
    'needs_correction',
    'submit_official',
    'mark_completed',
    'cancel'
  ).required().messages({
    'any.only': 'الإجراء غير صحيح',
    'any.required': 'الإجراء مطلوب'
  }),

  notes: Joi.string().max(500).optional().allow(''),

  receipt_id: Joi.string().uuid().when('action', {
    is: 'verify_payment',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  confirmation_number: Joi.string()
    .pattern(/^2026[A-Z]{2}\d{7}$/)  // مثال: 2026AB1234567
    .when('action', {
      is: 'submit_official',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
}).required()
```

---

## 3. Payments Schemas

### 3.1 Upload Receipt

```javascript
const uploadReceiptSchema = Joi.object({
  payment_method: Joi.string()
    .valid('kuraimi', 'jeeb', 'one_cash', 'mobile_money')
    .required()
    .messages({
      'any.only': 'طريقة الدفع غير مدعومة',
      'any.required': 'طريقة الدفع مطلوبة'
    }),

  amount: Joi.number()
    .valid(1000)
    .required()
    .messages({
      'any.only': 'المبلغ يجب أن يكون 1,000 ريال',
      'any.required': 'المبلغ مطلوب'
    })
})

// ملاحظة: الملف (صورة الإيصال) يتم التحقق منه عبر multer middleware
// قبل الوصول إلى Joi validation.
```

### 3.2 Verify Receipt (Employee)

```javascript
const verifyReceiptSchema = Joi.object({
  verified: Joi.boolean().required(),
  reason: Joi.string().max(500).when('verified', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional().allow('')
  })
})
```

---

## 4. Admin Schemas

### 4.1 Update User

```javascript
const updateUserSchema = Joi.object({
  role: Joi.string().valid('client', 'employee', 'admin')
    .optional(),

  status: Joi.string().valid('active', 'suspended')
    .optional()
}).min(1)
```

### 4.2 Update Settings

```javascript
const updateSettingsSchema = Joi.object({
  pricing: Joi.object({
    lottery_registration: Joi.number().min(500).max(5000)
      .optional(),
    result_checking: Joi.number().min(0).optional(),
    additional_services: Joi.object({
      translation_per_page: Joi.number().min(0),
      consultation_per_hour: Joi.number().min(0)
    }).optional()
  }).optional(),

  payment_accounts: Joi.array().items(Joi.object({
    method: Joi.string().valid('kuraimi', 'jeeb', 'one_cash', 'mobile_money'),
    account_number: Joi.string().min(5).max(50),
    account_name: Joi.string().min(2).max(100),
    is_active: Joi.boolean()
  })).optional(),

  season: Joi.object({
    is_open: Joi.boolean().optional(),
    opens_at: Joi.date().optional(),
    closes_at: Joi.date().greater(Joi.ref('opens_at')).optional()
  }).optional()
}).min(1)
```

---

## 5. Query Parameters Schemas

### 5.1 Pagination

```javascript
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('created_at', 'updated_at', 'status', 'amount')
    .default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc')
})
```

### 5.2 Orders List Filters

```javascript
const orderListQuerySchema = Joi.object({
  status: Joi.string().valid(
    'draft', 'data_entry_complete', 'photo_pending',
    'photo_rejected', 'photo_accepted', 'payment_pending',
    'payment_verification', 'needs_correction', 'approved',
    'submitted', 'completed', 'cancelled'
  ).optional(),

  search: Joi.string().max(100).optional(),

  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
})
```

---

## 6. استخدام الـ Schemas (Middleware)

```javascript
// common/validate.middleware.js
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,       // أرجع كل الأخطاء، ليس أول خطأ فقط
      stripUnknown: true,      // احذف الحقول غير المعروفة
      allowUnknown: false      // لا تسمح بحقول غير معرفة
    })

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'بيانات غير صحيحة',
          details
        }
      })
    }

    req[source] = value  // استخدم البيانات المنظفة
    next()
  }
}

module.exports = validate
```

### مثال الاستخدام في الـ Routes:

```javascript
const validate = require('../../common/validate.middleware')
const { createOrderSchema } = require('./orders.validation')

router.post('/',
  auth.required,
  validate(createOrderSchema),      // ← تحقق من الـ body
  controller.create
)

router.get('/',
  auth.required,
  validate(orderListQuerySchema, 'query'),  // ← تحقق من الـ query params
  controller.list
)
```

---

*Joi Validation Schemas - يوليو 2026*
*Qor3a (قرعة)*
