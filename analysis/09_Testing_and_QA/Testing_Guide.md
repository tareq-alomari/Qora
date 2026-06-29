# 🧪 دليل الاختبارات — Testing Guide

> **Qor3a (قرعة)** — How to Write & Run Tests, Coverage Targets, Best Practices

---

## 1. أنواع الاختبارات

```
           ⬆
         / 🔵 \
        /  E2E  \
       /   (5%)   \
      ───────────────
     /    🟢         \
    /  Integration     \
   /     (15%)          \
  ────────────────────────
 /        🟡              \
/      Unit Tests         \
/        (80%)             \
─────────────────────────────
```

| النوع | الغرض | العدد | الوقت | الأداة |
|-------|-------|-------|-------|--------|
| **Unit** | دوال Service + Model منفصلة | ~200 | ثوانٍ | Jest |
| **Integration** | API endpoints + DB حقيقي | ~50 | دقائق | Supertest + Jest |
| **E2E** | رحلة المستخدم الكاملة | ~10 | 20 دقيقة | Puppeteer + Jest |

---

## 2. ماذا نختبر بالضبط؟

### 2.1 Service Layer (🧠 Business Logic)

```javascript
// ✅ يجب اختبار:
// auth.service.js
register(), login(), verifyOTP(), refreshToken()

// orders.service.js (الأكثر أهمية!)
createOrder(), updatePersonalData(), uploadPhoto()
verifyPhoto(), submitPayment(), verifyPayment()
approveOrder(), submitToOfficialSite(), markCompleted()

// payments.service.js
submitReceipt(), verifyPayment(), rejectPayment()

// admin.service.js
getStats(), getUsers(), updateUserRole(), exportReport()
```

### 2.2 State Machine Tests (حرجة — 100% تغطية)

```javascript
// كل transition مسموح + ممنوع
describe('Orders State Machine', () => {
  it('draft → data_entry_complete (allowed)', async () => { /* 200 */ })
  it('draft → approved (forbidden)', async () => { /* 409 */ })
  it('data_entry_complete → photo_pending (allowed)', async () => { /* 200 */ })
  it('completed → draft (forbidden, terminal)', async () => { /* 409 */ })
  // ... كل 12×12 transition
})
```

### 2.3 Controller Layer (🎯 Request/Response)

```javascript
// ✅ اختبارات أساسية:
describe('POST /api/v1/orders', () => {
  it('creates order with valid data', async () => { /* 201 */ })
  it('rejects unauthenticated request', async () => { /* 401 */ })
  it('validates required fields', async () => { /* 400 */ })
})
```

### 2.4 Model Layer (🗄️ Database Queries)

```javascript
// ✅ اختبارات:
describe('OrderModel', () => {
  it('creates order with UUID', async () => { /* uuid */ })
  it('finds orders by user_id', async () => { /* filtered */ })
  it('supports pagination', async () => { /* limit + offset */ })
})
```

---

## 3. كتابة الاختبارات

### 3.1 Unit Test Example

```javascript
const { orderService } = require('./orders.service')

describe('orderService.createOrder', () => {
  const mockDb = { insert: jest.fn().mockResolvedValue({ id: 'uuid' }) }

  it('creates order with status draft', async () => {
    const order = await orderService.create('user-uuid', mockDb)
    expect(order.status).toBe('draft')
    expect(order.user_id).toBe('user-uuid')
  })

  it('throws for invalid user', async () => {
    mockDb.insert.mockRejectedValueOnce(new Error('User not found'))
    await expect(orderService.create('invalid', mockDb))
      .rejects.toThrow('User not found')
  })
})
```

### 3.2 Integration Test Example

```javascript
const request = require('supertest')
const app = require('../src/index')

describe('POST /api/v1/auth/register', () => {
  it('registers and sends OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967712345678' })

    expect(res.status).toBe(201)
    expect(res.body.data.otp_sent).toBe(true)
  })
})
```

### 3.3 State Machine Test Example

```javascript
describe('Order State Machine — Allowed Transitions', () => {
  const transitions = [
    ['draft', 'data_entry_complete', true],
    ['draft', 'cancelled', true],
    ['draft', 'approved', false],
    ['data_entry_complete', 'photo_pending', true],
    ['data_entry_complete', 'draft', true],
    // ... كل الـ transitions
  ]

  transitions.forEach(([from, to, allowed]) => {
    it(`${from} → ${to} returns ${allowed ? '200' : '409'}`, async () => {
      const order = await createOrder({ status: from })
      const res = await changeStatus(order.id, to)
      expect(res.status).toBe(allowed ? 200 : 409)
    })
  })
})
```

---

## 4. تغطية الاختبارات (Coverage Targets)

| الطبقة | الهدف | ملاحظات |
|--------|-------|---------|
| **Service (Business Logic)** | 100% للمسارات الحرجة | State Machine transitions |
| **Service (الباقي)** | > 80% | Auth, Payments, Admin |
| **Controller** | > 90% | Request/Response handling |
| **Model** | > 80% | Queries, Filters, Pagination |
| **State Machine** | 100% | كل transition مسموح/ممنوع |

---

## 5. تشغيل الاختبارات

```bash
# كل الاختبارات
npm test

# وحدة معينة
npm test -- --testPathPattern=orders

# مع التغطية
npm test -- --coverage

# في وضع الـ watch (أثناء التطوير)
npm test -- --watch

# Integration tests فقط
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## 6. هيكل مجلد الاختبارات

```
tests/
├── modules/
│   ├── auth.service.test.js
│   ├── auth.controller.test.js
│   ├── orders.service.test.js
│   ├── orders.controller.test.js
│   ├── payments.service.test.js
│   └── ...
├── integration/
│   ├── auth.api.test.js
│   ├── orders.api.test.js
│   └── ...
├── e2e/
│   ├── full-registration.test.js
│   ├── payment-flow.test.js
│   └── result-check.test.js
└── helpers/
    ├── setup.js       # DB connection + cleanup
    └── factories.js   # Test data factories
```

---

## 7. أفضل الممارسات

```
✅ Do:
├── اختبار واحد = حقيقة واحدة
├── استخدم factories لبيانات الاختبار
├── Mock خارجية (AI, WhatsApp, SMS)
├── Clean up بعد كل اختبار
├── State Machine transitions = 100% تغطية
└── اكتب الاختبار قبل أو مع الكود (TDD)

❌ Don't:
├── لا تختبر مكتبات خارجية (Joi, JWT)
├── لا تعتمد على بيانات ثابتة من DB
├── لا تترك test files مهملة
└── لا تستخدم console.log للتصحيح—استخدم debugger
```

---

*Qor3a — Testing Guide V1.0*
