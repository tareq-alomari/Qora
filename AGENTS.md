# AGENTS.md - تعليمات مساعدي الذكاء الاصطناعي
# AI Agents Instructions - Qor3a (قرعة)

---

## 1. هيكل المشروع

```
qor3a/
├── analysis/                 # تحليل النظام (مكتمل - 9 أقسام معيارية)
│   ├── 01_Business_and_Vision/       # نموذج العمل والجدوى
│   ├── 02_Requirements_Engineering/  # SRS - المتطلبات
│   ├── 03_System_Architecture/      # معمارية النظام
│   ├── 04_Database_Design/          # تصميم قواعد البيانات
│   ├── 05_API_and_Integrations/     # الواجهات والتكامل
│   ├── 06_UI_UX_Design/            # تجربة المستخدم
│   ├── 07_DevOps_and_Deployment/    # العمليات والنشر
│   ├── 08_Security_and_Risks/       # الأمان والمخاطر
│   └── 09_Testing_and_QA/          # الاختبار والجودة
│
├── backend/
│   ├── api/                  # 🎯 [Active] Node.js + Express (Modular Monolith)
│   │   ├── src/
│   │   │   ├── common/       # Middleware مشترك (auth, error, logger, validator)
│   │   │   ├── database/     # Knex migrations, schema, db.js
│   │   │   ├── modules/      # 🧩 كل موديول = مجلد (auth, orders, payments...)
│   │   │   │   ├── {module}/
│   │   │   │   │   ├── {module}.routes.js     # تعريف endpoints
│   │   │   │   │   ├── {module}.controller.js # معالجة request/response
│   │   │   │   │   ├── {module}.service.js    # منطق العمل (Business Logic)
│   │   │   │   │   └── {module}.model.js      # استعلامات قاعدة البيانات
│   │   │   └── index.js      # نقطة الدخول
│   │   ├── tests/            # اختبارات Jest
│   │   ├── package.json
│   │   └── knexfile.js
│   │
│   ├── ai/                   # 🎯 [Pending] Python + FastAPI (Photo Validation)
│   │   └── ...
│   │
│   └── headless/             # 🎯 [Pending] Node.js + Puppeteer (Automation)
│       └── ...
│
├── frontend/                 # 🎯 [Pending] React + Vite + Tailwind + Zustand
├── infra/                    # Docker, Terraform, K8s
├── docs/                     # توثيق
├── scripts/                  # سكريبتات مساعدة
│
├── README.md
├── AGENTS.md                 # 👈 هذا الملف
└── .env.example
```

---

## 2. القواعد الأساسية (Golden Rules)

### 🔴 القاعدة الذهبية: الصورة الشخصية
> **ممنوع منعاً باتاً تعديل أي بكسل في الصورة الأصلية أو استبدال الخلفية.**
> - وزارة الخارجية الأمريكية ترفض أي صورة معدلة رقمياً (Digitally Altered/Background Replaced).
> - دور AI هو **التحقق فقط (Validation)** : هل الخلفية بيضاء طبيعياً؟ هل الوجه في المنتصف؟ هل الإضاءة صحيحة؟
> - أي كود يحاول تعديل الصورة (cropping, background removal, color adjust) **مرفوض قطعياً**.

### 🟡 القاعدة الثانية: الدفع (إيداع في حساباتنا - لا API)
> - **النموذج**: العميل يحوّل المبلغ إلى حسابات قرعة في (كريمي، جيب، ون كاش، موبايل موني).
> - **لا يوجد API للدفع** - العميل يرفع صورة الإشعار، موظف يتأكد يدوياً ويؤكد.
> - عرض رقم حساب قرعة حسب الطريقة التي اختارها العميل.
> - المرحلة الثانية (مستقبلاً): OCR لاستخراج رقم الحوالة من الصورة لتقليل العمل اليدوي.

