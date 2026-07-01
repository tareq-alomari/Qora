const adminService = require('../../src/modules/admin/admin.service');
const adminModel = require('../../src/modules/admin/admin.model');
const { AppError } = require('../../src/common/error-handler');

jest.mock('../../src/modules/admin/admin.model');

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    test('returns default settings', async () => {
      adminModel.getSettings.mockResolvedValue({
        pricing: { lottery_registration: 1000, result_checking: 0 },
        payment_accounts: [{ method: 'kuraimi', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true }],
        season: { is_open: true, opens_at: '2026-09-01T08:00:00Z', closes_at: '2026-10-31T23:59:59Z' },
      });
      const settings = await adminService.getSettings();
      expect(settings.pricing.lottery_registration).toBe(1000);
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
