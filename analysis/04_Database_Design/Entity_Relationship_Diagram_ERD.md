# تحليل قاعدة البيانات التفصيلي - Database Deep Dive

## Qor3a — كل جدول، كل عمود، كل Index، لماذا؟

---

## 1. قواعد التصميم الأساسية

```
قواعدنا في تصميم DB:
├── 🆔 UUID Primary Keys (لا auto-increment)
├── ⏰ TIMESTAMPTZ everywhere (لا TIMESTAMP)
├── 📝 JSONB للبيانات غير المهيكلة
├── 🔗 Foreign Keys صريحة (مع ON DELETE)
├── 📊 Indexes على كل ما يُبحث
├── 🗑️ Soft delete (is_active) — لا DELETE حقيقي
└── 📋 Audit Log لكل تغيير حالة
```

---

## 2. تحليل كل جدول

### 2.1 users

```
📋 الغرض: كل من يستخدم المنصة (عملاء، موظفين، أدمن)

الحجم المتوقع:
├── السنة 1: 1,000-2,000 مستخدم
├── السنة 3: 5,000-10,000 مستخدم
└── حجم صف: ~200 bytes → كلها < 2MB

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │ آمن، لا تخمين               │
│ email              │ VARCHAR(255)│ UNIQUE   │ للحجز المستقبلي (اختياري)  │
│ phone              │ VARCHAR(20) │ UNIQUE NN│ المعرف الأساسي للعميل       │
│ password_hash      │ VARCHAR(255)│ NULL     │ Qor3a يعتمد OTP، لكن         │
│                    │            │          │ موظف/أدمن يحتاج كلمة سر     │
│ full_name          │ VARCHAR(255)│          │ اسم المستخدم               │
│ role               │ user_role  │ DEFAULT  │ client/employee/admin       │
│                    │            │ 'client' │                            │
│ is_verified        │ BOOLEAN    │ DEFAULT  │ هل أكد رقم الهاتف؟          │
│                    │            │ FALSE    │                            │
│ is_active          │ BOOLEAN    │ DEFAULT  │ Soft delete                 │
│                    │            │ TRUE     │                            │
│ last_login_at      │ TIMESTAMPTZ│          │ لمراقبة النشاط             │
│ metadata           │ JSONB      │ DEFAULT  │ لأي بيانات إضافية          │
│                    │            │ '{}'     │                            │
│ created_at         │ TIMESTAMPTZ│ DEFAULT  │                             │
│                    │            │ NOW()    │                            │
│ updated_at         │ TIMESTAMPTZ│ DEFAULT  │ (trigger)                   │
│                    │            │ NOW()    │                            │
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

⚠️ مشكلة في الـ schema الحالي:
├── password_hash NOT NULL (نحن لا نستخدم كلمة سر!)
├── الحل: تغيير إلى password_hash VARCHAR(255) DEFAULT NULL
└── الموظف/الأدمن فقط عندهم كلمة سر (OTP + password للداشبورد)

الـ Queries الحرجة:
┌────────────────────────────────────────────┬──────────────────────┐
│ الاستعلام                                   │ أين يستخدم؟          │
├────────────────────────────────────────────┼──────────────────────┤
│ SELECT * FROM users WHERE phone = '...'    │ login, register      │
│ SELECT * FROM users WHERE id = '...'       │ كل مكان (auth)       │
│ SELECT * FROM users WHERE role = 'employee'│ admin: قائمة موظفين  │
│ UPDATE users SET last_login_at=NOW() ...   │ عند كل login         │
└────────────────────────────────────────────┴──────────────────────┘

الـ Indexes:
├── ✅ phone (UNIQUE) — البحث الأساسي
├── ✅ email (UNIQUE, WHERE email IS NOT NULL)
├── ✅ role (لتصفية الموظفين/الأدمن)
└── 🟡 is_active + role (للأدمن: عرض المستخدمين النشطين فقط)
```

### 2.2 orders

