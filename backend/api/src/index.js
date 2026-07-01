const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('./common/logger');
const multer = require('multer');
const { errorHandler } = require('./common/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  }),
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/users.routes'));
app.use('/api/v1/orders', require('./modules/orders/orders.routes'));
app.use('/api/v1/payments', require('./modules/payments/payments.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/v1/admin', require('./modules/admin/admin.routes'));

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found`, details: [] },
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'حجم الملف يجب أن يكون أقل من 5MB',
      LIMIT_FILE_COUNT: 'يمكن رفع ملف واحد فقط',
      LIMIT_UNEXPECTED_FILE: 'حقل غير متوقع',
    };
    return res.status(400).json({
      error: { code: 'UPLOAD_ERROR', message: messages[err.code] || 'خطأ في رفع الملف', details: [] },
    });
  }
  next(err);
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`qor3a API running on port ${PORT}`);
});

module.exports = app;
