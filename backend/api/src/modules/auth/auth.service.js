const jwt = require('jsonwebtoken');
const userModel = require('./auth.model');
const { AppError } = require('../../common/error-handler');
const { setOtp, getOtp, delOtp, setRefreshToken, getRefreshToken, delRefreshToken, setOtpAttempts, getOtpAttempts, delOtpAttempts, setOtpLocked, getOtpLocked, delOtpLocked } = require('../../common/redis');
const notifier = require('../../common/notifier');

const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_AFTER = 3;
const OTP_LOCK_MINUTES = 30;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const resendOtp = async (phone) => {
  const otp = generateOtp();
  await setOtp(phone, otp);

  const user = await userModel.findByPhone(phone);
  if (user) {
    await notifier.sendOtp(user.id, phone, otp);
  }
};

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, phone: user.phone };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

const checkOtpAttempts = async (phone) => {
  const locked = await getOtpLocked(phone);
  if (locked) {
    throw new AppError(
      `Too many failed attempts. Try again in ${OTP_LOCK_MINUTES} minutes`,
      429,
      'OTP_LOCKED',
    );
  }
};

const register = async (phone, fullName, ip = null) => {
  const existing = await userModel.findByPhone(phone);
  if (existing) {
    throw new AppError('Phone already registered', 409, 'PHONE_EXISTS');
  }

  const user = await userModel.create({
    phone,
    full_name: fullName || null,
    role: 'client',
    metadata: ip ? { registration_ip: ip } : {},
  });

  const otp = generateOtp();
  await setOtp(phone, otp);
  await setOtpAttempts(phone, 0);

  await notifier.sendOtp(user[0].id, phone, otp);

  return { userId: user[0].id, otpSent: true, otpExpiresIn: 300 };
};

const verifyOtp = async (phone, otp) => {
  await checkOtpAttempts(phone);

  const stored = await getOtp(phone);
  if (!stored) {
    throw new AppError('OTP expired or not requested', 410, 'OTP_EXPIRED');
  }
  if (stored !== otp) {
    const currentAttempts = await getOtpAttempts(phone) || 0;
    const newAttempts = currentAttempts + 1;
    await setOtpAttempts(phone, newAttempts);
    const remaining = OTP_MAX_ATTEMPTS - newAttempts;

    if (newAttempts >= OTP_MAX_ATTEMPTS) {
      await setOtpLocked(phone, OTP_LOCK_MINUTES * 60);
      throw new AppError(
        `Too many failed attempts. Account locked for ${OTP_LOCK_MINUTES} minutes`,
        429,
        'OTP_LOCKED',
      );
    }

    if (newAttempts >= OTP_RESEND_AFTER) {
      await resendOtp(phone);
      const err = new AppError('Invalid OTP. A new code has been sent', 400, 'INVALID_OTP_RESENT');
      err.details = [{ field: 'otp', message: 'رمز التحقق غير صحيح. تم إعادة إرسال رمز جديد' }];
      throw err;
    }

    const err = new AppError('Invalid OTP', 400, 'INVALID_OTP');
    err.details = [{ field: 'otp', message: `رمز التحقق غير صحيح. لديك ${remaining} محاولات متبقية` }];
    throw err;
  }

  await delOtpAttempts(phone);
  await delOtpLocked(phone);
  await delOtp(phone);

  const user = await userModel.findByPhone(phone);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await userModel.updateLastLogin(user.id);
  await setRefreshToken(user.id, '');

  const tokens = generateTokens(user);
  await setRefreshToken(user.id, tokens.refreshToken);

  return {
    userId: user.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
  };
};

const login = async (phone) => {
  const user = await userModel.findByPhone(phone);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const otp = generateOtp();
  await setOtp(phone, otp);
  await setOtpAttempts(phone, 0);

  await notifier.sendOtp(user.id, phone, otp);

  return { otpSent: true, otpExpiresIn: 300 };
};

const refresh = async (token) => {
  if (!token) {
    throw new AppError('Refresh token required', 401, 'INVALID_REFRESH_TOKEN');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const stored = await getRefreshToken(decoded.id);
  if (stored !== token) {
    throw new AppError('Refresh token not found', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const tokens = generateTokens(user);
  await setRefreshToken(user.id, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
  };
};

const logout = async (userId) => {
  await delRefreshToken(userId);
};

module.exports = { register, verifyOtp, login, refresh, logout };
