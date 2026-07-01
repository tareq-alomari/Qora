require('dotenv').config();
const browserPool = require('./browser-pool');
const submissionQueue = require('./queue/submission-queue');
const resultQueue = require('./queue/result-queue');
const proxyManager = require('./utils/proxy');
const logger = require('./utils/logger');

async function main() {
  logger.info('Starting qor3a Headless Browser Service');

  proxyManager.startRotation();

  await browserPool.initialize();

  const health = await browserPool.healthCheck();
  logger.info(`Browser pool ready: ${health.total} browsers`);

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.info('Headless service started. Queues are listening for jobs.');
  logger.info(`  - Submission queue: ${submissionQueue.name}`);
  logger.info(`  - Result queue: ${resultQueue.name}`);

  setInterval(async () => {
    const h = await browserPool.healthCheck();
    logger.info(`Health: ${h.total} browsers, ${h.inUse} in use`);
  }, 60000);
}

async function shutdown() {
  logger.info('Shutting down headless service...');
  proxyManager.stopRotation();
  await submissionQueue.close();
  await resultQueue.close();
  await browserPool.closeAll();
  process.exit(0);
}

main().catch((err) => {
  logger.error('Failed to start headless service', err);
  process.exit(1);
});
