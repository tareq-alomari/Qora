# دليل الإعداد للمطور الجديد - Setup Guide

## Qor3a — من clone إلى تشغيل

---

## 1. المتطلبات الأساسية

```
├── 🟢 Node.js 20+ (v20.0.0 أو أحدث)
├── 🟢 PostgreSQL 16+
├── 🟢 Redis 7+
├── 🟢 Docker + Docker Compose (اختياري — لـ MinIO)
├── 🟢 Git
└── 🟢 npm أو yarn
```

### التحقق من المتطلبات

```bash
node --version     # v20.x.x
npm --version      # 10.x.x
psql --version     # 16.x
redis-cli --version # 7.x
docker --version   # 24.x (اختياري)
```

---

## 2.克隆 المشروع

```bash
git clone https://github.com/your-org/qor3a.git
cd qor3a
```

### هيكل المشروع

```
qor3a/
├── backend/
│   ├── api/        ← Node.js + Express
│   ├── ai/         ← Python + FastAPI (لاحقاً)
│   └── headless/   ← Puppeteer (لاحقاً)
├── frontend/       ← React + Vite + Tailwind
├── infra/          ← Docker, Nginx configs
├── docs/           ← وثائق
├── scripts/        ← سكريبتات مساعدة
├── analysis/       ← تحليل كامل (مرجع)
├── README.md
└── .env.example
```

---

## 3. إعداد قاعدة البيانات

### 3.1 إنشاء قاعدة البيانات

```bash
# ادخل على PostgreSQL
sudo -u postgres psql

# أنشئ قاعدة البيانات والمستخدم
CREATE DATABASE qor3a_dev;
CREATE USER qor3a_user WITH PASSWORD 'qor3a_dev_pass';
GRANT ALL PRIVILEGES ON DATABASE qor3a_dev TO qor3a_user;

# أنشئ التمديدات
\c qor3a_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# اخرج
\q
```

### 3.2 تشغيل الـ Migrations

```bash
cd backend/api

# نسخ ملف البيئة
cp .env.example .env
# عدّل ملف .env (DB_USER, DB_PASSWORD, DB_NAME)

# شغل الـ migrations
npx knex migrate:latest

# (اختياري) حشو بيانات تجريبية
npx knex seed:run
```

### 3.3 التحقق

```bash
# ادخل على قاعدة البيانات وتأكد من وجود الجداول
psql -U qor3a_user -d qor3a_dev
\dt
```

---

## 4. إعداد ملف البيئة (.env)

```bash
# backend/api/.env
cp .env.example .env
```

المحتويات المطلوبة:

```
# ── Database ──
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qor3a_dev
DB_USER=qor3a_user
DB_PASSWORD=qor3a_dev_pass

# ── JWT ──
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ── Redis ──
REDIS_HOST=localhost
REDIS_PORT=6379

# ── MinIO (S3) ──
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=qor3a_minio
MINIO_SECRET_KEY=qor3a_minio_secret
MINIO_BUCKET=qor3a-uploads

# ── WhatsApp API ──
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=9677XXXXXXX

# ── AI Service ──
AI_SERVICE_URL=http://localhost:8000

# ── Server ──
PORT=3000
NODE_ENV=development
```

---

## 5. تشغيل الخدمات المساعدة (Docker)

للخدمات التي تحتاج Docker (Redis + MinIO):

```bash
# من مجلد infra
cd infra

# شغل Redis + MinIO
docker compose up -d redis minio

# تحقق من اشتغالهم
docker compose ps
```

إذا ما عندك Docker، شغل Redis محلياً:

```bash
redis-server
```

---

## 6. تشغيل الـ Backend

```bash
cd backend/api

# تثبيت الاعتماديات
npm install

# شغل في وضع التطوير (مع auto-reload)
npm run dev

# إذا كل شيء سليم، راح تشوف:
# ✅ Server running on port 3000
# ✅ Database connected
# ✅ Redis connected
```

### التحقق من الصحة

