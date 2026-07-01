const jwt = require('jsonwebtoken');
const userModel = require('./auth.model');
const { AppError } = require('../../common/error-handler');

const otpStore = new Map();

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
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(phone, { code: otp, expiresAt });

  return { userId: user[0].id, otpSent: true, otpExpiresIn: 300 };
};

const verifyOtp = async (phone, otp) => {
  const stored = otpStore.get(phone);
  if (!stored) {
    throw new AppError('No OTP requested', 400, 'NO_OTP');
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    throw new AppError('OTP expired', 410, 'OTP_EXPIRED');
  }
  if (stored.code !== otp) {
    throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  }

  otpStore.delete(phone);

  let user = await userModel.findByPhone(phone);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await userModel.updateLastLogin(user.id);

  const tokens = generateTokens(user);
  await userModel.storeRefreshToken(user.id, tokens.refreshToken);

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
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(phone, { code: otp, expiresAt });

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

  const user = await userModel.findRefreshToken(token);
  if (!user || user.id !== decoded.id) {
    throw new AppError('Refresh token not found', 401, 'INVALID_REFRESH_TOKEN');
  }

  const tokens = generateTokens(user);
  await userModel.storeRefreshToken(user.id, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
  };
};

module.exports = { register, verifyOtp, login, refresh };
