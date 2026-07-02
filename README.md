<div align="center">
  <h1>🎯 قرعة — Qor3a</h1>
  <p><strong>منصة التسجيل الآلي في قرعة DV Lottery — السوق اليمني</strong></p>
  <p>نصف السعر • ضعف الخدمة • من جوالك في 5 دقائق</p>

  <p>
    <img src="https://img.shields.io/badge/status-MVP-yellow" alt="Status">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/analysis-68%20files%20%7C%209%20phases-brightgreen" alt="Analysis">
    <img src="https://img.shields.io/badge/stack-Node.js%20%7C%20React%20%7C%20PostgreSQL-green" alt="Stack">
    <img src="https://img.shields.io/badge/tests-133%20passing-brightgreen" alt="Tests">
  </p>
</div>

---

## 📋 نبذة

**قرعة** منصة SaaS يمنية تبدأ كمساعد آلي للتسجيل في قرعة DV Lottery (التنوع) بـ **1,000 YR** — نصف سعر المكاتب (2,000 YR). العميل يسجل من هاتفه: إدخال بيانات → تصوير (AI) → دفع → مراجعة بشرية → إدخال رسمي → فحص نتيجة.

> **نحن لا نبيع التسجيل المجاني — نبيع راحة البال والاحترافية وتوفير الوقت.**

---

## 🚀 رحلة العميل

```
📱 دخول → 📝 بيانات → 📸 تصوير (AI) → 💳 دفع → 👨‍💼 مراجعة → 🌐 تسجيل رسمي → 📩 تأكيد → 🔍 فحص نتيجة
```

**الزمن الإجمالي: < 5 دقائق** | الدفع عبر إيداع في حسابات قرعة (كريمي • جيب • ون كاش • موبايل موني)

---

## 🔐 التوثيق (Authentication) — 3 طرق

### 📱 1. الدخول برقم الهاتف + OTP
- يناسب المستخدمين اليمنيين (لا يحتاج بريد إلكتروني)
- إرسال رمز 6 أرقام عبر WhatsApp/SMS → صلاحية 5 دقائق
- Rate Limit: 3/ساعة للتسجيل، 5/دقيقة لتسجيل الدخول

**API:**
```bash
# طلب رمز
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"phone":"9677XXXXXXXX"}'

# أو تسجيل دخول
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"9677XXXXXXXX"}'

# تأكيد الرمز
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"phone":"9677XXXXXXXX","otp":"123456"}'
```

### 📧 2. البريد الإلكتروني + كلمة المرور
- تسجيل كامل: الاسم + البريد + الهاتف + كلمة المرور
- bcrypt hash + JWT (24h access + 7d refresh)
- يتم تحديث التوكين تلقائياً عبر axios interceptor (401 → refresh → retry)

**API:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register-email \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"محمد أحمد","email":"user@example.com","phone":"9677XXXXXXXX","password":"mypassword123"}'

curl -X POST http://localhost:3000/api/v1/auth/login-email \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@qor3a.ye","password":"admin123"}'
```

### 🌐 3. Google OAuth
- يستخدم Google Identity Services (GIS) — popup من الموقع الرسمي
- إرسال ID token → التحقق في الباكند عبر `google-auth-library`
- إذا كان البريد موجوداً مسبقاً، يربط حساب Google به
- يتطلب تفعيل `GOOGLE_CLIENT_ID` في `.env` — بدونه يظهر الزر كـ "قريباً"

**API:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/google \
  -H 'Content-Type: application/json' \
  -d '{"id_token":"<token_from_google>"}'
```

### 🔄 تحديث التوكين (Refresh)
- httpOnly cookie على المسار `/api/v1/auth/refresh`
- axios interceptor يكتشف 401 → يرسل طلب refresh → يعيد الطلبات المعلقة

---

## 🧱 القيود المعمارية الأساسية (Hard Constraints)

