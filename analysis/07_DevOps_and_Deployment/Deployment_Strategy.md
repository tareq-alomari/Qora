# 🚀 استراتيجية النشر — Deployment Strategy

> **Qor3a (قرعة)** — CI/CD Pipeline + Environment Management + Release Process

---

## 1. البيئات (Environments)

| البيئة | الرابط | الغرض | الـ DB | الإعدادات |
|--------|--------|-------|-------|----------|
| **Development** | localhost:3000 | تطوير يومي | PostgreSQL محلي | `.env.dev` |
| **Staging** | staging.qor3a.com | اختبار قبل الإطلاق | DB مستقل + بيانات وهمية | `.env.staging` |
| **Production** | qor3a.com | الإطلاق الفعلي | DB مخصص + Backup تلقائي | `.env.prod` + Docker Secrets |

### Development Environment

```
المبرمج يحتاج:
├── 📦 Node.js 20+
├── 🐘 PostgreSQL (محلي)
├── 📦 Redis (محلي)
└── 🐳 Docker (لـ MinIO)

التشغيل:
  backend/api/    → npm run dev    → :3000
  frontend/       → npm run dev    → :5173 (proxy → :3000)
  infra/          → docker-compose up -d redis minio
```

### Staging Environment

```
نفس إعدادات Production لكن:
├── 🔄 بيانات وهمية (لا بيانات حقيقية)
├── 🔓 Rate Limiting مخفف
├── 🔔 إشعارات إلى مطور فقط
└── 🧪 بعد كل Merge إلى develop → تلقائي
```

### Production Environment

```
السيرفر: VPS واحد (أو 2)
├── 💻 4-8 vCPU + 8-16GB RAM + 160-240GB SSD
├── 🐳 Docker + Docker Compose
├── 🌐 Nginx Reverse Proxy + SSL
├── 🐘 PostgreSQL + Redis + MinIO
└── التكلفة: ~$30-80/شهر (Hetzner CX31-CX41)
```

---

## 2. Docker Deployment

### 2.1 Docker Compose (Production)

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on: [backend-api]

  backend-api:
    build: ./backend/api
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on: [postgres, redis]

  ai-service:
    build: ./backend/ai
    restart: always
    ports: ["8000:8000"]

  headless-service:
    build: ./backend/headless
    restart: always

  postgres:
    image: postgres:16-alpine
    restart: always
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    restart: always

  minio:
    image: minio/minio
    restart: always
    volumes: [miniodata:/data]
```

### 2.2 أوامر الإدارة

```bash
# أول مرة
ssh root@SERVER_IP
cd /opt/qor3a
git pull
docker compose up -d

# تحديث
git pull
docker compose build backend-api
docker compose up -d backend-api

# مراقبة
docker compose logs -f backend-api
docker compose stats

# Backup
docker exec qor3a-postgres pg_dump -U postgres qor3a > backup_$(date +%Y%m%d).sql
```

---

## 3. Nginx Configuration

```nginx
# HTTP → HTTPS
server {
    listen 80;
    server_name qor3a.com www.qor3a.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name qor3a.com www.qor3a.com;

    ssl_certificate /etc/ssl/qor3a.crt;
    ssl_certificate_key /etc/ssl/qor3a.key;
    ssl_protocols TLSv1.3;

    # Frontend (static files)
    root /var/www/qor3a/frontend/dist;
    index index.html;

    # API
    location /api/ {
        proxy_pass http://backend-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # AI Service
    location /api/ai/ {
        proxy_pass http://ai-service:8000;
    }

    # S3 Storage
    location /storage/ {
        proxy_pass http://minio:9000;
    }

    # SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 4. CI/CD Pipeline

### 4.1 تدفق النشر

```
git push origin main
        │
        ▼
GitHub Actions
        │
    ├── npm run lint
    ├── npm run test
    ├── npm run build
        │
        ▼
بناء Docker Image
        │
    ├── docker build -t qor3a-api:{sha}
        │
        ▼
رفع الصورة
        │
    ├── docker push registry/qor3a-api:{sha}
        │
        ▼
نشر على السيرفر
        │
    ├── ssh server "docker compose pull && docker compose up -d"
    ├── smoke test (curl /health)
    └── إشعار (تيليجرام/إيميل)
```

### 4.2 GitHub Actions Workflow

```yaml
name: Deploy Qor3a
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy
        run: |
          echo "${{ secrets.SSH_KEY }}" > key.pem
          chmod 600 key.pem
          ssh -i key.pem root@${{ secrets.SERVER_IP }} "
            cd /opt/qor3a &&
            git pull &&
            docker compose build backend-api &&
            docker compose up -d backend-api &&
            echo '✅ Deployed successfully'
          "
```

---

## 5. Release Process

### 5.1 Versioning

```
Semantic Versioning: MAJOR.MINOR.PATCH
├── MAJOR: تغيير جذري (API v2)
├── MINOR: ميزة جديدة (Payment Link)
└── PATCH: إصلاح خطأ (Bug fix)

مثال: v1.2.3
├── 1 = الإصدار الرئيسي
├── 2 = الميزة الثانية
└── 3 = الإصلاح الثالث
```

### 5.2 Release Checklist

```
□ كل الاختبارات تمر (npm test)
□ Lint لا يوجد أخطاء
□ Build يعمل (dev + production)
□ Migration جاهز (knex migrate up)
□ Changelog محدث
□ Git tag: git tag v1.2.3 && git push --tags
□ Docker image مبني ومرفوع
□ Smoke test على Staging
□ Backup DB قبل النشر
□ النشر باستخدام zero-downtime strategy
□ Smoke test بعد النشر
□ monitoring check بعد 30 دقيقة
```

---

## 6. Zero-Downtime Deployment

```yaml
# Nginx load balancer مع two instances
upstream backend {
    server api1:3000;
    server api2:3000;
}

# تحديث بدون توقف:
1. pull latest
2. docker compose up -d api2  ← نسخة جديدة
3. انتظر health check
4. docker compose up -d api1  ← نسخة جديدة
5. اكتمل التحديث
```

---

*Qor3a — Deployment Strategy V1.0*
