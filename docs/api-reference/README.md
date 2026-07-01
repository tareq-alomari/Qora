# Qor3a API Reference — قرعة

> **Base URL:** `/api/v1` (production: `https://api.qor3a.ye`)

## Specification Format

The API is documented using **OpenAPI 3.0.3**:

| File | Description |
|------|-------------|
| [`openapi.yaml`](./openapi.yaml) | Full OpenAPI specification (all endpoints, schemas, errors) |

### Usage

**Swagger UI:**
```bash
npx swagger-ui-cli serve docs/api-reference/openapi.yaml
```

**Redoc:**
```bash
npx redoc-cli serve docs/api-reference/openapi.yaml
```

**VS Code:**
Install "OpenAPI (Swagger) Editor" extension → open `openapi.yaml` → `Ctrl+Shift+P` → "Preview Swagger"

---

## Authentication

Most endpoints require a **JWT Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Flow

```
┌─────────┐    POST /auth/register       ┌─────────┐
│  Client  │ ──────────────────────────►  │  API    │
│          │    { phone, full_name }      │         │
│          │ ◄──────────────────────────  │         │
│          │    201 { otp_sent: true }    │         │
│          │                              │         │
│          │    POST /auth/verify-otp     │         │
│          │ ──────────────────────────►  │         │
│          │    { phone, otp }            │         │
│          │ ◄──────────────────────────  │         │
│          │    200 { access_token }      │         │
│          │    Set-Cookie: refreshToken  │         │
└─────────┘                              └─────────┘
```

### Token Renewal

| Token | Location | Expiry | Renewal |
|-------|----------|--------|---------|
| Access | `Authorization: Bearer` header | 24 hours | Use `POST /auth/refresh` |
| Refresh | `Set-Cookie: refreshToken` (httpOnly) | 7 days | Auto-renewed on each refresh |

---

## API Overview

