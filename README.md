<div align="center">
  <h1>🎯 قرعة — Qor3a</h1>
  <p><strong>منصة التسجيل الآلي في قرعة DV Lottery — السوق اليمني</strong></p>
  <p>نصف السعر • ضعف الخدمة • من جوالك في 5 دقائق</p>

  <p>
    <img src="https://img.shields.io/badge/status-MVP-yellow" alt="Status">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/analysis-68%20files%20%7C%209%20phases-brightgreen" alt="Analysis">
    <img src="https://img.shields.io/badge/stack-Node.js%20%7C%20React%20%7C%20PostgreSQL-green" alt="Stack">
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
│   ├── 06_UI_UX_Design/           # Journey، Wireframes، Design System، Mobile
│   ├── 07_DevOps_and_Deployment/  # CI/CD، Docker، Monitoring، Runbook
│   ├── 08_Security_and_Risks/     # Threat Model، RBAC، Privacy، Fraud
│   └── 09_Testing_and_QA/         # Test Cases، Performance، UAT
│
├── backend/
│   ├── api/                       # 🟢 [Active] Node.js + Express (Modular Monolith)
│   │   ├── src/common/            # Auth، Error، Logger، Validator
│   │   ├── src/modules/           # Auth، Orders، Payments، Notifications
│   │   └── src/database/          # Knex migrations + schema.sql
│   ├── ai/                        # ⏳ [Pending] Python + FastAPI (Photo Validation)
│   └── headless/                  # ⏳ [Pending] Node.js + Puppeteer (Automation)
│
├── frontend/                      # 🟢 [Active] React + Vite + Tailwind + Zustand
│   ├── src/client/                # صفحات العميل (Wizard، Dashboard)
│   └── src/dashboard/             # صفحات الموظف والمدير
│
├── infra/                         # 🐳 Docker، Docker Compose
├── docs/                          # 📖 توثيق API والنشر
├── scripts/                       # 🔧 سكريبتات (new-project.sh)
│
├── README.md                      # 👈 هذا الملف
├── AGENTS.md                      # تعليمات الذكاء الاصطناعي
└── .env.example                   # قالب متغيرات البيئة
```

---

## 🛠️ التقنيات (Tech Stack)

| الطبقة | التقنية | الغرض |
|--------|---------|-------|
| **Backend API** | Node.js + Express | Modular Monolith — Auth, Orders, Payments |
| **AI Service** | Python + FastAPI + OpenCV/ONNX | التحقق من الصورة الشخصية |
| **Headless** | Node.js + Puppeteer | إدخال بيانات في الموقع الرسمي + CAPTCHA |
| **Database** | PostgreSQL + Knex | 6 جداول، JSONB، RLS |
| **Queue** | Bull + Redis | أولوية الطلبات + Retry + Dashboard |
| **Storage** | MinIO (S3-compatible) | الصور الشخصية + إيصالات الدفع |
| **Frontend** | React + Vite + Tailwind + Zustand | PWA، RTL، 3G |
| **Container** | Docker + Docker Compose | 5 خدمات (Postgres، Redis، MinIO، API، Headless) |
| **Hosting** | VPS (Hetzner CX31 ~$12/mo) | 4 vCPU، 8GB RAM، 160GB SSD |

---

## 🚦 البدء السريع

```bash
# 1. Clone
git clone git@github.com:tareq-alomari/Qora.git
cd Qora

# 2. إنشاء قاعدة البيانات
createdb qor3a
psql -d qor3a -f backend/api/src/database/schema.sql

# 3. تشغيل الخدمات المساعدة (Redis + MinIO)
cd infra && docker-compose up -d && cd ..

# 4. تشغيل API
cd backend/api && npm install && npm run dev

# 5. تشغيل Frontend (نافذة جديدة)
cd frontend && npm install && npm run dev
```

🖥️ API → `http://localhost:3000` | 🎨 Frontend → `http://localhost:5173`

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

مشروعنا يتبع إطار **First-Principles Engineering Analysis** — 9 مراحل، 68 ملفاً،  1.2MB:

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

> 🔄 لمشروع جديد: `./scripts/new-project.sh "اسم المشروع"` ينشئ نفس الهيكل تلقائياً.

---

## 🔐 الأمان

- **JWT** — Access Token (24h) + Refresh Token (7 days, httpOnly)
- **RBAC** — 3 أدوار (Client، Employee، Admin) مع Least Privilege
- **تشفير** — AES-256 للصور، TLS 1.3 للاتصالات، bcrypt لكلمات المرور
- **Rate Limiting** — 5/min للتسجيل، 10/min للطلبات، 30/min للموظفين
- **Audit Log** — كل تغيير حالة يُسجل مع IP و User-Agent

---

## 🧪 الاختبارات

- **Unit**: كل Service بشكل منفصل (100% critical paths)
- **Integration**: API endpoints كاملة مع قاعدة بيانات اختبار
- **E2E**: Puppeteer يختبر رحلة المستخدم الكاملة
- **State Machine**: 12 حالة × 12 انتقال — كل انتقال مُختبر

---

## 🔮 خارطة الطريق (Product Roadmap)

| المرحلة | المدة | المخرجات |
|---------|-------|----------|
| 🏗️ التحضير | شهر 1-2 | تحليل، تصميم، قاعدة بيانات |
| 🚀 الإطلاق | شهر 3 | Auth + Orders + Payments MVP |
| 📈 النمو | شهر 4-6 | AI Photo + WhatsApp Notifications |
| 🏆 القرعة | شهر 7-9 | Headless Browser + Queue |
| 🔍 النتائج | شهر 10-11 | Result Checking + Notification |
| 🌍 التوسع | شهر 12+ | خدمات جديدة (تأشيرات، ترجمة) |

---

## 📄 الترخيص

MIT © [tareq-alomari](https://github.com/tareq-alomari)

---

<p align="center">
  <strong>قرعة — من اليمن إلى العالم 🌍</strong><br>
  <sub>نصف السعر، ضعف الخدمة، راحة البال</sub>
</p>
