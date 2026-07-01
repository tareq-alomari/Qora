const resultsService = require('../../src/modules/results/results.service');
const orderModel = require('../../src/modules/orders/orders.model');
const { AppError } = require('../../src/common/error-handler');

jest.mock('../../src/modules/orders/orders.model');

jest.mock('../../src/database/db', () => {
  const m = {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    whereNotNull: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null),
    orderBy: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
  };
  const fn = jest.fn(() => m);
  fn.fn = { now: jest.fn().mockReturnValue('2026-07-01T00:00:00.000Z') };
  fn.raw = jest.fn((str, val) => m);
  m.fn = fn.fn;
  return fn;
});

const db = require('../../src/database/db');

describe('Results Service', () => {
  const mockOrder = {
    id: 'order-uuid',
    user_id: 'user-uuid',
    status: 'submitted',
    total_price: 1000,
    currency: 'YER',
    order_number: 'QR-2026-0001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const m = db('any');
    Object.values(m).forEach(v => {
      if (jest.isMockFunction(v)) v.mockReturnThis();
    });
    m.first.mockResolvedValue(null);
    m.returning.mockResolvedValue([]);
  });

  describe('check', () => {
    test('throws NOT_FOUND when order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(resultsService.check('missing-id', 'user-uuid'))
        .rejects.toThrow(AppError);
    });

    test('throws FORBIDDEN when client checks another user order', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' });

      await expect(resultsService.check('order-uuid', 'other-user'))
        .rejects.toThrow(AppError);
    });

    test('throws NO_CONFIRMATION when order has no confirmation number', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' })
        .mockResolvedValueOnce({ confirmation_number: null });

      await expect(resultsService.check('order-uuid', 'user-uuid'))
        .rejects.toThrow(AppError);
    });

    test('queues order for checking successfully', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' })
        .mockResolvedValueOnce({ confirmation_number: '2026AB1234567' })
        .mockResolvedValueOnce(null);

      const result = await resultsService.check('order-uuid', 'user-uuid');

      expect(result.status).toBe('queued');
      expect(result.message).toBe('تمت إضافة الطلب إلى قائمة الانتظار');
    });

    test('allows employee to check any order', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'employee' })
        .mockResolvedValueOnce({ confirmation_number: '2026AB1234567' })
        .mockResolvedValueOnce(null);

      const result = await resultsService.check('order-uuid', 'employee-uuid');

      expect(result.status).toBe('queued');
    });

    test('throws ALREADY_CHECKED if result already exists and is not pending/error', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' })
        .mockResolvedValueOnce({ confirmation_number: '2026AB1234567' })
        .mockResolvedValueOnce({ result: 'winner' });

      await expect(resultsService.check('order-uuid', 'user-uuid'))
        .rejects.toThrow(AppError);
    });
  });

  describe('getResult', () => {
    test('throws NOT_FOUND when order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(resultsService.getResult('missing-id', 'user-uuid'))
        .rejects.toThrow(AppError);
    });

    test('returns not_checked when no result exists', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' })
        .mockResolvedValueOnce(null);

      const result = await resultsService.getResult('order-uuid', 'user-uuid');

      expect(result.status).toBe('not_checked');
    });

    test('returns winner result', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      db('any').first
        .mockResolvedValueOnce({ role: 'client' })
        .mockResolvedValueOnce({
          result: 'winner',
          case_number: '2026AB1234567',
          checked_at: new Date(),
          raw_data: {},
        });

      const result = await resultsService.getResult('order-uuid', 'user-uuid');

      expect(result.result).toBe('winner');
      expect(result.status).toBe('completed');
    });
  });

  describe('getResultByConfirmation', () => {
    test('throws NOT_FOUND when confirmation does not exist', async () => {
      db('any').first.mockResolvedValue(null);

      await expect(resultsService.getResultByConfirmation('2026AB0000000'))
        .rejects.toThrow(AppError);
    });

    test('returns result from check_results by confirmation', async () => {
      db('any').first
        .mockResolvedValueOnce({
          result: 'loser',
          checked_at: new Date(),
          confirmation_number: '2026AB1234567',
        });

      const result = await resultsService.getResultByConfirmation('2026AB1234567');

      expect(result.status).toBe('completed');
      expect(result.result).toBe('loser');
    });

    test('looks up via applicant_data when check_results not found', async () => {
      db('any').first
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ order_id: 'order-uuid', confirmation_number: '2026AB1234567' })
        .mockResolvedValueOnce({
          result: 'winner',
          checked_at: new Date(),
        });

      const result = await resultsService.getResultByConfirmation('2026AB1234567');

      expect(result.result).toBe('winner');
    });
  });

  describe('updateResult', () => {
    test('throws NOT_FOUND when order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(resultsService.updateResult('missing-id', { result: 'winner' }))
        .rejects.toThrow(AppError);
    });

    test('updates result for an order', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);

      const result = await resultsService.updateResult('order-uuid', {
        result: 'winner',
        case_number: '2026AB0000001',
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('winner');
    });
  });

  describe('updateConfirmation', () => {
    test('throws NOT_FOUND when order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(resultsService.updateConfirmation('missing-id', '2026AB1234567'))
        .rejects.toThrow(AppError);
    });

    test('updates confirmation number', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);

      const result = await resultsService.updateConfirmation('order-uuid', '2026AB1234567');

      expect(result.success).toBe(true);
      expect(result.confirmation_number).toBe('2026AB1234567');
    });
  });
});
