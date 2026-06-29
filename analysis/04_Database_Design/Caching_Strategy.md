# ⚡ استراتيجية التخزين المؤقت — Caching Strategy

> **Qor3a (قرعة)** — Redis caching, CDN, Query Optimization

---

## 1. متى نستخدم Cache؟

| السيناريو | هل نحتاج Cache؟ | السبب |
|-----------|----------------|-------|
| بيانات المستخدم (profile) | 🟡 أحياناً | تتغير قليلاً، لكن عدد المستخدمين قليل |
| حالة الطلب | 🟢 نعم | يقرأها العميل 10x أكثر مما يعدلها |
| قائمة الطلبات (مع فلترة) | 🟢 نعم | الموظف يفتحها كل دقيقة |
| التقارير والإحصائيات | 🟢 نعم | حسابات ثقيلة تتكرر |
| الصور (MinIO) | 🟢 نعم | حجم كبير، طلب متكرر |
| محتوى ثابت (CSS/JS) | 🟢 نعم | CDN + Browser Cache |
| AI Validation Result | 🟡 مؤقت | يقرأ مرة ثم ينتقل للحالة التالية |
| قوائم المدفوعات | 🟢 نعم | مراجعة + تصدير متكرر |

---

## 2. طبقات التخزين المؤقت (Cache Layers)

```
                   ┌──────────────┐
                   │   Browser    │
                   │ Cache (PWA)  │
                   └──────┬───────┘
                          │ SW Cache
                   ┌──────▼───────┐
                   │  CDN Cache   │
                   │ (CloudFlare) │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  Nginx Cache │
                   │ (محتوى ثابت) │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  Redis Cache │
                   │ (بيانات ديناميكية)│
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  PostgreSQL  │
                   │  (Source of Truth)│
                   └──────────────┘
```

---

## 3. Redis Cache

### 3.1 ما نخزنه في Redis؟

| المفتاح | القيمة | TTL | الحجم التقريبي |
|---------|--------|-----|----------------|
| `user:{id}:profile` | JSON | 5 دقائق | 1KB/user |
| `order:{id}:status` | JSON | 30 ثانية | 500B/order |
| `orders:list:{filters}` | JSON[] | 10 ثوانٍ | 10KB/query |
| `stats:daily` | JSON | 1 ساعة | 2KB |
| `payment:providers` | JSON[] | 1 يوم | 1KB |
| `ai:validation:{order_id}` | JSON | 5 دقائق | 500B |

### 3.2 استراتيجية الـ Invalidation

```javascript
// عند تحديث الطلب — حذف cache الطلب + قائمة الطلبات
const invalidateOrder = async (orderId) => {
  await redis.del(`order:${orderId}:status`)
  // مسح كل قوائم الطلبات المصفاة (باستخدام pattern)
  const keys = await redis.keys('orders:list:*')
  if (keys.length > 0) await redis.del(keys)
}

// عند تحديث الملف الشخصي
const invalidateUser = async (userId) => {
  await redis.del(`user:${userId}:profile`)
}
```

### 3.3 Cache-Aside Pattern

```javascript
const getOrderStatus = async (orderId) => {
  // 1. حاول تجيب من cache
  const cached = await redis.get(`order:${orderId}:status`)
  if (cached) return JSON.parse(cached)

  // 2. لو ما في — جيب من DB
  const order = await db('orders').where({ id: orderId }).first()

  // 3. خزن في cache
  await redis.setex(`order:${orderId}:status`, 30, JSON.stringify(order))

  return order
}
```

---

## 4. CDN Cache (CloudFlare)

| المورد | Cache | TTL | ملاحظات |
|--------|-------|-----|---------|
| JS/CSS bundles | نعم | 1 سنة | اسم الملف يحتوي Hash |
| الصور (النهائية) | نعم | 1 ساعة | MinIO → CDN |
| صور الإيصالات | لا | — | بيانات حساسة |
| API Responses | لا | — | ديناميكية |
| PWA App Shell | نعم | 24 ساعة | Service Worker |

---

## 5. Browser Cache (PWA)

### 5.1 Service Worker Caching Strategy

```javascript
// Cache First — للمحتوى الثابت
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/static/')) {
    event.respondWith(caches.match(event.request)
      .then(cached => cached || fetch(event.request)))
  }
})

// Network First — للبيانات
if (event.request.url.includes('/api/')) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open('api-cache').put(event.request, clone)
        return response
      })
      .catch(() => caches.match(event.request))
  )
}
```

### 5.2 ما نخزنه في المتصفح؟

| المورد | الاستراتيجية | الحجم |
|--------|-------------|-------|
| الصفحات الثابتة | Cache First | ~50KB |
| أيقونات وشعارات | Cache First | ~100KB |
| آخر طلب للمستخدم | Network First | ~5KB |
| حالة الطلب الحالية | Network First | ~1KB |

---

## 6. Nginx Cache (محتوى ثابت)

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /static/ {
    expires 7d;
    add_header Cache-Control "public, must-revalidate";
}

location /api/ {
    # لا تخزين
    add_header Cache-Control "no-store";
}
```

---

## 7. أدوات القياس (Monitoring)

| المقياس | طريقة القياس | التنبيه |
|---------|-------------|---------|
| Cache Hit Ratio | Redis INFO | < 60% |
| Redis Memory | redis-cli info memory | > 80% |
| CDN Hit Ratio | CloudFlare Analytics | < 70% |
| API Response Time | Winston + UptimeRobot | > 500ms |

---

## 8. متى نضيف Cache؟

```
تحتاج 500+ طلب نشط في نفس الوقت
├── قبلها: لا نحتاج Cache — PostgreSQL يتحمل
├── 500-2000: Cache للطلبات المتكررة (Redis)
└── 2000+: CDN + Redis + Nginx Cache معاً
```

> حاليًا (MVP): لا نحتاج Cache نشط. نضيفه عندما نرى تأخير > 200ms.
> Redis موجود أصلاً (لـ Bull Queue) — تفعيل Cache مجاني.
