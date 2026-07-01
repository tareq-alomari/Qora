const adminService = require('../../src/modules/admin/admin.service');
const adminModel = require('../../src/modules/admin/admin.model');
const { AppError } = require('../../src/common/error-handler');

jest.mock('../../src/modules/admin/admin.model');

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    test('returns default settings', () => {
      const settings = adminService.getSettings();
      expect(settings.pricing.lottery_registration).toBe(1000);
      expect(settings.payment_accounts).toHaveLength(4);
      expect(settings.season.is_open).toBe(true);
    });
  });

  describe('updateUser', () => {
    test('updates user role', async () => {
      adminModel.updateUser.mockResolvedValue([{ id: 'uuid', role: 'employee' }]);

      const result = await adminService.updateUser('uuid', { role: 'employee' });

      expect(result.role).toBe('employee');
    });

    test('throws on invalid role', async () => {
      await expect(adminService.updateUser('uuid', { role: 'superadmin' }))
        .rejects.toThrow(AppError);
    });
  });
});
