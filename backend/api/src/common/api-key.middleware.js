const { AppError } = require('./error-handler');

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return next(new AppError('Invalid API key', 401, 'UNAUTHORIZED'));
  }
  next();
};

module.exports = { authenticateApiKey };
