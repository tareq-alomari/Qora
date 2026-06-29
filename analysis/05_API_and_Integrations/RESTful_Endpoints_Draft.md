# مواصفات API كاملة - OpenAPI Contracts

## Qor3a — كل الـ Endpoints بالتفصيل

---

## 1. Auth Module

### POST /api/v1/auth/register

```
إنشاء حساب جديد.

Request Body:
{
  "phone": "9677XXXXXXXX",    // required, string, 10-15 digits
  "full_name": "أحمد محمد"    // optional, string, 2-100 chars
}

Response 201:
{
  "data": {
    "user_id": "uuid",
    "phone": "9677XXXXXXXX",
    "otp_sent": true,
    "otp_expires_in": 300
  },
  "message": "تم إرسال رمز التحقق"
}

Response 400:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رقم الهاتف مطلوب",
    "details": [{ "field": "phone", "message": "..." }]
  }
}

Response 409:
{
  "error": {
    "code": "PHONE_EXISTS",
    "message": "هذا الرقم مسجل مسبقاً",
    "details": []
  }
}
```

### POST /api/v1/auth/verify-otp

```
تأكيد رمز التحقق.

Request Body:
{
  "phone": "9677XXXXXXXX",     // required
  "otp": "123456"              // required, string, 6 digits
}

Response 200:
{
  "data": {
    "user_id": "uuid",
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 86400
  },
  "message": "تم تسجيل الدخول بنجاح"
}

Response 400:
{
  "error": {
    "code": "INVALID_OTP",
    "message": "رمز التحقق خطأ",
    "details": []
  }
}

Response 410:
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "انتهت صلاحية الرمز، يرجى طلب رمز جديد",
    "details": []
  }
}
```

### POST /api/v1/auth/login

```
تسجيل الدخول برقم الهاتف (يرسل OTP).

Request Body:
{
  "phone": "9677XXXXXXXX"     // required
}

Response 200:
{
  "data": {
    "otp_sent": true,
    "otp_expires_in": 300
  },
  "message": "تم إرسال رمز التحقق"
}

Response 404:
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "هذا الرقم غير مسجل",
    "details": []
  }
}
```

### POST /api/v1/auth/refresh

```
تجديد Access Token باستخدام Refresh Token.

Request Headers:
  Authorization: Bearer <refresh_token>

Response 200:
{
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 86400
  }
}

Response 401:
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "انتهت صلاحية الجلسة",
    "details": []
  }
}
```

---

## 2. Orders Module

### POST /api/v1/orders

```
إنشاء طلب جديد.

Auth: required (client)
Rate Limit: 10/min/user

Request Body:
{
  "personal_data": {
    "first_name": "أحمد",              // required, 2-50 chars
    "middle_name": "محمد",             // optional
    "last_name": "علي",                // required, 2-50 chars
    "gender": "male",                  // required, enum: male/female
    "birth_date": "1995-03-15",        // required, date, age 18+
    "birth_city": "صنعاء",             // required, 2-100 chars
    "birth_country": "YEMEN",          // required, ISO country code
    "country_of_eligibility": "YEMEN", // required, ISO country code
    "marital_status": "single",        // required, enum
    "passport_number": "012345678",    // required, alphanumeric
    "passport_expiry": "2030-01-01"    // required, date, future
  },
  "spouse_data": {                     // optional (if married)
    "first_name": "فاطمة",
    "last_name": "أحمد",
    "birth_date": "1998-07-20",
    "gender": "female",
    "birth_city": "صنعاء",
    "photo": null                      // optional, will upload later
  },
  "children_data": [                   // optional
    {
      "first_name": "عمر",
      "last_name": "أحمد",
      "birth_date": "2020-05-10",
      "gender": "male"
    }
  ],
  "address": {
    "street": "شارع الستين",           // required
    "city": "صنعاء",                   // required
    "district": "الثورة",              // optional
    "postal_code": null,               // optional
    "country": "YEMEN"                 // required
  },
  "contact": {
    "phone": "9677XXXXXXXX",           // required, matches auth
    "email": "ahmed@example.com",      // optional, valid email
    "alt_phone": null                  // optional
  },
  "photo_path": null                   // optional, will upload
}

Response 201:
{
  "data": {
    "order_id": "uuid",
    "order_number": "QR-2026-0001",
    "status": "draft",
    "created_at": "2026-09-15T10:30:00Z",
    "updated_at": "2026-09-15T10:30:00Z"
  },
  "message": "تم إنشاء الطلب"
}

Response 409:
{
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "لديك طلب نشط بالفعل",
    "details": []
  }
}
```

