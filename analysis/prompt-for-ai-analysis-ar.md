# 🏗️ أمر للذكاء الاصطناعي — تحليل مشروع برمجي احترافي
# Arabic Version — قابلة للنسخ واللصق لأي AI

> استخدم هذا الأمر مع Claude أو ChatGPT أو Gemini  
> لإنشاء تحليل كامل لأي مشروع برمجي — جاهز للبرمجة.

---

## التعليمات للذكاء الاصطناعي

أنت مستشار برمجيات أول. مهمتك: تحليل شامل للمشروع التالي باتباع المنهجية أدناه بدقة.

---

## المنهجية: 9 مراحل (First Principles)

```
┌───────────────────────────────────────────────────┐
│ #  │ المرحلة                       │ السؤال       │
├────┼────────────────────────────────┼──────────────┤
│ 01 │ Business & Vision             │ لماذا نبني؟   │
│ 02 │ Requirements Engineering      │ ماذا نبني؟    │
│ 03 │ System Architecture           │ كيف نبنيها؟   │
│ 04 │ Database Design               │ أين نخزن؟     │
│ 05 │ API & Integrations            │ كيف نربط؟     │
│ 06 │ UI/UX Design                  │ تفاعل المستخدم│
│ 07 │ DevOps & Deployment           │ كيف نشغلها؟   │
│ 08 │ Security & Risks              │ كيف نحميها؟   │
│ 09 │ Testing & QA                  │ كيف نضمن الجودة│
└────┴────────────────────────────────┴──────────────┘
```

كل مشروع يمر بهذه المراحل. الفرق فقط في العمق.

---

## قواعد الإخراج

1. أنشئ ملفات في `analysis/{رقم-المرحلة}-{الاسم}/` بترقيم تسلسلي
2. كل ملف يجب أن يجيب على سؤال محدد
3. الكود البرمجي بالإنجليزية، المحتوى بالعربية
4. كل ملف: 100-300 سطر من المحتوى القابل للتنفيذ
5. استخدم **Mermaid.js** للرسوم البيانية (graph TB, erDiagram, stateDiagram, sequenceDiagram) بدلاً من ASCII
6. استخدم أرقاماً حقيقية (تكاليف، أوقات، منافسين حقيقيين)

---

## هيكل كل مرحلة

### المرحلة 1: Business & Vision (01_Business_and_Vision/)

```
README.md                ← فهرس الملفات
Business_Model_Canvas.md ← نموذج العمل: Value Proposition, BMC, شرائح, تسعير
Value_Proposition.md     ← القيمة المقترحة, الاحتفاظ بالعملاء, دورة الحياة
Market_and_Competitors.md ← السوق, منافسون حقيقيون, SWOT, مقارنة أسعار
Unit_Economics.md        ← CAC, LTV, Break-Even, هامش الربح
Financial_Projections.md ← P&L 3 سنوات, تدفق نقدي, 3 سيناريوهات
Marketing_Strategy.md    ← قنوات, شخصيات, حملات, ميزانية, تقويم
Team_Structure.md        ← الأدوار, الرواتب, جدول التوظيف
Product_Roadmap.md       ← 12-24 شهر مع milestones
Risk_Analysis.md         ← 10+ مخاطر + مصفوفة RPN + Heat Map
```

**لكل ملف:** من المستخدمون؟ TAM/SAM/SOM؟ أسعار المنافسين؟ الإيرادات؟ التكاليف؟ Break-Even؟ القنوات؟ الفريق؟ المخاطر الحرجة؟

### المرحلة 2: Requirements Engineering (02_Requirements_Engineering/)

```
README.md                ← فهرس الملفات
PRD.md                   ← PRD: كل FRs + NFRs + قيود + OKRs + معايير الإطلاق
User_Personas.md         ← 3-5 شخصيات مفصلة بأسماء/أعمار/أجهزة/ألم
Functional_Requirements.md ← 23+ FR + 18+ NFR + User Stories + Use Cases
```

**PRD هو المستند الأم.** اجمع كل شيء فيه. قصص المستخدم داخل ملف المتطلبات.

### المرحلة 3: System Architecture (03_System_Architecture/)

```
README.md                ← فهرس الملفات
Architecture_Overview.md ← Mermaid: رسمة معمارية, ERD, State Machine, 3 Sequence
Architecture_Decision_Records_ADR.md ← 8+ ADRs مع تبرير كل قرار
System_Flowcharts.md     ← Mermaid: DFD Level 0/1/2 للعمليات الأساسية
Official_Submission.md   ← Mermaid: أتمتة المواقع الخارجية (إن وجد)
Failure_Scenarios.md     ← 6+ سيناريوهات فشل + إنذار مبكر + حل يدوي
```

**ADRs:** "ليش Express مو NestJS؟ ليش PostgreSQL مو MongoDB؟" — أسباب حقيقية.
كل الرسومات بـ Mermaid.js.

### المرحلة 4: Database Design (04_Database_Design/)

