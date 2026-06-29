# تحليل المخاطر والأمان (Risk & Security Analysis)

## 1. Risk Assessment Matrix

| ID | Risk | Probability | Impact | RPN (P × I) | Mitigation Strategy |
|----|------|-------------|--------|-------------|---------------------|
| R1 | الموقع الرسمي للوتري يغير هيكل صفحاته | Medium (30%) | High (9) | 27 | عناوين CSS انتقائية + اختبار دوري أسبوعي للـ Scraper + تنبيهات فشل |
| R2 | CAPTCHA يعطل الفحص الآلي بالكامل | High (70%) | High (9) | 63 | استخدام 2Captcha API + طابور يدوي احتياطي + تحديد أولويات الفحص |
| R3 | ضغط هائل على الخادم وقت إعلان النتائج | High (80%) | High (8) | 64 | Auto-scaling خلف Load Balancer + Queueing + Rate Limiting |
| R4 | تسرب بيانات الصور الشخصية | Low (10%) | Critical (10) | 10 | تشفير AES-256 + تخزين في S3 مقفل + سياسة حذف تلقائي |
| R5 | فشل AI Microservice في معالجة الصور | Medium (40%) | Medium (6) | 24 | Graceful Degradation → تحقق يدوي + إعادة تشغيل تلقائي |
| R6 | احتيال دفع (صور حوالات مزورة) | Medium (40%) | High (8) | 32 | موظف يتأكد يدوياً + (لاحقاً) OCR لمطابقة رقم الحوالة مع البنك |
| R7 | انقطاع خدمة SMS/WhatsApp API | Low (15%) | Medium (5) | 7.5 | التبديل التلقائي بين مزودين + احتياطي عبر البريد الإلكتروني |
| R8 | العميل يدخل بيانات خاطئة عمداً | Medium (40%) | Medium (5) | 20 | التحقق الآلي من صحة البيانات + مراجعة الموظف الإجبارية |
| R9 | هجوم DDoS خلال موسم التسجيل | Medium (30%) | High (8) | 24 | CloudFlare/WAF + Rate Limiting + IP Banning |
| R10 | الموقع الرسمي يحظر IP الخادم بسبب كثافة الطلبات | High (60%) | High (8) | 48 | Proxy Rotation + تأخير عشوائي بين الطلبات + جدولة ذكية |

### Top 3 Critical Risks (Action Required)
1. **R3 + R2**: أيام إعلان النتائج = ضغط هائل + CAPTCHA ← يحتاج خطة طوارئ متكاملة
2. **R10**: حظر IP يوقف الفحص تماماً ← يحتاج Proxy Pool + مراقبة
3. **R4**: أي تسريب للصور = نهاية المشروع ← استثمار في الأمان من اليوم الأول

---

## 2. Data Privacy & Protection

### 2.1 Data Classification
| Class | Examples | Storage | Encryption | Retention |
|-------|----------|---------|------------|-----------|
| **Critical** | صور جواز السفر، الصورة الشخصية | S3 (Private Bucket) | AES-256 at rest + TLS 1.3 in transit | حذف بعد 30 يوماً من إعلان النتائج |
| **Sensitive** | الاسم، تاريخ الميلاد، رقم الهاتف، البريد | PostgreSQL | Encrypted columns (pgcrypto) | 3 سنوات للأرشفة ثم إخفاء الهوية |
| **Internal** | رقم التأكيد، حالة الطلب | PostgreSQL | TLS + DB-level encryption | مدة دورة اللوتري + سنة |
| **Public** | اسم الخدمة، الأسعار | Any | --- | --- |

### 2.2 Data Retention Policy
```
التقاط الصورة → AI Validation → قبول → تسجيل → إعلان النتائج → 30 يوماً → حذف الصورة
                                                         │
                                                         │
                                                    بعد 3 سنوات → إخفاء هوية البيانات الشخصية
                                                         │
                                                         │
                                                    بعد 5 سنوات → حذف كامل
```

### 2.3 Access Control (RBAC)

| Resource | Client | Employee | Admin |
|----------|--------|----------|-------|
| بياناتي الشخصية | CRUD | Read | Read |
| صورتي الشخصية | CRUD | Read | Read |
| طلباتي | Read | Read (all) | Read (all) |
| طلبات الآخرين | - | Read | Read |
| المدفوعات (خاصتي) | Read | Read | Read |
| المدفوعات (الكل) | - | Read | Read + Export |
| إدارة المستخدمين | - | - | CRUD |
| إدارة الصلاحيات | - | - | CRUD |
| سجل التدقيق (Audit) | - | Read (limited) | Read (full) |
| الإحصائيات والتقارير | - | Read | CRUD + Export |
| إعدادات النظام | - | - | CRUD |