### 🟡 القاعدة الثالثة: CAPTCHA
> - نظام الفحص الآلي (Headless Browser) سيواجه CAPTCHA في الموقع الرسمي.
> - استراتيجية: 2Captcha API أولاً → طابور يدوي احتياطي → Proxy Rotation.
> - لا تتجاهل CAPTCHA أو تحاول bypass غير قانوني.

### 🟢 القاعدة الرابعة: اللغة
> - **Code**: بالإنجليزية (متغيرات، دوال، ملفات).
> - **Comments/Docs**: بالعربية والإنجليزية.
> - **User-facing strings**: بالعربية (مع دعم i18n مستقبلاً).

### 🟢 القاعدة الخامسة: لا تكرار (DRY)
> - كل قطعة منطق تكتب مرة واحدة فقط.
> - الـ common middleware لا ينسخ عبر الموديولات.
> - State Machine transitions تعرّف في مكان واحد.

---

## 3. معمارية الكود (Code Architecture)

### 3.1 Pattern: Modular Monolith with Layered Modules

كل موديول يتبع هيكل **3 طبقات صارم**:

```
modules/{module}/
├── {module}.routes.js       # 🚪 الطبقة 1: Routes
├── {module}.controller.js   # 🎯 الطبقة 2: Controller
├── {module}.service.js      # 🧠 الطبقة 3: Service (Business Logic)
└── {module}.model.js        # 🗄️ الطبقة 4: Model (Data Access)
```

#### قواعد التدفق
```
Request → Router → Middleware (auth, validation)
         → Controller (req/res handling)
         → Service (business logic, state machine)
         → Model (database queries)
         → Response
```

- **Router**: فقط يعرّف المسارات ويربطها بالـ Controller.
- **Controller**: لا يحتوي منطق عمل - فقط `try/catch`، استدعاء Service، وإرجاع Response.
- **Service**: **هنا كل المنطق** - State Machine transitions، التحقق من الصلاحيات، التنسيق بين الموديولات.
- **Model**: استعلامات Knex/base SQL فقط - لا منطق عمل.

#### ✅ صحيح
```javascript
// controller
const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.user.id, req.body)
    res.status(201).json(order)
  } catch (err) { next(err) }
}
```

#### ❌ خطأ - لا تضع منطق العمل في الـ Controller
```javascript
// controller - ممنوع ❌
const create = async (req, res) => {
  if (req.body.age < 18) return res.status(400).json(...)
  const status = req.body.photo ? 'photo_pending' : 'draft'
  // ...
}
```

### 3.2 Common Middleware (في src/common/)

| الملف | الوظيفة |
|-------|---------|
| `auth.middleware.js` | فك JWT + إضافة `req.user` |
| `role.middleware.js` | التحقق من الصلاحية (client/employee/admin) |
| `validate.middleware.js` | التحقق من صحة البيانات (Joi schemas) |
| `error-handler.js` | معالجة الأخطاء المركزية |
| `logger.js` | Winston logger |

### 3.3 State Machine Rules

```javascript
// state-machine.js - معرفة مرة واحدة في المشروع
const TRANSITIONS = {
  draft:                    ['data_entry_complete'],
  data_entry_complete:      ['photo_pending'],
  photo_pending:            ['photo_accepted', 'photo_rejected'],
  photo_rejected:           ['photo_pending'],       // retry
  photo_accepted:           ['payment_pending'],
  payment_pending:          ['payment_verification'],
  payment_verification:     ['approved', 'needs_correction'],
  needs_correction:         ['payment_pending', 'photo_pending', 'data_entry_complete'],
  approved:                 ['submitted'],
  submitted:                ['completed'],
  completed:                [],                       // terminal state
  cancelled:                [],                       // terminal state
}
```

- كل تغيير حالة **يجب** أن يسجل في `audit_logs`.
- استخدم `GUARDS` للتحقق من الشروط قبل السماح بالانتقال.

---

## 4. قاعدة البيانات (Database Conventions)

