# استراتيجية الاختبارات وضمان الجودة - QA & Testing Strategy

## Qor3a - Quality Assurance Plan

---

## 1. أنواع الاختبارات

### 1.1 هرم الاختبارات

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

### 1.2 كل نوع بالتفصيل

| النوع | الغرض | عددها | وقت التنفيذ | أداة |
|-------|-------|-------|-------------|------|
| 🟡 **Unit** | تختبر دوال Service + Model بشكل منفصل | ~100-200 اختبار | ثوانٍ | Jest |
| 🟢 **Integration** | تختبر API endpoints مع DB حقيقي | ~30-50 اختبار | دقائق | Supertest + Jest |
| 🔵 **E2E** | تختبر رحلة المستخدم الكاملة | ~5-10 اختبار | 10-20 دقيقة | Puppeteer + Jest |

---

## 2. ماذا نختبر بالضبط؟

### 2.1 Unit Tests (Service Layer)

```
الموديولات التي تحتاج اختبارات Service:

✅ auth.service.js
├── register → تحقق من إنشاء المستخدم + إرسال OTP
├── login → تحقق من JWT + Refresh Token
├── verifyOTP → تحقق من صلاحية الـ OTP
├── refreshToken → تحقق من تجديد التوكين
└── ❌ يجب فشل: كلمة سر خطأ، OTP منتهي، مستخدم غير موجود

✅ orders.service.js (الأهم!)
├── createOrder → تحقق من إنشاء الطلب بحالة draft
├── updatePersonalData → تحقق من الانتقال إلى data_entry_complete
├── uploadPhoto → تحقق من الانتقال إلى photo_pending
├── verifyPhoto (AI callback) → تحقق من photo_accepted / photo_rejected
├── submitPayment → تحقق من payment_pending
├── verifyPayment → تحقق من payment_verification
├── approveOrder → تحقق من approved
├── submitToOfficialSite → تحقق من submitted
├── markCompleted → تحقق من completed
├── cancelOrder → تحقق من cancelled
└── ❌ يجب فشل: انتقال غير مسموح به في State Machine

✅ state-machine.js (100% تغطية)
├── كل انتقال مسموح → يمر
├── كل انتقال غير مسموح → يرفض
└── الحالة النهائية (completed, cancelled) → لا تقبل أي انتقال

✅ payments.service.js
├── createReceipt → رفع إيصال الدفع
├── verifyReceipt → تأكيد الموظف للدفع
└── ❌ يجب فشل: إيصال مزور، دفع مكرر

✅ notifications.service.js
├── sendOTP → إرسال OTP
├── sendStatusUpdate → إشعار بتغير الحالة
└── ❌ يجب فشل: رقم خطأ، خدمة الإرسال معطلة
```

### 2.2 Integration Tests (API Endpoints)

```
📋 قائمة الاختبارات:

┌── AUTH
├── POST /api/v1/auth/register
│   ├── 201 → نجاح التسجيل (مع OTP)
│   └── 400 → رقم موجود مسبقاً
├── POST /api/v1/auth/login
│   ├── 200 → نجاح الدخول
│   └── 401 → رقم غير مسجل
├── POST /api/v1/auth/verify-otp
│   ├── 200 → OTP صحيح
│   └── 400 → OTP خطأ أو منتهي

┌── ORDERS
├── POST /api/v1/orders
│   ├── 201 → تم إنشاء الطلب
│   └── 401 → غير مسجل دخول
├── PATCH /api/v1/orders/:id/personal-data
│   ├── 200 → تم تحديث البيانات
│   └── 409 → حالة خاطئة للانتقال
├── PATCH /api/v1/orders/:id/photo
│   ├── 200 → تم رفع الصورة
│   └── 400 → الصورة لا تطابق المتطلبات
├── PATCH /api/v1/orders/:id/status (employee)
│   ├── 200 → تم تغيير الحالة
│   └── 403 → ليس لديك صلاحية

┌── PAYMENTS
├── POST /api/v1/payments/receipt
│   ├── 201 → تم رفع الإيصال
│   └── 400 → الإيصال ناقص
├── PATCH /api/v1/payments/:id/verify (employee)
│   ├── 200 → تم تأكيد الدفع
│   └── 403 → ليس موظف

┌── ADMIN
├── GET /api/v1/admin/users
│   ├── 200 → قائمة المستخدمين
│   └── 403 → ليس أدمن
├── PATCH /api/v1/admin/orders/:id/cancel
│   ├── 200 → تم الإلغاء
│   └── 409 → حالة لا تقبل الإلغاء
```

### 2.3 E2E Tests (Full Journey — مع Puppeteer)

```
اختبار 1: الرحلة الكاملة لعميل جديد
────────────────────────────────
1. يفتح الموقع
2. يضغط "سجّل الآن"
3. يسجل برقم هاتفه (OTP)
4. يدخل بياناته الشخصية (الاسم، تاريخ الميلاد...)
5. يدخل بيانات الزوج/الزوجة (إن وجد)
6. يدخل بيانات الأطفال (إن وجد)
7. يرفع صورة شخصية
8. AI يفحص الصورة ← مقبولة
9. يختار طريقة الدفع (كريمي)
10. يرفع صورة الإشعار
11. ينتظر تأكيد الموظف
12. ✅ الطلب أصبح "approved"

اختبار 2: فشل الصورة
────────────────
1-6: نفس الرحلة
7. يرفع صورة الخلفية مش بيضاء
8. AI يرفض الصورة ← photo_rejected
9. يرفع صورة جديدة
10. AI يقبل ← photo_accepted

اختبار 3: إلغاء من الأدمن
────────────────
1-9: طلب كامل
10. الأدمن يدخل لوحته
11. يبحث عن الطلب
12. يضغط "إلغاء"
13. ✅ الطلب أصبح "cancelled"
```

