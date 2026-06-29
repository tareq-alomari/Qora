# توثيق القرارات المعمارية - Architecture Decision Records (ADRs)

## Qor3a — لماذا اخترنا كل تقنية؟

---

## ADR 001: Node.js + Express (وليس NestJS أو Fastify)

### الحالة: ✅ مقبول

### السياق:
```
نبني API للخدمات الخلفية. الخيارات المتاحة:
├── Express (الأشهر، الأبسط)
├── Fastify (أسرع، لكن أقل شهرة)
├── NestJS (منظم، TypeScript، يشبه Spring Boot)
└── Hono (أحدث، أسرع)
```

### القرار:
```
سنستخدم Express.

الأسباب:
├── ✅ بسيط: لا يحتاج TypeScript (حتى إشعار آخر)
├── ✅ مجتمع كبير: أي مشكلة → حل موجود
├── ✅ Modular Monolith: Express يناسب هذا الـ pattern
├── ✅ المطور / الفريق يعرفه أكثر من الآخرين
└── ✅ سرعة كافية لـ 500-2,000 طلب/موسم

متى نغير؟
├── إذا وصلنا إلى 10,000+ طلب/موسم
├── إذا احتجنا WebSockets كثيرة (Express مع Socket.io عادي)
└── إذا قررنا TypeScript → ممكن نستخدم Express مع JSDoc
```

### البدائل المرفوضة:
```
❌ NestJS: جميل لكنه opinionated جداً ويبطئ التطوير في البداية
❌ Fastify: أسرع 2x لكن أقل مكتبات، عيبه أننا قد نواجه مشاكل
❌ Hono: جديد جداً، لا خطر عليه في الإنتاج
```

---

## ADR 002: React + Vite (وليس Next.js أو Vue)

### الحالة: ✅ مقبول

### السياق:
```
نبني واجهة أمامية. الخيارات:
├── React + Vite (SPA)
├── Next.js (SSR/SSG)
├── Vue 3 + Vite
├── SvelteKit
└── Angular
```

### القرار:
```
سنستخدم React + Vite.

الأسباب:
├── ✅ SPA: الموقع ليس معقداً (لا يحتاج SSR)
├── ✅ Vite: أسرع 10x من Create React App
├── ✅ React: مكتبة ضخمة (حلول لكل مشكلة)
├── ✅ Zustand: أخف من Redux (5 KB vs 15 KB)
├── ✅ React Hook Form: مثالي للـ 8-Step Wizard
└── ✅ Tailwind: سريع + صغير (Purge يترك 10-15 KB)

متى نغير؟
├── إذا احتجنا SEO مهم (Next.js)
├── إذا كبر الفريق (Next.js ينظم أكثر)
└── لكن حالياً: لا حاجة لـ SEO (التسويق عبر واتساب/تيك توك)
```

---

## ADR 003: PostgreSQL (وليس MongoDB أو MySQL)

### الحالة: ✅ مقبول

### السياق:
```
قاعدة البيانات للـ API. الخيارات:
├── PostgreSQL (relational, SQL, JSONB)
├── MySQL (أشهر في الاستضافة المشتركة)
├── MongoDB (NoSQL, مرن)
└── SQLite (خفيف، محلي)
```

### القرار:
```
سنستخدم PostgreSQL.

الأسباب:
├── ✅ العلاقات: State Machine + Users + Orders → علاقات واضحة
├── ✅ JSONB: يخزّن spouse_data, children_data, metadata
├── ✅ ENUMs: status, role, payment_method — أنواع محددة
├── ✅ UUID: Primary Keys (مهم للأمان — لا auto-increment)
├── ✅ TIMESTAMPTZ: توقيت عالمي (لا مشاكل مع فروق التوقيت)
├── ✅ Knex: يدعم PostgreSQL أولاً
└── ✅ Supabase: إذا قررنا لاحقاً (مبني على PostgreSQL)

متى نغير؟
├── أبداً — PostgreSQL يكفي للتوسع
└── فقط إذا وصلنا لمستوى Twitter/Instagram
```

---

