const notifier = require('../../src/common/notifier');

const mockQueryBuilder = {
  insert: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(null),
  orderBy: jest.fn().mockReturnThis(),
};

jest.mock('../../src/common/notification-queue', () => ({
  enqueue: jest.fn().mockResolvedValue(),
  notificationQueue: null,
}));

jest.mock('../../src/database/db', () => jest.fn(() => mockQueryBuilder));
const db = require('../../src/database/db');

describe('Notifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(mockQueryBuilder).forEach(m => {
      if (jest.isMockFunction(m)) m.mockReturnThis();
    });
    mockQueryBuilder.returning.mockResolvedValue([{ id: 'uuid', title: 'Test', status: 'pending' }]);
  });

  describe('send', () => {
    test('creates notification record', async () => {
      const result = await notifier.send('user-uuid', {
        type: 'test',
        title: 'Test Notification',
        body: 'Test body',
      });

      expect(result).toBeTruthy();
      expect(result.title).toBe('Test');
    });
  });

  describe('sendStatusUpdate', () => {
    test('sends status message for approved', async () => {
      const result = await notifier.sendStatusUpdate('user-uuid', 'order-uuid', 'approved');
      expect(result).toBeTruthy();
    });

    test('returns null for unknown status', async () => {
      const result = await notifier.sendStatusUpdate('user-uuid', 'order-uuid', 'unknown_status');
      expect(result).toBeNull();
    });
  });
});
