# 🧪 حالات الاختبار — Test Cases

> **Qor3a (قرعة)** — 50+ Test Case عبر 7 وحدات

---

## 1. Auth Module

| TC# | السيناريو | Input | Expected Result | Priority |
|-----|----------|-------|----------------|----------|
| AUTH-01 | تسجيل برقم هاتف صحيح | `{phone: "967712345678"}` | 201 + OTP sent | عالية |
| AUTH-02 | تسجيل برقم هاتف ناقص | `{phone: "9677"}` | 400 + رسالة خطأ | عالية |
| AUTH-03 | تسجيل برقم موجود مسبقاً | duplicate phone | 409 + "رقم مسجل" | عالية |
| AUTH-04 | تحقق OTP صحيح | `{phone, otp: "123456"}` | 200 + JWT tokens | عالية |
| AUTH-05 | تحقق OTP خاطئ | `{phone, otp: "000000"}` | 400 + "رمز خطأ" | عالية |
| AUTH-06 | تحقق OTP منتهي الصلاحية | بعد 5 دقائق | 400 + "انتهت صلاحية" | عالية |
| AUTH-07 | Refresh Token صحيح | valid refresh token | 200 + new access token | عالية |
| AUTH-08 | Refresh Token منتهي | expired | 401 + "انتهت الجلسة" | عالية |
| AUTH-09 | إعادة إرسال OTP | نفس الرقم | 200 + OTP جديد | متوسطة |
| AUTH-10 | Rate Limit — 6 محاولات | 6× same phone | 429 + "حاول لاحقاً" | عالية |

---

## 2. Orders Module

| TC# | السيناريو | Input | Expected Result | Priority |
|-----|----------|-------|----------------|----------|
| ORD-01 | إنشاء طلب جديد | valid JWT | 201 + status: draft | عالية |
| ORD-02 | إنشاء طلب بدون Auth | no token | 401 | عالية |
| ORD-03 | حفظ بيانات (Auto-Save) | valid form data | 200 + saved_at | عالية |
| ORD-04 | حفظ بيانات ناقصة | missing required fields | 400 + details | عالية |
| ORD-05 | إرسال البيانات النهائية | complete data | 200 + status: data_entry_complete | عالية |
| ORD-06 | رفع الصورة | valid image file | 200 + status: photo_pending | عالية |
| ORD-07 | رفع صورة كبيرة جداً | >10MB file | 400 + "الملف كبير" | عالية |
| ORD-08 | رفع صورة بصيغة خاطئة | .gif file | 400 + "صيغة غير مدعومة" | عالية |
| ORD-09 | رفع إيصال دفع | receipt image | 201 + status: payment_verification | عالية |
| ORD-10 | تغيير حالة الطلب (موظف) | `{status: "approved"}` | 200 + new status | عالية |
| ORD-11 | تغيير حالة غير مسموحة | `draft → approved` | 409 + "حالة غير مسموحة" | عالية |
| ORD-12 | إلغاء الطلب (مدير) | valid admin | 200 + status: cancelled | عالية |
| ORD-13 | عرض طلباتي (عميل) | client token | 200 + list (his only) | عالية |
| ORD-14 | عرض كل الطلبات (موظف) | employee token | 200 + list (all) | عالية |
| ORD-15 | عرض طلب غير موجود | invalid UUID | 404 | عالية |

---

## 3. State Machine Transitions

> مصفوفة 12×12 — كل انتقال غير مسموح = 409

| TC# | من | إلى | الفاعل | Expected |
|-----|-----|-----|--------|----------|
| SM-01 | draft | data_entry_complete | Client | 200 ✅ |
| SM-02 | draft | approved | Client | 409 ❌ |
| SM-03 | draft | cancelled | Admin | 200 ✅ |
| SM-04 | data_entry_complete | photo_pending | System | 200 ✅ |
| SM-05 | data_entry_complete | draft | Client | 200 ✅ (عودة) |
| SM-06 | photo_pending | photo_accepted | AI | 200 ✅ |
| SM-07 | photo_pending | photo_rejected | AI | 200 ✅ |
| SM-08 | photo_rejected | photo_pending | Client | 200 ✅ |
| SM-09 | photo_accepted | payment_pending | System | 200 ✅ |
| SM-10 | payment_pending | payment_verification | Client | 200 ✅ |
| SM-11 | payment_verification | approved | Employee | 200 ✅ |
| SM-12 | payment_verification | needs_correction | Employee | 200 ✅ |
| SM-13 | needs_correction | payment_pending | Client | 200 ✅ |
| SM-14 | approved | submitted | Employee | 200 ✅ |
| SM-15 | submitted | completed | System | 200 ✅ |
| SM-16 | completed | cancelled | Admin | 200 ✅ |
| SM-17 | completed | draft | Anyone | 409 ❌ (نهائي) |
| SM-18 | cancelled | draft | Anyone | 409 ❌ (نهائي) |