### GET /api/v1/orders

```
قائمة طلبات المستخدم (أو كل الطلبات للموظف).

Auth: required (client/employee)
Query Params:
  ?status=photo_pending          // filter by status
  &page=1                        // default: 1
  &limit=20                      // default: 20, max: 100
  &search=أحمد                   // search by name/phone/order#
  &sort=created_at               // default: created_at
  &order=desc                    // default: desc

Response 200 (client):
{
  "data": [
    {
      "order_id": "uuid",
      "order_number": "QR-2026-0001",
      "status": "photo_pending",
      "created_at": "2026-09-15T10:30:00Z",
      "updated_at": "2026-09-15T10:35:00Z",
      "personal_data": {
        "first_name": "أحمد",
        "last_name": "علي"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}

Response 200 (employee):
{
  "data": [
    {
      "order_id": "uuid",
      "order_number": "QR-2026-0001",
      "status": "photo_pending",
      "client": {
        "user_id": "uuid",
        "phone": "9677XXXXXXX"
      },
      "payment": {
        "amount": 1000,
        "method": "jeeb",
        "status": "pending"
      },
      "created_at": "2026-09-15T10:30:00Z"
    }
  ],
  "meta": { ... }
}
```

### GET /api/v1/orders/:id

```
عرض طلب محدد.

Auth: required (client → طلبه فقط / employee → أي طلب)

Response 200:
{
  "data": {
    "order_id": "uuid",
    "order_number": "QR-2026-0001",
    "status": "photo_pending",
    "personal_data": { ... },
    "spouse_data": { ... },
    "children_data": [ ... ],
    "address": { ... },
    "contact": { ... },
    "photo": {
      "path": "orders/uuid/photo.jpg",
      "url": "/storage/orders/uuid/photo.jpg",
      "ai_result": "accepted",
      "ai_confidence": 0.95
    },
    "payment": {
      "receipt_path": null,
      "amount": 1000,
      "method": null,
      "status": "pending"
    },
    "submission": {
      "confirmation_number": null,
      "submitted_at": null,
      "result": null
    },
    "audit_log": [
      {
        "action": "status_change",
        "from_status": "draft",
        "to_status": "data_entry_complete",
        "by": "client",
        "at": "2026-09-15T10:35:00Z"
      }
    ],
    "created_at": "2026-09-15T10:30:00Z",
    "updated_at": "2026-09-15T10:35:00Z"
  }
}

Response 404:
{
  "error": {
    "code": "NOT_FOUND",
    "message": "الطلب غير موجود",
    "details": []
  }
}
```

### PATCH /api/v1/orders/:id/personal-data

```
تحديث البيانات الشخصية (فقط في حالة draft/needs_correction).

Auth: required (client — طلبه فقط)

Request Body:
{
  "personal_data": { ... },    // optional fields to update
  "spouse_data": { ... },
  "children_data": [ ... ],
  "address": { ... }
}

Response 200:
{
  "data": {
    "order_id": "uuid",
    "status": "data_entry_complete",
    "personal_data": { ... },
    "updated_at": "2026-09-15T11:00:00Z"
  },
  "message": "تم تحديث البيانات"
}

Response 409:
{
  "error": {
    "code": "INVALID_STATE",
    "message": "لا يمكن تعديل البيانات في الحالة الحالية",
    "details": []
  }
}
```

### POST /api/v1/orders/:id/photo

```
رفع الصورة الشخصية.

Auth: required (client)
Rate Limit: 5/min/user

Request: multipart/form-data
  photo: file (JPEG/PNG, max 5MB, min 600×600px)

Response 200:
{
  "data": {
    "order_id": "uuid",
    "photo_path": "orders/uuid/photo.jpg",
    "status": "photo_pending",
    "ai_check": {
      "status": "processing",
      "estimated_time": 3
    }
  },
  "message": "تم رفع الصورة، جاري الفحص"
}

Response 400:
{
  "error": {
    "code": "PHOTO_TOO_LARGE",
    "message": "حجم الصورة يجب أن يكون أقل من 5MB",
    "details": []
  }
}
```

