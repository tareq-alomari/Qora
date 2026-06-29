# 🔒 اختبارات الأمان — Security Testing

> **Qor3a (قرعة)** — Penetration Testing Checklist, Attack Surface, Mitigations

---

## 1. Attack Surface Analysis

```
                       ┌─────────────────────────┐
                       │      سطح الهجوم          │
                       └─────────────────────────┘
                                   │
        ┌──────────┬──────────┬────┴────┬──────────┬──────────┐
        ▼          ▼          ▼         ▼          ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ Web    │ │ API    │ │ Auth   │ │  S3/   │ │  DB    │ │ Externa│
   │ App    │ │REST API│ │ (JWT)  │ │ MinIO  │ │Postgres│ │ APIs   │
   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

| المكون | المخاطر | الأولوية |
|--------|---------|---------|
| **API** | Rate limiting, SQL injection, Mass assignment | حرجة |
| **Auth** | JWT theft, OTP brute force, Session fixation | حرجة |
| **S3/MinIO** | Public bucket, Unauthorized upload | عالية |
| **DB** | SQL injection, Unencrypted data | حرجة |
| **Client App** | XSS, CSRF, Sensitive data in localStorage | عالية |
| **External APIs** | Man-in-the-middle, API key leak | عالية |

---

## 2. اختبارات الأمان الأساسية

### 2.1 Authentication & Authorization

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-01 | JWT بدون توقيع | تغيير الـ payload | 401 |
| SEC-02 | JWT منتهي الصلاحية | استخدام expired token | 401 |
| SEC-03 | الوصول لـ /admin كـ client | client token → /admin | 403 |
| SEC-04 | الوصول لـ /admin بدون token | no auth header | 401 |
| SEC-05 | تغيير order_id لطلب آخر | client A يعدل order B | 403 |
| SEC-06 | OTP brute force | 10 محاولات لرقم واحد | 429 + لوك |
| SEC-07 | Role escalation | client يحاول ترقية نفسه | 403 |
| SEC-08 | IDOR في /users/:id | client يطلب user آخر | 403 |

### 2.2 Input Validation & Injection

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-09 | SQL Injection في phone | `' OR 1=1 --` | 400 أو escaped |
| SEC-10 | XSS في full_name | `<script>alert(1)</script>` | escaped output |
| SEC-11 | NoSQL Injection | `{ "$gt": "" }` | 400 |
| SEC-12 | Command Injection في اسم الملف | `file; rm -rf /` | 400 |
| SEC-13 | Path Traversal في photo_path | `../../../etc/passwd` | 400 |
| SEC-14 | حجوم ضخمة | 50MB JSON body | 413 |

### 2.3 File Upload

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-15 | رفع ملف PHP/JS | `photo.php.jpg` | 400 + مرفوض |
| SEC-16 | رفع ملف ضخم | 100MB صورة | 413 |
| SEC-17 | رفع صورة مع EXIF مسموم | صورة محملة | sanitized EXIF |
| SEC-18 | رفع ملف مكرر SHA-256 | نفس الصورة مرتين | 409 أو overwrite |
| SEC-19 | رفع SVG يحتوي Script | `svg with <script>` | 400 |

### 2.4 JWT Security

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-20 | استخدام alg: none | `{ alg: "none" }` | 401 |
| SEC-21 | استخدام مفتعموم | `alg: HS256, key: "public"` | 401 |
| SEC-22 | تغيير sub (user_id) | تعديل الـ token | 401 |
| SEC-23 | Token في URL | إرسال token كـ query param | ممنوع (Header) |
| SEC-24 | Refresh token stolen | استخدام refresh من مسرب | 401 (ليس في الـ cookie) |

### 2.5 API Security

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-25 | Rate Limiting تجاوز | 100 طلب/دقيقة | 429 |
| SEC-26 | CORS مفتوح | `Origin: evil.com` | ممنوع |
| SEC-27 | إرجاع كلمة السر | `GET /users/me` | password_hash غير موجود |
| SEC-28 | Mass Assignment | إرسال `role: admin` في register | تجاهل الحقل |
| SEC-29 | HTTP Method غير مصرح | `DELETE` على `/orders` | 405 |

### 2.6 Data Exposure

| ST# | الاختبار | الطريقة | Expected |
|-----|---------|---------|----------|
| SEC-30 | سؤال Audit Logs | client يسأل جميع الـ logs | 403 |
| SEC-31 | صور الآخرين | تغيير UUID الصورة | 403 |
| SEC-32 | Error stack trace | إرسال 400 خطأ | رسالة فقط لا stack |
| SEC-33 | DB error leak | SQL خاطئ | 500 بدون تفاصيل |

---

## 3. OWASP Top 10 — التغطية

| # | OWASP | التغطية في قرعة |
|---|-------|----------------|
| A01 | Broken Access Control | RBAC صارم + Audit Log لكل تغيير |
| A02 | Cryptographic Failures | AES-256 للصور + TLS 1.3 |
| A03 | Injection | Joi validation + Prepared statements (Knex) |
| A04 | Insecure Design | State Machine يمنع transitions غير الصحيحة |
| A05 | Security Misconfiguration | Docker + environment variables |
| A06 | Vulnerable Components | npm audit + تحديثات أسبوعية |
| A07 | Auth Failures | OTP بصلاحية 5 دقائق + Rate Limit |
| A08 | Data Integrity | SHA-256 للصور المرفوعة |
| A09 | Logging Failures | Audit Log لكل تغيير حالة |
| A10 | SSRF | تقييد الطلبات الخارجية |

---

## 4. أدوات الاختبار

| الأداة | الاستخدام | الأمر مثال |
|--------|-----------|-----------|
| **OWASP ZAP** | API Scanner + DAST | `zap-api-scan.py -t https://api.qor3a.com/v1` |
| **Burp Suite** | Manual pentesting | Proxy + Repeater |
| **SQLMap** | SQL Injection | `sqlmap -u "https://api.qor3a.com/auth/login"` |
| **Nmap** | Port scanning | `nmap -sV -p- api.qor3a.com` |
| **JWT Tool** | JWT analysis | `jwt_tool eyJ...` |
| **npm audit** | Dependency check | `npm audit` |
| **Snyk** | Vulnerability scan | `snyk test` |

---

## 5. جدول الاختبارات الدورية

| التكرار | الاختبارات | المسؤول |
|---------|-----------|---------|
| **أسبوعياً** | npm audit + Snyk + Review logs | المطور |
| **شهرياً** | OWASP ZAP scan + Rate limit test | المطور |
| **فصلياً** | Full pentest + Dependency update | مستشار أمني |
| **سنوياً** | External pentest firm | شركة متخصصة |

---

## 6. ما قبل الإطلاق — Audit Security Checklist

```
□ جميع الاتصالات عبر HTTPS (TLS 1.3)
□ كلمات المرور مشفرة (bcrypt)
□ JWT secret قوي (> 256-bit)
□ لا secrets في الكود (كلها في .env)
□ CORS مقتصر على domain واحد
□ Rate Limiting مفعل على كل الـ endpoints
□ Input validation في كل مدخل
□ File upload يمنع الملفات القابلة للتنفيذ
□ EXIF data يُمسح من الصور المرفوعة
□ S3/MinIO bucket مقفل (public access off)
□ Backups مشفرة
□ Audit Log مفعل
□ RBAC مُطبق في كل endpoint
□ Stack traces مخفية عن الـ response
□ XSS protection في headers
□ Helmet.js مفعل
```

---

*Qor3a — Security Testing V1.0*
