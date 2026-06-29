# 📊 Data Flow Diagrams — DFD

> **Qor3a (قرعة)** — تدفق البيانات بين النظام والمستخدمين والخدمات الخارجية

---

## 1. DFD Level 0 — Context Diagram

```
                  ┌─────────────────┐
                  │   2Captcha      │
                  │     API         │
                  └────────┬────────┘
                           │ CAPTCHA token
                           │
┌──────────┐   بيانات    ┌──┴──────────────┐   صور    ┌──────────┐
│  Client  │────────────▶│                 │◄─────────│  MinIO   │
│  (هاتف)  │◄────────────│    Qor3a        │──────────▶│   S3     │
└──────────┘  إشعارات    │    System       │  صور     └──────────┘
                          │                 │
┌──────────┐   مراجعة    │                 │  بيانات  ┌──────────┐
│ Employee │────────────▶│                 │◄────────▶│PostgreSQL│
│  (موظف)  │◄────────────│                 │──────────▶│   DB     │
└──────────┘  أوامر      └─────────────────┘          └──────────┘
                  │            │
                  │            │ بيانات + Conf#
                  ▼            ▼
           ┌──────────┐  ┌──────────┐
           │WhatsApp  │  │ Official │
           │Cloud API │  │DV Site   │
           └──────────┘  └──────────┘
```

---

## 2. DFD Level 1 — Core Processes

```
                        ┌──────────────────────────────────────────────┐
                        │                   Qor3a System               │
                        │                                              │
┌──────────┐            │  ┌────────────┐    ┌──────────────┐          │
│  Client  │──────────────▶│  1.0 Auth  │───▶│  2.0 Order   │────      │
│ (Browser)│◄──────────────│  Register  │    │  Wizard     │    │      │
└──────────┘            │  └────────────┘    └──────┬───────┘    │      │
                        │                           │            │      │
┌──────────┐            │  ┌──────────────────┐    │            │      │
│  MinIO   │◄──────────────│  3.0 AI Photo    │◄───┘            │      │
│  S3      │──────────────▶│  Validation      │                 │      │
└──────────┘            │  └──────────────────┘                 │      │
                        │                                       │      │
                        │  ┌──────────────────────┐             │      │
                        │  │  4.0 Payment         │◄────────────┘      │
                        │  │  (Receipt Upload)    │                    │
                        │  └──────────┬───────────┘                    │
                        │             │                                │
                        │             ▼                                │
                        │  ┌──────────────────────┐                    │
                        │  │  5.0 Order Review    │                    │
                        │  │  (Employee)          │                    │
                        │  └──────────┬───────────┘                    │
                        │             │                                │
                        │             ▼                                │
                        │  ┌──────────────────────┐                    │
                        │  │  6.0 Official        │                    │
                        │  │  Submission          │────────────────────│──→ Official Site
                        │  └──────────┬───────────┘                    │
                        │             │                                │
                        │             ▼                                │
                        │  ┌──────────────────────┐                    │
                        │  │  7.0 Notification    │────────────────────│──→ WhatsApp/SMS
                        │  │  Sender              │                    │
                        │  └──────────────────────┘                    │
                        │                                              │
                        │  ┌──────────────────────┐                    │
                        │  │  8.0 Result Check    │────────────────────│──→ DV Site
                        │  │  (Headless Browser)  │                    │
                        │  └──────────────────────┘                    │
                        └──────────────────────────────────────────────┘
```

---

## 3. DFD Level 2 — Detailed Data Flows

### 3.1 Process 2.0: Order Registration (Client)
```
Client          2.1 Form       2.2 Auto-Save        2.3 Submit       PostgreSQL
  │             Entry          │                    │                │
  │──data──────▶│              │                    │                │
  │             │──field──────▶│                    │                │
  │◄──────error─│              │──save draft───────▶│                │
  │             │              │◄────saved──────────│                │
  │             │              │                    │                │
  │             │              │  كل 10 ثوانٍ        │                │
  │             │◄──────saved──│                    │                │
  │             │              │                    │                │
  │             │──complete──▶│                    │                │
  │             │              │                    │──insert order──▶│
  │◄────confirmation──────────│────────────────────│◄─────uuid──────│
  │             │              │                    │                │
```

### 3.2 Process 3.0: Photo Validation
```
Client       3.1 Capture     3.2 Upload           3.3 AI Service    3.4 MinIO
  │                          │                    │                 │
  │──capture────────────────▶│                    │                 │
  │                          │──image────────────▶│                 │
  │                          │──(also─────────────│                 │
  │                          │  save─────▶MinIO)  │                 │
  │                          │                    │                 │
  │                          │                    │──validate──────▶│
  │                          │                    │◄────result──────│
  │                          │                    │                 │
  │                          │◄──result───────────│                 │
  │                          │                    │                 │
  │◄──accepted/rejected──────│                    │                 │
  │                          │                    │                 │
  Data Flow:
  · Image: JPEG/Max 10MB
  · Validation Result: { face_center: bool, head_size: bool,
  ·   background: bool, lighting: bool, sharpness: bool,
  ·   overall: "accepted"|"rejected", confidence: 0-100 }
```

