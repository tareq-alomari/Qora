# 🎨 نظام التصميم — Design System

> **Qor3a (قرعة)** — Brand Identity + UI Component Specs

---

## 1. Brand Identity

### اللوجو
```
┌──────────────────┐
│  🎯  قرعة        │
│      Qor3a       │
└──────────────────┘
- أيقونة: هدف/سهم 🎯 أو كشط يانصيب
- النص: "قرعة" بالعربية كبيرة + "Qor3a" بالإنجليزية صغيرة
- الاتجاه: icon يمين النص
- RTL للعربية، LTR للإنجليزية
```

### الألوان الأساسية

| اللون | الاستخدام | HEX | Tailwind |
|-------|-----------|-----|----------|
| **Primary Green** | أزرار، روابط، عناوين، حالات نشطة | `#10b981` | emerald-500 |
| **Green Dark** | Hover, Active | `#059669` | emerald-600 |
| **Gold/Amber** | فوز، نجاح، إنجاز | `#f59e0b` | amber-500 |
| **Red** | أخطاء، رفض، تحذير | `#ef4444` | red-500 |
| **Blue** | معلومات، عمليات جارية، روابط | `#3b82f6` | blue-500 |
| **Navy** | عناوين، نص رئيسي | `#1e293b` | slate-800 |

### الألوان المحايدة

| اللون | الاستخدام | HEX | Tailwind |
|-------|-----------|-----|----------|
| Background | خلفيات الصفحات | `#f9fafb` | gray-50 |
| Surface | بطاقات، صناديق | `#ffffff` | white |
| Border | حدود خفيفة | `#e5e7eb` | gray-200 |
| Text Primary | نص أساسي | `#111827` | gray-900 |
| Text Secondary | نص ثانوي | `#6b7280` | gray-500 |
| Text Disabled | نص معطل | `#9ca3af` | gray-400 |

### State Colors

| الحالة | اللون | HEX |
|--------|-------|-----|
| Draft | رمادي | `#9ca3af` |
| Pending Review | أزرق | `#3b82f6` |
| Photo Rejected | أحمر | `#ef4444` |
| Photo Accepted | أخضر | `#10b981` |
| Payment Pending | برتقالي | `#f97316` |
| Payment Verified | أخضر | `#10b981` |
| Needs Correction | أصفر | `#eab308` |
| Approved | أخضر داكن | `#059669` |
| Submitted | بنفسجي | `#8b5cf6` |
| Completed | أخضر | `#22c55e` |
| Cancelled | أحمر داكن | `#dc2626` |

---

## 2. Typography

### Font Family
- **العربية**: Cairo (Google Font)
- **English**: Cairo (same — supports both)
- Fallback: `sans-serif`

### Weights
| الوزن | الاستخدام |
|-------|-----------|
| 300 (Light) | نصوص طويلة، Captions |
| 400 (Regular) | الجسم، الفقرات |
| 500 (Medium) | عناوين ثانوية، أزرار |
| 600 (Semi-Bold) | عناوين داخلية |
| 700 (Bold) | العناوين الرئيسية |

### Size Scale (Mobile-first)

| الاسم | Mobile | Desktop | الاستخدام |
|-------|--------|---------|-----------|
| xs | 12px | 14px | Caption, helper |
| sm | 14px | 16px | Body small |
| base | 16px | 18px | Body text |
| lg | 18px | 20px | Subtitle, inputs |
| xl | 20px | 24px | Section titles |
| 2xl | 24px | 30px | Page titles |
| 3xl | 30px | 36px | Hero title |
| 4xl | 36px | 48px | Hero big |

---

## 3. Spacing & Layout

### Spacing Scale
| Token | px | Tailwind |
|-------|----|----------|
| xs | 4px | p-1 |
| sm | 8px | p-2 |
| md | 16px | p-4 |
| lg | 24px | p-6 |
| xl | 32px | p-8 |
| 2xl | 48px | p-12 |

### Breakpoints
| Device | Width | Container |
|--------|-------|-----------|
| Mobile | 360-414px | 100% (16px padding) |
| Tablet | 768px | 720px |
| Desktop | 1024px | 960px |
| Wide | 1440px | 1280px |

### Border Radius
| الاسم | Value | Tailwind | الاستخدام |
|-------|-------|----------|-----------|
| input | 8px | rounded-lg | Inputs, buttons |
| card | 12px | rounded-xl | بطاقات المحتوى |
| modal | 16px | rounded-2xl | المودالات |
| badge | 999px | rounded-full | الشارات |

### Shadows
| الاسم | Tailwind | الاستخدام |
|-------|----------|-----------|
| Soft | shadow-sm | بطاقات هادئة |
| Medium | shadow-md | البطاقات الرئيسية |
| Hard | shadow-lg | المودالات والقوائم |

---

## 4. Components Library

### 4.1 Buttons
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

// Primary (أخضر)
// - bg: #10b981, text: white, hover: #059669
// - استخدام: CTA، تأكيد، حفظ

