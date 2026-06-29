# ♿ إتاحة الوصول — Accessibility (a11y)

> **Qor3a (قرعة)** — WCAG 2.1 AA Compliance for RTL Arabic Web Application

---

## 1. المبادئ الأساسية

```
┌─────────────────────────────────────────────────────────────┐
│ مبدأ                        │ التطبيق في قرعة                │
├─────────────────────────────┼───────────────────────────────│
│ 1. Perceivable (قابل للإدراك) │ كل المحتوى يصل للحواس        │
│ 2. Operable (قابل للتشغيل)   │ كل الوظائف تعمل بلوحة المفاتيح│
│ 3. Understandable (مفهوم)    │ المحتوى واضح وسهل الفهم       │
│ 4. Robust (متين)             │ يعمل مع كل التقنيات المساعدة  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. اللغة العربية RTL

| القاعدة | التطبيق |
|---------|---------|
| `dir="rtl"` على `<html>` | كل الصفحات |
| `lang="ar"` | المحتوى العربي |
| محاذاة النص يميناً | كل العناصر النصية |
| عكس اتجاه الأيقونات | أيقونات السهم، الإشارات، الـ chevron |
| مسافات RTL | padding-right لليسار، padding-left لليمين |

---

## 3. Semantic HTML

```html
<!-- ✅ صحيح: استخدام landmarks -->
<header role="banner">...</header>
<nav role="navigation" aria-label="القائمة الرئيسية">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- ✅ صحيح: خطوات الـ Wizard -->
<nav aria-label="خطوات التسجيل">
  <ol>
    <li aria-current="step">البيانات الشخصية</li>
    <li>الصورة</li>
    <li>الدفع</li>
  </ol>
</nav>

<!-- ❌ خطأ: أزرار بدون معنى -->
<div onclick="submit()">إرسال</div>
<!-- ✅ صحيح: -->
<button type="submit">إرسال</button>
```

---

## 4. Keyboard Navigation

| المفتاح | الوظيفة |
|---------|---------|
| `Tab` | التنقل بين العناصر بالترتيب المنطقي |
| `Shift + Tab` | العودة للخلف |
| `Enter / Space` | تفعيل الزر/الرابط |
| `Escape` | إغلاق الـ Modal |
| `Arrow Keys` | التنقل داخل القوائم المنسدلة |
| `1-8` (في Wizard) | الانتقال المباشر للخطوة (اختصار) |

### ترتيب الـ Tab

```
الصفحة الرئيسية:
1. Skip to content
2. الشعار (رابط للرئيسية)
3. زر "ابدأ التسجيل"
4. روابط القائمة
5. المحتوى الرئيسي
6. التذييل

Wizard:
1. حقل الإدخال الأول
2. حقل الإدخال الثاني
3. ...
4. زر السابق
5. زر التالي ← Focus هنا تلقائياً بعد إكمال خطوة
```

### Skip Navigation
```html
<!-- أول عنصر بعد <body> -->
<a href="#main-content" class="skip-link">
  تخطى إلى المحتوى الرئيسي
</a>
<style>
.skip-link {
  position: absolute;
  top: -40px; /* مخفي إلا عند الـ focus */
}
.skip-link:focus {
  top: 0;
  background: #10b981;
  color: white;
  padding: 8px 16px;
  z-index: 9999;
}
</style>
```

---

## 5. ARIA Attributes

```typescript
// Modal
<dialog role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">تأكيد الحذف</h2>
  <p id="modal-desc">هل أنت متأكد من حذف هذا الطلب؟</p>
  <button aria-describedby="modal-desc">نعم، حذف</button>
</dialog>

// Status Badge
<span role="status" aria-live="polite">
  حالة الطلب: <span class="badge">قيد المراجعة</span>
</span>

// Error Message
<div role="alert" aria-live="assertive">
  ❌ البريد الإلكتروني غير صحيح
</div>

// Progress Bar
<div role="progressbar" aria-valuenow="3" aria-valuemin="1"
     aria-valuemax="5" aria-label="الخطوة 3 من 5">
  <div class="progress-fill" style="width: 60%"></div>
</div>

