const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const { phone, full_name } = req.body;
    const result = await authService.register(phone, full_name);
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
    res.status(200).json({
      data: {
        user_id: result.userId,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
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
    const header = req.headers.authorization;
    const token = header ? header.split(' ')[1] : null;
    const result = await authService.refresh(token);
    res.status(200).json({
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        expires_in: result.expiresIn,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyOtp, login, refresh };