## ADR 004: Modular Monolith (وليس Microservices)

### الحالة: ✅ مقبول

### السياق:
```
كيف ننظم الكود الخلفي؟
├── Monolith: كل شيء في تطبيق واحد
├── Modular Monolith: وحدات منفصلة لكن في تطبيق واحد
├── Microservices: كل خدمة منفصلة مع API
└── Serverless: دوال منفصلة (AWS Lambda)
```

### القرار:
```
سنستخدم Modular Monolith مع Layered Modules.

الهيكل:
├── modules/auth/ → routes, controller, service, model
├── modules/orders/ → routes, controller, service, model
├── modules/payments/ → routes, controller, service, model
└── common/ → middleware مشترك (auth, error, validate)

الأسباب:
├── ✅ بسيط: تطبيق واحد، نشر واحد
├── ✅ طبقات واضحة: Route → Controller → Service → Model
├── ✅ فصل منطقي: كل موديول مستقل (لكن داخل نفس الـ process)
├── ✅ سهل التوسع: إذا احتجنا → نفصل موديول لـ Microservice
├── ✅ لا تعقيد الـ Microservices (Network, Message Queue...)
└── ✅ يكفي لـ 2,000 طلب/موسم

متى نغير إلى Microservices؟
├── إذا وصل الفريق إلى 5+ مطورين
├── إذا احتجنا نشر منفصل لخدمة (مثل AI)
└── حالياً فقط AI Service منفصل (لأنه Python)
```

---

## ADR 005: Zustand (وليس Redux أو Context API)

### الحالة: ✅ مقبول

### السياق:
```
إدارة الحالة في الـ Frontend.
├── Redux (أشهر، لكنه ثقيل)
├── Zustand (خفيف، بسيط)
├── Context API (مدمج في React)
├── Jotai (atomic)
└── MobX (reactive)
```

### القرار:
```
سنستخدم Zustand.

الأسباب:
├── ✅ خفيف: 5 KB (Redux: 15 KB + Redux Toolkit)
├── ✅ بسيط: ما يحتاج boilerplate
├── ✅ سريع: لا re-renders غير ضرورية
├── ✅ يدعم Middleware (persist, devtools)
└── ✅ يكفي لـ Auth Store + Notification Store

متى نغير؟
├── إذا كبرت الحالة جداً → Jotai أو Redux
└── لكن حالياً: Zustand مثالي
```

---

## ADR 006: Knex.js (وليس Prisma أو Sequelize أو SQL المباشر)

### الحالة: ✅ مقبول

### السياق:
```
كيف نتواصل مع قاعدة البيانات في Node.js؟
├── Knex.js (Query Builder + Migrations)
├── Prisma (ORM — أسرع تطوراً)
├── Sequelize (ORM — أقدم)
├── TypeORM (TypeScript)
├── SQL المباشر (pg driver)
```

### القرار:
```
سنستخدم Knex.js.

الأسباب:
├── ✅ Query Builder (ليس ORM) — نحن نكتب SQL، لكن مع حماية من الـ Injection
├── ✅ Migrations: إدارة تلقائية للـ schema
├── ✅ خفيف: ما يضيف طبقة تجريد ثقيلة
├── ✅ مرن: نقدر نكتب SQL خام عند الحاجة
└── ✅ شفاف: نعرف بالضبط إيش يصير في الـ DB

متى نغير؟
├── إذا كرهنا كتابة SQL → Prisma
├── إذا احتجنا TypeScript → Knex ينفع مع TypeScript
└── حالياً: Knex مثالي
```

---

## ADR 007: Bull + Redis للـ Queue (وليس RabbitMQ أو SQS)

### الحالة: ✅ مقبول

### السياق:
```
إدارة المهام الخلفية (AI فحص الصور، الـ Queue للتسجيل الرسمي، إرسال الإشعارات).
├── Bull + Redis (Node.js Queue)
├── RabbitMQ (Message Broker)
├── AWS SQS (سحابي)
├── Bee-Queue (أخف من Bull)
└── Agenda (Job Scheduler)
```

