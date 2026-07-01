const userModel = require('./users.model');
const { AppError } = require('../../common/error-handler');

const getProfile = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await userModel.update(userId, data);
  if (!user || user.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user[0];
};

module.exports = { getProfile, updateProfile };