```
📋 الغرض: كل طلب، والـ State Machine

الحجم المتوقع:
├── السنة 1: 1,000-2,000 طلب
├── السنة 3: 5,000-10,000 طلب
└── حجم صف: ~150 bytes → كلها < 2MB

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │                             │
│ user_id            │ UUID       │ FK→users │ كل طلب يتبع مستخدم         │
│ service_type       │ service_type│ DEFAULT │ للتوسع: dv_lottery, visa...│
│                    │            │ 'dv_lottery'│                         │
│ status             │ order_status│ DEFAULT │ 12 حالة لـ State Machine   │
│                    │            │ 'draft'  │                            │
│ total_price        │ DECIMAL(10,2)│ NOT NULL│ سعر الخدمة (1,000 YR)    │
│ currency           │ VARCHAR(3) │ DEFAULT  │ 'YER' للريال اليمني        │
│                    │            │ 'USD'    │                            │
│ notes              │ TEXT       │          │ ملاحظات الموظف            │
│ metadata           │ JSONB      │ DEFAULT  │ أي بيانات إضافية           │
│                    │            │ '{}'     │                            │
│ created_at         │ TIMESTAMPTZ│          │                             │
│ updated_at         │ TIMESTAMPTZ│          │ (trigger)                   │
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

⚠️ مشاكل في الـ schema الحالي:
├── currency = 'USD' افتراضياً — نحن في اليمن، العملة YER
├── total_price NOT NULL DEFAULT 0 — الأفضل DEFAULT 1000
└── لا index على (status, created_at) — هذا الـ query الأكثر استخداماً

الـ Queries الحرجة:
┌────────────────────────────────────────────────────┬──────────────────────┐
│ الاستعلام                                           │ أين يستخدم؟          │
├────────────────────────────────────────────────────┼──────────────────────┤
│ SELECT * FROM orders WHERE user_id = '...'         │ Client: قائمة طلباتي │
│ ORDER BY created_at DESC                            │                     │
│ SELECT * FROM orders WHERE status = 'payment_pending'│ Employee: قائمة     │
│ ORDER BY created_at ASC                             │ الطلبات المعلقة     │
│ SELECT COUNT(*) FROM orders                         │ Admin: الإحصائيات   │
│ SELECT COUNT(*), status FROM orders GROUP BY status │ Admin: توزيع الحالات│
│ SELECT SUM(total_price) FROM orders                 │ Admin: الإيرادات    │
│ WHERE status = 'completed'                          │                     │
│ SELECT * FROM orders WHERE created_at > NOW() -     │ Admin: طلبات اليوم  │
│ INTERVAL '1 day'                                    │                     │
└────────────────────────────────────────────────────┴──────────────────────┘

الـ Indexes المطلوبة:
├── ✅ user_id (لطلبات مستخدم محدد)
├── ✅ status (لتصفية الطلبات حسب الحالة)
├── ✅ created_at (للترتيب الزمني)
├── ✅ (status, created_at) — Compound index للـ Employee قائمة
├── 🟡 (created_at) WHERE status = 'completed' — للإيرادات (Partial index)
└── 🟡 (user_id, created_at) — لـ Client قائمة
```

### 2.3 applicant_data

