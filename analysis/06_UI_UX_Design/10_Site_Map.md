# خريطة الموقع - Site Map

> جميع صفحات موقع قرعة (العميل + لوحة التحكم)

---

## 🧭 Navigation Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Built |
| 🔧 | In Progress |
| ⬜ | Not Built |
| 🔒 | Requires Auth (Client) |
| 🔐 | Requires Auth (Employee) |
| 🔑 | Requires Auth (Admin) |
| 🌐 | Public |

---

## 1. الموقع العام (Client-Facing Site)

### 1.1 الصفحات العامة (Public Pages)

```
🌐 /                                ← الصفحة الرئيسية (Landing Page) ✅
🌐 /login                           ← تسجيل الدخول (هاتف + OTP) ✅
🌐 /register                        ← إنشاء حساب (هاتف + OTP) ✅
🌐 /help                            ← الأسئلة الشائعة (FAQ) ✅
```

### 1.2 صفحات العميل (Protected - Client)

```
🔒 /lottery/*                       ← مشرف التسجيل 8 خطوات ✅
│   ├── Step 1: البيانات الشخصية     ✅
│   ├── Step 2: معلومات التواصل      ✅
│   ├── Step 3: التعليم والحالة      ✅
│   ├── Step 4: بيانات الزوج/ة       ✅
│   ├── Step 5: بيانات الأطفال       ✅
│   ├── Step 6: الصورة الشخصية       ✅
│   ├── Step 7: الدفع                ✅
│   └── Step 8: التأكيد              ✅
│
🔒 /my-account                       ← لوحة تحكم العميل (طلباتي) ✅
🔒 /orders/:id                       ← tracking طلب واحد ✅
🔒 /check-result                     ← فحص النتيجة برقم التأكيد ✅
```

### 1.3 صفحات مقترحة (Not Built)

```
🌐 ⬜ /about                         ← من نحن
🌐 ⬜ /terms                         ← الشروط والأحكام
🌐 ⬜ /privacy                       ← سياسة الخصوصية
🌐 ⬜ /contact                       ← اتصل بنا
🌐 ⬜ /photo-guide                   ← دليل الصورة الشخصية (صفحة منفصلة)

🔒 ⬜ /my-account/settings           ← إعدادات الحساب (تعديل الاسم، البريد)
🔒 ⬜ /my-account/notifications      ← قائمة الإشعارات كاملة
🔒 ⬜ /my-account/orders/:id/result  ← صفحة النتيجة (فائز/خاسر)
```

---

## 2. لوحة التحكم - Dashboard (Employee + Admin)

### 2.1 القسم المشترك (Employee & Admin)

```
🔐 /dashboard                        ← الرئيسية (إحصائيات سريعة) ✅
│
🔐 /dashboard/orders                 ← ← قائمة الطلبات مع فلترة ✅
🔐 /dashboard/orders/:id             ← ← مراجعة طلب واحد ✅
│
🔐 /dashboard/payments               ← ← قائمة المدفوعات ✅
🔐 /dashboard/payments/:id           ← ← التحقق من الدفع ✅
│
🔐 /dashboard/submit                 ← ← طلبات جاهزة للإدخال الرسمي ✅
🔐 /dashboard/submit/:id             ← ← إدخال رقم التأكيد ✅
│
🔐 /dashboard/check-results          ← ← فحص النتائج (قائمة) ✅
│
🔐 /dashboard/profile                ← ← الملف الشخصي للموظف ✅
```

### 2.2 قسم المشرف (Admin Only)

```
🔑 /dashboard/admin/orders           ← الإشراف على الطلبات (مع احتيال) ✅
🔑 /dashboard/admin/users            ← إدارة المستخدمين ✅
🔑 /dashboard/admin/reports          ← التقارير والإحصائيات ✅
🔑 /dashboard/admin/audit-log        ← سجل التدقيق ✅
🔑 /dashboard/admin/settings         ← الإعدادات العامة ✅
🔑 /dashboard/admin/notifications    ← إرسال إشعارات جماعية ✅
```

### 2.3 صفحات إضافية مقترحة

```
🔑 ⬜ /dashboard/admin/settings/season       ← ← إعدادات الموسم
🔑 ⬜ /dashboard/admin/settings/pricing      ← ← إعدادات الأسعار
🔑 ⬜ /dashboard/admin/settings/accounts     ← ← حسابات الدفع
🔑 ⬜ /dashboard/admin/settings/api-keys     ← ← مفاتيح API (2Captcha, WhatsApp)

🔑 ⬜ /dashboard/admin/reports/revenue       ← ← تقرير الإيرادات
🔑 ⬜ /dashboard/admin/reports/orders        ← ← تقرير الطلبات
🔑 ⬜ /dashboard/admin/reports/employees     ← ← أداء الموظفين

🔐 ⬜ /dashboard/employees                   ← ← قائمة الموظفين (Admin)
🔐 ⬜ /dashboard/employees/:id               ← ← مراجعة أداء موظف

🔑 ⬜ /dashboard/admin/backups               ← ← النسخ الاحتياطي
🔑 ⬜ /dashboard/admin/logs                  ← ← سجلات النظام (server logs)
```

---

## 3. الصفحات المشتركة (UI Components)

```
📦 src/common/components/
│
├── CameraFrame.jsx              ← كاميرا مدمجة مع إطار بيضاوي ✅
├── EmptyState.jsx               ← حالة فارغة (لا توجد بيانات) ✅
├── ExportButton.jsx             ← تصدير CSV ✅
├── Modal.jsx                    ← نافذة منبثقة ✅
├── OtpInput.jsx                 ← إدخال OTP 6 أرقام ✅
├── Pagination.jsx               ← ترقيم الصفحات ✅
├── PhotoGuide.jsx               ← دليل الصورة ✅
├── PhotoViewer.jsx              ← عرض الصورة ✅
├── ReceiptViewer.jsx            ← عرض الإيصال ✅
├── StatCard.jsx                 ← بطاقة إحصائية ✅
├── StatusBadge.jsx              ← شارة الحالة ✅
└── StatusTimeline.jsx           ← خط زمني للحالات ✅
```

---

## 4. توزيع المسارات حسب الدور (Role-Based Access)

```
دور العميل (Client):
├── / → /login → /register → /help
├── /lottery/*
├── /my-account → /orders/:id
└── /check-result

دور الموظف (Employee):
├── /dashboard
├── /dashboard/orders → /dashboard/orders/:id
├── /dashboard/payments → /dashboard/payments/:id
├── /dashboard/submit → /dashboard/submit/:id
├── /dashboard/check-results
└── /dashboard/profile

دور المشرف (Admin):
├── كل صلاحيات الموظف +
├── /dashboard/admin/orders
├── /dashboard/admin/users
├── /dashboard/admin/reports
├── /dashboard/admin/audit-log
├── /dashboard/admin/settings
└── /dashboard/admin/notifications
```

---

## 5. إحصائيات الصفحات

| الفئة | موجود ✅ | مقترح ⬜ | المجموع |
|-------|---------|---------|---------|
| صفحات عامة (Public) | 4 | 6 | 10 |
| صفحات العميل | 4 | 3 | 7 |
| لوحة التحكم (موظف + مشرف) | 16 | 10 | 26 |
| **الإجمالي** | **24** | **19** | **43** |

> ✅ **24 صفحة مبنية** من أصل 43 صفحة مخطط لها = **55% مكتمل**