### 3.3 Process 4.0: Payment
```
Client          4.1 Select     4.2 Upload        4.3 Store        PostgreSQL
  │             Method         Receipt             │                │
  │              │              │                  │                │
  │──select────────────────────▶│                  │                │
  │◄────account number──────────│                  │                │
  │              │              │                  │                │
  │              │──receipt image─────────────────▶│                │
  │              │              │                  │──insert payment▶│
  │              │              │                  │◄────payment_id─│
  │◄───pending─confirm─────────│──────────────────│                │
  │              │              │                  │                │
  Employee       4.4 Verify     │                  │                │
  │              │              │                  │                │
  │──verify─────▶│              │                  │                │
  │              │──update status─────────────────▶│                │
  │◄────done─────│              │                  │◄──────────────│
  │              │              │                  │                │
  Data Stores:
  · D1: Payment Accounts (Kuraimi, Jeeb, One Cash, Mobile Money)
  · D2: Payment Records
```

### 3.4 Process 5.0: Employee Review
```
Employee       5.1 Fetch      5.2 Display         5.3 Decision    PostgreSQL
  │             Orders         Order                │                │
  │              │              │                    │                │
  │──fetch──────▶│              │                    │                │
  │◄───list──────│              │                    │                │
  │              │              │                    │                │
  │──select────────────────────▶│                    │                │
  │              │              │                    │                │
  │              │──fetch data──────────────────────────────────────▶│
  │              │◄───order + photo + payment───────────────────────│
  │              │              │                    │                │
  │              │              │──approve/reject───────────────────▶│
  │◄────confirm─────────────────────────────────────────────────────│
  │              │              │                    │                │
```

### 3.5 Process 6.0: Official Submission
```
Employee       6.1 Queue      6.2 CAPTCHA      6.3 Headless      6.4 Official
  │             Order          Solve            Browser           DV Site
  │              │              │                │                  │
  │──submit────▶│              │                │                  │
  │              │──enqueue────▶│                │                  │
  │              │              │                │                  │
  │              │              │──request───────▶│──open url───────▶│
  │              │              │                │◄──page───────────│
  │              │              │                │──CAPTCHA img────▶│
  │              │              │◄──img──────────│◄──CAPTCHA───────│
  │              │              │                │                  │
  │              │              │──solve────────▶│                  │
  │              │              │  (2Captcha)    │                  │
  │              │              │◄──token───────│                  │
  │              │              │                │──submit token───▶│
  │              │              │                │──enter data─────▶│
  │              │              │                │◄──confirmation──│
  │              │              │                │                  │
  │              │              │──save Conf#──────────────────────▶│
  │◄────done─────│──────────────│────────────────│                  │
  │              │              │                │                  │
```

---

## 4. Data Stores Dictionary

| ID | الاسم | نوع التخزين | الحجم المتوقع |
|----|-------|------------|--------------|
| D1 | User Accounts | PostgreSQL | 5K-10K صف |
| D2 | Orders | PostgreSQL | 5K-20K صف |
| D3 | Applicant Data | PostgreSQL | 5K-20K صف |
| D4 | Payments | PostgreSQL | 5K-20K صف |
| D5 | Audit Logs | PostgreSQL | 50K-200K صف |
| D6 | Notifications | PostgreSQL | 100K-500K صف |
| D7 | Photos | MinIO/S3 | 5-50 GB |
| D8 | Receipt Images | MinIO/S3 | 1-10 GB |
| D9 | Queue Jobs | Redis | مؤقت |
| D10 | Cache | Redis | مؤقت |

---

## 5. External Entities

| الكيان | الوصف | نوع التفاعل |
|--------|-------|------------|
| **Client** | مستخدم عبر المتصفح الجوال | إدخال بيانات، رفع صور |
| **Employee** | موظف عبر لوحة التحكم | مراجعة، تغيير حالة |
| **Admin** | مدير النظام | إعدادات، تقارير |
| **Official DV Site** | travel.state.gov | إدخال بيانات، CAPTCHA |
| **WhatsApp Cloud API** | Meta API | إرسال OTP، إشعارات |
| **SMS Gateway** | SMS provider | إشعارات احتياطية |
| **2Captcha** | CAPTCHA solver | حل CAPTCHA |
| **MinIO/S3** | تخزين الصور | حفظ واسترجاع الصور |

---

## 6. Key Data Flow Rules

| القاعدة | الوصف |
|---------|-------|
| **لا تخرج الصورة الأصلية** | الصورة لا تخرج من النظام بعد التحقق — إلا عند إرسالها للموقع الرسمي |
| **كل تغيير حالة يُسجل** | أي تغيير في Status يمر عبر Audit Log |
| **العميل يرى بياناته فقط** | RBAC يمنع تسرب البيانات بين العملاء |
| **الإشعارات لها Fallback** | WhatsApp ← PWA Push ← SMS ← Email |
| **Queue لكل مهمة ثقيلة** | AI Validation + Official Submission + Result Check |
| **الصور مؤقتة** | تحذف تلقائياً بعد 30 يوماً من إعلان النتائج |

---

*Qor3a — Data Flow Diagrams V1.0*