```
📋 الغرض: بيانات DV Lottery (مرتبطة بطلب واحد فقط)

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │                             │
│ order_id           │ UUID       │ FK→orders│ 1-1 relation               │
│                    │            │ UNIQUE   │ (كل طلب له بيانات واحدة)    │
│ first_name         │ VARCHAR(100)│          │ الحقل الأول في النموذج     │
│ middle_name        │ VARCHAR(100)│          │ DV Lottery يتطلب 3 أسماء   │
│ last_name          │ VARCHAR(100)│          │                           │
│ gender             │ VARCHAR(10)│ CHECK    │ male/female                │
│ birth_date         │ DATE       │          │ للتحقق من العمر (18+)      │
│ birth_country      │ VARCHAR(100)│          │ البلد (YEMEN غالباً)      │
│ birth_city         │ VARCHAR(100)│          │ مدينة الميلاد             │
│ email              │ VARCHAR(255)│          │ للتواصل                   │
│ phone              │ VARCHAR(20)│          │ (قد يختلف عن رقم الحساب)   │
│ address_line1      │ TEXT       │          │ العنوان في اليمن          │
│ address_line2      │ TEXT       │          │                           │
│ country            │ VARCHAR(100)│          │ الدولة (YEMEN)            │
│ city               │ VARCHAR(100)│          │ المدينة                   │
│ postal_code        │ VARCHAR(20)│          │ (نادر في اليمن)           │
│ district           │ VARCHAR(100)│          │ الحي/المنطقة              │
│ education_level    │ VARCHAR(100)│          | مستوى التعليم (شرط اللوتري)│
│ marital_status     │ VARCHAR(20)│ CHECK    │ single/married/divorced/  │
│                    │            │          │ widowed                   │
│ spouse_data        │ JSONB      │ DEFAULT  │ بيانات الزوج/الزوجة       │
│                    │            │ '{}'     │                           │
│ children_data      │ JSONB      │ DEFAULT  │ قائمة الأطفال             │
│                    │            │ '[]'     │                           │
│ photo_path         │ VARCHAR(500)│          │ مسار الصورة في MinIO     │
│ photo_validation   │ JSONB      │ DEFAULT  | نتيجة فحص AI: {status,    │
│                    │            │ '{}'     │ confidence, reasons...}    │
│ confirmation_number│ VARCHAR(50)│          │ من موقع وزارة الخارجية    │
│ submitted_at       │ TIMESTAMPTZ│          │ تاريخ التسجيل الرسمي     │
│ submitted_by       │ UUID       │ FK→users │ الموظف الذي سجّل          │
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

JSONB vs جدول منفصل لـ spouse_data:
┌────────────────────────────────────────────────────────────┐
│ الخيار         │ مميزات              │ عيوب                  │
├────────────────┼─────────────────────┼──────────────────────┤
│ ✅ JSONB       │ بسيط، مرن،           │ لا Queries معقدة     │
│ (اخترناه)      │ لا يحتاج JOIN       │ على البيانات الداخلية │
│                │ يدخل/يخرج بسرعة      │                       │
│                │ يتغير بسهولة         │                       │
├────────────────┼─────────────────────┼──────────────────────┤
│ جدول منفصل     │ Queries مباشرة       │ JOIN إضافي           │
│ (spouses)      │ Validation أسهل      │ أكثر تعقيداً         │
│                │                        │ 3 جداول بدلاً من 1  │
│ children       │                        │                       │
└────────────────┴─────────────────────┴──────────────────────┘

لماذا JSONB كافٍ:
├── spouse_data: 5-7 حقول فقط (name, birth_date, gender, photo...)
├── children_data: 4 حقول لكل طفل (name, birth_date, gender)
├── لا نحتاج WHERE على حقل داخل JSONB
├── البيانات تُقرأ فقط (لا تُعدّل جزئياً)
└── التوفير: 2 JOINs أقل = أسرع

⚠️ مشاكل:
├── لا Validation على JSONB (يمكن إدخال أي شيء)
├── الحل: Validation في Service layer (Joi/Zod قبل الحفظ)
├── spuse_data و children_data — خطأ إملائي في اسم الحقل
└── الحل: توحيد الأسماء بين schema.sql والكود

الـ Queries الحرجة:
┌────────────────────────────────────────────────────┬──────────────────────┐
│ الاستعلام                                           │ أين يستخدم؟          │
├────────────────────────────────────────────────────┼──────────────────────┤
│ INSERT INTO applicant_data (order_id, ...) VALUES  │ Client: إرسال الطلب  │
│ (بعد اكتمال الـ 8-Step Wizard)                     │                     │
│ SELECT * FROM applicant_data WHERE order_id = '...'│ Employee: مراجعة     │
│ (لقراءة كل البيانات دفعة واحدة)                    │ الطلب               │
│ UPDATE applicant_data SET photo_validation = '...' │ AI: حفظ نتيجة الفحص │
│ UPDATE applicant_data SET confirmation_number =... │ Employee: بعد        │
│                                                    │ التسجيل الرسمي      │
└────────────────────────────────────────────────────┴──────────────────────┘

الـ Indexes:
├── ✅ order_id (UNIQUE) — العلاقة 1-1 مع orders
└── 🟡 confirmation_number (UNIQUE WHERE NOT NULL) — للبحث لاحقاً
```

### 2.4 payments