| Module | Base Path | Auth | Description |
|--------|-----------|------|-------------|
| [Health](#health) | `GET /health` | ❌ | Service health check |
| [Auth](#auth) | `POST /auth/*` | ❌ | Register, OTP, login, refresh |
| [Users](#users) | `/users/*` | ✅ | Profile CRUD |
| [Orders](#orders) | `/orders/*` | ✅ | Order lifecycle (12-state machine) |
| [Payments](#payments) | `/payments/*` | Mixed | Payment methods, receipt listing |
| [Notifications](#notifications) | `/notifications/*` | ✅ | In-app & WhatsApp notifications |
| [Admin](#admin) | `/admin/*` | ✅ Admin | Stats, users, settings |

---

## Health

### `GET /health`

Returns API status, uptime, version, and individual service checks.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-01T12:00:00.000Z",
  "uptime": 12345,
  "version": "0.1.0",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "minio": "unknown",
    "ai_service": "unknown"
  }
}
```

---

## Auth

### `POST /api/v1/auth/register`

Create a new client account. Sends a 6-digit OTP via WhatsApp.

**Rate limit:** 3/hour per IP

**Request:**
```json
{
  "phone": "967712345678",
  "full_name": "أحمد محمد"
}
```

**Response `201`:**
```json
{
  "data": {
    "user_id": "uuid",
    "phone": "967712345678",
    "otp_sent": true,
    "otp_expires_in": 300
  }
}
```

### `POST /api/v1/auth/verify-otp`

Verify OTP and receive JWT tokens. On success, sets `refreshToken` httpOnly cookie.

**Rate limit:** 10/minute per IP

**Behavior:**
- 3 failed attempts → new OTP auto-sent
- 5 failed attempts → account locked for 30 minutes

**Request:**
```json
{
  "phone": "967712345678",
  "otp": "123456"
}
```

**Response `200`:**
```json
{
  "data": {
    "user_id": "uuid",
    "access_token": "eyJ...",
    "expires_in": 86400
  },
  "Set-Cookie": "refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800"
}
```

### `POST /api/v1/auth/login`

Send OTP to existing user. Same flow as register but for returning users.

**Rate limit:** 5/minute per IP

### `POST /api/v1/auth/refresh`

Refresh access token using httpOnly cookie or `x-refresh-token` header.

**Rate limit:** 10/hour per IP

### `POST /api/v1/auth/logout`

Clear refresh token cookie.

---

## Orders

The order lifecycle follows a **12-state state machine**. Only valid transitions are allowed.

```
DRAFT → DATA_ENTRY_COMPLETE → PHOTO_PENDING → PHOTO_ACCEPTED → PAYMENT_PENDING
  ↕                           ↕ (rejected)      ↕                ↕
  edit                     retry_photo      initiate_payment   verify_payment
                                                                  ↓
                                                          PAYMENT_VERIFICATION
                                                         ↙                ↘
                                                    APPROVED      NEEDS_CORRECTION
                                                       ↓           ↙  ↓  ↘
                                                  SUBMITTED    data  photo  payment
                                                       ↓
                                                  COMPLETED

CANCELLED (admin, from any state)
```

### `POST /api/v1/orders`

Create a new DV Lottery order in `draft` status.

**Rate limit:** 10/minute per user

**Request:**
```json
{
  "personal_data": {
    "first_name": "أحمد",
    "last_name": "محمد",
    "gender": "male",
    "birth_date": "1990-01-15",
    "birth_city": "صنعاء",
    "birth_country": "YEMEN",
    "country_of_eligibility": "YEMEN",
    "marital_status": "married",
    "passport_number": "A1234567",
    "passport_expiry": "2028-12-31"
  },
  "spouse_data": {
    "first_name": "فاطمة",
    "last_name": "علي",
    "birth_date": "1992-05-10",
    "gender": "female",
    "birth_city": "عدن"
  },
  "children_data": [
    {
      "first_name": "سارة",
      "last_name": "أحمد",
      "birth_date": "2015-03-10",
      "gender": "female"
    }
  ],
  "address": {
    "street": "شارع حدة",
    "city": "صنعاء",
    "district": "التحرير",
    "country": "YEMEN"
  },
  "contact": {
    "phone": "967712345678",
    "email": "ahmed@example.com"
  }
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "order_number": "QR-2026-0001",
    "status": "draft",
    "total_price": 1000,
    "currency": "YER",
    "created_at": "2026-07-01T12:00:00.000Z",
    "updated_at": "2026-07-01T12:00:00.000Z"
  }
}
```

### `PATCH /api/v1/orders/{id}/status`

Advance order through state machine. Employee/Admin only.

**Rate limit:** 30/minute

**Request:**
```json
{
  "action": "approve_photo"
}
```

**Available actions:**
| Action | From → To | Who | Required Field |
|--------|-----------|-----|----------------|
| `approve_photo` | `photo_pending` → `photo_accepted` | Employee, Admin | — |
| `reject_photo` | `photo_pending` → `photo_rejected` | Employee, Admin | — |
| `verify_payment` | `payment_pending` → `payment_verification` | Employee, Admin | `receipt_id` |
| `approve` | `payment_verification` → `approved` | Employee, Admin | — |
| `request_correction` | any → `needs_correction` | Employee, Admin | `notes` |
| `submit_official` | `approved` → `submitted` | Employee, Admin | `confirmation_number` |
| `mark_completed` | `submitted` → `completed` | Admin | — |
| `cancel` | any → `cancelled` | Admin | — |

**Employee-only actions (employee → admin notification):**
| Action | From → To | Who |
|--------|-----------|-----|
| `resubmit_data` | `needs_correction` → `data_entry_complete` | Client |
| `resubmit_photo` | `needs_correction` → `photo_pending` | Client |
| `retry_payment` | `needs_correction` → `payment_pending` | Client |

---

## Admin

All admin endpoints require `Authorization: Bearer <token>` with role `admin`.

**Rate limit:** 60/minute

### `GET /api/v1/admin/stats`

Dashboard statistics.

**Response `200`:**
```json
{
  "data": {
    "totalOrders": 150,
    "ordersToday": 5,
    "ordersThisWeek": 23,
    "ordersThisMonth": 87,
    "byStatus": [
      { "status": "draft", "count": 30 },
      { "status": "photo_pending", "count": 15 }
    ],
    "revenueTotal": 50000,
    "revenueToday": 5000,
    "revenueThisWeek": 23000,
    "byPaymentMethod": [
      { "provider": "kuraimi", "count": 40, "revenue": 40000 }
    ],
    "ai_stats": {
      "total_checked": 100,
      "accepted": 85,
      "rejected": 15,
      "accuracy": 0.85,
      "avg_time_ms": 2500
    }
  }
}
```

### `GET /api/v1/admin/users`

Paginated user list with `orders_count` per user.

### `PATCH /api/v1/admin/users/{id}`

Update user role, status, or name.

### `GET /api/v1/admin/settings`

System settings (pricing, payment accounts, season, rate limits).

### `PATCH /api/v1/admin/settings`

Update system settings. All fields optional.

**Request:**
```json
{
  "pricing": {
    "lottery_registration": 1000,
    "result_checking": 0
  },
  "rate_limits": {
    "login_per_ip_per_min": 5,
    "register_per_ip_per_hour": 3,
    "orders_per_user_per_min": 10
  },
  "season": {
    "is_open": true,
    "opens_at": "2026-09-01T08:00:00Z",
    "closes_at": "2026-10-31T23:59:59Z"
  },
  "payment_accounts": [
    {
      "method": "kuraimi",
      "account_number": "0123456789",
      "account_name": "Qor3a Yemen",
      "is_active": true
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INVALID_OTP` | 400 | Wrong OTP code |
| `INVALID_OTP_RESENT` | 400 | Wrong OTP, new code sent |
| `INVALID_AMOUNT` | 400 | Payment amount must be 1000 YR |
| `ORDER_CANCELLED` | 400 | Order is in cancelled state |
| `PHOTO_REQUIRED` | 400 | Photo must be uploaded first |
| `RECEIPT_REQUIRED` | 400 | Receipt must be uploaded first |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `TOKEN_EXPIRED` | 401 | JWT has expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `USER_NOT_FOUND` | 404 | User not found |
| `DUPLICATE_ENTRY` | 409 | Active order already exists |
| `PHONE_EXISTS` | 409 | Phone already registered |
| `DUPLICATE_RECEIPT` | 409 | Receipt already submitted |
| `DUPLICATE_TRANSFER` | 409 | Transfer number already used |
| `INVALID_TRANSITION` | 409 | Cannot transition from current state |
| `INVALID_STATE` | 409 | Action not allowed in current state |
| `OTP_EXPIRED` | 410 | OTP expired, request new one |
| `OTP_LOCKED` | 429 | Account locked (5 failed attempts) |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "phone", "message": "رقم الهاتف مطلوب" }
    ]
  }
}
```

---

## Pagination

All list endpoints return paginated responses:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |

---

## State Machine Reference

### States

| State | Type | Description |
|-------|------|-------------|
| `draft` | Initial | Order created, no data entered |
| `data_entry_complete` | Active | Applicant data submitted |
| `photo_pending` | Active | Photo uploaded, awaiting AI |
| `photo_rejected` | Active | AI rejected photo, retry available |
| `photo_accepted` | Active | Photo passed AI validation |
| `payment_pending` | Active | Waiting for receipt upload |
| `payment_verification` | Active | Receipt uploaded, employee checks |
| `needs_correction` | Active | Employee requested changes |
| `approved` | Active | Payment verified, ready for official site |
| `submitted` | Active | Submitted to official DV website |
| `completed` | Terminal | Service complete |
| `cancelled` | Terminal | Cancelled by admin |

### Guards

Certain transitions have pre-conditions:

| Guard | Action | Condition |
|-------|--------|-----------|
| `submit_data` | `draft → data_entry_complete` | `first_name` + `last_name` required |
| `approve_photo` | `photo_pending → photo_accepted` | `photo_path` must exist |
| `verify_payment` | `payment_pending → payment_verification` | `receipt_image_path` must exist |

### Audit Logging

Every status transition is recorded in the `audit_logs` table:

```json
{
  "id": "uuid",
  "order_id": "uuid",
  "user_id": "uuid",
  "action": "approve_photo",
  "from_status": "photo_pending",
  "to_status": "photo_accepted",
  "metadata": {},
  "created_at": "2026-07-01T12:00:00.000Z"
}
```

---

## Rate Limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| Global | 100/min | Per IP |
| `POST /auth/register` | 3/hour | Per IP |
| `POST /auth/login` | 5/min | Per IP |
| `POST /auth/verify-otp` | 10/min | Per IP |
| `POST /auth/refresh` | 10/hour | Per IP |
| `POST /orders` | 10/min | Per user |
| `POST /orders/{id}/photo` | 5/min | Per user |
| `POST /orders/{id}/payment/receipt` | 3/min | Per user |
| `PATCH /orders/{id}/status` | 30/min | Per employee |
| `ALL /admin/*` | 60/min | Per admin |

**Response on rate limit exceed (429):**
```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests",
    "details": []
  }
}
```

---

## Security

- **TLS 1.3** for all communications
- **JWT** access tokens (24h) in `Authorization: Bearer` header
- **httpOnly cookies** for refresh tokens (7d)
- **bcrypt** password hashing (employees/admins)
- **SHA-256** receipt hash for duplicate detection
- **Role-based access control** (client / employee / admin)
- **Audit logs** for all state transitions
- **Rate limiting** per endpoint

---

## Environment Variables

See [`.env.example`](../../.env.example) for all configuration variables.

Key variables:
| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection | ✅ |
| `JWT_SECRET` | JWT signing key (256-bit+) | ✅ |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | ✅ |
| `WHATSAPP_API_TOKEN` | Meta Cloud API token | ✅ |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp sender ID | ✅ |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` | MinIO/S3 storage | Optional |
| `AI_SERVICE_URL` | Python AI microservice | Optional |
| `CORS_ORIGIN` | Allowed CORS origin | Optional |
| `ENCRYPTION_KEY` | AES-256 encryption key | Optional |