| القاعدة | الشرح |
|---------|-------|
| **🛑 الصورة لا تُعدّل** | ممنوع تغيير أي بكسل — AI يتحقق فقط (Background, Centering, Lighting). وزارة الخارجية ترفض الصور المعدلة |
| **💳 دفع يدوي** | العميل يحوّل لحسابات قرعة ← يرفع صورة الإشعار ← موظف يؤكد. لا API للدفع |
| **🤖 CAPTCHA** | 2Captcha API + طابور يدوي احتياطي + Proxy Rotation للموقع الرسمي |
| **📱 جوال أولاً** | تصميم 360-414px، PWA، أداء على 3G |
| **💰 العملة** | ريال يمني (YR) لكل التعاملات |

---

## 🏗️ هيكل المشروع

```
qor3a/
├── analysis/                      # 📚 تحليل شامل — 68 ملفاً، 9 أقسام
│   ├── 01_Business_and_Vision/    # نموذج العمل، السوق، الجدوى، المخاطر
│   ├── 02_Requirements_Engineering/ # PRD، المتطلبات، الشخصيات، الصلاحيات
│   ├── 03_System_Architecture/    # Mermaid: ERD، State Machine، ADRs، DFDs
│   ├── 04_Database_Design/        # SQL، Caching، Data Dictionary
│   ├── 05_API_and_Integrations/   # REST API، تكاملات خارجية، إشعارات
│   ├── 06_UI_UX_Design/           # Journey، Wireframes، Design System، Mobile، Site Map
│   ├── 07_DevOps_and_Deployment/  # CI/CD، Docker، Monitoring، Runbook
│   ├── 08_Security_and_Risks/     # Threat Model، RBAC، Privacy، Fraud
│   └── 09_Testing_and_QA/         # Test Cases، Performance، UAT
│
├── backend/
│   ├── api/                       # 🟢 [Active] Node.js + Express (Modular Monolith)
│   │   ├── src/
│   │   │   ├── common/            # Auth, Error, Logger, Validator, Fraud Detector
│   │   │   ├── database/          # Knex migrations (9 ملفات) + schema + seeds
│   │   │   ├── modules/           # Auth, Orders, Payments, Notifications, Admin, Results
│   │   │   │   └── {module}/
│   │   │   │       ├── {module}.routes.js
│   │   │   │       ├── {module}.controller.js
│   │   │   │       ├── {module}.service.js
│   │   │   │       └── {module}.model.js
│   │   │   └── index.js
│   │   └── tests/                 # 133 اختبار (Jest)
│   ├── ai/                        # ⏳ [Pending] Python + FastAPI (Photo Validation)
│   └── headless/                  # ⏳ [Pending] Node.js + Puppeteer (Automation)
│
├── frontend/                      # 🟢 [Active] React + Vite + Tailwind + Zustand
│   ├── src/
│   │   ├── client/                # Landing, Auth (3 طرق), Wizard (8 خطوات), Dashboard
│   │   ├── dashboard/             # Employee Profile, Orders, Payments, Admin Pages
│   │   └── common/                # OtpInput, ExportButton, Pagination, StatusBadge...
│   └── index.html                 # PWA + RTL
│
├── infra/                         # 🐳 Docker، Docker Compose، nginx
├── docs/                          # 📖 توثيق API (OpenAPI 3.0.3 — 27 Endpoint)
├── scripts/                       # 🔧 سكريبتات مساعدة
├── analysis/06_UI_UX_Design/10_Site_Map.md  # خريطة الموقع (43 صفحة)
│
├── README.md                      # 👈 هذا الملف
├── AGENTS.md                      # تعليمات الذكاء الاصطناعي
└── .env.example                   # قالب متغيرات البيئة
```

**عدد الملفات:** 45+ باكند | 60+ فرونت | 68 تحليل | 133 اختبار | ~2,304 سطر OpenAPI

---

## 🛠️ التقنيات (Tech Stack)

