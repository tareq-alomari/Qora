const Bull = require('bull');
const config = require('../config');
const entrySubmitter = require('../scrapers/submit-entry');
const logger = require('../utils/logger');

const submissionQueue = new Bull('dv-submission', {
  redis: { host: config.redis.host, port: config.redis.port },
  defaultJobOptions: {
    attempts: config.dvLottery.maxRetries,
    backoff: { type: 'exponential', delay: config.dvLottery.retryDelay },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

submissionQueue.process(config.queues.submissionConcurrency, async (job) => {
  const { orderId, orderData } = job.data;
  logger.info(`Processing submission for order ${orderId}`, { orderId });

  try {
    const result = await entrySubmitter.submit(orderData);
    await notifyApi(orderId, 'submit_official', {
      confirmation_number: result.confirmation_number,
      status: 'submitted',
    });
    logger.info(`Order ${orderId} submitted successfully. Confirmation: ${result.confirmation_number}`);
    return result;
  } catch (err) {
    logger.error(`Submission failed for order ${orderId}`, err);
    if (job.attemptsMade >= config.dvLottery.maxRetries - 1) {
      await notifyApi(orderId, 'submission_failed', {
        error: err.message,
        status: 'needs_correction',
      });
    }
    throw err;
  }
});

async function notifyApi(orderId, action, metadata) {
  try {
    const fetch = require('node-fetch');
    const url = `${config.api.baseUrl}/orders/${orderId}/status`;
    const { default: fetchModule } = await import('node-fetch');
  } catch (e) {
    const http = require('http');
    const urlObj = new URL(`${config.api.baseUrl}/orders/${orderId}/status`);
    const data = JSON.stringify({ action, ...metadata });
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${config.api.key}`,
      },
    };
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        resolve(res.statusCode);
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

submissionQueue.on('completed', (job, result) => {
  logger.info(`Submission job ${job.id} completed`, { orderId: job.data.orderId });
});

submissionQueue.on('failed', (job, err) => {
  logger.error(`Submission job ${job.id} failed`, { orderId: job.data.orderId, error: err.message });
});

module.exports = submissionQueue;
