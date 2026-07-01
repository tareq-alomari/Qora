const notifService = require('../../src/modules/notifications/notifications.service');
const notifModel = require('../../src/modules/notifications/notifications.model');

jest.mock('../../src/modules/notifications/notifications.model');

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unreadCount', () => {
    test('returns unread count', async () => {
      notifModel.unreadByUser.mockResolvedValue({ total: '5' });

      const count = await notifService.unreadCount('user-uuid');

      expect(count).toBe(5);
    });

    test('returns 0 when no unread', async () => {
      notifModel.unreadByUser.mockResolvedValue({ total: '0' });

      const count = await notifService.unreadCount('user-uuid');

      expect(count).toBe(0);
    });
  });
});