### 4.1 الممارسات
- **UUID** primary keys (وليس auto-increment integers) - `uuid_generate_v4()`.
- **TIMESTAMPTZ** للتواريخ (وليس TIMESTAMP).
- كل جدول له `created_at` و `updated_at` مع trigger.
- **ENUMs** لأنواع الحالة (ملف `schema.sql`).
- **JSONB** للبيانات غير المهيكلة (spouse_data, children_data, metadata).
- **Indexes** على `user_id` و `status` و `created_at`.

### 4.2 Migrations
- استخدم Knex migrations، وليس SQL يدوياً (إلا للـ schema الأولي).
- اسم الملف: `YYYYMMDDHHMMSS_description.js`
- كل migration يجب أن يكون reversible (`up` + `down`).

---

## 5. API Design Conventions

### 5.1 التنسيق

```
POST   /api/v1/{resource}          # إنشاء
GET    /api/v1/{resource}          # قائمة (مع pagination)
GET    /api/v1/{resource}/:id      # قراءة واحد
PATCH  /api/v1/{resource}/:id      # تحديث جزئي
DELETE /api/v1/{resource}/:id      # حذف (soft-delete إن أمكن)
```

### 5.2 Response Format

#### نجاح ✅
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

#### خطأ ❌
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "الحقل مطلوب",
    "details": [{ "field": "email", "message": "..." }]
  }
}
```

### 5.3 HTTP Status Codes
| Code | متى |
|------|-----|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (wrong state transition) |
| 429 | Rate Limited |
| 500 | Internal Error |

---

## 6. الاختبارات (Testing Standards)

### 6.1 Coverage Targets
| الطبقة | التغطية المطلوبة |
|--------|------------------|
| Service (Business Logic) | 100% critical paths |
| Controller | 90% |
| Model | 80% |
| State Machine | 100% كل transition |

### 6.2 أنواع الاختبارات
- **Unit**: كل Service بشكل منفصل (isolated).
- **Integration**: API endpoints كاملة مع قاعدة بيانات حقيقية (SQLite أو test DB).
- **E2E**: Puppeteer يختبر رحلة المستخدم الكاملة.

### 6.3 تسمية الملفات
```
tests/
├── modules/
│   ├── auth.service.test.js
│   ├── auth.controller.test.js
│   ├── orders.service.test.js
│   └── ...
└── integration/
    ├── auth.api.test.js
    └── orders.api.test.js
```

---

## 7. الأمان (Security)

### 7.1 Auth: Hybrid Model (3 Methods)
| Method | Flow | Use Case |
|--------|------|----------|
| **Phone + OTP** | Send OTP via WhatsApp/SMS → verify 6-digit code | Primary for Yemeni users (fast, no email needed) |
| **Email + Password** | `POST /auth/register-email` → bcrypt hashed → JWT | Traditional auth |
| **Google OAuth** | Frontend GIS token → `POST /auth/google` → verify via `google-auth-library` → JWT | Convenience |

- Access Token: 24h (في الـ Authorization header).
- Refresh Token: 7 days (في httpOnly cookie, automatically refreshed by axios interceptor on 401).
- OTP: 5 minutes expiry, rate-limited (3/hour register, 5/min login, 10/min verify).
- Email verification: `is_email_verified` flag on users table. Future: send verification email.
- Google uses Google Identity Services (GIS) popup on frontend → ID token sent to backend → verified server-side with `google-auth-library` → JWT issued.
- If `GOOGLE_CLIENT_ID` env var is missing, Google button shows "قريباً" (coming soon) tooltip.

### 7.2 Rate Limiting
| Endpoint | Limit | Scope |
|----------|-------|-------|
| `POST /auth/login` (OTP) | 5/min | per IP |
| `POST /auth/register` (OTP) | 3/hour | per IP |
| `POST /auth/register-email` | 3/hour | per IP |
| `POST /auth/login-email` | 10/min | per IP |
| `POST /auth/google` | 5/min | per IP |
| `POST /auth/verify-otp` | 10/min | per IP |
| `POST /auth/refresh` | 10/hour | per IP |
| `POST /orders` | 10/min | per user |
| `PATCH /orders/:id/status` | 30/min | per employee |

### 7.3 Row Level Security (Supabase RLS)
- Client: يرى فقط طلباته.
- Employee: يرى كل الطلبات.
- Admin: يرى كل شيء + التقارير.

### 7.4 Audit Logging
- كل transition في State Machine يُسجل في `audit_logs`.
- الـ Audit Log يحتوي: `user_id`, `action`, `from_status`, `to_status`, `ip_address`, `metadata`.

---

## 8. Git Workflow

### 8.1 الفروع (Branching)
```
main          ← جاهز للإنتاج
├── develop   ← للتكامل
│   ├── feature/auth-module
│   ├── feature/orders-state-machine
│   └── ...
└── hotfix/   ← لإصلاحات عاجلة
```

### 8.2 Commit Messages
```
[type]: وصف مختصر بالعربية أو الإنجليزية