```
📋 الغرض: سجل كل محاولات الدفع

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │                             │
│ order_id           │ UUID       │ FK→orders│ مرتبط بطلب                 │
│ amount             │ DECIMAL(10,2)│ NN     │ 1,000 YR                    │
│ currency           │ VARCHAR(3) │ DEFAULT  │ 'YER'                       │
│                    │            │ 'USD'    │                             │
│ method             │ payment_method│       │ deposit/wallet             │
│ provider           │ payment_provider│     │ alkuraimi/jeeb/one_cash/   │
│                    │            │          │ mobile_money               │
│ transfer_number    │ VARCHAR(100)│         │ رقم العملية من الإيصال     │
│ receipt_image_path │ VARCHAR(500)│         │ مسار صورة الإيصال          │
│ status             │ payment_status│       │ pending/verified/rejected/ │
│                    │            │          │ refunded                   │
│ verified_by        │ UUID       │ FK→users│ الموظف الذي أكد الدفع      │
│ verified_at        │ TIMESTAMPTZ│          │ وقت التأكيد               │
│ rejection_reason   │ TEXT       │          │ سبب الرفض                  │
│ notes              │ TEXT       │          │ ملاحظات إضافية             │
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

⚠️ مشاكل في الـ schema الحالي:
├── payment_method ENUM: ('deposit', 'wallet') — هذا صحيح
├── لكن DEFAULT في جدول payments = 'bank_transfer' (غير موجود في الـ ENUM)
├── الحل: تغيير DEFAULT إلى 'deposit'
├── currency DEFAULT 'USD' → يجب 'YER'
└── payment_provider ENUM: ('alkuraimi', ...) — AGENTS.md تقول ('kuraimi', ...)
    → توحيد التسمية

الـ Queries الحرجة:
┌────────────────────────────────────────────────────┬──────────────────────┐
│ الاستعلام                                           │ أين يستخدم؟          │
├────────────────────────────────────────────────────┼──────────────────────┤
│ SELECT * FROM payments WHERE order_id = '...'     │ عرض حالة الدفع       │
│ SELECT * FROM payments WHERE status = 'pending'    │ Employee: قائمة      │
│ ORDER BY created_at ASC                             │ الإيصالات المعلقة    │
│ SELECT SUM(amount) FROM payments                   │ Admin: الإيرادات     │
│ WHERE status = 'verified'                          │                     │
│ SELECT p.provider, COUNT(*) FROM payments p        │ Admin: توزيع طرق     │
│ WHERE p.status = 'verified'                        │ الدفع               │
│ GROUP BY p.provider                                 │                     │
└────────────────────────────────────────────────────┴──────────────────────┘

الـ Indexes:
├── ✅ order_id (لربط مع الطلب)
├── ✅ status (لتصفية المعلقة)
├── ✅ transfer_number (WHERE NOT NULL) — لمكافحة الإيصالات المكررة
└── 🟡 (status, created_at) — للـ Employee قائمة
```

### 2.5 notifications

```
📋 الغرض: سجل كل الإشعارات (للرسوم البيانية وإعادة الإرسال)

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │                             │
│ user_id            │ UUID       │ FK→users│ المستلم                      │
│ order_id           │ UUID       │ FK→orders│ (للربط بالطلب، اختياري)      │
│                    │            │ SET NULL │                             │
│ type               │ VARCHAR(50)│          │ otp, payment_confirmed,     │
│                    │            │          │ status_change, result...   │
│ channel            │ notification_channel│  │ whatsapp, pwa, email, sms │
│ title              │ VARCHAR(255)│ NN     | عنوان الإشعار               │
│ body               │ TEXT       │          │ نص الإشعار                  │
│ metadata           │ JSONB      │ DEFAULT  │ قالب الـ ID، وقت الإرسال... │
│                    │            │ '{}'     │                            │
│ status             │ notification_status│   │ pending/sent/failed/read  │
│ sent_at            │ TIMESTAMPTZ│          │ وقت الإرسال الفعلي         │
│ read_at            │ TIMESTAMPTZ│          │ وقت القراءة                │
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

الحجم: كبير — كل إشعار = صف. 2,000 طلب × 10 إشعارات = 20,000 صف/موسم.

الـ Queries الحرجة:
├── SELECT * FROM notifications WHERE user_id = '...' ORDER BY created_at DESC
├── SELECT * FROM notifications WHERE status = 'pending'  ← للـ Queue
└── UPDATE notifications SET status = 'failed' WHERE id = '...'  ← إعادة إرسال

الـ Indexes:
├── ✅ user_id
├── ✅ status (لـ Queue الأرسال)
├── 🟡 (user_id, created_at DESC) — لقائمة إشعارات المستخدم
└── 🟡 type (للتقارير)
```