---

## 3. State Machine Testing (الأهم)

### 3.1 مصفوفة الانتقالات

```
من \ إلى     draft   data_entry   photo_pending   photo_acc   photo_rej   pay_pend   pay_ver   approved   submitted   completed   cancelled
draft          -        ✅            ❌              ❌         ❌          ❌        ❌        ❌         ❌          ❌          ❌
data_entry     ❌       -             ✅              ❌         ❌          ❌        ❌        ❌         ❌          ❌          ❌
photo_pending  ❌       ❌            -               ✅         ✅          ❌        ❌        ❌         ❌          ❌          ❌
photo_acc      ❌       ❌            ❌              -          ❌          ✅        ❌        ❌         ❌          ❌          ❌
photo_rej      ❌       ❌            ✅              ❌         -           ❌        ❌        ❌         ❌          ❌          ❌
pay_pend       ❌       ❌            ❌              ❌         ❌          -         ✅        ❌         ❌          ❌          ❌
pay_ver        ❌       ❌            ❌              ❌         ❌          ❌        -         ✅         ❌          ❌          ✅
approved       ❌       ❌            ❌              ❌         ❌          ❌        ❌        -          ✅          ❌          ✅
submitted      ❌       ❌            ❌              ❌         ❌          ❌        ❌        ❌         -           ✅          ❌
completed      ❌       ❌            ❌              ❌         ❌          ❌        ❌        ❌         ❌          -           ❌
cancelled      ❌       ❌            ❌              ❌         ❌          ❌        ❌        ❌         ❌          ❌          -
```

✅ = مسموح | ❌ = ممنوع

كل خلية في هذه المصفوفة يجب أن يكون لها اختبار.

---

## 4. اختبارات الصورة (AI Service)

### 4.1 صور اختبارية

```
نحتاج مكتبة صور اختبارية:

✅ مقبولة:
├── face-front.jpg → وجه في المنتصف، خلفية بيضاء، إضاءة جيدة
├── face-front-2.jpg → شخص آخر، نفس المواصفات
└── face-good.jpg → صورة جواز سفر مقبولة

❌ مرفوضة:
├── bad-background-color.jpg → خلفية ملونة
├── bad-background-pattern.jpg → خلفية منقوشة
├── bad-lighting-dark.jpg → إضاءة ضعيفة
├── bad-lighting-overexposed.jpg → إضاءة زائدة
├── bad-face-not-centered.jpg → وجه غير في المنتصف
├── bad-glasses-reflection.jpg → نظارة تسبب انعكاس
├── bad-smile.jpg → يبتسم (ممنوع في DV Lottery)
├── bad-head-tilted.jpg → رأس مائل
└── bad-filters.jpg → فلتر على الصورة
```

### 4.2 معايير الاختبار

```
├── AI يجب أن يقبل الـ 3 صور المقبولة
├── AI يجب أن يرفض كل الصور المرفوضة
├── وقت المعالجة < 2 ثانية لكل صورة
└── دقة > 95% على مجموعة الاختبار
```

---

## 5. متى نختبر؟ (Testing Schedule)

### 5.1 أثناء التطوير

```
كل Commit:
├── 🟡 Unit Tests (كلها)
└── ✅ ESLint (لا أخطاء)

كل PR/Merge:
├── 🟡 Unit Tests
├── 🟢 Integration Tests
└── ✅ Build (npm run build)

قبل الإطلاق:
├── 🟡 Unit Tests
├── 🟢 Integration Tests
├── 🔵 E2E Tests (الرحلة الحرجة فقط)
└── ✅ فحص يدوي (شخص يختبر الموقع)
```

### 5.2 أثناء موسم التسجيل

```
يومياً (صباحاً):
├── 🟡 Smoke Test: هل المواقع الأساسية شغالة؟
│   ├── API /health → 200
│   ├── الصفحة الرئيسية → 200
│   ├── تسجيل الدخول → يعمل
│   └── AI Service → 200
└── 📊 مراجعة الـ Error Logs

أسبوعياً:
├── 🟢 Integration Tests
└── 📈 مراجعة الأداء (تحت ضغط)
```

---

## 6. الأدوات

| الأداة | الاستخدام | مجانية؟ |
|--------|-----------|---------|
| **Jest** | إطار الاختبارات الرئيسي | ✅ |
| **Supertest** | اختبار الـ HTTP endpoints | ✅ |
| **Puppeteer** | اختبار E2E | ✅ |
| **Faker.js** | بيانات اختبارية وهمية | ✅ |
| **nock** | تقليد API خارجية (AI, WhatsApp) | ✅ |
| **sqlite3** | قاعدة بيانات اختبارية خفيفة | ✅ |
| **ESLint** | فحص جودة الكود | ✅ |
| **istanbul/nyc** | قياس التغطية | ✅ |

---

*استراتيجية الاختبارات - يوليو 2026*
*قرعة (Qor3a) - منصة التسجيل في DV Lottery*
