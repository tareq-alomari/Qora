<div align="center">
  <img src="frontend/public/icons/icon.svg" width="100" height="100" alt="قرعة">
  <h1>قرعة — Qor3a</h1>
  <p><strong>منصة التسجيل الآلي في قرعة DV Lottery — السوق اليمني</strong></p>
  <p>نصف السعر • ضعف الخدمة • من جوالك في 5 دقائق</p>

  <p>
    <img src="https://img.shields.io/badge/status-Beta-green" alt="Status">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/tests-196%20passing-brightgreen" alt="Tests">
  </p>
</div>

---

## 📋 نبذة

**قرعة** منصة SaaS يمنية للتسجيل الآلي في قرعة DV Lottery (التنوع) — العميل يسجل من هاتفه: إدخال بيانات ← تصوير (AI) ← دفع ← مراجعة بشرية ← إدخال رسمي عبر متصفح آلي ← فحص النتيجة.

> **نحن لا نبيع التسجيل المجاني — نبيع راحة البال والاحترافية وتوفير الوقت.**

---

## 🚀 رحلة العميل

```
📱 تسجيل دخول → 📝 إدخال بيانات → 📸 تصوير (AI) → 💳 دفع → 👨‍💼 مراجعة موظف
→ 🌐 إدخال رسمي (Headless) → 🔍 فحص النتيجة
```

**الزمن الإجمالي: < 5 دقائق** | الدفع عبر إيداع في حسابات قرعة (كريمي • جيب • ون كاش • موبايل موني)

---

## 🎨 الهوية البصرية (Brand Identity)

