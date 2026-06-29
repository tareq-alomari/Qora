# جدول رموز الأخطاء - Error Code Catalog

## Qor3a — كل خطأ في النظام، كل سبب، كل حل

---

## 1. تنسيق الخطأ

```
كل خطأ يرجع بهذا التنسيق:
{
  "error": {
    "code": "VALIDATION_ERROR",      // رمز الخطأ
    "message": "الحقل مطلوب",        // رسالة للمستخدم
    "details": [                     // تفاصيل إضافية (اختياري)
      { "field": "email", "message": "..." }
    ]
  }
}

كود الحالة (HTTP Status):
├── 400 → خطأ في الإدخال (Validation)
├── 401 → غير مصرح (Unauthorized)
├── 403 → ممنوع (Forbidden — دور خاطئ)
├── 404 → غير موجود (Not Found)
├── 409 → تعارض (Conflict — حالة خاطئة)
├── 429 → تجاوز الحد (Rate Limited)
├── 500 → خطأ داخلي (Internal)
```

---

## 2. Auth Module Errors

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `PHONE_REQUIRED` | 400 | رقم الهاتف مطلوب | لم يرسل رقم |
| `INVALID_PHONE` | 400 | رقم الهاتف غير صحيح | رقم أقل من 10 أرقام |
| `PHONE_EXISTS` | 409 | هذا الرقم مسجل مسبقاً | تسجيل برقم موجود |
| `OTP_REQUIRED` | 400 | رمز التحقق مطلوب | لم يرسل OTP |
| `INVALID_OTP` | 400 | رمز التحقق خطأ | OTP غلط |
| `OTP_EXPIRED` | 410 | انتهت صلاحية الرمز | OTP قديم (> 5 دقائق) |
| `OTP_MAX_ATTEMPTS` | 429 | تجاوزت عدد المحاولات المسموحة | 5 محاولات فاشلة |
| `USER_NOT_FOUND` | 404 | هذا الرقم غير مسجل | Login برقم غير موجود |
| `INVALID_REFRESH_TOKEN` | 401 | انتهت صلاحية الجلسة | Refresh token قديم |
| `TOKEN_EXPIRED` | 401 | انتهت صلاحية الجلسة | Access token قديم |
| `INVALID_TOKEN` | 401 | رمز الدخول غير صحيح | Token مزور أو تالف |

### مثال كل خطأ:

```javascript
// INVALID_OTP — المستخدم أدخل OTP غلط
{
  "error": {
    "code": "INVALID_OTP",
    "message": "رمز التحقق خطأ",
    "details": [
      { "field": "otp", "message": "الرمز الذي أدخلته غير صحيح. لديك 3 محاولات متبقية" }
    ]
  }
}

// OTP_EXPIRED — المستخدم أبطأ في الإدخال
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "انتهت صلاحية الرمز، يرجى طلب رمز جديد",
    "details": []
  }
}

// PHONE_EXISTS — محاولة تسجيل برقم موجود
{
  "error": {
    "code": "PHONE_EXISTS",
    "message": "هذا الرقم مسجل مسبقاً",
    "details": [
      { "field": "phone", "message": "يمكنك تسجيل الدخول بدلاً من ذلك" }
    ]
  }
}
```

---

## 3. Orders Module Errors

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `DUPLICATE_ENTRY` | 409 | لديك طلب نشط بالفعل | محاولة إنشاء طلب ثانٍ |
| `NOT_FOUND` | 404 | الطلب غير موجود | ID خطأ |
| `FORBIDDEN` | 403 | ليس لديك صلاحية | client يرى طلب غيره |
| `INVALID_STATE` | 409 | لا يمكن الانتقال إلى هذه الحالة | State Machine يمنع |
| `GUARD_FAILED` | 409 | لم تتحقق شروط الانتقال | Guard condition فشل |
| `MISSING_DATA` | 400 | البيانات ناقصة | حقول إجبارية غير مكتملة |
| `INVALID_DATE` | 400 | تاريخ الميلاد غير صحيح | العمر أقل من 18 |
| `INVALID_PASSPORT` | 400 | رقم الجواز غير صحيح | أقل من 6 أرقام |
| `ORDER_ALREADY_SUBMITTED` | 409 | الطلب مقدم بالفعل | تم التسجيل الرسمي مسبقاً |
| `ORDER_CANCELLED` | 400 | الطلب ملغي | محاولة تعديل طلب ملغي |

