# 📝 نظام تسجيل الأحداث — Logging Strategy

> **Qor3a (قرعة)** — Winston Logger Configuration + Log Structure + Retention

---

## 1. Logger Configuration

```javascript
// backend/api/src/common/logger.js
const winston = require("winston")

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

module.exports = { logger }
```

### Levels

| Level | الاستخدام | لون |
|-------|-----------|-----|
| **error** | أخطاء تؤثر على المستخدم | 🔴 |
| **warn** | تحذيرات (Rate limit, فشل إشعار) | 🟡 |
| **info** | أحداث مهمة (تسجيل، دفع، تغيير حالة) | ✅ |
| **http** | كل طلبات الـ API | 📡 |
| **verbose** | تفاصيل إضافية | 📋 |
| **debug** | تصحيح الأخطاء (التطوير فقط) | 🔧 |
| **silly** | كل شيء | 🗑️ |

---

## 2. Log Structure

### 2.1 JSON Format (Production)

```json
{
  "timestamp": "2026-09-01T10:30:00.123Z",
  "level": "info",
  "message": "Order status changed",
  "service": "orders-service",
  "module": "orders",
  "action": "changeStatus",
  "metadata": {
    "orderId": "uuid-123",
    "userId": "uuid-456",
    "fromStatus": "payment_verification",
    "toStatus": "approved",
    "changedBy": "employee-uuid"
  },
  "requestId": "req-uuid-789",
  "duration": 245
}
```

### 2.2 الحقول الإلزامية

| الحقل | مطلوب | مثال |
|-------|-------|------|
| `timestamp` | ✅ | ISO 8601 |
| `level` | ✅ | info, error |
| `message` | ✅ | وصف الحدث |
| `service` | ✅ | api, ai, headless |
| `module` | للـ API | auth, orders, payments |
| `requestId` | للـ API | correlation ID |
| `duration` | للـ API | وقت المعالجة (ms) |
| `userId` | إذا موجود | من قام بالإجراء |
| `metadata` | حسب الحاجة | بيانات إضافية |

---

## 3. أنواع السجلات

### 3.1 API Logs

```javascript
// Middleware لتسجيل كل طلب
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
      ip: req.ip,
    })
  })
  next()
})
```

### 3.2 Business Logs

```javascript
// كل تغيير حالة مهم
logger.info('Order status changed', {
  module: 'orders',
  action: 'changeStatus',
  metadata: { orderId, fromStatus, toStatus, changedBy },
})

// الدفع
logger.info('Payment verified', {
  module: 'payments',
  action: 'verify',
  metadata: { orderId, paymentId, verifiedBy },
})

// AI validation
logger.info('Photo validation result', {
  module: 'ai',
  action: 'validate',
  metadata: { orderId, result: 'accepted', confidence: 95 },
})
```

### 3.3 Error Logs

```javascript
try {
  // ...
} catch (err) {
  logger.error('Failed to process order', {
    module: 'orders',
    action: 'create',
    metadata: { userId, error: err.message },
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
```

---

## 4. Log Levels في كل بيئة

| البيئة | الـ Level | التخزين |
|--------|-----------|---------|
| **Development** | debug | Console فقط |
| **Staging** | info | Console + File (7 أيام) |
| **Production** | http (API) / info (Business) | Console (Docker logs) + Log aggregation |

---

## 5. سياسة الاحتفاظ

| البيئة | المدة | ملاحظات |
|--------|-------|---------|
| Development | 7 أيام | ملفات محلية |
| Staging | 30 يوماً | للتحليل |
| Production | 90 يوماً | متطلبات Audit |
| Audit Logs | سنتان | في قاعدة البيانات |
| Error Logs | سنة | للتحليل الأمني |

---

## 6. ما لا نسجله في الـ Logs

```
❌ كلمات السر (bcrypt hash ولا حتى masked)
❌ JWT tokens
❌ OTP codes
❌ الصور الشخصية (base64)
❌ أرقام الحوالات الكاملة
❌ أي بيانات sensitive يمكن أن تضر العميل

✅ نسجل: action، status changes، metadata عام
✅ audit_logs في DB: مسار تدقيق كامل بدون بيانات حساسة
```

---

## 7. Log Rotation

```bash
# logrotate config — /etc/logrotate.d/qor3a
/var/log/qor3a/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

---

*Qor3a — Logging Strategy V1.0*