### GET /api/v1/orders/:id/photo/status

```
الاستعلام عن نتيجة فحص الصورة من AI.

Auth: required (client)

Response 200:
{
  "data": {
    "status": "accepted",          // processing | accepted | rejected
    "confidence": 0.95,
    "reasons": [],                 // filled if rejected
    "checked_at": "2026-09-15T10:35:05Z"
  }
}

Or (rejected):
{
  "data": {
    "status": "rejected",
    "confidence": 0.23,
    "reasons": [
      "background_not_white",
      "lighting_poor"
    ],
    "suggestions": [
      "استخدم خلفية بيضاء بالكامل",
      "تأكد من إضاءة متساوية على الوجه"
    ]
  }
}
```

### POST /api/v1/orders/:id/payment/receipt

```
رفع إيصال الدفع.

Auth: required (client)

Request: multipart/form-data
  receipt: file (JPEG/PNG, max 5MB)
  payment_method: "jeeb"             // enum
  amount: 1000                       // must be 1000

Response 201:
{
  "data": {
    "receipt_id": "uuid",
    "payment_method": "jeeb",
    "amount": 1000,
    "status": "pending_verification",
    "order_status": "payment_pending"
  },
  "message": "تم رفع الإيصال، في انتظار التأكيد"
}
```

### PATCH /api/v1/orders/:id/status

```
تغيير حالة الطلب (للموظف/الأدمن فقط).

Auth: required (employee/admin)

Request Body:
{
  "action": "verify_payment",         // required, see below
  "notes": "تم التأكيد",              // optional
  "receipt_id": "uuid"                // required for verify_payment
}

Actions:
├── verify_payment:    payment_pending → payment_verification
├── approve:           payment_verification → approved
├── reject_photo:      photo_pending → photo_rejected
├── approve_photo:     photo_pending → photo_accepted
├── needs_correction:  any → needs_correction
├── submit_official:   approved → submitted (مع confirmation#)
├── mark_completed:    submitted → completed
├── cancel:            any → cancelled

Response 200:
{
  "data": {
    "order_id": "uuid",
    "status": "payment_verification",
    "submission": { ... },
    "updated_at": "2026-09-15T14:00:00Z"
  },
  "message": "تم تأكيد الدفع"
}

Response 409:
{
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "لا يمكن الانتقال من [photo_pending] إلى [approved]",
    "details": []
  }
}

Response 403:
{
  "error": {
    "code": "FORBIDDEN",
    "message": "ليس لديك صلاحية",
    "details": []
  }
}
```

---

## 3. Payments Module

### GET /api/v1/payments/methods

```
قائمة طرق الدفع المتاحة.

Auth: optional (public)

Response 200:
{
  "data": [
    {
      "id": "kuraimi",
      "name": "كريمي",
      "account_number": "0123456789",
      "account_name": "Qor3a Yemen",
      "is_active": true,
      "order": 1
    },
    {
      "id": "jeeb",
      "name": "جيب",
      "account_number": "9876543210",
      "account_name": "Qor3a Yemen",
      "is_active": true,
      "order": 2
    },
    {
      "id": "one_cash",
      "name": "ون كاش",
      "account_number": "5555555555",
      "account_name": "Qor3a",
      "is_active": true,
      "order": 3
    },
    {
      "id": "mobile_money",
      "name": "موبايل موني",
      "account_number": "7777777777",
      "account_name": "Qor3a",
      "is_active": false,
      "order": 4
    }
  ]
}
```

### GET /api/v1/payments/receipts

```
قائمة الإيصالات (للموظف/الأدمن).

Auth: required (employee/admin)
Query Params:
  ?status=pending_verification
  &page=1
  &limit=20

Response 200:
{
  "data": [
    {
      "receipt_id": "uuid",
      "order_id": "uuid",
      "order_number": "QR-2026-0001",
      "client_phone": "9677XXXXXXX",
      "method": "jeeb",
      "amount": 1000,
      "status": "pending_verification",
      "receipt_url": "/storage/receipts/uuid.jpg",
      "created_at": "2026-09-15T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

## 4. Admin Module

### GET /api/v1/admin/stats

```
إحصائيات عامة.

