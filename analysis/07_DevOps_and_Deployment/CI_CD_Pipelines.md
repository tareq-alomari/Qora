# 🔄 CI/CD Pipeline

> **Qor3a (قرعة)** — GitHub Actions + Docker + Automated Deployment

---

## 1. Pipeline Overview

```
git push origin main
        │
        ▼
┌───────────────────────┐
│  1. اختبارات تلقائية  │
│  ├── npm run lint     │
│  ├── npm run test     │
│  └── npm run build    │
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│  2. بناء Docker       │
│  ├── docker build     │
│  └── docker tag       │
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│  3. رفع الصورة        │
│  ├── docker push      │
│  └── إشعار            │
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│  4. نشر على السيرفر   │
│  ├── docker pull      │
│  ├── docker compose up│
│  └── smoke test       │
└───────────────────────┘
```

---

## 2. GitHub Actions Workflow

### 2.1 Backend API

```yaml
# .github/workflows/deploy-api.yml
name: Deploy Backend API

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/api/**'

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: qor3a_test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: backend/api/package-lock.json

      - run: npm ci
        working-directory: backend/api

      - run: npm run lint
        working-directory: backend/api

      - run: npm test
        working-directory: backend/api
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/qor3a_test
          JWT_SECRET: test-secret
          NODE_ENV: test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -t qor3a-api:latest -f infra/Dockerfile.api .
          docker tag qor3a-api:latest registry.qor3a.com/qor3a-api:${{ github.sha }}

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push registry.qor3a.com/qor3a-api:latest
          docker push registry.qor3a.com/qor3a-api:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/qor3a
            git pull
            docker compose pull backend-api
            docker compose up -d backend-api
            sleep 10
            curl -f http://localhost:3000/health || exit 1

      - name: Notification (success)
        if: success()
        run: |
          curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT }}/sendMessage" \
            -d "chat_id=${{ secrets.TELEGRAM_CHAT }}&text=✅ Qor3a deployed: ${{ github.sha }}"
```

### 2.2 Frontend

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm ci && npm run build
        working-directory: frontend

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          source: "frontend/dist/*"
          target: "/var/www/qor3a/"
```

---

## 3. Branch Strategy

```
main ← production-ready
│
├── develop ← staging (التكامل)
│   ├── feature/auth-module
│   ├── feature/orders-state-machine
│   ├── feature/payment-module
│   └── ...
│
└── hotfix/ ← إصلاحات عاجلة (direct to main)
```

### متى ينشر؟

| الفرع | البيئة | متى |
|-------|--------|-----|
| `feature/*` | محلي (Developer) | أثناء التطوير |
| `develop` | Staging | بعد كل Merge |
| `main` | Production | بعد موافقة + اختبارات |
| `hotfix/*` | Production (مباشر) | عاجل فقط |

---

## 4. Quality Gates

```
قبل النشر إلى Production، يجب تجاوز:
═══════════════════════════════════
✅ ESLint: 0 أخطاء
✅ Unit Tests: 100% Pass
✅ Integration Tests: 100% Pass
✅ Build: يعمل
✅ Code Review: موافقة من شخصين
✅ Staging: Smoke Test ناجح
✅ DB Migration: جاهز
✅ Changelog: محدث
```

---

## 5. Docker Registry

```yaml
# المرحلة 1: Docker Hub (مجاني)
images: qor3a/api:latest

# المرحلة 2: GitHub Container Registry
images: ghcr.io/qor3a/api:latest

# المرحلة 3: Self-hosted (Harbor)
images: registry.qor3a.com/api:latest
```

---

## 6. Smoke Tests بعد النشر

```bash
#!/bin/bash
# smoke-test.sh — يشغل بعد النشر

echo "🔍 Running smoke tests..."

# 1. هل API يستجيب؟
curl -f http://localhost:3000/health || exit 1
echo "✅ Health check passed"

# 2. Database؟
curl -f http://localhost:3000/health/detailed | grep -q '"database":"connected"' || exit 1
echo "✅ Database connected"

# 3. تسجيل + Login؟
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"96770000000"}' | jq -r '.data.access_token')
[ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] || exit 1
echo "✅ Auth working"

# 4. إنشاء طلب؟
curl -f -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" || exit 1
echo "✅ Orders working"

echo "🎉 All smoke tests passed!"
```

---

## 7. Rollback Strategy

```
إذا فشل النشر:
──────────────────

1. تلقائي: التراجع إلى آخر إصدار مستقر
   git revert HEAD
   docker compose up -d backend-api

2. يدوي: 
   ssh server
   cd /opt/qor3a
   git checkout v1.2.2  ← آخر إصدار مستقر
   docker compose up -d backend-api

3. وقت الاسترجاع: < 5 دقائق
```

---

*Qor3a — CI/CD Pipeline V1.0*
