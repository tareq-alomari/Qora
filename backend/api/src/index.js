require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const { logger } = require('./common/logger');
const { errorHandler } = require('./common/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

const apiSpecPath = path.resolve(__dirname, '../../../docs/api-reference/openapi.yaml');
let swaggerDocument = null;
try {
  swaggerDocument = yaml.load(fs.readFileSync(apiSpecPath, 'utf8'));
  swaggerDocument.servers = [
    { url: `http://localhost:${PORT}`, description: 'Local development' },
    ...(swaggerDocument.servers || []),
  ];
} catch (err) {
  logger.warn(`Could not load OpenAPI spec: ${err.message}`);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      objectSrc: ['\'none\''],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\''],
    },
  },
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  }),
);

if (swaggerDocument) {
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Qor3a API — قرعة',
  };
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {
      database: process.env.NODE_ENV === 'test' ? 'ok' : 'unknown',
      redis: process.env.REDIS_ENABLED !== 'false' ? 'unknown' : 'ok',
      minio: process.env.S3_ENDPOINT ? 'unknown' : 'ok',
      ai_service: process.env.AI_SERVICE_URL ? 'unknown' : 'ok',
    },
  });
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