Auth: required (admin)

Response 200:
{
  "data": {
    "total_orders": 500,
    "orders_today": 12,
    "orders_this_week": 85,
    "orders_this_month": 200,
    "by_status": {
      "draft": 5,
      "photo_pending": 15,
      "payment_pending": 10,
      "completed": 400,
      "cancelled": 10
    },
    "revenue_today": 12000,
    "revenue_this_week": 85000,
    "revenue_total": 500000,
    "by_payment_method": {
      "kuraimi": { "count": 200, "revenue": 200000 },
      "jeeb": { "count": 160, "revenue": 160000 },
      "one_cash": { "count": 65, "revenue": 65000 },
      "mobile_money": { "count": 25, "revenue": 25000 }
    },
    "ai_stats": {
      "total_checked": 500,
      "accepted": 420,
      "rejected": 80,
      "accuracy": 0.96,
      "avg_time_ms": 2300
    }
  }
}
```

### GET /api/v1/admin/users

```
قائمة المستخدمين.

Auth: required (admin)
Query Params:
  ?role=employee
  &search=أحمد
  &page=1
  &limit=20

Response 200:
{
  "data": [
    {
      "user_id": "uuid",
      "phone": "9677XXXXXXX",
      "full_name": "أحمد محمد",
      "role": "employee",
      "orders_count": 45,
      "status": "active",
      "created_at": "2026-08-01T00:00:00Z",
      "last_login": "2026-09-15T08:30:00Z"
    }
  ],
  "meta": { ... }
}
```

### PATCH /api/v1/admin/users/:id

```
تحديث مستخدم (تغيير الدور، تفعيل/تعطيل).

Auth: required (admin)

Request Body:
{
  "role": "employee",          // client | employee | admin
  "status": "active"           // active | suspended
}

Response 200:
{
  "data": {
    "user_id": "uuid",
    "role": "employee",
    "status": "active",
    "updated_at": "2026-09-15T15:00:00Z"
  },
  "message": "تم تحديث المستخدم"
}
```

### GET /api/v1/admin/settings

```
الإعدادات العامة.

Auth: required (admin)

Response 200:
{
  "data": {
    "pricing": {
      "lottery_registration": 1000,
      "result_checking": 0,
      "additional_services": {
        "translation_per_page": 2000,
        "consultation_per_hour": 3000
      }
    },
    "payment_accounts": [
      {
        "method": "jeeb",
        "account_number": "9876543210",
        "account_name": "Qor3a Yemen",
        "is_active": true
      }
    ],
    "season": {
      "is_open": true,
      "opens_at": "2026-09-01T08:00:00Z",
      "closes_at": "2026-10-31T23:59:59Z"
    },
    "rate_limits": {
      "login_per_ip_per_min": 5,
      "register_per_ip_per_hour": 3,
      "orders_per_user_per_min": 10
    }
  }
}
```

### PATCH /api/v1/admin/settings

```
تحديث الإعدادات.

Auth: required (admin)

Request Body:
{
  "pricing": { "lottery_registration": 1200 },
  "payment_accounts": [
    { "method": "jeeb", "account_number": "NEW_NUMBER", ... }
  ],
  "season": {
    "is_open": false,
    "closes_at": "2026-10-31T23:59:59Z"
  }
}

Response 200: { "data": { ... }, "message": "تم تحديث الإعدادات" }
```

---

## 5. مشترك: Health Check

### GET /api/v1/health

```
فحص صحة الخدمة.

Auth: none (public)

Response 200:
{
  "status": "ok",
  "timestamp": "2026-09-15T10:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "minio": "ok",
    "ai_service": "ok"
  }
}

Response 503:
{
  "status": "degraded",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "minio": "ok",
    "ai_service": "down"
  }
}
```

---

*مواصفات API - يوليو 2026*
*قرعة (Qor3a) - منصة التسجيل في DV Lottery*
