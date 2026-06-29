# 📊 المراقبة والتنبيهات — Monitoring & Alerting

> **Qor3a (قرعة)** — استراتيجية مراقبة شاملة لجميع مكونات النظام

---

## 1. أهداف المراقبة

```
┌─────────────────────────────────────────────────────────────┐
│ الهدف                        │ كيف نقيسه                    │
├──────────────────────────────┼──────────────────────────────┤
│ uptime > 99.5% (موسم)       │ UptimeRobot، health checks    │
│ API Response Time < 1s P95  │ Winston logs + metrics        │
│ AI Processing < 5s           │ Health check endpoint        │
│ Queue لا تتراكم > 100 طلب   │ Bull Dashboard               │
│ لا اختراق أمني               │ Audit Log + Nginx logs       │
│ SSL لا ينتهي                 │ UptimeRobot SSL check        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ما نراقبه

### 2.1 النظام (Infrastructure)

| المكون | الأداة | ماذا نراقب | التنبيه عند |
|--------|--------|-----------|-------------|
| **CPU** | htop / netdata / Prometheus | % استخدام | > 80% لمدة 5 دقائق |
| **RAM** | htop / netdata | % استخدام | > 85% |
| **Disk** | df -h | % استخدام | > 80% |
| **Network** | netdata / vnstat | bandwidth | > 500 Mbps |
| **Docker** | docker stats | كل حاوية | حاوية متوقفة |
| **SSL** | UptimeRobot | تاريخ الانتهاء | قبل 15 يوماً |

### 2.2 التطبيق (Application)

| المكون | الأداة | ماذا نراقب |
|--------|-------|-----------|
| **API Health** | `/health` endpoint | هل API يستجيب؟ |
| **API Response Time** | Winston logs (JSON) | P50, P95, P99 |
| **Error Rate** | Winston logs | نسبة 5xx > 1% |
| **DB Connections** | `pg_stat_activity` | عدد الاتصالات > 50 |
| **Redis Memory** | Redis INFO | > 200MB |
| **MinIO Storage** | API | > 80% من المساحة |
| **Bull Queue** | Queue dashboard | عدد jobs > 100 |

### 2.3 الأعمال (Business)

| المقياس | أداة القياس | التنبيه |
|---------|-----------|---------|
| عدد الطلبات الجديدة/ساعة | Dashboard إحصائي | إذا صفر لمدة 12 ساعة |
| عدد المدفوعات المعلقة | Dashboard | > 20 معلقة |
| نسبة الصور المرفوضة | AI Service logs | > 30% (مشكلة في الدقة) |
| فشل الإشعارات | Notification logs | > 10% فشل |

---

## 3. أدوات المراقبة

| الأداة | النوع | التكلفة | التوصية |
|--------|-------|---------|---------|
| **UptimeRobot** | مراقبة توفر | مجاني (50 monitor) | ✅ موقع + API |
| **NetData** | نظام (CPU, RAM, Disk) | مجاني (self-hosted) | ✅ على السيرفر |
| **Prometheus + Grafana** | نظام متقدم | مجاني | المرحلة 2 |
| **Winston Logs** | API logs | موجود مسبقاً | ✅ |
| **Bull Dashboard** | Queue | موجود مسبقاً | ✅ |
| **Sentry** | Error tracking | مجاني (لـ 5K events) | ✅ إضافي |

---

## 4. قنوات التنبيه

```
🔴 Critical → تيليجرام + إيميل (فوري)
├── الموقع لا يستجيب
├── Error Rate > 5%
├── DB disconnected
└── Security breach

🟡 Warning → تيليجرام
├── CPU > 80%
├── Queue > 50 jobs
├── SSL باقي 15 يوم
└── Backup فشل

🟢 Info → إيميل يومي
├── Backup تم بنجاح
├── عدد الطلبات اليومي
└── إحصائيات الأسبوع
```

---

## 5. Health Check Endpoints

```javascript
// GET /api/v1/health → 200
{
  "status": "ok",
  "uptime": 123456,
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "minio": "connected",
    "ai_service": "healthy"
  }
}

// GET /api/v1/health/detailed → لكل مكون
{
  "postgres": { "status": "ok", "connections": 12, "lag": "0ms" },
  "redis": { "status": "ok", "memory": "45MB", "hit_rate": "87%" },
  "minio": { "status": "ok", "buckets": 3, "storage": "2.1GB" },
  "bull": { "waiting": 5, "active": 2, "failed": 1 }
}
```

---

## 6. قائمة تشغيل المراقبة

```
□ إعدادات UptimeRobot → كل 5 دقائق
  ├── api.qor3a.com/health
  └── qor3a.com
□ NetData → مراقبة السيرفر 24/7
□ Winston → JSON logs مع timestamp
□ Bull Dashboard → مفتوح للمسؤولين
□ SSL expiry reminder ← قبل 30 و 15 و 7 أيام
□ Backup check → كل صباح (تم النسخ؟)
□ Weekly review → مراجعة logs + alerts
```

---

*Qor3a — Monitoring Strategy V1.0*
