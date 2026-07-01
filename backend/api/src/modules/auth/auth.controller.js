const authService = require('./auth.service');

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

const register = async (req, res, next) => {
  try {
    const { phone, full_name } = req.body;
    const result = await authService.register(phone, full_name, req.ip);
    res.status(201).json({
      data: {
        user_id: result.userId,
        phone,
        otp_sent: result.otpSent,
        otp_expires_in: result.otpExpiresIn,
      },
      message: 'تم إرسال رمز التحقق',
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      data: {
        user_id: result.userId,
        access_token: result.accessToken,
        expires_in: result.expiresIn,
      },
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.login(phone);
    res.status(200).json({
      data: {
        otp_sent: result.otpSent,
        otp_expires_in: result.otpExpiresIn,
      },
      message: 'تم إرسال رمز التحقق',
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      data: {
        access_token: result.accessToken,
        expires_in: result.expiresIn,
      },
    });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await authService.logout(req.user.id);
    }
    clearRefreshCookie(res);
    res.json({ message: 'تم تسجيل الخروج' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyOtp, login, refresh, logout };