### 2.4 GDPR / Data Privacy Compliance Checklist
- [x] تشفير البيانات الحساسة
- [x] سياسة احتفاظ واضحة
- [x] حق الوصول إلى البيانات (يمكن للعميل تنزيل بياناته)
- [x] حق حذف البيانات (حذف الحساب مع جميع البيانات)
- [ ] موافقة صريحة على معالجة البيانات (نافذة منبثقة)
- [ ] إشعار خرق البيانات خلال 72 ساعة

---

## 3. Traffic Spike Strategy

### 3.1 Known Spike Events
| Event | Expected Traffic | Duration | Warning Time |
|-------|-----------------|----------|-------------|
| الأسبوع الأخير للتسجيل (سبتمبر) | 5x - 10x | 7 أيام | معروف مسبقاً |
| يوم إعلان النتائج (مايو) | 20x - 50x | 24-48 ساعة | معروف مسبقاً |
| إطلاق الإعلانات المدفوعة | 3x - 5x | 3-5 أيام | يمكن التوقع |

### 3.2 Auto-scaling Architecture
```
Traffic Spike (20x)
       │
       ▼
┌──────────────┐    ┌──────────────┐
│  CloudFlare  │───▶│   WAF / DDoS │
│  (CDN + Cache)│   │  Protection  │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────┐
│     Nginx / Load Balancer    │
│  Round Robin + Rate Limiting │
└──────────────┬───────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Web App │ │Web App │ │Web App │
│Instance│ │Instance│ │Instance│
│   1    │ │   2    │ │   N    │
└────────┘ └────────┘ └────────┘
     │         │         │
     └─────────┼─────────┘
               │
               ▼
┌──────────────────────────────┐
│   PostgreSQL (Main + Read    │
│        Replicas)             │
└──────────────────────────────┘
```

### 3.3 Queue Strategy for Result Checking
```
Time of Results Announcement (May 1st)
       │
       ▼
┌─────────────────────────────────────┐
│  10,000+ clients want to check     │
│         simultaneously             │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│          Queue (Redis/RabbitMQ)     │
│  ┌─────────────────────────────┐   │
│  │ Priority 1: VIP clients     │   │
│  │ Priority 2: Registered pre  │   │
│  │ Priority 3: New checks      │   │
│  └─────────────────────────────┘   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     Worker Pool (max 10 workers)   │
│  ┌───┐ ┌───┐ ┌───┐     ┌───┐    │
│  │ W1│ │ W2│ │ W3│ ... │ W10│   │
│  └───┘ └───┘ └───┘     └───┘    │
│  Each: Headless Browser + CAPTCHA│
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Official Site  │
        │ (Rate Limited) │
        └────────────────┘
```

