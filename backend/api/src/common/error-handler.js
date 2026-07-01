const { logger } = require('./logger');

class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn(`${err.code}: ${err.message}`);
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || [],
      },
    });
  }

  logger.error(err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: [],
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { AppError, errorHandler };