### 2.6 audit_logs

```
📋 الغرض: سجل كل تغيير في حالة الطلب — غير قابل للتعديل أبداً

الحجم: 2,000 طلب × 8 تغييرات حالة = ~16,000 صف/موسم

الأعمدة:
┌────────────────────┬────────────┬──────────┬─────────────────────────────┐
│ العمود             │ النوع      │ القيود   │ لماذا؟                      │
├────────────────────┼────────────┼──────────┼─────────────────────────────┤
│ id                 │ UUID       │ PK       │                             │
│ order_id           │ UUID       │ FK→orders│ أي طلب تغير                │
│                    │            │ SET NULL │                             │
│ user_id            │ UUID       │ FK→users│ من قام بالتغيير             │
│                    │            │ SET NULL │                             │
│ action             │ VARCHAR(100)│ NN      | status_change, payment_ver, │
│                    │            │          | photo_upload...            │
│ from_status        │ order_status│         │ الحالة السابقة             │
│ to_status          │ order_status│         │ الحالة الجديدة             │
│ metadata           │ JSONB      │ DEFAULT  │ تفاصيل إضافية (السبب،      │
│                    │            │ '{}'     │ notes...)                  │
│ ip_address         │ INET       │          │ لمنع الاحتيال              │
│ user_agent         │ TEXT       │          │ الجهاز المستخدم            │
│ created_at         │ TIMESTAMPTZ│          │ (Immutable — لا updated_at)│
└────────────────────┴────────────┴──────────┴─────────────────────────────┘

⚠️ هذا الجدول لا يمكن تعديل البيانات فيه أبداً!
├── ❌ لا UPDATE
├── ❌ لا DELETE
└── ✅ فقط INSERT + SELECT

الـ Queries الحرجة:
├── SELECT * FROM audit_logs WHERE order_id = '...' ORDER BY created_at ASC
│   ← Employee: عرض تاريخ الطلب
├── SELECT * FROM audit_logs WHERE user_id = '...' AND action = 'verify_payment'
│   ← Admin: مراقبة أداء الموظف
└── SELECT * FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours'
    ← Admin: نشاط اليوم

الـ Indexes:
├── ✅ order_id (عرض تاريخ الطلب)
├── ✅ user_id (تتبع الموظف)
├── ✅ created_at (البحث الزمني)
├── 🟡 action (للتقارير)
└── 🟡 (order_id, created_at ASC) — Compound index للتاريخ
```

---

## 3. العلاقات بين الجداول (Relationships)

```
┌──────────┐    1:N    ┌──────────┐    1:1    ┌────────────────┐
│  users   │──────────►│  orders  │──────────►│ applicant_data │
└──────────┘           └──────────┘           └────────────────┘
     │                       │
     │                       │ 1:N
     │ 1:N                   │
     │                       ▼
     │               ┌──────────────┐    1:N    ┌──────────────────┐
     │               │   payments   │──────────►│   audit_logs     │
     │               └──────────────┘           └──────────────────┘
     │
     │ 1:N
     │
     ▼
┌──────────────────┐
│   notifications   │
└──────────────────┘

شرح العلاقات:
├── users 1:N orders — مستخدم له عدة طلبات
├── orders 1:1 applicant_data — كل طلب له بيانات DV واحدة
├── orders 1:N payments — كل طلب قد يحاول دفع عدة مرات
├── orders 1:N audit_logs — كل تغيير حالة مسجل
├── users 1:N notifications — إشعارات لكل مستخدم
└── payments.verified_by → users.id — الموظف الذي أكد الدفع
```

---

## 4. مقارنة JSONB vs جداول منفصلة

| العنصر | JSONB (اخترناه) | جدول منفصل |
|--------|-----------------|-------------|
| spouse_data | 5-7 حقول، لا يحتاج JOIN | spuse جدول كامل بعلاقات |
| children_data | قائمة، 4 حقول/طفل | children جدول مع FK |
| photo_validation | AI result + reasons + confidence | جدول photo_checks |
| metadata (orders) | أي حقل إضافي | جدول order_meta |

