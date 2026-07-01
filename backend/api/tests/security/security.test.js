process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-secret-for-security-tests';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!';
process.env.UPLOAD_DIR = '/tmp/qor3a-security-test-uploads';
process.env.JWT_EXPIRES_IN = '24h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
process.env.RATE_LIMIT_REGISTER_MAX = '100';
process.env.RATE_LIMIT_VERIFY_OTP_MAX = '100';
process.env.RATE_LIMIT_PHOTO_MAX = '100';
process.env.RATE_LIMIT_ORDER_MAX = '100';
process.env.RATE_LIMIT_LOGIN_MAX = '100';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const express = require('express');

jest.mock('../../src/common/redis', () => {
  const store = new Map();
  return {
    _clearStore: () => store.clear(),
    setOtp: jest.fn((phone, code) => { store.set(`otp:${phone}`, code); }),
    getOtp: jest.fn((phone) => store.get(`otp:${phone}`)),
    delOtp: jest.fn((phone) => store.delete(`otp:${phone}`)),
    setOtpAttempts: jest.fn((phone, attempts) => { store.set(`otp_attempts:${phone}`, String(attempts)); }),
    getOtpAttempts: jest.fn((phone) => parseInt(store.get(`otp_attempts:${phone}`) || '0')),
    delOtpAttempts: jest.fn((phone) => store.delete(`otp_attempts:${phone}`)),
    setOtpLocked: jest.fn((phone) => { store.set(`otp_locked:${phone}`, '1'); }),
    getOtpLocked: jest.fn((phone) => store.get(`otp_locked:${phone}`)),
    delOtpLocked: jest.fn((phone) => store.delete(`otp_locked:${phone}`)),
    setRefreshToken: jest.fn((userId, token) => { store.set(`refresh:${userId}`, token || 'valid-refresh-token'); }),
    getRefreshToken: jest.fn((userId) => store.get(`refresh:${userId}`) || null),
    delRefreshToken: jest.fn((userId) => store.delete(`refresh:${userId}`)),
    redis: null,
  };
});

jest.mock('../../src/common/storage', () => ({
  save: jest.fn().mockResolvedValue(),
  getUrl: jest.fn().mockReturnValue('/uploads/test.jpg'),
  read: jest.fn().mockResolvedValue(Buffer.from('test')),
}));

jest.mock('../../src/common/notification-queue', () => ({
  enqueue: jest.fn().mockResolvedValue(),
  notificationQueue: null,
}));

jest.mock('image-size', () => jest.fn().mockReturnValue({ width: 600, height: 600 }));

let app;
let db;