| العنصر | التفاصيل |
|--------|---------|
| **الشعار** | حرف "ق" باللون الأبيض على خلفية كحلية (`#1E3A5F`) مع دائرة ذهبية (`#C9A84C`) |
| **الألوان الأساسية** | كحلي (`#1E3A5F`), ذهبي (`#C9A84C`), أبيض (`#FFFFFF`) |
| **الخط** | [Cairo](https://fonts.google.com/specimen/Cairo) — خط عربي حديث وواضح |
| **الأيقونة** | 🎯 (Target) كـ Favicon |

### الألوان

| اللون | الكود | الاستخدام |
|-------|-------|-----------|
| كحلي غامق | `#1E3A5F` | الخلفية الأساسية، الشعار |
| كحلي فاتح | `#2D5A8E` | العناوين، الأزرار الرئيسية |
| ذهبي | `#C9A84C` | التأكيدات، الشارة المميزة، أيقونات النجاح |
| أخضر نجاح | `#22C55E` | حالات النجاح والقبول |
| أحمر خطأ | `#EF4444` | حالات الرفض والخطأ |

### الشعار

<p align="center">
  <img src="frontend/public/icons/icon.svg" width="120" alt="شعار قرعة">
  <br>
  <sub>حرف "ق" — أول حرف من "قرعة" — داخل مستطيل كحلي مع دائرة ذهبية</sub>
</p>

أيقونة التطبيق بتنسيقات مختلفة:

| الصيغة | الحجم | الموقع |
|--------|-------|--------|
| SVG | 512×512 | `frontend/public/icons/icon.svg` |
| PNG | 512×512 | `frontend/public/icons/icon-512x512.png` |
| PNG | 192×192 | `frontend/public/icons/icon-192x192.png` |
| SVG | 32×32 | `frontend/public/favicon.svg` |

---

## 🧱 القيود المعمارية الأساسية (Hard Constraints)

| القاعدة | الشرح |
|---------|-------|
| **🛑 الصورة لا تُعدّل** | ممنوع تغيير أي بكسل — AI يتحقق فقط (خلفية بيضاء، توسيط، إضاءة). وزارة الخارجية ترفض الصور المعدلة |
| **💳 دفع يدوي** | العميل يحوّل لحسابات قرعة ← يرفع صورة الإشعار ← موظف يؤكد. لا API للدفع |
| **🤖 CAPTCHA** | 2Captcha API + طابور يدوي احتياطي + Proxy Rotation للموقع الرسمي |
| **📱 جوال أولاً** | تصميم متجاوب، PWA، أداء على شبكات ضعيفة |
| **💰 العملة** | ريال يمني (YR) لكل التعاملات |

---

## 🛠️ التقنيات (Tech Stack)

| الطبقة | التقنية | الغرض |
|--------|---------|-------|
| **Backend API** | Node.js + Express 4 | Modular Monolith — 8 موديولات |
| **Auth** | JWT + bcrypt + google-auth-library | بريد إلكتروني/كلمة مرور + Google OAuth |
| **AI Service** | Python + FastAPI + OpenCV (معلق) | التحقق من الصورة الشخصية |
| **Headless** | Node.js + Puppeteer + Stealth | إدخال بيانات في الموقع الرسمي + CAPTCHA |
| **Database** | PostgreSQL + Knex | 11 جدول، JSONB، UUID |
| **Queue** | Bull + Redis | طابور الطلبات + Retry |
| **Storage** | MinIO (S3-compatible) | الصور الشخصية + إيصالات الدفع |
| **Frontend** | React 19 + Vite + Tailwind 4 + Zustand | PWA، RTL، 43+ صفحة |

---

## ⚡ البدء السريع (Quick Start)

### المتطلبات
- Node.js 20+
- PostgreSQL 16+
- Redis
- npm

### التثبيت والتشغيل — سكربت واحد

```bash
# 1. Clone
git clone git@github.com:tareq-alomari/Qora.git
cd Qora

# 2. إنشاء قاعدة البيانات
createdb qor3a

# 3. تشغيل الخدمات المساعدة (Redis + MinIO)
docker compose -f infra/docker-compose.yml up -d redis minio

# 4. تشغيل السكربت الموحد — ينصب الاعتماديات، يشغل الترحيلات، البذور، ويطلق الخوادم
bash scripts/start.sh
```

### أو التشغيل اليدوي

```bash
# 1. إعداد البيئة
cp .env.example .env   # عدّل المتغيرات (خاصة JWT_SECRET و CORS_ORIGIN)

# 2. Backend
cd backend/api
cp .env.example ../../.env
npm install
npx knex migrate:latest
npx knex seed:run              # ينشئ المستخدمين + بيانات تجريبية
npm run dev                    # http://localhost:3000

# 3. Frontend (نافذة جديدة)
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

### 🐳 تشغيل Docker (كل الخدمات)

```bash
docker compose -f infra/docker-compose.yml up --build
```

### بيانات الدخول الافتراضية

| الحساب | البريد | كلمة المرور | الدور |
|--------|--------|-------------|-------|
| 🛡️ مدير النظام | `admin@qor3a.ye` | `admin123` | Admin |
| 👨‍💼 موظف | `employee@qor3a.ye` | `admin123` | Employee |
| 👤 عميل 1 | `ahmed@example.com` | `client123` | Client |
| 👤 عميل 2 | `sara@example.com` | `client123` | Client |
| 👤 عميل 3 | `khaled@example.com` | `client123` | Client |
| 👤 عميل 4 | `noor@example.com` | `client123` | Client |
| 👤 عميل 5 | `yasser@example.com` | `client123` | Client |

### بيئة التشغيل

| الخدمة | الرابط |
|--------|--------|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ API | http://localhost:3000 |
| 📖 Swagger Docs | http://localhost:3000/docs |
| ❤️ Health Check | http://localhost:3000/health |
| 🖥️ لوحة الإدارة | http://localhost:5173/dashboard/login |
| 🔐 تسجيل الدخول | http://localhost:5173/login |

---

## 🏗️ هيكل المشروع

```
qor3a/
├── analysis/                 # 📚 تحليل شامل — 9 أقسام، 68 ملفاً
│   ├── 01_Business_and_Vision/
│   ├── 02_Requirements_Engineering/
│   ├── 03_System_Architecture/
│   ├── 04_Database_Design/
│   ├── 05_API_and_Integrations/
│   ├── 06_UI_UX_Design/
│   ├── 07_DevOps_and_Deployment/
│   ├── 08_Security_and_Risks/
│   └── 09_Testing_and_QA/
│
├── backend/
│   ├── api/                  # 🟢 Node.js + Express (Modular Monolith)
│   │   ├── src/
│   │   │   ├── common/       # Middleware: auth, error, logger, validator, fraud, ai, queue
│   │   │   ├── database/     # 11 migrations + schema.sql + seeds (core + demo)
│   │   │   ├── modules/      # 8 موديولات: auth, users, orders, payments, notifications, results, push-subscriptions, admin
│   │   │   │   └── {module}/
│   │   │   │       ├── {module}.routes.js
│   │   │   │       ├── {module}.controller.js
│   │   │   │       ├── {module}.service.js
│   │   │   │       ├── {module}.model.js
│   │   │   │       └── {module}.schema.js
│   │   │   └── index.js
│   │   └── tests/            # 185+ اختبار (Unit + Integration + Security)
│   │
│   ├── ai/                   # ⏳ Python + FastAPI (Photo Validation)
│   └── headless/             # 🟢 Node.js + Puppeteer (Automation)
│
├── frontend/                 # 🟢 React + Vite + Tailwind + Zustand
│   ├── src/
│   │   ├── client/           # 16+ صفحة (Landing, Auth, Wizard, Dashboard)
│   │   ├── dashboard/        # 26+ صفحة (Employee + Admin)
│   │   └── common/           # Components, Hooks, Stores, Utils
│   └── index.html
│
├── infra/                    # 🐳 Docker, Docker Compose
├── docs/                     # 📖 OpenAPI 3.0.3 (27+ Endpoint)
├── scripts/                  # 🔧 start.sh — سكربت التشغيل الموحد
├── README.md
├── AGENTS.md                 # تعليمات الذكاء الاصطناعي
└── .env.example
```

---

## 🔐 التوثيق (Authentication)

### 📧 1. البريد الإلكتروني + كلمة المرور
- تسجيل وتسجيل دخول بالبريد الإلكتروني وكلمة مرور
- bcrypt hash + JWT (24h access + 7d refresh)
- تحديث تلقائي للتوكين عبر axios interceptor

### 🌐 2. Google OAuth
- Google Identity Services (GIS) popup
- التحقق في الباكند عبر `google-auth-library`
- يتطلب `GOOGLE_CLIENT_ID` في `.env`

### 🔄 تحديث التوكين
- httpOnly cookie على `/api/v1/auth/refresh`
- axios interceptor: 401 → refresh → retry

### API

```bash
# تسجيل
curl -X POST http://localhost:3000/api/v1/auth/register-email \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"محمد أحمد","email":"user@example.com","phone":"9677XXXXXXXX","password":"mypassword123"}'

# تسجيل دخول
curl -X POST http://localhost:3000/api/v1/auth/login-email \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@qor3a.ye","password":"admin123"}'
```

---

## 🧠 State Machine — 12 حالة

```
DRAFT → DATA_ENTRY_COMPLETE → PHOTO_PENDING → PHOTO_ACCEPTED / PHOTO_REJECTED
     → PAYMENT_PENDING → PAYMENT_VERIFICATION → APPROVED / NEEDS_CORRECTION
     → SUBMITTED → COMPLETED / CANCELLED
```

كل تغيير حالة يُسجل في `audit_logs` مع IP و User-Agent.

---

## 📊 لوحة التحكم (42+ صفحة)

### صفحات العميل (16+)
- الرئيسية، تسجيل الدخول، نسيان كلمة المرور، إعادة تعيين، التحقق من البريد
- إنشاء طلب (Wizard 8 خطوات)، طلباتي، تفاصيل الطلب، نتيجة الطلب
- الإشعارات، الإعدادات، متطلبات الصورة، الأسعار، من نحن، اتصل بنا، سياسة الخصوصية، الشروط

### صفحات الموظف (9)
- الرئيسية (إحصائيات)، الطلبات، مراجعة طلب، المدفوعات، تأكيد دفع
- فحص النتائج، إرسال الطلبات، تأكيد الإرسال، الملف الشخصي

### صفحات المدير (17)
- كل صفحات الموظف + إدارة المستخدمين، سجل التدقيق
- علامات الاحتيال، حالة الطابور، أداء الموظفين
- المدفوعات (إشراف)، مراجعة طلب (قراءة فقط)، قائمة الموظفين
- التقارير (نظرة عامة، إيرادات، موظفون)، الإعدادات (أسعار، حسابات، موسم، حدود، مفاتيح API)
- النسخ الاحتياطي، سجلات السيرفر، الإشعارات الجماعية

---

## 🔐 الأمان

- **JWT** — Access Token (24h) + Refresh Token (7d, httpOnly)
- **RBAC** — 3 أدوار (Client, Employee, Admin)
- **تشفير** — AES-256-GCM للبيانات الحساسة، bcrypt لكلمات المرور
- **Rate Limiting** — لكل endpoint حد منفصل
- **Audit Log** — كل تغيير حالة يُسجل مع IP
- **Fraud Detection** — 8 قواعد آلية (IP متكرر، سرعة غير طبيعية، أنماط مشبوهة)

---

## 🧪 الاختبارات

```
196+ tests, كلها ناجحة ✅
```

| المستوى | التغطية |
|---------|---------|
| Unit Tests | Service: 100% critical paths |
| Integration | API endpoints كاملة مع قاعدة بيانات |
| Security | JWT, SQL Injection, Role Escalation, IDOR, Rate Limit |
| Frontend | مكونات رئيسية |

```bash
# تشغيل اختبارات الباكند
cd backend/api && npm test

# تشغيل اختبارات الفرونت
cd frontend && npm test
```

---

## 📖 API Documentation

- OpenAPI 3.0.3: `backend/api/docs/openapi.yaml` (27+ endpoint, 31 schema)
- Swagger UI: `http://localhost:3000/docs`
- Base URL: `http://localhost:3000/api/v1`

### أهم الـ Endpoints

| Resource | الطرق | الوصف |
|----------|-------|-------|
| `/auth/*` | POST | تسجيل، دخول، Google، refresh، نسيان كلمة المرور |
| `/users/profile` | GET, PATCH | الملف الشخصي |
| `/orders/*` | GET, POST, PATCH | الطلبات (إنشاء، بيانات، صور، دفع) |
| `/orders/:id/photo` | POST | رفع الصورة الشخصية + فحص AI |
| `/orders/:id/passport-scan` | POST | رفع صورة الجواز |
| `/orders/:id/payment/receipt` | POST | رفع إيصال الدفع |
| `/orders/:id/check-result` | POST | طلب فحص النتيجة |
| `/payments/methods` | GET | طرق الدفع المتاحة |
| `/payments/receipts` | GET | قائمة المدفوعات (موظف/مدير) |
| `/notifications/*` | GET, POST, PATCH | الإشعارات |
| `/admin/*` | GET, POST, PATCH, DELETE | لوحة الإدارة الكاملة |

---

## 📱 PWA

التطبيق يدعم التثبيت على الشاشة الرئيسية (Add to Home Screen):
- يعمل بدون إنترنت (offline caching)
- إشعارات لحظية (Web Push)
- أداء سريع (lazy loading, code splitting)

---

## 🔮 خارطة الطريق

| المرحلة | الحالة | المخرجات |
|---------|--------|----------|
| 🏗️ التحليل والتخطيط | ✅ مكتمل | 68 ملف تحليل، OpenAPI، ERD، State Machine |
| 🚀 MVP | ✅ مكتمل | Auth, Orders, Payments, Dashboard (196+ test) |
| 📸 AI Photo | ⏳ معلق | Python + FastAPI + OpenCV |
| 🤖 Headless | ✅ مكتمل | Puppeteer + 2Captcha + Queue |
| 🔍 Result Check | ✅ مكتمل | فحص تلقائي للنتائج + إشعارات |
| 🌍 التوسع | ⏳ مستقبلاً | خدمات جديدة (تأشيرات، ترجمة، جوازات) |

---

## 📄 الترخيص

MIT © [tareq-alomari](https://github.com/tareq-alomari)

---

<p align="center">
  <strong>قرعة — من اليمن إلى العالم 🌍</strong><br>
  <sub>نصف السعر، ضعف الخدمة، راحة البال</sub>
</p>