لماذا JSONB كافٍ:
```
┌─────────────────────────────────────────────────────────┐
│ JSONB أفضل عندما:                                        │
│ ✅ البيانات تُقرأ كاملة (لا بحث داخل JSONB)              │
│ ✅ الهيكل قد يتغير (وزارة الخارجية تغير النموذج)         │
│ ✅ كمية البيانات صغيرة (< 10 حقول)                       │
│ ✅ لا يحتاج JOINs                                        │
│                                                          │
│ جدول منفصل أفضل عندما:                                   │
│ ❌ تبحث داخل البيانات (WHERE spouse_name = '...')        │
│ ❌ كمية بيانات كبيرة (أطفال كثيرون)                       │
│ ❌ تحتاج علاقات مع جداول أخرى                            │
└─────────────────────────────────────────────────────────┘

في Qor3a:
├── spouse_data: 5-7 حقول، لا نبحث فيها أبداً → JSONB ✅
├── children_data: 0-20 طفل، نادراً > 5 → JSONB ✅
├── photo_validation: 3-5 حقول (status, confidence, reasons) → JSONB ✅
└── metadata: أي شيء مستقبلاً → JSONB ✅
```

---

## 5. استراتيجية الـ Indexes (كاملة)

```
ضرورية (موجودة بالفعل):
├── idx_users_phone
├── idx_users_email
├── idx_orders_user_id
├── idx_orders_status
├── idx_orders_created_at
├── idx_applicant_data_order_id
├── idx_payments_order_id
├── idx_payments_status
├── idx_payments_transfer_number
├── idx_notifications_user_id
├── idx_notifications_status
├── idx_audit_logs_order_id
├── idx_audit_logs_created_at

مقترحة (غير موجودة):
├── idx_orders_status_created ON orders(status, created_at DESC)
│   ← Employee: قائمة الطلبات مرتبة
├── idx_audit_logs_user_id ON audit_logs(user_id)
│   ← Admin: تتبع الموظف
├── idx_orders_user_id_created ON orders(user_id, created_at DESC)
│   ← Client: قائمة طلباتي
└── idx_payments_status_created ON payments(status, created_at ASC)
    ← Employee: قائمة الإيصالات المعلقة
```

---

## 6. حجم البيانات المتوقع

```
جدول         │ صف/سنة 1 │ صف/سنة 3 │ حجم/سنة 1 │ حجم/سنة 3
─────────────┼──────────┼──────────┼───────────┼───────────
users        │ 1,500    │ 10,000   │ 1 MB      │ 5 MB
orders       │ 1,500    │ 10,000   │ 1 MB      │ 5 MB
applicant_data│ 1,500   │ 10,000   │ 5 MB      │ 50 MB (صور!)
payments     │ 1,500    │ 10,000   │ 1 MB      │ 5 MB
notifications│ 15,000   │ 100,000  │ 5 MB      │ 30 MB
audit_logs  │ 12,000   │ 80,000   │ 5 MB      │ 30 MB
─────────────────────────────────────────────────────────
المجموع      │          │          │ ~18 MB    │ ~125 MB

⚠️ الصور (MinIO/S3) بشكل منفصل:
├── السنة 1: ~1,500 صورة × 500 KB + 1,500 إيصال × 300 KB = ~1.2 GB
├── السنة 3: ~10,000 × 500 KB + 10,000 × 300 KB = ~8 GB
└── قاعدة البيانات نفسها صغيرة (< 200 MB حتى السنة 3)
```

---

## 7. الـ Migrations

```
قواعدنا:
├── ✅ كل تغيير في schema = Knex migration
├── ✅ up() + down() — قابل للرجوع
├── ✅ لا تغيير يدوي على SQL مباشر
└── ✅ Migration يسبق الكود (coder أولاً)

أهم الـ Migrations القادمة (بعد الـ schema الأولي):
├── 001_add_applicant_data_indexes
├── 002_fix_currency_to_yer
├── 003_fix_payment_method_default
├── 004_add_compound_indexes
└── 005_add_result_field (بعد فحص النتائج — مايو 2027)
```

---

*تحليل قاعدة البيانات - يوليو 2026*
*قرعة (Qor3a) - منصة التسجيل في DV Lottery*