```
README.md                ← فهرس الملفات
Entity_Relationship_Diagram_ERD.md ← ERD + SQL كامل + Indexes + RLS
Data_Requirements.md     ← تصنيف البيانات, أحجام, دورة حياة, تخزين
```

إضافي: Caching_Strategy.md, Data_Dictionary.md

### المرحلة 5: API & Integrations (05_API_and_Integrations/)

```
README.md                ← فهرس الملفات
RESTful_Endpoints_Draft.md ← API: method, path, auth, role, request/response
Integration_Requirements.md ← خدمات خارجية, APIs, Fallback, تكاليف
Third_Party_Integrations.md ← بوابات دفع, SMS, إيميل — auth + cost + fallback
Notifications.md         ← سلسلة الإشعارات: WhatsApp→PWA→SMS→Email
Payment_Reconciliation.md ← تسوية المدفوعات, محاسبة, كشف احتيال
```

### المرحلة 6: UI/UX Design (06_UI_UX_Design/)

```
README.md                ← فهرس الملفات
User_Journey_Maps.md     ← رحلة كاملة + خريطة موقع + سير عمل (Mermaid)
Client_Dashboard.md      ← شاشات العميل, Wizard, تتبع
Admin_Dashboard.md       ← شاشات المدير, تقارير, إعدادات
Employee_Operations.md   ← مراجعة, يوم الموظف, Task Queue (Mermaid)
Post_Payment_Workflow.md ← تأكيد الدفع ← إدخال رسمي ← فحص نتيجة
Design_System.md         ← ألوان, خطوط, مسافات, Components, RTL
Wireframes_and_Layouts.md ← كل شاشة بـ 4 حالات (افتراضي/تحميل/خطأ/فارغ)
Content_Strategy.md      ← نصوص, FAQ, فيديوهات, دليل تصوير, ردود
Mobile_First.md          ← PWA, 3G, 360-414px, Touch ≥48px
Onboarding_Trust.md      ← أول 5 دقائق, أول 24 ساعة, بناء الثقة
Accessibility.md         ← WCAG AA: Keyboard, ARIA, Contrast
User_Testing.md          ← 5 شخصيات, SUS, 7 سيناريوهات
```

**مبدأ:** صمم لأضعف مستخدم (أرخص هاتف, أبطأ إنترنت). الجوال أولاً.

### المرحلة 7: DevOps & Deployment (07_DevOps_and_Deployment/)

```
README.md                ← فهرس الملفات
Project_Setup.md         ← git clone → .env → npm install → localhost
Coding_Standards.md      ← هيكل المجلدات, التسمية, ✅/❌
Module_Template.md       ← موديول كامل: routes/controller/service/model
Error_Handling.md        ← AppError, 50+ كود خطأ, Centralized Handler
Validation_Schemas.md    ← Joi/Zod لكل endpoint
Component_Library.md     ← 40+ Component, 24 Hook, Zustand Stores
Docker_and_Containers.md ← Mermaid: VPS Topology, Docker Compose
Deployment_Strategy.md   ← البيئات, CI/CD, Zero-Downtime, Rollback
CI_CD_Pipelines.md       ← GitHub Actions + Docker + Deploy
Monitoring_and_Logs.md   ← Health Checks, Alert Channels, Thresholds
Logging.md               ← Winston, JSON, Levels, Retention
Disaster_Recovery.md     ← 10+ سيناريوهات, RTO/RPO, Backup
Runbook.md               ← استمرارية المؤسس, كلمات سر, طوارئ
Customer_Support.md      ← 5 قنوات, 6 قوالب, 4 مستويات تصعيد
Maintenance.md           ← يومي/أسبوعي/شهري/موسمي
Reports_Analytics.md     ← KPIs, Dashboards, SQL, تنبيهات
```

**مبدأ:** الـ Module Template يُنسخ لكل ميزة جديدة. اجعله مثالياً.

### المرحلة 8: Security & Risks (08_Security_and_Risks/)

```
README.md                ← فهرس الملفات
Threat_Model.md          ← مخاطر أمنية + RPN + استراتيجيات تخفيف
Security_Architecture.md ← JWT, RBAC, AES-256, Rate Limiting, Traffic
Data_Privacy.md          ← قانوني, حماية بيانات, تشفير, احتفاظ, حذف
Privacy_Policy.md        ← سياسة خصوصية — نص كامل جاهز للنشر
Terms_of_Service.md      ← شروط خدمة — نص كامل جاهز للنشر
Fraud_Prevention.md      ← محرك قواعد, كشف احتيال, Audit Trail
Security_Testing.md      ← OWASP Top 10, 30+ اختبار اختراق
```

### المرحلة 9: Testing & QA (09_Testing_and_QA/)

