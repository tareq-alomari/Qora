const jwt = require('jsonwebtoken');
const userModel = require('./auth.model');
const { AppError } = require('../../common/error-handler');
const { setOtp, getOtp, delOtp, setRefreshToken, getRefreshToken } = require('../../common/redis');

const OTP_MAX_ATTEMPTS = 5;
const otpAttempts = {};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

const checkOtpAttempts = (phone) => {
  const attempts = otpAttempts[phone] || 0;
  if (attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError('Too many attempts. Request a new OTP', 429, 'OTP_MAX_ATTEMPTS');
  }
};

const register = async (phone, fullName) => {
  const existing = await userModel.findByPhone(phone);
  if (existing) {
    throw new AppError('Phone already registered', 409, 'PHONE_EXISTS');
  }

  const user = await userModel.create({
    phone,
    full_name: fullName || null,
    role: 'client',
    metadata: {},
  });

  const otp = generateOtp();
  await setOtp(phone, otp);
  otpAttempts[phone] = 0;

  return { userId: user[0].id, otpSent: true, otpExpiresIn: 300 };
};

const verifyOtp = async (phone, otp) => {
  checkOtpAttempts(phone);

  const stored = await getOtp(phone);
  if (!stored) {
    throw new AppError('OTP expired or not requested', 410, 'OTP_EXPIRED');
  }
  if (stored !== otp) {
    otpAttempts[phone] = (otpAttempts[phone] || 0) + 1;
    const remaining = OTP_MAX_ATTEMPTS - otpAttempts[phone];
    const err = new AppError('Invalid OTP', 400, 'INVALID_OTP');
    err.details = [{ field: 'otp', message: `رمز التحقق غير صحيح. لديك ${remaining} محاولات متبقية` }];
    throw err;
  }

  delete otpAttempts[phone];
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
  otpAttempts[phone] = 0;

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

module.exports = { register, verifyOtp, login, refresh };
