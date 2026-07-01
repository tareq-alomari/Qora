const paymentService = require('../../src/modules/payments/payments.service');

describe('Payments Service', () => {
  describe('getMethods', () => {
    test('returns active payment methods', () => {
      const methods = paymentService.getMethods();
      expect(methods).toHaveLength(3);
      expect(methods[0].id).toBe('kuraimi');
      expect(methods[1].id).toBe('jeeb');
      expect(methods[2].id).toBe('one_cash');
    });

    test('excludes inactive methods', () => {
      const methods = paymentService.getMethods();
      const mobileMoney = methods.find(m => m.id === 'mobile_money');
      expect(mobileMoney).toBeUndefined();
    });

    test('returns correct structure', () => {
      const methods = paymentService.getMethods();
      methods.forEach(m => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('account_number');
        expect(m).toHaveProperty('is_active');
      });
    });
  });
});