الأنواع:
feat:     إضافة ميزة جديدة
fix:      إصلاح خطأ
refactor: إعادة هيكلة بدون تغيير وظيفي
docs:     توثيق
test:     اختبارات
chore:    مهام تشغيلية (dependencies, config)
```

### 8.3 قبل كل Commit
1. `npm run lint` - لا توجد أخطاء ESLint.
2. `npm test` - كل الاختبارات تمر.
3. لا توجد مفاتيح أو كلمات سر في الكود (استخدم `.env`).

---

## 9. ممنوعات صارمة (Hard Bans)

| ✅ مسموح | ❌ ممنوع |
|----------|----------|
| Express, Knex, Joi, JWT, bcrypt, Winston, Bull, google-auth-library | أي مكتبة غير معروفة أو مهجورة |
| `async/await` مع `try/catch` | `callback hell` أو `promise chains` بدون داعي |
| CommonJS (`require`) | ES Modules (`import`) في backend حالياً |
| TypeScript JSDoc للتوثيق | TypeScript compile (حتى إشعار آخر) |
| UUID للـ Primary Keys | Auto-increment IDs |
| Soft delete (`is_active = false`) | `DELETE FROM` بدون تفكير |
| Winston للـ logging | `console.log()` في أي كود إنتاجي |
| Environment variables لكل الإعدادات | Hardcoded secrets |

---

## 10. State Machine - الحالات المسموحة

```
DRAFT → DATA_ENTRY_COMPLETE → PHOTO_PENDING
       → PHOTO_ACCEPTED / PHOTO_REJECTED (AI)
       → PAYMENT_PENDING → PAYMENT_VERIFICATION
       → APPROVED / NEEDS_CORRECTION
       → SUBMITTED (after official site entry)
       → COMPLETED
       → CANCELLED (at any time by admin)
```

- **NEEDS_CORRECTION** يعود إلى الحالة التي تحتاج تعديل (حسب ملاحظة الموظف).
- **CANCELLED** حالة نهائية (terminal) - لا يمكن العودة منها.

---

## 11. Environment Variables

كل الإعدادات في `.env` (انظر `.env.example`):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `REDIS_HOST`, `REDIS_PORT`
- `AI_SERVICE_URL`
- `CAPTCHA_API_KEY`
- `S3_ENDPOINT`, `S3_BUCKET`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## 12. عند كتابة كود جديد

1. **اقرأ الموديولات الموجودة أولاً** - اتبع نمطها بالضبط.
2. **اكتب الـ Service قبل الـ Controller** - المنطق أولاً.
3. **اكتب الاختبارات قبل أو مع الكود** (TDD إن أمكن).
4. **كل موديول مستقل** - لا تعتمد على موديول آخر بشكل مباشر (استخدم Service layer).
5. **لا تكرر الـ Middleware** - استخدم الـ common.
6. **كل Endpoint يحتاج**:
   - Rate limiting مناسب
   - Validation (Joi schema)
   - Auth middleware
   - Role check (إن لزم)
   - Audit log (إن غيّر حالة)
