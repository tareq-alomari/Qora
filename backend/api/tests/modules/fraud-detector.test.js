const fraudDetector = require('../../src/common/fraud-detector');

const mockDb = {
  where: jest.fn().mockReturnThis(),
  whereRaw: jest.fn().mockReturnThis(),
  whereNotNull: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(null),
};

jest.mock('../../src/database/db', () => {
  const fn = jest.fn(() => mockDb);
  fn.raw = jest.fn((str) => str);
  fn.fn = { now: jest.fn(() => 'NOW()') };
  return fn;
});

const db = require('../../src/database/db');

describe('Fraud Detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(mockDb).forEach(m => {
      if (jest.isMockFunction(m)) m.mockReturnThis();
    });
    mockDb.first.mockResolvedValue(null);
    mockDb.count.mockReturnThis();
    db.raw.mockClear();
    db.raw.mockImplementation((str) => str);
    db.fn.now.mockReturnValue('NOW()');
  });

  describe('checkIpAccountCount', () => {
    test('returns not flagged when count is below threshold', async () => {
      mockDb.first.mockResolvedValue({ count: '3' });

      const result = await fraudDetector.checkIpAccountCount('192.168.1.1');

      expect(result.flagged).toBe(false);
      expect(result.count).toBe(3);
      expect(result.threshold).toBe(5);
    });

    test('returns flagged when count exceeds threshold', async () => {
      mockDb.first.mockResolvedValue({ count: '7' });

      const result = await fraudDetector.checkIpAccountCount('192.168.1.1');

      expect(result.flagged).toBe(true);
      expect(result.count).toBe(7);
    });

    test('handles null count gracefully', async () => {
      mockDb.first.mockResolvedValue({ count: null });

      const result = await fraudDetector.checkIpAccountCount('10.0.0.1');

      expect(result.flagged).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('checkSubmissionSpeed', () => {
    test('returns not flagged when enough time between steps', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);
      mockDb.limit.mockResolvedValue([
        { created_at: now.toISOString(), user_id: 'user-1' },
        { created_at: earlier.toISOString(), user_id: 'user-1' },
      ]);

      const result = await fraudDetector.checkSubmissionSpeed('order-1', 'user-1');

      expect(result.flagged).toBe(false);
      expect(result.timeSeconds).toBeGreaterThanOrEqual(59);
    });

    test('returns flagged when submission is too fast', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 5000);
      mockDb.limit.mockResolvedValue([
        { created_at: now.toISOString(), user_id: 'user-1' },
        { created_at: earlier.toISOString(), user_id: 'user-1' },
      ]);

      const result = await fraudDetector.checkSubmissionSpeed('order-1', 'user-1');

      expect(result.flagged).toBe(true);
      expect(result.timeSeconds).toBeLessThan(30);
    });

    test('returns not flagged with insufficient log entries', async () => {
      mockDb.limit.mockResolvedValue([{ created_at: new Date().toISOString(), user_id: 'user-1' }]);

      const result = await fraudDetector.checkSubmissionSpeed('order-1', 'user-1');

      expect(result.flagged).toBe(false);
      expect(result.timeSeconds).toBeNull();
    });

    test('returns not flagged with empty logs', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await fraudDetector.checkSubmissionSpeed('order-1', 'user-1');

      expect(result.flagged).toBe(false);
      expect(result.timeSeconds).toBeNull();
    });
  });

  describe('checkEmployeeThroughput', () => {
    test('returns not flagged when under threshold', async () => {
      mockDb.first.mockResolvedValue({ count: '15' });

      const result = await fraudDetector.checkEmployeeThroughput('emp-1');

      expect(result.flagged).toBe(false);
      expect(result.count).toBe(15);
    });

    test('returns flagged when exceeding threshold', async () => {
      mockDb.first.mockResolvedValue({ count: '35' });

      const result = await fraudDetector.checkEmployeeThroughput('emp-1');

      expect(result.flagged).toBe(true);
      expect(result.count).toBe(35);
      expect(result.threshold).toBe(30);
    });
  });

  describe('checkNewAccountOrderRate', () => {
    test('returns not flagged for old account', async () => {
      const oldDate = new Date(Date.now() - 72 * 60 * 60 * 1000);
      mockDb.first
        .mockResolvedValueOnce({ created_at: oldDate.toISOString() });

      const result = await fraudDetector.checkNewAccountOrderRate('user-1');

      expect(result.flagged).toBe(false);
      expect(result.orderCount).toBe(0);
    });

    test('returns flagged for new account with many orders', async () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      mockDb.first
        .mockResolvedValueOnce({ created_at: recentDate.toISOString() })
        .mockResolvedValueOnce({ count: '12' });

      const result = await fraudDetector.checkNewAccountOrderRate('user-1');

      expect(result.flagged).toBe(true);
      expect(result.orderCount).toBe(12);
    });

    test('returns not flagged for new account with few orders', async () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      mockDb.first
        .mockResolvedValueOnce({ created_at: recentDate.toISOString() })
        .mockResolvedValueOnce({ count: '3' });

      const result = await fraudDetector.checkNewAccountOrderRate('user-1');

      expect(result.flagged).toBe(false);
      expect(result.orderCount).toBe(3);
    });

    test('handles missing user gracefully', async () => {
      mockDb.first.mockResolvedValue(null);

      const result = await fraudDetector.checkNewAccountOrderRate('nonexistent');

      expect(result.flagged).toBe(false);
      expect(result.accountAge).toBeNull();
      expect(result.orderCount).toBe(0);
    });
  });

  describe('flagOrder', () => {
    test('updates order with fraud info at level 1', async () => {
      await fraudDetector.flagOrder('order-1', 'user-1', 'مشبوه قليلاً', 1);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    test('updates order and cancels at level 3', async () => {
      let updateArgs;
      mockDb.update.mockImplementation((data) => {
        updateArgs = data;
        return mockDb;
      });

      await fraudDetector.flagOrder('order-1', 'user-1', 'احتيال مؤكد', 3);

      expect(updateArgs.fraud_level).toBe(3);
      expect(updateArgs.status).toBe('cancelled');
    });

    test('inserts audit log with flag_level', async () => {
      let insertArgs;
      mockDb.insert.mockImplementation((data) => {
        insertArgs = data;
        return mockDb;
      });

      await fraudDetector.flagOrder('order-1', 'user-1', 'اختبار', 2);

      expect(insertArgs.action).toBe('fraud_flag');
      expect(insertArgs.flag_level).toBe(2);
      expect(insertArgs.metadata.level).toBe(2);
    });
  });
});
