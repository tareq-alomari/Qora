process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!';

const orderService = require('../../src/modules/orders/orders.service');
const orderModel = require('../../src/modules/orders/orders.model');
const { AppError } = require('../../src/common/error-handler');
const storage = require('../../src/common/storage');

jest.mock('../../src/modules/orders/orders.model');
jest.mock('../../src/common/storage');

const mockDb = {};

jest.mock('../../src/database/db', () => {
  const fn = jest.fn(() => mockDb);
  fn.fn = { now: jest.fn().mockReturnValue('2026-07-01T00:00:00Z') };
  fn.raw = jest.fn().mockReturnValue('NOW()');
  return fn;
});

const db = require('../../src/database/db');

const buildMockDb = () => ({
  insert: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereNotNull: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(null),
  orderBy: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([]),
  raw: jest.fn().mockReturnValue('NOW()'),
  count: jest.fn().mockReturnThis(),
});

describe('Orders Service', () => {
  const mockOrder = {
    id: 'order-uuid',
    user_id: 'user-uuid',
    status: 'draft',
    total_price: 1000,
    currency: 'YER',
    order_number: 'QR-2026-0001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPayment = {
    id: 'payment-uuid',
    order_id: 'order-uuid',
    status: 'verified',
    amount: 1000,
    currency: 'YER',
    method: 'deposit',
    provider: 'kuraimi',
    receipt_image_path: '/receipts/order-uuid/receipt.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockDb, buildMockDb());
    storage.save.mockResolvedValue();
    storage.getUrl.mockReturnValue('/uploads/test.jpg');
  });

  describe('create', () => {
    const validData = {
      personal_data: {
        first_name: 'أحمد',
        last_name: 'علي',
        gender: 'male',
        birth_date: '1995-03-15',
        birth_city: 'صنعاء',
        birth_country: 'YEMEN',
        country_of_eligibility: 'YEMEN',
        marital_status: 'single',
        education_level: 6,
        passport_number: '012345678',
        passport_expiry: '2030-01-01',
      },
      address: { street: 'شارع الستين', city: 'صنعاء', country: 'YEMEN' },
      contact: { phone: '967700000001' },
    };

    test('creates order and applicant data', async () => {
      orderModel.getActiveOrder.mockResolvedValue(null);
      orderModel.getOrderNumber.mockResolvedValue('QR-2026-0001');
      orderModel.create.mockResolvedValue([mockOrder]);

      const result = await orderService.create('user-uuid', validData);

      expect(result.order_number).toBe('QR-2026-0001');
    });

    test('blocks duplicate active orders', async () => {
      orderModel.getActiveOrder.mockResolvedValue({ id: 'existing' });

      await expect(orderService.create('user-uuid', validData))
        .rejects.toThrow(AppError);
    });
  });

  describe('list', () => {
    test('returns paginated orders for client', async () => {
      orderModel.findByUser.mockResolvedValue([mockOrder]);
      orderModel.countByUser.mockResolvedValue({ total: '1' });

      const result = await orderService.list('user-uuid', 'client', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('changeStatus', () => {
    test('approves order when transition is valid', async () => {
      const approvedOrder = { ...mockOrder, status: 'approved' };
      orderModel.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'payment_verification' })
        .mockResolvedValueOnce(approvedOrder);
      orderModel.update.mockResolvedValue([approvedOrder]);
      mockDb.first.mockResolvedValue(mockPayment);

      const result = await orderService.changeStatus(
        'order-uuid', 'employee-uuid', 'employee',
        { action: 'approve' }
      );

      expect(result.order.status).toBe('approved');
    });

    test('rejects invalid action for current status', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, status: 'draft' });

      await expect(orderService.changeStatus(
        'order-uuid', 'employee-uuid', 'employee',
        { action: 'approve' }
      )).rejects.toThrow(AppError);
    });

    test('approves order with verify_payment action and updates payment status', async () => {
      const verifiedOrder = { ...mockOrder, status: 'payment_verification' };
      orderModel.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'payment_pending' })
        .mockResolvedValueOnce(verifiedOrder);
      orderModel.update.mockResolvedValue([verifiedOrder]);
      mockDb.first.mockResolvedValue({ ...mockPayment, status: 'pending' });

      const result = await orderService.changeStatus(
        'order-uuid', 'employee-uuid', 'employee',
        { action: 'verify_payment' }
      );

      expect(result.order.status).toBe('payment_verification');
      expect(mockDb.update).toHaveBeenCalledWith({ status: 'verified', verified_at: expect.anything(), verified_by: 'employee-uuid' });
    });

    test('rejects approve when payment is not verified', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, status: 'payment_verification' });
      mockDb.first.mockResolvedValue({ ...mockPayment, status: 'pending' });

      await expect(orderService.changeStatus(
        'order-uuid', 'employee-uuid', 'employee',
        { action: 'approve' }
      )).rejects.toThrow(AppError);
    });

    test('rejects submit_official when confirmation_number is missing', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, status: 'approved' });
      mockDb.first.mockResolvedValue(null);

      await expect(orderService.changeStatus(
        'order-uuid', 'employee-uuid', 'employee',
        { action: 'submit_official' }
      )).rejects.toThrow(AppError);
    });
  });
});