### مثال كل خطأ:

```javascript
// DUPLICATE_ENTRY — عميل لديه طلب نشط
{
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "لديك طلب نشط بالفعل",
    "details": [
      { "field": "order", "message": "يمكنك متابعة طلبك الحالي #{order_number}" }
    ]
  }
}

// INVALID_STATE — محاولة انتقال ممنوع
{
  "error": {
    "code": "INVALID_STATE",
    "message": "لا يمكن الانتقال من [draft] إلى [approved]",
    "details": []
  }
}

// GUARD_FAILED — شرط لم يتحقق
{
  "error": {
    "code": "GUARD_FAILED",
    "message": "لم يتم تأكيد الدفع بعد",
    "details": [
      { "field": "payment", "message": "الطلب في حالة [payment_pending]" }
    ]
  }
}
```

---

## 4. Payments Module Errors

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `RECEIPT_REQUIRED` | 400 | صورة الإيصال مطلوبة | لم يرفع ملف |
| `INVALID_AMOUNT` | 400 | المبلغ يجب أن يكون 1,000 ريال | مبلغ خطأ |
| `DUPLICATE_RECEIPT` | 409 | هذا الإيصال مستخدم سابقاً | إيصال مكرر |
| `INVALID_PAYMENT_METHOD` | 400 | طريقة الدفع غير مدعومة | اختيار طريقة غير موجودة |
| `PAYMENT_NOT_FOUND` | 404 | الدفع غير موجود | ID خطأ |
| `PAYMENT_ALREADY_VERIFIED` | 409 | تم تأكيد هذا الدفع مسبقاً | محاولة تأكيد مكرر |
| `VERIFICATION_REQUIRED` | 400 | يجب تحديد تأكيد أو رفض | لم يرسل الموظف القرار |
| `INVALID_RECEIPT_IMAGE` | 400 | صورة الإيصال غير واضحة | دقة منخفضة |

### مثال كل خطأ:

```javascript
// INVALID_AMOUNT — العميل دفع مبلغ ناقص
{
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "المبلغ يجب أن يكون 1,000 ريال",
    "details": [
      { "field": "amount", "message": "المبلغ المرسل 950 ريال. يرجى استكمال 50 ريال" }
    ]
  }
}

// DUPLICATE_RECEIPT — نفس الإيصال يستخدم مرتين
{
  "error": {
    "code": "DUPLICATE_RECEIPT",
    "message": "هذا الإيصال مستخدم سابقاً",
    "details": [
      { "field": "receipt", "message": "رقم العملية {transfer_number} مسجل للطلب {order_number}" }
    ]
  }
}
```

---

## 5. AI Service Errors

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `PHOTO_REQUIRED` | 400 | الصورة مطلوبة | لم يرفع ملف |
| `PHOTO_TOO_LARGE` | 400 | حجم الصورة يجب أن يكون أقل من 5MB | ملف كبير |
| `PHOTO_INVALID_FORMAT` | 400 | الصيغة غير مدعومة (JPG/PNG فقط) | GIF، WEBP... |
| `PHOTO_TOO_SMALL` | 400 | دقة الصورة يجب أن تكون 600×600 على الأقل | صورة صغيرة |
| `AI_PROCESSING_FAILED` | 500 | فشل فحص الصورة | خطأ في AI Service |
| `AI_TIMEOUT` | 504 | استغرق الفحص وقتاً طويلاً | AI لا يستجيب |
| `PHOTO_REJECTED_BACKGROUND` | 200 | الخلفية غير بيضاء | نتيجة AI |
| `PHOTO_REJECTED_LIGHTING` | 200 | الإضاءة غير كافية | نتيجة AI |
| `PHOTO_REJECTED_FACE` | 200 | الوجه غير في المنتصف | نتيجة AI |
| `PHOTO_REJECTED_EXPRESSION` | 200 | تعبير الوجه غير مقبول | نتيجة AI |

