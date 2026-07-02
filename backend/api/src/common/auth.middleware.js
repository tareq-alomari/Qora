const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { AppError } = require('./error-handler');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('users').where({ id: decoded.id }).select('id', 'role', 'phone', 'is_active').first();
    if (!user) {
      return next(new AppError('User not found', 401, 'USER_NOT_FOUND'));
    }
    if (user.is_active === false) {
      return next(new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED'));
    }

    req.user = { id: user.id, role: user.role, phone: user.phone };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
  }
};

const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    if (req.user.role !== 'client') {
      return next();
    }
    const resourceId = req.params[paramName];
    if (resourceId && resourceId !== req.user.id) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    next();
  };
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, phone: decoded.phone };
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, requireOwnership, optionalAuth };