| الطبقة | التقنية | الغرض |
|--------|---------|-------|
| **Backend API** | Node.js + Express 4 | Modular Monolith — Auth (3 طرق), Orders, Payments |
| **Auth** | JWT + bcrypt + google-auth-library + OTP | Hybrid: Phone/OTP, Email/Password, Google OAuth |
| **AI Service** | Python + FastAPI + OpenCV/ONNX | التحقق من الصورة الشخصية (7 فحوصات) |
| **Headless** | Node.js + Puppeteer + Stealth | إدخال بيانات في الموقع الرسمي + CAPTCHA |
| **Database** | PostgreSQL + Knex | 11 جدول، JSONB، UUID، RLS |
| **Queue** | Bull + Redis | أولوية الطلبات + Retry + Dashboard |
| **Storage** | MinIO (S3-compatible) | الصور الشخصية + إيصالات الدفع |
| **Frontend** | React 19 + Vite + Tailwind 4 + Zustand | PWA، RTL، 3G |
| **Container** | Docker + Docker Compose | 5 خدمات |
| **Hosting** | VPS (Hetzner CX31 ~$12/mo) | 4 vCPU، 8GB RAM، 160GB SSD |

---

## 🚦 البدء السريع

### المتطلبات
- Node.js 20+
- PostgreSQL 16
- Redis (لـ OTP و Bull queue)

### التثبيت

```bash
# 1. Clone
git clone git@github.com:tareq-alomari/Qora.git
cd Qora

# 2. إنشاء قاعدة البيانات
createdb qor3a

# 3. تشغيل الخدمات المساعدة
cd infra && docker-compose up -d redis minio && cd ..

# 4. إعداد Backend
cd backend/api
cp .env.example ../../.env   # عدّل المتغيرات
npm install
npx knex migrate:latest      # تشغيل 9 ملفات migration
npx knex seed:run             # إنشاء المستخدمين الافتراضيين
npm run dev                   # http://localhost:3000

# 5. إعداد Frontend (نافذة جديدة)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### بيانات الدخول الافتراضية

| الحساب | البريد | كلمة المرور | الدور |
|--------|--------|-------------|-------|
| مدير النظام | `admin@qor3a.ye` | `admin123` | Admin |
| موظف | `employee@qor3a.ye` | `admin123` | Employee |

---

## 📊 التكاليف والأسعار

| الخدمة | سعر قرعة | السوق (المكاتب) |
|--------|----------|-----------------|
| 🎯 تسجيل لوتري كامل | **1,000 YR** | 2,000 YR |
| 📸 تصوير احترافي + AI | 500 YR | 1,000 YR |
| 🔍 فحص النتيجة | 500 YR | — |

**Break-Even**: 625 طلب/سنة (~$400) — يتحقق خلال الموسم الأول

---

## 📚 التحليل

مشروعنا يتبع إطار **First-Principles Engineering Analysis** — 9 مراحل، 68 ملفاً، 1.2MB:

| # | القسم | الملفات | السؤال |
|---|-------|---------|--------|
| 01 | Business & Vision | 10 | لماذا نبني هذا؟ |
| 02 | Requirements Engineering | 4 | ماذا نبني بالضبط؟ |
| 03 | System Architecture | 5 | كيف نبنيها؟ |
| 04 | Database Design | 3 | أين نخزن البيانات؟ |
| 05 | API & Integrations | 5 | كيف نربط الخدمات؟ |
| 06 | UI/UX Design | 12 | كيف سيتفاعل المستخدم؟ |
| 07 | DevOps & Deployment | 16 | كيف نشغلها؟ |
| 08 | Security & Risks | 7 | كيف نحميها؟ |
| 09 | Testing & QA | 6 | كيف نضمن الجودة؟ |

---

## 🔐 الأمان

- **JWT** — Access Token (24h) + Refresh Token (7 days, httpOnly)
- **RBAC** — 3 أدوار (Client، Employee، Admin) مع Least Privilege
- **تشفير** — AES-256-GCM للبيانات الحساسة، TLS 1.3، bcrypt لكلمات المرور
- **Rate Limiting** — لكل endpoint حد منفصل:
  - OTP Register: 3/hour | OTP Login: 5/min | OTP Verify: 10/min
  - Email Register: 3/hour | Email Login: 10/min
  - Google Auth: 5/min | Refresh: 10/hour
  - Orders: 10/min/user | Status Change: 30/min/employee
- **Audit Log** — كل تغيير حالة يُسجل مع IP و User-Agent
- **Fraud Detection** — 8 قواعد آلية (IP متكرر، سرعة غير طبيعية، أنماط مشبوهة)

---

## 🧪 الاختبارات

```
133 tests, 12 suites — الكل ناجح ✅
```

| المستوى | العدد | التغطية |
|---------|-------|---------|
| Unit Tests | 9 ملفات | Service: 100% critical paths |
| Integration | 3 ملفات | API endpoints مع SQLite |
| Security | 14 سيناريو | JWT, SQL Injection, Role Escalation, IDOR, Rate Limit |

---

## 📖 API Documentation

- OpenAPI 3.0.3: `backend/api/docs/openapi.yaml` (27 endpoint, 31 schema, 54 error code)
- Swagger UI: `http://localhost:3000/docs` (عند تشغيل الباكند)
- Base URL: `http://localhost:3000/api/v1`

