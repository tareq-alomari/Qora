const authService = require('../../src/modules/auth/auth.service');
const authModel = require('../../src/modules/auth/auth.model');
const { AppError } = require('../../src/common/error-handler');
const { setOtp, getOtp, delOtp } = require('../../src/common/redis');

jest.mock('../../src/modules/auth/auth.model');
jest.mock('../../src/common/redis');
jest.mock('../../src/common/notifier');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setOtp.mockResolvedValue();
    getOtp.mockResolvedValue(null);
    delOtp.mockResolvedValue();
  });

  describe('register', () => {
    test('creates user and returns OTP sent', async () => {
      authModel.findByPhone.mockResolvedValue(null);
      authModel.create.mockResolvedValue([{ id: 'uuid-123' }]);

      const result = await authService.register('967700000001', 'Test User');

      expect(result.otpSent).toBe(true);
      expect(result.otpExpiresIn).toBe(300);
      expect(authModel.create).toHaveBeenCalledWith({
        phone: '967700000001',
        full_name: 'Test User',
        role: 'client',
        metadata: {},
      });
      expect(setOtp).toHaveBeenCalledWith('967700000001', expect.any(String));
    });

    test('throws if phone already exists', async () => {
      authModel.findByPhone.mockResolvedValue({ id: 'existing' });

      await expect(authService.register('967700000001', 'Test'))
        .rejects.toThrow(AppError);
    });

    test('handles missing full name', async () => {
      authModel.findByPhone.mockResolvedValue(null);
      authModel.create.mockResolvedValue([{ id: 'uuid-123' }]);

      const result = await authService.register('967700000002', null);

      expect(authModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: null })
      );
    });
  });

  describe('verifyOtp', () => {
    test('verifies OTP and returns tokens', async () => {
      getOtp.mockResolvedValue('123456');
      authModel.findByPhone.mockResolvedValue({
        id: 'uuid-123',
        role: 'client',
        phone: '967700000001',
      });
      authModel.updateLastLogin.mockResolvedValue();

      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRES_IN = '24h';
      process.env.JWT_REFRESH_EXPIRES_IN = '7d';

      const result = await authService.verifyOtp('967700000001', '123456');

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(delOtp).toHaveBeenCalledWith('967700000001');
    });

    test('throws on wrong OTP', async () => {
      getOtp.mockResolvedValue('654321');

      await expect(authService.verifyOtp('967700000001', '123456'))
        .rejects.toThrow(AppError);
    });

    test('throws on expired OTP', async () => {
      getOtp.mockResolvedValue(null);

      await expect(authService.verifyOtp('967700000001', '123456'))
        .rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    test('sends OTP for existing user', async () => {
      authModel.findByPhone.mockResolvedValue({ id: 'uuid-123' });

      const result = await authService.login('967700000001');

      expect(result.otpSent).toBe(true);
      expect(setOtp).toHaveBeenCalled();
    });

    test('throws for non-existent user', async () => {
      authModel.findByPhone.mockResolvedValue(null);

      await expect(authService.login('967700000001'))
        .rejects.toThrow(AppError);
    });
  });
});
