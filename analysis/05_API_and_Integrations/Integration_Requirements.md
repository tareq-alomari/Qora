# 🔗 متطلبات التكامل — Integration Requirements

> **Qor3a (قرعة)** — كل الخدمات الخارجية التي يتكامل معها النظام

---

## 1. نظرة عامة

```
┌─────────────────────────────────────────────────────────────────┐
│                      Qor3a System                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ WhatsApp │  │ 2Captcha │  │ SMTP     │  │ Official       │   │
│  │ Cloud API│  │ API      │  │ (Email)  │  │ DV Site        │   │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Proxy    │  │ SMS      │  │ MinIO    │                       │
│  │ Provider │  │ Gateway  │  │ (S3)     │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. قائمة خدمات التكامل

| الخدمة | النوع | المرحلة | الأولوية | التكلفة |
|--------|-------|---------|---------|---------|
| **WhatsApp Cloud API** | إشعارات (OTP، تحديثات) | V1 | 🔴 ضروري | مجاني (Meta) |
| **2Captcha** | حل CAPTCHA | V1 | 🔴 ضروري | ~$15/سنة |
| **Proxy Provider** | تجاوز حظر IP | V1 | 🔴 ضروري | ~$10-30/شهر |
| **SMTP (Email)** | إشعارات احتياطية | V1 | 🟡 مهم | $0-5/شهر |
| **SMS Gateway** | إشعارات طوارئ | V1 | 🟡 مهم | ~$10/شهر |
| **MinIO / S3** | تخزين الصور | V1 | 🔴 ضروري | مجاني (MinIO) |
| **Jeeb Payment Link** | رابط دفع مباشر | V2 | 🟢 اختياري | — |

---

## 3. تكامل الإشعارات (Notification Chain)

```
إرسال إشعار →
     │
     ├── WhatsApp Cloud API (Primary)
     │   ├── Meta Business Account
     │   ├── Template Messages (OTP, status updates)
     │   └── 24-hour free messaging window
     │
     ├── PWA Push (Fallback 1)
     │   ├── Service Worker
     │   └── Notification API
     │
     ├── SMS Gateway (Fallback 2)
     │   ├── Twilio أو مزود محلي
     │   └── للنصوص القصيرة فقط
     │
     └── Email (Fallback 3)
         ├── SMTP (SendGrid / Gmail)
         └── للإشعارات الطويلة
```

### 3.1 WhatsApp Cloud API

| العنصر | المواصفات |
|--------|-----------|
| **المنصة** | Meta WhatsApp Cloud API |
| **التسعير** | مجاني (1,000 محادثة/شهر مجاناً) |
| **التوثيق** | `graph.facebook.com/v17.0/{phone-number-id}/messages` |
| **الرسائل** | Templates مصادق عليها (OTP, Status) |
| **العدد** | ~5K-50K رسالة/موسم |
| **Fallback** | PWA Push → SMS → Email |

### 3.2 Flowchart الإشعارات

```
try {
  await sendWhatsApp(user, message)
} catch (whatsappError) {
  logger.warn('WhatsApp failed, trying PWA push')
  try {
    await sendPWAPush(user, message)
  } catch (pwaError) {
    logger.warn('PWA push failed, trying SMS')
    try {
      await sendSMS(user, message)
    } catch (smsError) {
      logger.warn('SMS failed, trying Email')
      await sendEmail(user, message)
    }
  }
}
```

---

## 4. تكامل CAPTCHA (للفحص الآلي)

```
عند فحص النتيجة ←
     │
     ├── 2Captcha API
     │   ├── أرسل صورة CAPTCHA
     │   ├── استلم token
     │   └── كلفة: $1/1000 طلب
     │
     ├── Manual Fallback (إذا فشل 2Captcha)
     │   ├── Queue للطلبات اليدوية
     │   └── Employee يحل CAPTCHA يدوياً
     │
     └── Proxy Rotation
         ├── Pool من 10-20 IP (US/Turkey/UAE)
         ├── تأخير عشوائي 3-7 ثواني
         └── إذا حظر IP → استبدال
```

---

## 5. تكامل التخزين (MinIO / S3)

| الوظيفة | الواجهة | مثال |
|---------|---------|------|
| رفع صورة | `PUT /bucket/{order_id}/photo.jpg` | Client → API → MinIO |
| قراءة صورة | `GET /bucket/{order_id}/photo.jpg` | Employee review |
| حذف صورة | `DELETE /bucket/{order_id}/photo.jpg` | بعد 30 يوم |
| رفع إيصال | `PUT /bucket/payments/{payment_id}.jpg` | Client upload |
| تخزين مؤقت | `GET /bucket/{path}` ← CDN | تحميل أسرع |

### 5.1 هيكل Buckets

```
qor3a-photos/
├── original/          ← الصور الأصلية (للتحقق)
│   └── {order_id}.jpg
├── receipt/           ← إيصالات الدفع
│   └── {payment_id}.jpg
├── confirmation/      ← صور التأكيد من الموقع الرسمي
│   └── {order_id}.png
└── temp/             ← ملفات مؤقتة (تنظف كل 24 ساعة)
```

---

## 6. تكامل الدفع (لا API)

```
⚠️ لا يوجد API للدفع — العميل يحول على حسابات قرعة يدوياً.

التدفق:
1. يختار طريقة الدفع (كريمي، جيب، ون كاش، موبايل موني)
2. يشوف رقم حساب قرعة
3. يحول المبلغ (1,000 YR)
4. يرفع صورة الإشعال
5. الموظف يتأكد يدوياً ويضغط Verify

المرحلة 2 (Jeeb Payment Link):
├── يرسل للعميل رابط دفع
├── العميل يدفع مباشرة (بدون رفع إيصال)
└── API يحوّل المبلغ لحساب قرعة
```

---

## 7. متطلبات الأمان للتكامل

| الخدمة | المصادقة | التشفير | Rate Limit |
|--------|---------|---------|-----------|
| WhatsApp API | Token (Bearer) | HTTPS | 80 req/s |
| 2Captcha | API Key | HTTPS | 60 req/min |
| SMTP | Username + Password | STARTTLS | 500/يوم |
| MinIO | Access Key + Secret | HTTPS + TLS | حسب الإعداد |
| Proxy | IP/Port | — | حسب الخطة |

---

## 8. قائمة البيئات (Environment Variables)

```
# المطلوب تشغيل التكاملات
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
TWOCAPTCHA_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
S3_BUCKET=...
PROXY_LIST=...
SMS_API_KEY=...
```

---

*Qor3a — Integration Requirements V1.0*
