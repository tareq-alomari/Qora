const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../database/db');
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

const registerWithEmail = async (fullName, email, phone, password, ip = null) => {
  const existingEmail = await userModel.findByEmail(email);
  if (existingEmail) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const existingPhone = await userModel.findByPhone(phone);
  if (existingPhone) {
    throw new AppError('Phone already registered', 409, 'PHONE_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    phone,
    email,
    full_name: fullName,
    password_hash: passwordHash,
    role: 'client',
    is_verified: true,
    is_email_verified: false,
    metadata: ip ? { registration_ip: ip } : {},
  });

  const tokens = generateTokens(user[0]);
  await setRefreshToken(user[0].id, tokens.refreshToken);

  return {
    userId: user[0].id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
  };
};

const loginWithEmail = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.password_hash) {
    throw new AppError('This account uses OTP login. Please use phone login.', 400, 'OTP_ONLY_ACCOUNT');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  await userModel.updateLastLogin(user.id);
  const tokens = generateTokens(user);
  await setRefreshToken(user.id, tokens.refreshToken);

  return {
    userId: user.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
    user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
  };
};

const { OAuth2Client } = require('google-auth-library');

const googleAuth = async (idToken) => {
  let payload;

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } else {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } else {
        throw new Error('Invalid token format');
      }
    }
  } catch {
    throw new AppError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
  }

  const { sub: googleId, email, name: fullName, picture: avatarUrl } = payload;
  if (!email) {
    throw new AppError('Email required from Google', 400, 'GOOGLE_EMAIL_REQUIRED');
  }

  let user = await userModel.findByGoogleId(googleId);

  if (!user) {
    user = await userModel.findByEmail(email);

    if (user) {
      await userModel.update(user.id, { google_id: googleId, avatar_url: avatarUrl });
    } else {
      const created = await userModel.create({
        email,
        full_name: fullName || email.split('@')[0],
        google_id: googleId,
        avatar_url: avatarUrl,
        role: 'client',
        is_verified: true,
        is_email_verified: true,
      });
      user = created[0];
    }
  }

  await userModel.updateLastLogin(user.id);
  const tokens = generateTokens(user);
  await setRefreshToken(user.id, tokens.refreshToken);

  return {
    userId: user.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 86400,
    user: { id: user.id, full_name: user.full_name, email: user.email, avatar_url: user.avatar_url, role: user.role },
  };
};

const forgotPassword = async (email, phone) => {
  let user;
  if (email) user = await userModel.findByEmail(email);
  else if (phone) user = await userModel.findByPhone(phone);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.password_hash) {
    throw new AppError('This account uses OTP login only', 400, 'OTP_ONLY_ACCOUNT');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ttl = 300;

  await setOtp(user.phone, otp, ttl);
  await notifier.send(user.id, {
    type: 'otp',
    title: 'إعادة تعيين كلمة المرور',
    body: `رمز التحقق لإعادة تعيين كلمة المرور: ${otp}`,
  }, 1);

  return { phone: user.phone, otpExpiresIn: ttl };
};

const resetPassword = async (phone, otp, password) => {
  const user = await userModel.findByPhone(phone);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const storedOtp = await getOtp(phone);
  if (!storedOtp || storedOtp !== otp) {
    throw new AppError('Invalid OTP', 401, 'INVALID_OTP');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await userModel.update(user.id, { password_hash: passwordHash });
  await delOtp(phone);

  return { message: 'Password reset successfully' };
};

const sendVerification = async (email) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.is_email_verified) {
    throw new AppError('Email already verified', 409, 'EMAIL_ALREADY_VERIFIED');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await userModel.update(user.id, {
    email_verification_token: token,
    email_verification_expires_at: expiresAt,
  });

  const verificationLink = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify-email?token=${token}`;
  const { logger } = require('../../common/logger');
  logger.info(`Verification link for ${email}: ${verificationLink}`);

  await notifier.send(user.id, {
    type: 'general',
    title: 'تحقق من بريدك الإلكتروني',
    body: `رابط التحقق: ${verificationLink}`,
  });

  return {
    message: 'Verification email sent',
    verification_link: process.env.NODE_ENV === 'development' ? verificationLink : undefined,
  };
};

const verifyEmail = async (token) => {
  const user = await db('users')
    .where({ email_verification_token: token })
    .where('email_verification_expires_at', '>', db.fn.now())
    .first();

  if (!user) {
    throw new AppError('Invalid or expired token', 401, 'INVALID_VERIFICATION_TOKEN');
  }

  await userModel.update(user.id, {
    is_email_verified: true,
    email_verification_token: null,
    email_verification_expires_at: null,
  });

  return { message: 'Email verified successfully' };
};

module.exports = { register, registerWithEmail, loginWithEmail, googleAuth, verifyOtp, login, refresh, logout, forgotPassword, resetPassword, sendVerification, verifyEmail };
