require('dotenv').config();

const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
    key: process.env.API_KEY || 'headless-service-key',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    timeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 30000,
  },
  captcha: {
    apiKey: process.env.CAPTCHA_API_KEY || '',
    baseUrl: process.env.CAPTCHA_BASE_URL || 'https://2captcha.com',
    timeout: parseInt(process.env.CAPTCHA_TIMEOUT) || 120,
  },
  proxy: {
    list: (process.env.PROXY_LIST || '').split(',').filter(Boolean),
    rotationInterval: parseInt(process.env.PROXY_ROTATION_INTERVAL) || 60000,
  },
  browserPool: {
    min: parseInt(process.env.BROWSER_POOL_MIN) || 1,
    max: parseInt(process.env.BROWSER_POOL_MAX) || 5,
  },
  queues: {
    submissionConcurrency: parseInt(process.env.SUBMISSION_QUEUE_CONCURRENCY) || 2,
    resultConcurrency: parseInt(process.env.RESULT_QUEUE_CONCURRENCY) || 5,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  dvLottery: {
    entryUrl: 'https://dvprogram.state.gov/AES/',
    escUrl: 'https://dvprogram.state.gov/ESC/CheckStatus.aspx',
    recoveryUrl: 'https://dvprogram.state.gov/ESC/CheckConfirmation.aspx',
    sessionTimeout: 55 * 60 * 1000,
    maxRetries: 3,
    retryDelay: 5000,
  },
};

module.exports = config;