---

## 4. Payment Module

| TC# | السيناريو | Input | Expected Result | Priority |
|-----|----------|-------|----------------|----------|
| PAY-01 | عرض طرق الدفع | order_id | 200 + list of 4 methods | عالية |
| PAY-02 | اختيار طريقة + عرض حساب | method: "kuraimi" | 200 + account_number | عالية |
| PAY-03 | رفع إيصال + رقم حوالة | valid receipt | 201 + status pending | عالية |
| PAY-04 | رفع بدون إيصال | no file | 400 | عالية |
| PAY-05 | تأكيد دفع (موظف) | `verify: true` | 200 + status: approved | عالية |
| PAY-06 | رفض دفع (موظف) | `verify: false, notes` | 200 + status: needs_correction | عالية |
| PAY-07 | تأكيد لطلب غير موجود | invalid UUID | 404 | عالية |
| PAY-08 | رفض بدون ملاحظات | no notes | 400 + "الملاحظات مطلوبة" | عالية |
| PAY-09 | محاولة دفع لطلب مكتمل | completed order | 409 | متوسطة |

---

## 5. AI Photo Validation

| TC# | السيناريو | Input | Expected Result | Priority |
|-----|----------|-------|----------------|----------|
| AI-01 | صورة صحيحة تماماً | white bg, centered, lit | accepted + confidence > 90% | عالية |
| AI-02 | خلفية غير بيضاء | coloured bg | rejected + "خلفية غير بيضاء" | عالية |
| AI-03 | وجه غير متمركز | face on left edge | rejected + "الوجه غير متمركز" | عالية |
| AI-04 | إضاءة خافتة | dark image | rejected + "إضاءة غير كافية" | عالية |
| AI-05 | صورة مشوشة | blurry | rejected + "الصورة غير واضحة" | عالية |
| AI-06 | حجم رأس صغير جداً | face < 50% frame | rejected + "تكبير الوجه" | عالية |
| AI-07 | الخدمة معطلة | AI service down | 503 + "حاول لاحقاً" + manual fallback | عالية |
| AI-08 | مهلة الخدمة انتهت | > 10 ثوانٍ | 504 + "حاول مرة أخرى" | عالية |

---

## 6. Notification Module

| TC# | السيناريو | Expected Result | Priority |
|-----|----------|----------------|----------|
| NOT-01 | إرسال OTP → WhatsApp | sent + status: pending | عالية |
| NOT-02 | WhatsApp فشل → SMS | fallback + status: sent (SMS) | عالية |
| NOT-03 | SMS فشل → PWA Push | PWA push sent | متوسطة |
| NOT-04 | جميع القنوات فشلت | status: failed + retry queue | عالية |
| NOT-05 | Mark as read | 200 + status: read | متوسطة |
| NOT-06 | قائمة الإشعارات (مقسم) | 200 + paginated list | عالية |

---

## 7. Admin Module

| TC# | السيناريو | Expected Result | Priority |
|-----|----------|----------------|----------|
| ADM-01 | عرض الإحصائيات | 200 + orders count, revenue, status distribution | عالية |
| ADM-02 | قائمة المستخدمين (مقسم) | 200 + paginated list | عالية |
| ADM-03 | تغيير صلاحية مستخدم | 200 + role updated | عالية |
| ADM-04 | تصدير تقارير CSV | 200 + file download | متوسطة |
| ADM-05 | تغيير إعدادات الموسم | 200 + settings saved | عالية |
| ADM-06 | عرض سجل التدقيق | 200 + ordered audit log | عالية |
| ADM-07 | عميل يحاول الوصول لـ /admin | 403 + Forbidden | عالية |
| ADM-08 | موظف يحاول إدارة المستخدمين | 403 + Forbidden | عالية |

---

## 8. Edge Cases

| TC# | السيناريو | Expected Result | Priority |
|-----|----------|----------------|----------|
| EDG-01 | مستخدم يرسل طلبين بنفس الوقت | 200 (طلب 1) + 409 (طلب 2 إن وجد نشط) | متوسطة |
| EDG-02 | انقطاع الإنترنت أثناء رفع الصورة | auto-save يحمي البيانات | متوسطة |
| EDG-03 | متصفح قديم (IE, UC Mini) | PWA fallback + تحذير | منخفضة |
| EDG-04 | زوم 200% | لا فقدان محتوى، تخطيط مرن | متوسطة |
| EDG-05 | 1000 طلب متزامن في API | Rate limiting + queue | عالية |
| EDG-06 | إدخال بيانات SQL Injection | 400 + sanitized | عالية |
| EDG-07 | إدخال XSS في الملاحظات | escaped output | عالية |
| EDG-08 | حجم طلب ضخم (>1MB JSON) | 413 + "حجم الطلب كبير" | متوسطة |

---

*Qor3a — Test Cases V1.0 (50+ Test Cases)*
