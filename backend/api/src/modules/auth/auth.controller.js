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

const registerWithEmail = async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const result = await authService.registerWithEmail(full_name, email, phone, password, req.ip);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      data: {
        user_id: result.userId,
        access_token: result.accessToken,
        expires_in: result.expiresIn,
      },
      message: 'تم إنشاء الحساب بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

const loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithEmail(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      data: {
        user_id: result.userId,
        access_token: result.accessToken,
        expires_in: result.expiresIn,
        user: result.user,
      },
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { id_token } = req.body;
    const result = await authService.googleAuth(id_token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      data: {
        user_id: result.userId,
        access_token: result.accessToken,
        expires_in: result.expiresIn,
        user: result.user,
      },
      message: 'تم تسجيل الدخول بواسطة Google',
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email, req.body.phone);
    res.status(200).json({
      data: { phone: result.phone, otp_expires_in: result.otpExpiresIn },
      message: 'تم إرسال رمز التحقق إلى هاتفك',
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.phone, req.body.otp, req.body.password);
    res.status(200).json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (err) {
    next(err);
  }
};

const sendVerification = async (req, res, next) => {
  try {
    const result = await authService.sendVerification(req.body.email);
    res.status(200).json({
      data: result.verification_link ? { verification_link: result.verification_link } : undefined,
      message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني',
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.token);
    res.status(200).json({ message: 'تم التحقق من البريد الإلكتروني بنجاح' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, registerWithEmail, loginWithEmail, googleAuth, verifyOtp, login, refresh, logout, forgotPassword, resetPassword, sendVerification, verifyEmail };
