# 🎯 قرعة - Qor3a

## منصة التسجيل الآلي في قرعة اللوتري (DV Lottery) - السوق اليمني

---

### ما هي قرعة؟

**قرعة** هي منصة SaaS يمنية تبدأ كـ "نظام آلي للتسجيل في قرعة DV Lottery" بـ **1,000 ريال يمني فقط** (المكاتب تاخذ 2,000!) وتتوسع لتصبح بوابة خدمات إلكترونية شاملة (تأشيرات، ترجمة، جوازات، تعبئة نماذج).

نحن لا نبيع التسجيل المجاني - نبيع **راحة البال، الاحترافية، وتوفير الوقت**. كل شيء من جوالك: بيانات + تصوير + دفع + فحص النتيجة.

> **🎯 شعارنا: نصف السعر، ضعف الخدمة**

### رحلة العميل في 8 خطوات (< 5 دقائق)

```
دخول → بيانات → 📸 صورة (AI) → 💳 دفع → 👨‍💼 مراجعة → 🌐 تسجيل رسمي → 📩 تأكيد → 🔍 فحص نتيجة
```

### الأسعار - السوق اليمني
| الخدمة | السعر | السوق |
|--------|-------|-------|
| 🎯 تسجيل لوتري كامل | **1,000 YR** | المكاتب تاخذ 2,000 YR |
| 📸 تصوير احترافي | 500 YR | - |
| 🔍 فحص النتيجة | 500 YR | - |
| 💳 الدفع: إيداع في حسابات قرعة (كريمي، جيب، ون كاش، موبايل موني) - لا API | | |

### القيود المعمارية الأساسية

1. **🛑 الصورة**: ممنوع تعديل أي بكسل - تحقق فقط (AI Validation, لا AI Generation)
2. **💳 الدفع**: يحوّل العميل على حسابات قرعة (كريمي، جيب، ون كاش، موبايل موني) ← يرفع صورة الإشعار ← موظف يؤكد يدوياً ← اكتمال الدفع. **لا API للدفع**
3. **🤖 CAPTCHA**: 2Captcha API + طابور يدوي احتياطي

### هيكل المشروع

```
📁 qor3a/
│
├── 📁 analysis/                  # تحليل النظام (مكتمل)
│   ├── business/                 # نموذج العمل، السوق، المالية
│   ├── requirements/             # SRS، المتطلبات، Use Cases، User Stories
│   ├── architecture/             # ERD، State Machine، API، Sequence Diagrams
│   ├── ux/                       # رحلة المستخدم، Wireframes، Site Map
│   └── security/                 # المخاطر، الخصوصية، استراتيجية Traffic
│
├── 📁 backend/                   # الكود الخلفي
│   ├── api/                      # Node.js + Express (Modular Monolith)
│   ├── ai/                       # Python + FastAPI (التحقق من الصور)
│   └── headless/                 # Node.js + Puppeteer (التصفح الآلي)
│
├── 📁 frontend/                  # React + Vite + Tailwind + Zustand
│
├── 📁 infra/                     # Docker، Terraform، K8s، CI/CD
├── 📁 docs/                      # توثيق API والنشر
├── 📁 scripts/                   # سكريبتات مساعدة
│
├── README.md
├── AGENTS.md
└── .env.example
```

### Stack

| الطبقة | التقنية |
|--------|---------|
| Backend API | Node.js + Express |
| AI Service | Python + FastAPI + OpenCV/ONNX |
| Headless | Node.js + Puppeteer |
| Database | PostgreSQL |
| Cache/Queue | Redis |
| Storage | MinIO (S3-compatible) |
| Frontend | React + Vite + Tailwind + Zustand |
| Container | Docker + Docker Compose |

### البدء السريع

```bash
# 1. إنشاء قاعدة البيانات
createdb qor3a
psql -d qor3a -f backend/api/src/database/schema.sql

# 2. تشغيل الخدمات
cd infra
docker-compose up -d

# 3. تشغيل الـ API محلياً (اختياري)
cd backend/api
npm install
npm run dev
```