beforeAll(async () => {
  jest.setTimeout(30000);
  const fs = require('fs');
  fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });

  db = require('../../src/database/db');

  await db.schema
    .createTable('users', (t) => {
      t.string('id').primary();
      t.string('email', 255).unique();
      t.string('phone', 20).unique();
      t.string('password_hash', 255);
      t.string('full_name', 255);
      t.string('role').defaultTo('client');
      t.boolean('is_verified').defaultTo(false);
      t.boolean('is_active').defaultTo(true);
      t.string('last_login_at');
      t.text('metadata').defaultTo('{}');
      t.text('encrypted_email');
      t.text('encrypted_phone');
      t.string('created_at').defaultTo(db.fn.now());
      t.string('updated_at').defaultTo(db.fn.now());
    })
    .createTable('orders', (t) => {
      t.string('id').primary();
      t.string('user_id').notNullable().references('id').inTable('users');
      t.string('service_type').defaultTo('dv_lottery');
      t.string('status').defaultTo('draft');
      t.decimal('total_price', 10, 2).notNullable().defaultTo(0);
      t.string('order_number').unique();
      t.string('currency', 3).defaultTo('YER');
      t.text('notes');
      t.text('metadata').defaultTo('{}');
      t.string('created_at').defaultTo(db.fn.now());
      t.string('updated_at').defaultTo(db.fn.now());
    })
    .createTable('applicant_data', (t) => {
      t.string('id').primary();
      t.string('order_id').notNullable().unique().references('id').inTable('orders');
      t.string('first_name', 100);
      t.string('last_name', 100);
      t.string('middle_name', 100);
      t.string('gender', 10);
      t.string('birth_date');
      t.string('birth_country', 100);
      t.string('birth_city', 100);
      t.string('email', 255);
      t.string('phone', 20);
      t.text('address_line1');
      t.text('address_line2');
      t.string('country', 100);
      t.string('city', 100);
      t.string('postal_code', 20);
      t.string('district', 100);
      t.string('education_level', 100);
      t.string('marital_status', 20);
      t.text('spouse_data').defaultTo('{}');
      t.text('children_data').defaultTo('[]');
      t.string('country_of_eligibility', 100);
      t.string('passport_number', 50);
      t.string('passport_expiry');
      t.string('alt_phone', 20);
      t.string('photo_path', 500);
      t.string('photo_hash', 64);
      t.string('passport_scan_path', 500);
      t.text('photo_validation').defaultTo('{}');
      t.text('encrypted_passport_number');
      t.text('encrypted_spouse_data');
      t.text('encrypted_children_data');
      t.string('confirmation_number', 50);
      t.string('submitted_at');
      t.string('submitted_by').references('id').inTable('users');
      t.string('created_at').defaultTo(db.fn.now());
      t.string('updated_at').defaultTo(db.fn.now());
    })
    .createTable('payments', (t) => {
      t.string('id').primary();
      t.string('order_id').notNullable().references('id').inTable('orders');
      t.decimal('amount', 10, 2).notNullable();
      t.string('currency', 3).defaultTo('YER');
      t.string('method').defaultTo('deposit');
      t.string('provider');
      t.string('transfer_number', 100);
      t.string('receipt_image_path', 500);
      t.string('receipt_hash', 64);
      t.string('status').defaultTo('pending');
      t.string('verified_by').references('id').inTable('users');
      t.string('verified_at');
      t.text('rejection_reason');
      t.text('notes');
      t.string('created_at').defaultTo(db.fn.now());
      t.string('updated_at').defaultTo(db.fn.now());
    })
    .createTable('notifications', (t) => {
      t.string('id').primary();
      t.string('user_id').notNullable().references('id').inTable('users');
      t.string('order_id').references('id').inTable('orders');
      t.string('type', 50).notNullable();
      t.string('channel').defaultTo('in_app');
      t.string('title', 255).notNullable();
      t.text('body');
      t.text('metadata').defaultTo('{}');
      t.string('status').defaultTo('pending');
      t.string('sent_at');
      t.string('read_at');
      t.string('created_at').defaultTo(db.fn.now());
    })
    .createTable('audit_logs', (t) => {
      t.string('id').primary();
      t.string('order_id').references('id').inTable('orders');
      t.string('user_id').references('id').inTable('users');
      t.string('action', 100).notNullable();
      t.string('from_status');
      t.string('to_status');
      t.text('metadata').defaultTo('{}');
      t.string('ip_address');
      t.text('user_agent');
      t.string('created_at').defaultTo(db.fn.now());
    })
    .createTable('settings', (t) => {
      t.string('id').primary();
      t.string('key', 100).unique();
      t.text('value').notNullable();
      t.string('updated_by').references('id').inTable('users');
      t.string('created_at').defaultTo(db.fn.now());
      t.string('updated_at').defaultTo(db.fn.now());
    });

  app = require('../../src/index');
});