// Secondary (أبيض بحدود)
// - bg: white, border: #e5e7eb, text: #111827
// - استخدام: إلغاء، رجوع

// Ghost (بدون حدود)
// - bg: transparent, text: #6b7280
// - استخدام: إجراءات ثانوية

// Danger (أحمر)
// - bg: #ef4444, text: white
// - استخدام: حذف، رفض
```

### 4.2 Input Fields
```typescript
type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled'

// Default: border #e5e7eb, bg white
// Focused: border #10b981, ring 2px rgba(16,185,129,0.2)
// Error: border #ef4444, red text below
// Success: border #10b981, green check icon
// Disabled: bg #f3f4f6, text #9ca3af
```

### 4.3 Status Badges
```typescript
type BadgeStatus =
  | 'draft'           // bg: gray-100, text: gray-700
  | 'photo_pending'   // bg: blue-100, text: blue-700
  | 'photo_rejected'  // bg: red-100, text: red-700
  | 'photo_accepted'  // bg: green-100, text: green-700
  | 'payment_pending' // bg: orange-100, text: orange-700
  | 'payment_verification' // bg: blue-100, text: blue-700
  | 'approved'        // bg: emerald-100, text: emerald-700
  | 'needs_correction'// bg: yellow-100, text: yellow-700
  | 'submitted'       // bg: purple-100, text: purple-700
  | 'completed'       // bg: green-100, text: green-700
  | 'cancelled'       // bg: red-100, text: red-700
```

### 4.4 Cards
```typescript
// Order Card (قائمة الطلبات)
// - Rounded: 12px
// - Shadow: md
// - Padding: 16px
// - يحتوي: Status badge + Title + Date + Quick actions

// Review Card (شاشة المراجعة)
// - 3 أعمدة: Photo | Data | Payment
// - كل عمود: Surface white + border
```

### 4.5 Progress Bar
```typescript
type ProgressStep = 'completed' | 'current' | 'pending'

// Step indicator:
// ●━━━●━━━●━━━●━━━●
// 1   2   3   4   5

// Completed: bg green, icon check
// Current: bg blue, pulse animation
// Pending: bg gray, hollow circle
```

### 4.6 Toast Notifications
```
Success: Green bg + ✅ + "تم الحفظ"
Error:   Red bg + ❌ + "حدث خطأ"
Warning: Yellow bg + ⚠️ + "الدفع لم يؤكد"
Info:    Blue bg + ℹ️ + "قيد المراجعة"
Duration: 4 ثوانٍ أو حتى إغلاق يدوي
Position: أعلى اليمين (RTL: أعلى اليسار)
```

### 4.7 Modal
```typescript
// طبقتان: Backdrop (dark 50%) + Content (white, rounded 16px)
// أزرار: تأكيد (primary) + إلغاء (secondary)
// Close: X button top right + backdrop click
```

### 4.8 Camera Frame
```
┌────────────────────┐
│       × إلغاء       │
│                    │
│  ┌──────────────┐  │
│  │  ┌────────┐  │  │
│  │  │ وجهك   │  │  │
│  │  │ هنا    │  │  │
│  │  └────────┘  │  │
│  └──────────────┘  │
│                    │
│  ● خلفية بيضاء     │
│  ● إضاءة جيدة       │
│  ● وجه في المنتصف   │
│                    │
│  [📷 التقاط الصورة] │
└────────────────────┘
```

### 4.9 Data Table (Employee)
```typescript
// Columns: # | الاسم | الحالة | تاريخ الإنشاء | الإجراءات
// Row hover: bg gray-50
// Sortable headers
// Pagination: 20 items/page
// Filters dropdown: الحالة, التاريخ
```

---

## 5. RTL Layout Rules

| العنصر | RTL |
|--------|-----|
| النص | text-align: right |
| الأيقونات | mirror horizontally |
| المسافات | margin-right ↔ margin-left |
| القوائم | padding-right: 0 |
| الأزرار | icon right of text |
| Sidebar | right side |
| Modal close | top left (not top right) |

---

## 6. Animation & Transitions

| العنصر | المدة | التابع |
|--------|-------|--------|
| Page load | 300ms | fade in |
| Modal show | 200ms | scale + fade |
| Toast in | 300ms | slide in |
| Status change | 500ms | highlight pulse |
| Button hover | 150ms | opacity/bg |
| Progress step | 400ms | slide to next |

---

## 7. Iconography

استخدم **Lucide Icons** (مكتبة مفتوحة المصدر متوافقة مع React):

| المعنى | الأيقونة |
|--------|----------|
| تسجيل | `UserPlus` |
| بيانات | `FileText` |
| تصوير | `Camera` |
| دفع | `Wallet` |
| مراجعة | `Search` |
| نجاح | `CheckCircle` |
| خطأ | `XCircle` |
| تعديل | `Pencil` |
| حذف | `Trash2` |
| إشعارات | `Bell` |
| تحميل | `Download` |
| رفع | `Upload` |

---

*Qor3a Design System V1.0 — يوليو 2026*