### المصادقة (Authentication)

| Endpoint | الطريقة | الوصف |
|----------|---------|-------|
| `POST /auth/register` | OTP | تسجيل برقم الهاتف |
| `POST /auth/login` | OTP | تسجيل دخول برقم الهاتف |
| `POST /auth/verify-otp` | OTP | تأكيد رمز التحقق |
| `POST /auth/register-email` | Email | تسجيل بالبريد + كلمة مرور |
| `POST /auth/login-email` | Email | تسجيل دخول بالبريد + كلمة مرور |
| `POST /auth/google` | Google | تسجيل دخول Google |
| `POST /auth/refresh` | — | تحديث التوكين |
| `POST /auth/logout` | — | تسجيل خروج |

### الـ Endpoints الأخرى

| Resource | الطرق | الوصف |
|----------|-------|-------|
| `/users` | GET, PATCH | الملف الشخصي |
| `/orders` | GET, POST, PATCH | الطلبات (8 حالات) |
| `/orders/:id/photo` | POST, DELETE | رفع/حذف الصورة |
| `/payments` | GET, POST | الدفع + رفع الإشعار |
| `/payments/:id/verify` | PATCH | تأكيد الدفع (موظف) |
| `/notifications` | GET | الإشعارات |
| `/admin/*` | GET, PATCH, POST | لوحة الإدارة |
| `/admin/export/orders` | GET | تصدير CSV/Excel |
| `/admin/bulk-notifications` | POST | إشعارات جماعية |

---

## 🔮 خارطة الطريق (Product Roadmap)

| المرحلة | المدة | المخرجات |
|---------|-------|----------|
| 🏗️ التحضير | شهر 1-2 | تحليل (68 ملف)، تصميم، قاعدة بيانات |
| 🚀 الإطلاق | شهر 3 | Auth + Orders + Payments MVP (45+ ملف باكند، 60+ فرونت) |
| 📈 النمو | شهر 4-6 | AI Photo + WhatsApp Notifications |
| 🏆 القرعة | شهر 7-9 | Headless Browser + Queue |
| 🔍 النتائج | شهر 10-11 | Result Checking + Notification |
| 🌍 التوسع | شهر 12+ | خدمات جديدة (تأشيرات، ترجمة، جوازات) |

---

## 📄 الترخيص

MIT © [tareq-alomari](https://github.com/tareq-alomari)

---

<p align="center">
  <strong>قرعة — من اليمن إلى العالم 🌍</strong><br>
  <sub>نصف السعر، ضعف الخدمة، راحة البال</sub>
</p>