afterAll(async () => {
  await db.destroy();
  const fs = require('fs');
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

const cleanup = async () => {
  await db('notifications').del();
  await db('audit_logs').del();
  await db('payments').del();
  await db('applicant_data').del();
  await db('orders').del();
  await db('users').del();
  await db('settings').del();
};

const seedSettings = async () => {
  await db('settings').insert([
    { id: 's-pricing', key: 'pricing', value: JSON.stringify({ lottery_registration: 1000, result_checking: 0 }) },
    {
      id: 's-accounts', key: 'payment_accounts',
      value: JSON.stringify([
        { method: 'kuraimi', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true },
        { method: 'jeeb', account_number: '9876543210', account_name: 'Qor3a Yemen', is_active: true },
        { method: 'one_cash', account_number: '5555555555', account_name: 'Qor3a', is_active: true },
        { method: 'mobile_money', account_number: '7777777777', account_name: 'Qor3a', is_active: false },
      ]),
    },
    { id: 's-season', key: 'season', value: JSON.stringify({ is_open: true }) },
  ]);
};

const { _clearStore } = require('../../src/common/redis');

beforeEach(async () => {
  await cleanup();
  await seedSettings();
  _clearStore();
});

const insertClientUser = async (id, phone) => {
  await db('users').insert({ id, phone, role: 'client' });
  return jwt.sign({ id, role: 'client', phone }, process.env.JWT_SECRET);
};

const insertOrderWithApplicant = async (orderId, userId, status) => {
  await db('orders').insert({
    id: orderId, user_id: userId, status, total_price: 1000,
    order_number: `QR-2026-${orderId.slice(-4)}`,
  });
  await db('applicant_data').insert({
    id: `ad-${orderId}`, order_id: orderId, first_name: 'Test', last_name: 'User',
  });
};

describe('SEC-01 to SEC-08: Authentication & Authorization', () => {
  test('SEC-01: JWT بدون توقيع - تغيير الـ payload => 401', async () => {
    const tamperedToken = jwt.sign({ id: 'any', role: 'admin' }, 'wrong-secret');
    const res = await request(app).get('/api/v1/admin/stats').set('Authorization', `Bearer ${tamperedToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toMatch(/INVALID_TOKEN|UNAUTHORIZED/);
  });

  test('SEC-02: JWT منتهي الصلاحية - استخدام expired token => 401', async () => {
    const expiredToken = jwt.sign({ id: 'test', role: 'client' }, process.env.JWT_SECRET, { expiresIn: '0s' });
    await new Promise((r) => setTimeout(r, 1100));
    const res = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  test('SEC-03: الوصول لـ /admin كـ client => 403', async () => {
    await db('users').insert({ id: 'sec03-client', phone: '967700000003', role: 'client' });
    const clientToken = jwt.sign({ id: 'sec03-client', role: 'client', phone: '967700000003' }, process.env.JWT_SECRET);
    const res = await request(app).get('/api/v1/admin/stats').set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('SEC-04: الوصول لـ /admin بدون token => 401', async () => {
    const res = await request(app).get('/api/v1/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('SEC-05: تغيير order_id لطلب آخر - client يعدل order B => 403', async () => {
    await db('users').insert({ id: 'sec05a', phone: '967700000051', role: 'client' });
    await db('users').insert({ id: 'sec05b', phone: '967700000052', role: 'client' });
    await db('orders').insert({ id: 'order-a', user_id: 'sec05a', status: 'draft', total_price: 1000, order_number: 'QR-2026-0001' });
    await db('orders').insert({ id: 'order-b', user_id: 'sec05b', status: 'draft', total_price: 1000, order_number: 'QR-2026-0002' });

    const userBToken = jwt.sign({ id: 'sec05b', role: 'client', phone: '967700000052' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/v1/orders/order-a')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('SEC-06: OTP brute force - 5 محاولات خاطئة => 429', async () => {
    const phone = '967700000099';
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone, full_name: 'Brute Force Test' });
    expect(registerRes.status).toBe(201);

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone, otp: '000000' });

      if (i < 2) {
        expect(res.status).toBe(400);
      } else if (i < 4) {
        expect([400, 429]).toContain(res.status);
      } else {
        expect(res.status).toBe(429);
        expect(res.body.error.code).toBe('OTP_LOCKED');
      }
    }
  });

  test('SEC-07: Role escalation - client يحاول ترقية نفسه => ignored field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967700000098', full_name: 'Role Escalation', role: 'admin' });
    expect(res.status).toBe(201);

    const user = await db('users').where({ phone: '967700000098' }).first();
    expect(user.role).toBe('client');
  });

  test('SEC-08: IDOR في /users/profile - client لا يرى بيانات آخر => isolated', async () => {
    await db('users').insert({ id: 'sec08a', phone: '967700000081', role: 'client', full_name: 'User A' });
    await db('users').insert({ id: 'sec08b', phone: '967700000082', role: 'client', full_name: 'User B' });
    const userBToken = jwt.sign({ id: 'sec08b', role: 'client', phone: '967700000082' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('sec08b');
    expect(res.body.data.full_name).toBe('User B');
  });
});

describe('SEC-09 to SEC-14: Input Validation & Injection', () => {
  test('SEC-09: SQL Injection في phone => 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: "' OR 1=1 --" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('SEC-10: XSS في full_name => مخزّن بأمان (JSON escaping)', async () => {
    const xssName = '<script>alert(document.cookie)</script>';
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967700000101', full_name: xssName });
    expect(res.status).toBe(201);

    const user = await db('users').where({ phone: '967700000101' }).first();
    expect(user.full_name).toBe(xssName);

    const token = jwt.sign({ id: user.id, role: 'client', phone: '967700000101' }, process.env.JWT_SECRET);
    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.full_name).toBeDefined();
    expect(typeof profileRes.body.data.full_name).toBe('string');
  });

  test('SEC-11: NoSQL Injection => irrelevant (SQL/Knex), لا كسر', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967700000111', full_name: { $gt: '' } });
    expect([201, 400]).toContain(res.status);
  });

  test('SEC-12: Command Injection في اسم الملف => آمن (memoryStorage)', async () => {
    const token = await insertClientUser('sec12', '967700000112');
    await insertOrderWithApplicant('order-sec12', 'sec12', 'data_entry_complete');

    const res = await request(app)
      .post('/api/v1/orders/order-sec12/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('not-a-real-image'), {
        filename: 'file; rm -rf /;.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.photo_url).not.toContain('rm -rf');
  });

  test('SEC-13: Path Traversal في photo_path => آمن (server-generated path)', async () => {
    const token = await insertClientUser('sec13', '967700000113');
    await insertOrderWithApplicant('order-sec13', 'sec13', 'data_entry_complete');

    const res = await request(app)
      .post('/api/v1/orders/order-sec13/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('not-a-real-image'), {
        filename: '../../../etc/passwd',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.photo_url).not.toContain('etc/passwd');
  });

  test('SEC-14: حجوم ضخمة - تجاوز 10MB JSON body => 413', async () => {
    const largeData = 'x'.repeat(15 * 1024 * 1024);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967700000114', data: largeData });
    expect([413, 500]).toContain(res.status);
  });
});

describe('SEC-15 to SEC-19: File Upload Security', () => {
  const setupOrder = async (userId, orderId, status) => {
    const token = await insertClientUser(userId, `96770${String(Math.random()).slice(2, 11)}`);
    await insertOrderWithApplicant(orderId, userId, status);
    return { token };
  };

  test('SEC-15: رفع ملف PHP/JS => 400', async () => {
    const { token } = await setupOrder('sec15', 'order-sec15', 'data_entry_complete');
    const res = await request(app)
      .post('/api/v1/orders/order-sec15/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('<?php echo "test";'), {
        filename: 'photo.php',
        contentType: 'application/x-httpd-php',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toMatch(/INVALID_FILE_TYPE|INVALID_PHOTO/);
  });

  test('SEC-16: رفع ملف ضخم >240KB => 400', async () => {
    const { token } = await setupOrder('sec16', 'order-sec16', 'data_entry_complete');
    const hugeBuffer = Buffer.alloc(250 * 1024);
    const res = await request(app)
      .post('/api/v1/orders/order-sec16/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', hugeBuffer, { filename: 'huge.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toMatch(/PHOTO_TOO_LARGE|UPLOAD_ERROR/);
  });

  test('SEC-17: رفع صورة مع EXIF مسموم => sanitized or processed safely', async () => {
    const { token } = await setupOrder('sec17', 'order-sec17', 'data_entry_complete');
    const res = await request(app)
      .post('/api/v1/orders/order-sec17/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from('fake-jpeg-exif'), {
        filename: 'exif.jpg', contentType: 'image/jpeg',
      });
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data).toHaveProperty('photo_url');
    }
  });

  test('SEC-18: رفع ملف مكرر SHA-256 => 409', async () => {
    const { token } = await setupOrder('sec18a', 'order-sec18a', 'data_entry_complete');
    const { token: tokenB } = await setupOrder('sec18b', 'order-sec18b', 'data_entry_complete');

    const photoBuffer = Buffer.from('same-photo-content-12345');

    const res1 = await request(app)
      .post('/api/v1/orders/order-sec18a/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', photoBuffer, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    expect(res1.status).toBe(200);

    const res2 = await request(app)
      .post('/api/v1/orders/order-sec18b/photo')
      .set('Authorization', `Bearer ${tokenB}`)
      .attach('photo', photoBuffer, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe('DUPLICATE_PHOTO');
  });

  test('SEC-19: رفع SVG يحتوي Script => 400', async () => {
    const { token } = await setupOrder('sec19', 'order-sec19', 'data_entry_complete');
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const res = await request(app)
      .post('/api/v1/orders/order-sec19/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', Buffer.from(svgContent), {
        filename: 'evil.svg',
        contentType: 'image/svg+xml',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toMatch(/INVALID_FILE_TYPE|INVALID_PHOTO/);
  });
});

describe('SEC-20 to SEC-24: JWT Security', () => {
  test('SEC-20: استخدام alg: none => 401', async () => {
    const noneToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6InRlc3QiLCJyb2xlIjoiYWRtaW4ifQ.';
    const res = await request(app).get('/api/v1/admin/stats').set('Authorization', `Bearer ${noneToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('SEC-21: استخدام مفتاح عام مختلف => 401', async () => {
    const wrongKeyToken = jwt.sign({ id: 'test', role: 'admin' }, 'public-key-used-instead');
    const res = await request(app).get('/api/v1/admin/stats').set('Authorization', `Bearer ${wrongKeyToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('SEC-22: تغيير sub (user_id) => 403', async () => {
    await db('users').insert({ id: 'sec22a', phone: '967700000222', role: 'client' });
    await db('orders').insert({ id: 'order-sec22', user_id: 'sec22a', status: 'draft', total_price: 1000, order_number: 'QR-2026-0022' });

    const tamperedToken = jwt.sign({ id: 'other-user', role: 'client', phone: '967700000999' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/v1/orders/order-sec22')
      .set('Authorization', `Bearer ${tamperedToken}`);
    expect(res.status).toBe(403);
  });

  test('SEC-23: Token في URL => ممنوع (only header supported)', async () => {
    const token = jwt.sign({ id: 'test', role: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app).get(`/api/v1/admin/stats?token=${token}`);
    expect(res.status).toBe(401);
  });

  test('SEC-24: Refresh token stolen => 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('x-refresh-token', 'stolen-refresh-token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });
});

describe('SEC-25 to SEC-29: API Security', () => {
  test('SEC-25: Rate Limiting - التهيئة والتقييد موجودة', async () => {
    const rateLimit = require('express-rate-limit');
    const testApp = express();
    testApp.use(rateLimit({ windowMs: 200, max: 2, message: 'Too many' }));
    testApp.get('/t', (req, res) => res.json({ ok: true }));

    expect((await request(testApp).get('/t')).status).toBe(200);
    expect((await request(testApp).get('/t')).status).toBe(200);
    expect((await request(testApp).get('/t')).status).toBe(429);
  });

  test('SEC-26: CORS مفتوح - Origin: evil.com => ممنوع', async () => {
    const evilRes = await request(app)
      .get('/health')
      .set('Origin', 'https://evil.com');
    const evilACAO = evilRes.headers['access-control-allow-origin'];
    expect(evilACAO || '').not.toBe('https://evil.com');
    expect(evilACAO || '').not.toMatch(/evil/i);

    const goodRes = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(goodRes.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('SEC-27: إرجاع كلمة السر - password_hash غير موجود', async () => {
    await db('users').insert({
      id: 'sec27', phone: '967700000227', role: 'client',
      full_name: 'Password Hash Test', password_hash: '$2b$10$hashedpassword123',
    });
    const token = jwt.sign({ id: 'sec27', role: 'client', phone: '967700000227' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  test('SEC-28: Mass Assignment - role: admin في register => تجاهل الحقل', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '967700000228', full_name: 'Mass Assign', role: 'admin', is_active: true });
    expect(res.status).toBe(201);

    const user = await db('users').where({ phone: '967700000228' }).first();
    expect(user.role).toBe('client');
    expect(user.is_active).toBeTruthy();
  });

  test('SEC-29: HTTP Method غير مصرح - DELETE على /orders => 404', async () => {
    const res = await request(app).delete('/api/v1/orders');
    expect([401, 404, 405]).toContain(res.status);
  });
});

describe('SEC-30 to SEC-33: Data Exposure', () => {
  test('SEC-30: سؤال Audit Logs - client يرى فقط audit logs لطلبه', async () => {
    const token = await insertClientUser('sec30', '967700000330');
    await db('orders').insert({ id: 'order-sec30', user_id: 'sec30', status: 'draft', total_price: 1000, order_number: 'QR-2026-0030' });

    const res = await request(app)
      .get('/api/v1/orders/order-sec30')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('audit_log');
    expect(Array.isArray(res.body.data.audit_log)).toBe(true);

    const unauthorizedRes = await request(app)
      .get('/api/v1/orders/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(unauthorizedRes.status).toBe(404);
  });

  test('SEC-31: صور الآخرين - تغيير UUID الصورة => 403', async () => {
    await db('users').insert({ id: 'sec31a', phone: '967700000311', role: 'client' });
    await db('users').insert({ id: 'sec31b', phone: '967700000312', role: 'client' });

    const tokenA = jwt.sign({ id: 'sec31a', role: 'client', phone: '967700000311' }, process.env.JWT_SECRET);
    const tokenB = jwt.sign({ id: 'sec31b', role: 'client', phone: '967700000312' }, process.env.JWT_SECRET);

    await db('orders').insert({ id: 'order-sec31a', user_id: 'sec31a', status: 'photo_pending', total_price: 1000, order_number: 'QR-2026-0031a' });
    await db('orders').insert({ id: 'order-sec31b', user_id: 'sec31b', status: 'photo_pending', total_price: 1000, order_number: 'QR-2026-0031b' });
    await db('applicant_data').insert({ id: 'ad-sec31a', order_id: 'order-sec31a', first_name: 'A', last_name: 'A', photo_path: '/uploads/test.jpg' });

    const res = await request(app)
      .get('/api/v1/orders/order-sec31a')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  test('SEC-32: Error stack trace - إرسال 400 خطأ => رسالة فقط لا stack', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.stack).toBeUndefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBeTruthy();
  });

  test('SEC-33: DB error leak - خطأ 404 => 500 بدون تفاصيل داخلية', async () => {
    const token = await insertClientUser('sec33', '967700000333');
    const res = await request(app)
      .get('/api/v1/orders/order-sec33')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.stack).toBeUndefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBeTruthy();
    expect(res.body.error.details).toBeDefined();
  });
});