### مثال كل خطأ:

```javascript
// PHOTO_REJECTED — AI رفض الصورة مع الأسباب
{
  "data": {
    "status": "rejected",
    "confidence": 0.12,
    "reasons": ["background_not_white", "lighting_poor"],
    "suggestions": [
      "استخدم خلفية بيضاء بالكامل بدون ظلال",
      "اجلس في مكان بإضاءة جيدة — يفضل ضوء النهار"
    ]
  }
}

// AI_PROCESSING_FAILED — خدمة AI معطلة
{
  "error": {
    "code": "AI_PROCESSING_FAILED",
    "message": "تعذر فحص الصورة حالياً، يرجى المحاولة مرة أخرى",
    "details": []
  }
}
```

---

## 6. Admin Module Errors

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `USER_NOT_FOUND` | 404 | المستخدم غير موجود | ID خطأ |
| `CANNOT_DELETE_ADMIN` | 400 | لا يمكن حذف حساب أدمن | محاولة حذف أدمن |
| `CANNOT_DEMOTE_SELF` | 400 | لا يمكن تغيير دور نفسك | أدمن يحاول تغيير نفسه |
| `INVALID_ROLE` | 400 | الدور غير صحيح | client/employee/admin فقط |
| `SETTING_NOT_FOUND` | 404 | الإعداد غير موجود | اسم إعداد خطأ |
| `SEASON_ALREADY_OPEN` | 409 | الموسم مفتوح بالفعل | محاولة فتح موسم مكرر |
| `SEASON_CANNOT_OPEN` | 400 | لا يمكن فتح الموسم بعد | تاريخ بداية خاطئ |

---

## 7. System Errors (نادرة)

| الرمز | الحالة | الرسالة | متى يظهر؟ |
|-------|--------|---------|-----------|
| `INTERNAL_ERROR` | 500 | حدث خطأ غير متوقع | أي خطأ غير متوقع |
| `SERVICE_UNAVAILABLE` | 503 | الخدمة غير متاحة حالياً | DB أو Redis معطل |
| `RATE_LIMITED` | 429 | تجاوزت الحد المسموح من الطلبات | Rate limiting |
| `MAINTENANCE_MODE` | 503 | الموقع تحت الصيانة | صيانة مقررة |
| `DATABASE_ERROR` | 500 | خطأ في قاعدة البيانات | Query فشل |
| `QUEUE_FULL` | 503 | طابور المعالجة ممتلئ | ضغط عالي |

### مثال كل خطأ:

```javascript
// RATE_LIMITED — تجاوز عدد الطلبات
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "لقد تجاوزت الحد المسموح من الطلبات",
    "details": [
      { "field": "retry_after", "message": "يرجى المحاولة بعد 30 ثانية" }
    ]
  }
}

// INTERNAL_ERROR — خطأ غير متوقع (لنرى التفاصيل في الـ server log)
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "حدث خطأ غير متوقع، فريقنا يعمل على حله",
    "details": []
  }
}
```

---

## 8. ملخص سريع — كم رمز خطأ؟

```
Auth:      10 رموز
Orders:    12 رموز
Payments:   8 رموز
AI:        10 رموز
Admin:      8 رموز
System:     6 رموز
────────────────
المجموع:   54 رموز خطأ
```

---

*جدول رموز الأخطاء - يوليو 2026*
*Qor3a (قرعة)*