// Tabs
<div role="tablist" aria-label="أقسام الطلب">
  <button role="tab" aria-selected="true" aria-controls="panel-data">البيانات</button>
  <button role="tab" aria-selected="false" aria-controls="panel-photo">الصورة</button>
</div>
```

---

## 6. Color & Contrast

### النسبة المطلوبة (WCAG AA)

| العنصر | النسبة | مثال |
|--------|--------|------|
| نص عادي | 4.5:1 | نص رمادي #6b7280 على خلفية بيضاء → 4.6:1 ✅ |
| نص كبير (>24px) | 3:1 | عنوان أخضر #10b981 على أبيض → 3.2:1 ✅ |
| UI Components | 3:1 | حدود الحقول، أيقونات |

###不该 استخدام اللون فقط

```typescript
// ❌ خطأ: الاعتماد على اللون فقط
<StatusBadge color="green">مقبول</StatusBadge>

// ✅ صحيح: لون + أيقونة + نص
<StatusBadge color="green" icon="check">
  ✅ مقبول
</StatusBadge>
```

### الألوان المعتمدة

| اللون | Ratio على أبيض | الاستخدام |
|-------|----------------|-----------|
| #10b981 (Primary) | 3.2:1 | عناوين، حدود |
| #059669 (Dark) | 4.8:1 ✅ | نص الأزرار |
| #1e293b (Navy) | 14:1 ✅ | النص الرئيسي |
| #6b7280 (Gray) | 4.6:1 ✅ | النص الثانوي |
| #ef4444 (Red) | 4.5:1 ✅ | أخطاء |
| #3b82f6 (Blue) | 4.4:1 ✅ | روابط |

---

## 7. Forms & Inputs

```html
<!-- ✅ كل حقل له label -->
<label for="fullName">الاسم الكامل</label>
<input
  id="fullName"
  name="fullName"
  required
  aria-required="true"
  aria-describedby="fullName-hint fullName-error"
/>
<span id="fullName-hint">مثال: أحمد محمد علي</span>
<span id="fullName-error" role="alert" aria-live="assertive">
  الحقل مطلوب
</span>

<!-- ✅ مجموعة الحقول ذات الصلة -->
<fieldset>
  <legend>معلومات الاتصال</legend>
  <label for="email">البريد الإلكتروني</label>
  <input id="email" type="email" />
</fieldset>
```

### Auto-Save Announcement
```typescript
// عند الحفظ التلقائي:
<div role="status" aria-live="polite" class="sr-only">
  تم حفظ البيانات
</div>

// مرئياً:
<div class="toast" role="status">
  ✅ تم الحفظ
</div>
```

---

## 8. Focus Management

```typescript
// 1. عند فتح Modal → focus على أول عنصر تفاعلي
modal.addEventListener('open', () => {
  closeButton.focus()
})

// 2. عند إغلاق Modal → focus على الزر الذي فتحه
modal.addEventListener('close', () => {
  triggerButton.focus()
})

// 3. في Wizard → focus على عنوان الخطوة الجديدة
stepChange(page => {
  heading.focus()
})

// 4. في الأخطاء → focus على أول حقل خطأ
formValidation(errors => {
  errors[0].element.focus()
})
```

---

## 9. Screen Reader Only (SR Only) Classes

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
}
```

---

## 10. Touch Targets (Mobile)

| العنصر | الحد الأدنى | الأفضل |
|--------|------------|--------|
| الأزرار | 44×44px | 48×48px |
| الحقول | 44px ارتفاع | 48px |
| التباعد بين الأزرار | 8px | 12px |
| القوائم (روابط) | 44px | 48px |

---

## 11. Testing Checklist

```
□ HTML Validation (W3C)
□ ARIA attributes صحيحة
□ Keyboard navigation لكل الوظائف
□ Focus order منطقي
□ Skip link موجود
□ Contrast ratio ≥ 4.5:1 للنصوص
□ كل الصور لها alt text
□ كل الحقول لها labels
□ Errors تُعلن لـ Screen Reader
□ Modal focus trap
□ Zoom 200% — لا فقدان محتوى
□ Orientation (جوال) — landscape + portrait
□ Screen Reader: VoiceOver (iOS) + TalkBack (Android)
```

---

*Qor3a — Accessibility Guide V1.0*
