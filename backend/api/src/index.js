require('dotenv').config();
const path = require('path');
const db = require('./database/db');
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
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ['\'self\'', 'https:', 'data:'],
      connectSrc: ['\'self\''],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('FATAL: CORS_ORIGIN environment variable is required');
  process.exit(1);
}
app.use(cors({ origin: corsOrigin.split(','), credentials: true }));
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

app.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      storage: 'unknown',
    },
  };

  try {
    await db.raw('SELECT 1');
    checks.checks.database = 'ok';
  } catch {
    checks.checks.database = 'error';
    checks.status = 'degraded';
  }

  try {
    const { redis: redisClient } = require('./common/redis');
    if (redisClient) {
      await redisClient.ping();
      checks.checks.redis = 'ok';
    } else {
      checks.checks.redis = 'disabled';
    }
  } catch {
    checks.checks.redis = 'unavailable';
  }

  try {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    fs.accessSync(uploadDir, fs.constants.W_OK);
    checks.checks.storage = 'ok';
  } catch {
    checks.checks.storage = 'error';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});

app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/users.routes'));
app.use('/api/v1/orders', require('./modules/orders/orders.routes'));
app.use('/api/v1/payments', require('./modules/payments/payments.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/v1', require('./modules/results/results.routes'));
app.use('/api/v1/orders', require('./modules/results/results.routes'));
app.use('/api/v1/push-subscriptions', require('./modules/push-subscriptions/push-subscriptions.routes'));
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

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`qor3a API running on port ${PORT}`);
  });
}

module.exports = app;