```bash
curl http://localhost:3000/api/v1/health

# يجب أن ترى:
{
  "status": "ok",
  "timestamp": "2026-09-15T10:00:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "minio": "ok"
  }
}
```

---

## 7. تشغيل الـ Frontend

```bash
cd frontend

# تثبيت الاعتماديات
npm install

# شغل في وضع التطوير
npm run dev

# سيفتح على:
# http://localhost:5173
```

### إعداد الـ Proxy (Vite)

```javascript
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/storage': {
        target: 'http://localhost:9000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 8. إنشاء مستخدمين تجريبيين

### 8.1 عبر API

```bash
# إنشاء عميل
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "967700000001"}'

# 확인 الـ OTP (في development, OTP ثابت 123456)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "967700000001", "otp": "123456"}'
```

### 8.2 عبر الـ Seed

```bash
cd backend/api
npx knex seed:run
```

الـ Seed سينشئ:

| الهاتف | الدور | كلمة السر |
|--------|-------|-----------|
| 967700000001 | client | (OTP) |
| 967700000002 | employee | 123456 |
| 967700000003 | admin | 123456 |

---

## 9. تشغيل الاختبارات

```bash
cd backend/api

# كل الاختبارات
npm test

# اختبارات موديول محدد
npx jest modules/auth

# مع التغطية
npx jest --coverage
```

### إعداد قاعدة بيانات للاختبارات

```javascript
// backend/api/knexfile.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'qor3a_dev',
      user: 'qor3a_user',
      password: 'qor3a_dev_pass'
    }
  },
  test: {
    client: 'sqlite3',
    connection: { filename: './test.db' },
    useNullAsDefault: true
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL
  }
}
```

---

## 10. أوامر سريعة

```bash
# Backend
npm run dev          ← تشغيل (auto-reload)
npm start            ← تشغيل (production)
npm test             ← اختبارات
npm run lint         ← فحص الكود
npm run migrate      ← تشغيل migrations
npm run migrate:rollback  ← الرجوع آخر migration

# Frontend
npm run dev          ← تشغيل
npm run build        ← بناء للإنتاج
npm run preview      ← معاينة البناء
npm run lint         ← فحص الكود

# Docker (من infra/)
docker compose up -d ← تشغيل Redis + MinIO
docker compose down  ← إيقاف
docker compose logs  ← عرض السجلات

# قاعدة البيانات
npx knex migrate:latest
npx knex seed:run
npx knex migrate:rollback
```

---

## 11. المشاكل المتوقعة

| المشكلة | الحل |
|---------|------|
| `port 3000 already in use` | غيّر PORT في .env أو أوقف العملية: `lsof -i :3000 && kill -9 PID` |
| `Database connection refused` | تأكد من شغل PostgreSQL: `sudo systemctl start postgresql` |
| `Redis connection refused` | شغل Redis: `redis-server` أو `docker compose up -d redis` |
| `Module not found` | `npm install` |
| `Migration failed` | تحقق من اتصال DB، ثم `npx knex migrate:latest` |
| `CORS error` | تأكد من proxy في vite.config.js |
| `JWT_SECRET not set` | أضف JWT_SECRET في .env |

---

## 12. تدفق العمل اليومي

```
☀️ الصباح:
1. git pull (آخر التحديثات)
2. docker compose up -d (Redis + MinIO)
3. npm run dev (Backend)
4. npm run dev (Frontend)
5. افتح http://localhost:5173

💻 أثناء العمل:
1. أنشئ فرعاً: git checkout -b feature/feature-name
2. اكتب الكود + الاختبارات
3. npm test (تأكد من مرورها)
4. npm run lint (تأكد من لا أخطاء)
5. اختبر يدوياً في المتصفح

🌆 المساء:
1. git add . && git commit -m "feat: description"
2. git push origin feature/feature-name
3. افتح PR على GitHub
```

---

*دليل الإعداد - يوليو 2026*
*Qor3a (قرعة)*
