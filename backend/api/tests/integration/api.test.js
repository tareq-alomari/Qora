const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/common/redis');
jest.mock('../../src/common/storage', () => ({
  save: jest.fn().mockResolvedValue(),
  getUrl: jest.fn().mockReturnValue('/uploads/test.jpg'),
}));
jest.mock('../../src/common/notification-queue', () => ({
  enqueue: jest.fn().mockResolvedValue(),
  notificationQueue: null,
}));

let app;
let db;

beforeAll(async () => {
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
      t.text('photo_validation').defaultTo('{}');
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
});

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

const cleanup = async () => {
  await db('notifications').del();
  await db('audit_logs').del();
  await db('payments').del();
  await db('applicant_data').del();
  await db('orders').del();
  await db('users').del();
  await db('settings').del();
};

const { setOtp, getOtp, setRefreshToken } = require('../../src/common/redis');

describe('API Integration', () => {
  beforeEach(async () => {
    await cleanup();
    await seedSettings();
  });

  describe('GET /health', () => {
    test('returns ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Auth', () => {
    test('POST /api/v1/auth/register - creates user', async () => {
      setOtp.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phone: '967700000001', full_name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.data.otp_sent).toBe(true);
    });

    test('POST /api/v1/auth/register - rejects duplicate', async () => {
      await db('users').insert({ id: 'dup', phone: '967700000001' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phone: '967700000001' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('PHONE_EXISTS');
    });

    test('POST /api/v1/auth/verify-otp - verifies and returns tokens', async () => {
      const userId = 'vu-1';
      await db('users').insert({ id: userId, phone: '967700000002' });
      getOtp.mockResolvedValue('123456');
      setRefreshToken.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '967700000002', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data.access_token).toBeTruthy();
    });

    test('POST /api/v1/auth/login - sends OTP', async () => {
      await db('users').insert({ id: 'lu-1', phone: '967700000003' });
      setOtp.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '967700000003' });

      expect(res.status).toBe(200);
      expect(res.body.data.otp_sent).toBe(true);
    });
  });

  describe('Orders', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
      userId = `ord-${Date.now()}`;
      await db('users').insert({ id: userId, phone: '967700000010', role: 'client' });
      userToken = jwt.sign({ id: userId, role: 'client', phone: '967700000010' }, 'test-secret', { expiresIn: '24h' });
    });

    test('POST /api/v1/orders - creates order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          personal_data: {
            first_name: 'أحمد', last_name: 'علي', gender: 'male',
            birth_date: '1995-03-15', birth_city: 'صنعاء',
            birth_country: 'YEMEN', country_of_eligibility: 'YEMEN',
            marital_status: 'single', passport_number: '012345678',
            passport_expiry: '2030-01-01',
          },
          address: { street: 'شارع', city: 'صنعاء', country: 'YEMEN' },
          contact: { phone: '967700000010' },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.order_number).toMatch(/^QR-/);
    });

    test('GET /api/v1/orders - returns paginated list', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });

    test('POST /api/v1/orders - rejects without auth', async () => {
      const res = await request(app).post('/api/v1/orders').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('Admin', () => {
    let adminToken;
    let employeeToken;

    beforeEach(async () => {
      await db('users').insert({ id: 'adm-1', phone: '967700000020', role: 'admin' });
      await db('users').insert({ id: 'emp-1', phone: '967700000021', role: 'employee' });
      adminToken = jwt.sign({ id: 'adm-1', role: 'admin', phone: '967700000020' }, 'test-secret', { expiresIn: '24h' });
      employeeToken = jwt.sign({ id: 'emp-1', role: 'employee', phone: '967700000021' }, 'test-secret', { expiresIn: '24h' });
    });

    test('GET /api/v1/admin/stats - admin can access', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalOrders');
    });

    test('GET /api/v1/admin/stats - employee forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    test('GET /api/v1/admin/settings - returns settings', async () => {
      const res = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pricing.lottery_registration).toBe(1000);
    });

    test('PATCH /api/v1/admin/settings - updates pricing', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ pricing: { lottery_registration: 1500 } });

      expect(res.status).toBe(200);
      expect(res.body.data.pricing.lottery_registration).toBe(1500);
    });

    test('GET /api/v1/admin/settings - rejects without auth', async () => {
      const res = await request(app).get('/api/v1/admin/settings');
      expect(res.status).toBe(401);
    });
  });

  describe('Payments', () => {
    test('GET /api/v1/payments/methods - returns active methods', async () => {
      const res = await request(app).get('/api/v1/payments/methods');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].id).toBe('kuraimi');
    });
  });
});
