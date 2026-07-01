const jwt = require('jsonwebtoken');
const { AppError } = require('./error-handler');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      phone: decoded.phone,
    };
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
