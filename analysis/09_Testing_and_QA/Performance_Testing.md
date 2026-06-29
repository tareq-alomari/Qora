# ⚡ اختبارات الأداء — Performance Testing

> **Qor3a (قرعة)** — Load Testing مع K6، أهداف الأداء، Benchmarks

---

## 1. أهداف الأداء (SLIs/SLOs)

| المؤشر | SLO | الطريقة |
|--------|-----|---------|
| **P95 Response Time** | < 1 ثانية | مراقبة الـ API |
| **P99 Response Time** | < 3 ثوانٍ | مراقبة الـ API |
| **Error Rate** | < 0.5% | مراقبة الأخطاء |
| **Throughput** | 100 req/s | Load Test |
| **Uptime (موسم)** | > 99.5% | مراقبة 24/7 |
| **AI Processing** | < 5 ثوانٍ | Server timing |
| **Page Load** | < 2 ثانية | Lighthouse |

---

## 2. سيناريوهات Load Testing (K6)

### 2.1 Auth Endpoints

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // تصاعد
    { duration: '2m', target: 100 },  // ذروة
    { duration: '1m', target: 0 },    // انخفاض
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const res = http.post(`${__ENV.BASE_URL}/api/v1/auth/register`, {
    phone: `9677${Math.floor(10000000 + Math.random() * 90000000)}`,
  })
  check(res, { 'status 201': (r) => r.status === 201 })
  sleep(1)
}
```

### 2.2 Order Creation

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 30 },   // محاكاة موسم
    { duration: '3m', target: 60 },   // ذروة الموسم
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
}
```

### 2.3 AI Photo Upload (تحميل تدريجي)

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // صور قليلة
    { duration: '2m', target: 20 },   // ضغط متوسط
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
  },
}
```

---

## 3. اختبار الأداء الحرج: 100 مستخدم متزامن

### السيناريو
```
الوقت: 10 دقائق
المستخدمون: 100 متزامن
الإجراءات: كل مستخدم → تسجيل → طلب → رفع صورة (mock) → دفع

متطلبات النجاح:
├── P95 Response Time < 2 ثانية
├── Error Rate < 1%
└── CPU < 70% (خادم 2 vCPU)
```

### المتغيرات المقاسة

| المقياس | الهدف | أداة القياس |
|---------|-------|------------|
| Response Time | < 2s P95 | K6 |
| Request Throughput | > 50 req/s | K6 |
| CPU Usage | < 70% | htop / Docker stats |
| Memory Usage | < 80% | Docker stats |
| DB Connections | < 50 | pg_stat_activity |
| Redis Memory | < 200MB | Redis INFO |

---

## 4. سيناريو الضغط (Stress Test)

```
الهدف: كم طلب/ثانية قبل الانهيار؟

الخطوات:
1. ابدأ بـ 10 مستخدمين متزامنين
2. زد 10 كل دقيقة
3. لاحظ أين يبدأ الـ Error Rate بالارتفاع
4. سجل الـ Breaking Point

توقع:
├── 200 مستخدم → P95 < 3s ✅
├── 500 مستخدم → P95 < 5s (بدأ التباطؤ)
├── 1000 مستخدم → Error Rate > 5% (تحتاج توسعة)
└── تعليق: توسعة إلى 4 vCPU
```

---

## 5. Soak Test (اختبار التحمل)

```
المدة: 4 ساعات
المستخدمون: 50 متزامن
الهدف: التأكد من عدم تسرب الذاكرة

نقاط المراقبة كل 30 دقيقة:
├── Memory Usage ← يجب أن يكون ثابتاً
├── Response Time ← لا يزيد
├── DB Connections ← لا تتراكم
└── CPU Usage ← مستقر

إذا زادت الذاكرة > 20% خلال 4 ساعات → تسرب (Memory Leak)
```

---

## 6. حدود البنية التحتية

### VPS (Hetzner CX22 — $12/شهر)

| المورد | المتاح | الذروة الآمنة |
|--------|--------|--------------|
| vCPU | 2 | 80% |
| RAM | 4 GB | 3.2 GB |
| Storage | 80 GB | 60 GB |
| Network | 1 Gbps | — |

### التوسعة (في ذروة الموسم)

```
إذا وصلنا إلى 1000+ طلب/يوم → ننتقل إلى:
├── CX32 ($24/شهر): 4 vCPU + 8 GB RAM
├── Read Replica PostgreSQL
└── Redis Cluster
```

---

## 7. تحسينات الأداء الموصى بها

| التحسين | التأثير | التكلفة |
|---------|---------|---------|
| Redis Cache للـ API endpoints | -50% Response Time | مجاني |
| DB Indexes على user_id + status | -80% Query Time | مجاني |
| CDN للصور (MinIO → CDN) | -60% تحميل الصور | $5-10 |
| Pagination في كل القوائم | -90% تحميل الصفحات | مجاني |
| Compression (gzip) | -70% حجم الاستجابة | مجاني |
| Lazy Loading للصور | -50% First Paint | مجاني |
| DB Connection Pool (20-50) | -30% Connection Time | مجاني |

---

## 8. سيناريو استباقي: إعلان النتائج (مايو)

```
أخطر يوم تقني في السنة:
├── 300+ مستخدم يضغطون "فحص النتيجة" في نفس الوقت
├── كل طلب: Headless Browser + CAPTCHA (3-5 دقائق)
└── Bull Queue: max 50 طلب/دقيقة

الإجراء:
├── Rate Limiting صارم: 1 طلب/دقيقة لكل مستخدم
├── Queue مع Priority: الفائزين أولاً
├── صفحة "في الطابور" مع وقت تقديري
└── إشعارات Push عند اكتمال الفحص
```

---

*Qor3a — Performance Testing V1.0*
