# 🔐 معمارية الأمان — Security Architecture

> **Qor3a (قرعة)** — Authentication, Authorization, Encryption, Traffic Security

---

## 1. Authentication Architecture

```
                    ┌──────────────────────┐
                    │       Client          │
                    │    (Browser/PWA)      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   HTTPS / TLS 1.3    │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Nginx Reverse     │
                    │    Proxy + SSL       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Rate Limiting     │
                    │  (express-rate-limit) │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Auth Middleware     │
                    │  (JWT Verification)   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐    ┌─────▼─────┐   ┌──────▼──────┐
         │  Client  │    │ Employee  │   │   Admin     │
         │  JWT 24h │    │ JWT 24h  │   │  JWT 24h   │
         └─────────┘    └───────────┘   └─────────────┘
```

---

## 2. JWT Strategy

```javascript
// Access Token
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)

// Refresh Token (httpOnly cookie)
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
})
```

### Token Security Rules
| القاعدة | التفاصيل |
|---------|---------|
| **لا تخزين في localStorage** | الـ access token في الذاكرة فقط (Zustand store) |
| **Refresh في httpOnly cookie** | غير قابل للقراءة بواسطة JavaScript |
| **Rotate on refresh** | في كل refresh، يتم إبطال الـ refresh token القديم |
| **Revoke on logout** | حذف الـ refresh token من DB |
| **Rate limit على /refresh** | 10 مرات لكل ساعة |

---

## 3. RBAC — Role-Based Access Control

### 3.1 الأدوار

| الدور | الوصف | الصلاحيات |
|-------|-------|-----------|
| **client** | العميل المسجل | طلباته فقط |
| **employee** | موظف مراجعة | كل الطلبات (قراءة)، تغيير الحالة |
| **admin** | مدير النظام | كل شيء + إدارة المستخدمين |

### 3.2 Middleware Chain

```javascript
// 1. Auth Middleware
router.use(authMiddleware)    // يضيف req.user (userId, role)

// 2. Role Middleware
router.post('/', requireRole('client'), orderController.create)
router.get('/admin', requireRole('admin', 'employee'), adminController.list)

// 3. Ownership Middleware
router.get('/:id', requireOwnership, orderController.getById)
```

### 3.3 Resource Access Matrix

| المورد | client | employee | admin |
|--------|--------|----------|-------|
| بياناتي الشخصية | CRUD | Read | Read |
| صورتي الشخصية | CRUD | Read | Read |
| طلباتي | Read | Read (all) | Read (all) |
| طلبات الآخرين | — | Read | Read |
| مدفوعاتي | Read | Read | Read + Verify |
| كل المدفوعات | — | Read | Read + Export |
| المستخدمون | — | — | CRUD |
| سجل التدقيق | — | Limited | Full |
| التقارير | — | — | CRUD + Export |
| إعدادات النظام | — | — | CRUD |

---

## 4. Data Encryption

### 4.1 In Transit

| الاتصال | البروتوكول |
|---------|-----------|
| Client → API | HTTPS / TLS 1.3 |
| API → Database | SSL (مشفر) |
| API → Redis | AUTH + TLS |
| API → MinIO | HTTPS |
| Microservices | Internal network (لا TLS مطلوب) |

### 4.2 At Rest

```yaml
# PostgreSQL
encryption: pgcrypto (column-level)
fields: phone, email, full_name, address

# MinIO / S3
encryption: AES-256 (server-side)
objects: photos, receipt images

# Passwords
algorithm: bcrypt
rounds: 12
```

### 4.3 Key Management

| المفتاح | أين يخزن؟ | التناوب |
|---------|-----------|---------|
| JWT_SECRET | .env + Vault | كل 6 شهور |
| DB_PASSWORD | .env + Docker Secrets | كل 3 شهور |
| ENCRYPTION_KEY | Vault + HSM | كل سنة |
| API_KEYS (2Captcha, WhatsApp) | .env | حسب الحاجة |

---

## 5. Traffic Security Strategy

### 5.1 Rate Limiting

| Endpoint | Limit | Burst | Scope |
|----------|-------|-------|-------|
| POST /auth/login | 5/min | 10 | IP |
| POST /auth/register | 3/hour | 5 | IP |
| POST /auth/verify-otp | 10/min | 15 | IP |
| POST /orders | 10/min | 20 | User |
| POST /orders/:id/photo | 5/min | 10 | Order |
| POST /orders/:id/payment | 3/min | 5 | Order |
| GET /admin/* | 60/min | 100 | Employee |
| POST /auth/refresh | 10/hour | 15 | IP |
| POST /admin/check-result | 30/min | 50 | Employee |

### 5.2 DDoS Protection

```
الطبقة 1: CloudFlare (CDN + WAF + DDoS protection)
الطبقة 2: Nginx Rate Limiting
الطبقة 3: Express Rate Limiting (per IP + per user)
الطبقة 4: Connection pooling (حد أقصى للاتصالات المتزامنة)
الطبقة 5: Auto-scaling group (إذا استمر الضغط)
```

### 5.3 Traffic Spike Handling

```
حدث معروف: موسم التسجيل (5-10x) | إعلان النتائج (20-50x)
───────────────────────────────────────────────────────
الإجراء:
1. قبل الحدث بأسبوع: توسعة السيرفر
2. قبل الحدث بيوم: تفعيل Rate Limiting صارم
3. أثناء الحدث: Bull Queue لتنظيم الضغط
4. بعد الحدث: مراجعة الأداء وتحسين
```

---

## 6. Headers & Security Middleware

```javascript
const helmet = require('helmet')
app.use(helmet())
// يضيف:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 0
// - Strict-Transport-Security: max-age=63072000
// - Content-Security-Policy: ...
```

### الـ Headers الموصى بها

| Header | القيمة |
|--------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' https:; script-src 'self'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), geolocation=()` |

---

*Qor3a — Security Architecture V1.0*
