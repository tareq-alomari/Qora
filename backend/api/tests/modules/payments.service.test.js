const paymentService = require('../../src/modules/payments/payments.service');

jest.mock('../../src/database/db', () => jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(null),
})));

describe('Payments Service', () => {
  describe('getMethods', () => {
    test('returns active payment methods', async () => {
      const methods = await paymentService.getMethods();
      expect(methods).toHaveLength(3);
      expect(methods[0].id).toBe('kuraimi');
      expect(methods[1].id).toBe('jeeb');
      expect(methods[2].id).toBe('one_cash');
    });

    test('excludes inactive methods', async () => {
      const methods = await paymentService.getMethods();
      const mobileMoney = methods.find(m => m.id === 'mobile_money');
      expect(mobileMoney).toBeUndefined();
    });

    test('returns correct structure', async () => {
      const methods = await paymentService.getMethods();
      methods.forEach(m => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('account_number');
        expect(m).toHaveProperty('is_active');
      });
    });
  });
});