### القرار:
```
سنستخدم Bull + Redis.

الأسباب:
├── ✅ Bull: أشهر Queue في Node.js
├── ✅ Redis: موجود أصلاً في infra (للتخزين المؤقت)
├── ✅ Priority Queue: عشان نصنف المهام (عاجل/عادي)
├── ✅ Retry + Delayed Jobs: إعادة المحاولة + تأخير
├── ✅ Dashboard (Optional): لمراقبة الطابور
└── ✅ يكفي: 1,000-10,000 مهمة/يوم

متى نغير؟
├── إذا احتجنا توزيع الـ Queue على خوادم متعددة → RabbitMQ
└── إذا احتجنا Serverless → AWS SQS
```

---

## ADR 008: MinIO للتخزين (وليس S3 أو التخزين المحلي)

### الحالة: ✅ مقبول

### السياق:
```
تخزين الصور الشخصية وإيصالات الدفع.
├── MinIO (S3-Compatible — مفتوح المصدر)
├── AWS S3 (سحابي)
├── DigitalOcean Spaces (سحابي)
├── التخزين المحلي (ملفات على السيرفر)
```

### القرار:
```
سنستخدم MinIO.

الأسباب:
├── ✅ S3-Compatible: نكتب كود ينفع مع S3 لاحقاً
├── ✅ مجاني: مفتوح المصدر
├── ✅ محلي: سريع (لا يحتاج انتظار رفع لسحابة)
├── ✅ مرن: ننقله لـ S3 لاحقاً بسهولة
└── ✅ حجم صغير: الصور لا تتجاوز 10 GB في الموسم

متى نغير؟
├── إذا كبرت الصور > 50 GB → S3 أو Spaces
├── إذا احتجنا CDN → S3 + CloudFront
└── حالياً: MinIO يكفي
```

---

## ADR 009: JSDoc للتوثيق (وليس TypeScript)

### الحالة: ✅ مقبول

### السياق:
```
كتابة TypeScript أو JavaScript مع JSDoc للتوثيق؟
├── TypeScript: أمان أكثر، لكن وقت تطوير أطول
├── JavaScript + JSDoc: أسرع، مع توثيق
└── JavaScript بدون توثيق: سريع لكن فوضوي
```

### القرار:
```
سنستخدم JSDoc مع JavaScript (CommonJS).

الأسباب:
├── ✅ أسرع: TypeScript يضيف 20-30% وقت تطوير
├── ✅ CommonJS: AGENTS.md تنص على CommonJS (require)
├── ✅ JSDoc: يعطي Auto-completion + Type Checking
├── ✅ يكفي: مشروعنا صغير (< 20,000 سطر)
└── ✅ إذا احتجنا TypeScript: نضيفه تدريجياً

ملاحظة: 
├── 🟢 JSDoc للـ Service + Model (الأكثر أهمية)
├── 🟢 JSDoc للـ API endpoints (Params, Response)
└── 🟡 JSDoc اختياري للـ Controller (بسيط)
```

---

## ADR 010: Jest للاختبارات (وليس Mocha أو Vitest)

### الحالة: ✅ مقبول

### السياق:
```
إطار الاختبارات.
├── Jest (الأشهر)
├── Vitest (أسرع، متوافق مع Vite)
├── Mocha + Chai (مرن)
└── Tape (بسيط)
```

### القرار:
```
سنستخدم Jest.

الأسباب:
├── ✅ أشهر: أي مطوّر Node.js يعرفه
├── ✅ شامل: assertion, mocking, coverage كلها مدمجة
├── ✅ Supertest: يتكامل مع Jest بسهولة (لاختبار API)
├── ✅ Snapshot Testing: مفيد لفحص استجابات API
└── ✅ يكفي: لا نحتاج سرعة Vitest (عدد الاختبارات قليل)

متى نغير؟
├── إذا وصلنا إلى 500+ اختبار → Vitest (أسرع)
└── حالياً: Jest مثالي
```

---

*القرارات المعمارية - يوليو 2026*
*قرعة (Qor3a) - منصة التسجيل في DV Lottery*
