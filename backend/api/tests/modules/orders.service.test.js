process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!';

const orderService = require('../../src/modules/orders/orders.service');
const orderModel = require('../../src/modules/orders/orders.model');
const { AppError } = require('../../src/common/error-handler');
const storage = require('../../src/common/storage');

jest.mock('../../src/modules/orders/orders.model');
jest.mock('../../src/common/storage');

const mockDb = {
  insert: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereNotNull: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(null),
  orderBy: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([]),
};

jest.mock('../../src/database/db', () => {
  return jest.fn(() => mockDb);
});

const db = require('../../src/database/db');

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

  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(mockDb).forEach(m => {
      if (jest.isMockFunction(m)) m.mockReturnThis();
    });
    mockDb.first.mockResolvedValue(null);
    mockDb.returning.mockResolvedValue([]);
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
  });
});
