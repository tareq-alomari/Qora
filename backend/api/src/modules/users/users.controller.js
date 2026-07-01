const userService = require('./users.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ data: user, message: 'تم تحديث الملف الشخصي' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