```
README.md                ← فهرس الملفات
QA_Testing_Strategy.md   ← هرم Unit/Integration/E2E, أدوات, تغطية
Test_Cases.md            ← 50+ حالة اختبار + State Machine 12×12
Testing_Guide.md         ← Jest Patterns, Mocks, أمثلة
Performance_Testing.md   ← K6, SLOs, Stress/Soak
UAT.md                   ← 6 شخصيات, 7 سيناريوهات, SUS Score
Pre_Launch_Checklist.md  ← 100+ نقطة GO/NO-GO
```

**لحالات الاختبار:** غطِ كل انتقال في State Machine.

---

## قاعدة 80/20 لكل ملف

```
README في كل مجلد:
├── 20%: فقرة ملخص المرحلة
├── 60%: جدول بكل الملفات (#، الاسم، الحجم، الوصف)
└── 20%: ملاحظات على الملفات المدمجة أو الفجوات

ملفات المحتوى (01-xx.md):
├── 10%: عنوان المرحلة + اسم الملف
├── 70%: محتوى قابل للتنفيذ مع جداول وقوائم ورسومات Mermaid
├── 10%: أمثلة مع ✅/❌
└── 10%: إشارات لملفات أخرى
```

---

## معايير الجودة لكل ملف

```
قبل الانتقال للملف التالي، تحقق:
□ هل يجيب على السؤال في عنوانه؟
□ هل توجد أرقام محددة (تكاليف، أوقات، نسب مئوية)؟
□ هل المنافسون مذكورون بأسمائهم (وليس "بعض المنافسين")؟
□ هل الأمثلة عملية (وليست عامة)؟
□ هل يعرف المطور ماذا يبني بعد قراءته؟
□ هل يفهم عضو الفريق الجديد النظام؟
□ هل كل ملفات المعمارية تحتوي Mermaid diagrams؟
□ هل README.md يعرض كل الملفات في المجلد مع الأحجام؟
```

---

## مثال: قالب تحليل السوق

```markdown
# تحليل السوق — Market Analysis

> **{اسم المشروع}** — السوق المستهدف، الحجم، الجمهور

## 1. السوق المستهدف

| القطاع | الحجم | النسبة المستهدفة |
|--------|-------|-----------------|
| {القطاع 1} | {X مستخدم} | {Y%} |
| {القطاع 2} | {X مستخدم} | {Y%} |

## 2. المشكلة

| المشكلة | الحل في {المشروع} |
|---------|------------------|
| {نقطة الألم 1} | {الحل 1} |
| {نقطة الألم 2} | {الحل 2} |

## 3. مقارنة الأسعار

| المنافس | السعر | نقاط القوة | نقاط الضعف |
|---------|-------|-----------|-------------|
| {منافس 1} | {سعره} | {...} | {...} |
| {نحن} | {سعرنا} | {...} | {...} |

## 4. تحليل SWOT

### نقاط القوة
- ...

### نقاط الضعف
- ...

### الفرص
- ...

### التهديدات
- ...
```

---

## الـ INDEX النهائي

بعد إنشاء كل الملفات، أنشئ `analysis/INDEX.md` يحتوي على:

1. **شجرة هيكل المشروع** — شكل analysis/ كامل
2. **جدول نظرة عامة** — 9 مراحل مع عدد الملفات والسؤال لكل مرحلة
3. **كل مرحلة بالتفصيل** — جدول ملفات كل مرحلة (الاسم، الحجم، الوصف)
4. **مرجع سريع** — 40+ سؤال مع مواقع الملفات (مثال: "كم السعر؟" → `01_Business_and_Vision/Business_Model_Canvas.md`)
5. **دليل القراءة** — "المبتدئ يبدأ من هنا، المطور يبدأ من هنا"

---

## تقدير الوقت

| حجم المشروع | الملفات | الوقت للـ AI |
|-------------|---------|-------------|
| 🟢 صغير (صفحة + API بسيط) | 15-20 ملفاً | 2-3 جلسات |
| 🟡 متوسط (MVP مع مصادقة ودفع) | 30-40 ملفاً | 5-8 جلسات |
| 🔴 كبير (مؤسسي، خدمات متعددة) | 60-80 ملفاً | 10-20 جلسة |

ابدأ بالـ 20 ملفاً الأساسية (نموذج عمل، PRD، نظرة معمارية، تصميم DB) — يمكنك التوسع لاحقاً.

---

## --- الآن، قم بتحليل المشروع التالي ---

```
اسم المشروع: [اكتب اسم المشروع هنا]
الوصف: [وصف المشروع في 3-5 جمل]
المميزات الأساسية: [قائمة بالميزات]
الجمهور المستهدف: [من هم المستخدمون؟]
السوق: [أي سوق؟]
التقنيات المفضلة: [Node.js، Python، React، إلخ. أو "اختر أنت"]
المدة المقترحة: [3 شهور، 6 شهور، إلخ.]
الميزانية التقريبية: [$، $$، $$$]
ملاحظات إضافية: [أي معلومات أخرى]
```

---

*ملف مأخوذ من Qor3a (قرعة) — يوليو 2026*
*مشروع حقيقي: 65 ملفاً، 1.2MB، 9 مراحل، تغطية 100%*