### 3.4 Rate Limiting Policy
| Endpoint | Limit | Burst | Scope |
|----------|-------|-------|-------|
| POST /auth/login | 5/min | 10 | Per IP |
| POST /auth/register | 3/hour | 5 | Per IP |
| POST /orders | 10/min | 20 | Per user |
| POST /orders/{id}/photo | 5/min | 10 | Per order |
| POST /orders/{id}/payment | 3/min | 5 | Per order |
| GET /admin/* | 60/min | 100 | Per employee |
| GET /check-result | 1/min | 2 | Per user (spike protection) |
| POST /api/ai/validate | 30/min | 50 | Per service |

---

## 4. Anti-Fraud & Security Measures

### 4.1 Photo Fraud Prevention
| Threat | Detection | Prevention |
|--------|-----------|------------|
| صورة مأخوذة من الإنترنت | AI checks metadata + EXIF | رفض الصور بدون EXIF كامل |
| صورة قديمة (غير مطابقة) | مقارنة مع الصورة في قاعدة البيانات | طلب التقاط جديد مع timestamp |
| تعديل رقمي للصورة | AI كشف التلاعب (Error Level Analysis) | رفض تلقائي |
| صورة بهاتف آخر (شاشة) | كشف Moire pattern/texture غير طبيعي | رفض تلقائي |

### 4.2 Payment Fraud Prevention
| Threat | Detection | Prevention |
|--------|-----------|------------|
| صورة حوالة مزورة | موظف مدرب + (مستقبلاً) OCR cross-check | تأكيد يدوي إجباري |
| إعادة استخدام نفس الحوالة | فحص uniqueness للحوالة | رفض تلقائي + بلوك المستخدم |
| مبلغ خاطئ | تحقق آلي من المبلغ | منع الإرسال إن كان المبلغ ≠ السعر |

### 4.3 CAPTCHA Bypass Strategy
```
┌─────────────────────────────────────────┐
│         CAPTCHA Handling Flow           │
│                                         │
│  1. Headless Browser encounters CAPTCHA │
│  2. Pause script                        │
│  3. Try automated solver (2Captcha):    │
│     ┌─ Success → Continue              │
│     └─ Failed → Enqueue to manual queue │
│  4. Manual queue:                      │
│     Employee receives notification     │
│     "طلب فحص رقم #1234 يحتاج CAPTCHA"  │
│     Employee solves → continues        │
│  5. If CAPTCHA fails too often:        │
│     Rotate IP/Proxy                    │
│     Wait random delay (1-5 min)        │
└─────────────────────────────────────────┘
```

### 4.4 IP Rotation Strategy
```python
PROXY_POOL = [
    "datacenter_proxy_1:port",
    "datacenter_proxy_2:port",
    "residential_proxy_1:port",
    # ...
]

STRATEGY:
  لكل طلب فحص → اختر Proxy عشوائياً
  إذا تم حظر Proxy → أزله من pool
  إذا pool < 5 → أوقف الفحص ← أرسل إنذار
  تأخير عشوائي بين الطلبات: 3-10 ثواني
  تباعد زمني: لا تفحص أكثر من طلبين من نفس IP في الدقيقة
```

---

## 5. System Hardening

### 5.1 Docker Security
- تشغيل الحاويات بـ `--read-only` حيثما أمكن
- عدم تشغيل containers كـ root
- استخدام Docker Bench Security للتدقيق
- تحديث الصور أسبوعياً (Docker Scout / Trivy)

### 5.2 Network Security
```
┌──────────┐    ┌────────────┐    ┌──────────────┐
│  Public  │───▶│ DMZ        │───▶│  Private     │
│  Internet│    │ (API GW)   │    │  (App + DB)  │
└──────────┘    └────────────┘    └──────────────┘
                      │                  │
                      │           SSH only via
                      │           Bastion Host
                      │                  │
                      ▼                  ▼
                 WAF / DDoS         Internal DNS
                 Protection         + Firewall
```
- PostgreSQL port مفتوح فقط لـ internal network
- API Gateway (Nginx) هو point of entry الوحيد
- جميع الـ microservices تتواصل عبر internal network (Docker network)

### 5.3 Audit Logging
```sql
-- كل تغيير حالة يتم تسجيله
INSERT INTO audit_logs (order_id, user_id, action, from_status, to_status, metadata, ip_address)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- أمثلة:
-- user_id=client_123, action='PHOTO_UPLOAD', from='DATA_ENTRY', to='PHOTO_PENDING'
-- user_id=employee_456, action='PAYMENT_VERIFY', from='PAYMENT_VERIFICATION', to='APPROVED'
-- user_id=system, action='AI_PHOTO_REJECT', metadata={"reason": "background_not_white", "score": 0.23}
```

### 5.4 Incident Response Plan
| Level | Example | Response Time | Action |
|-------|---------|---------------|--------|
| P0 | DB breach, service down | < 15 min | إيقاف الخدمة، إشعار الفريق، تحليل الاختراق |
| P1 | CAPTCHA blocked, high error rate | < 30 min | تفعيل backup strategy, rotate proxies, notify |
| P2 | AI service down | < 1 hour | تفعيل manual review fallback، إعادة تشغيل |
| P3 | SMS API failed | < 4 hours | التبديل لـ email fallback |

---

## 6. Compliance Checklist

### Local Regulations
- [ ] التسجيل التجاري والسجل الضريبي
- [ ] موافقة هيئة الاتصالات (للرسائل الجماعية)
- [ ] سياسة الخصوصية متوافقة مع القوانين المحلية

### Technical Compliance
- [x] تشفير TLS 1.3 للاتصالات
- [x] تشفير AES-256 للبيانات المخزنة
- [x] RBAC مع أدنى صلاحية ضرورية (Least Privilege)
- [x] Audit Logs لكل العمليات الحساسة
- [x] Rate Limiting على جميع الـ APIs
- [x] CORS policy صارمة (only frontend domain)
- [ ] اختبار اختراق (Penetration Testing) سنوي
- [ ] مراجعة أمان دورية (Security Audit) كل 6 أشهر
