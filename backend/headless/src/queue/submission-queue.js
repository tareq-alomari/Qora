const Bull = require('bull');
const fetch = require('node-fetch');
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
    await notifyApi(orderId, {
      action: 'submit_official',
      confirmation_number: result.confirmation_number,
    });
    logger.info(`Order ${orderId} submitted successfully. Confirmation: ${result.confirmation_number}`);
    return result;
  } catch (err) {
    logger.error(`Submission failed for order ${orderId}`, err);
    if (job.attemptsMade >= config.dvLottery.maxRetries - 1) {
      await notifyApi(orderId, {
        action: 'request_correction',
        notes: `فشل التقديم الرسمي: ${err.message}`,
      });
    }
    throw err;
  }
});

async function notifyApi(orderId, body) {
  const url = `${config.api.baseUrl}/orders/${orderId}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.api.key,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    logger.error(`API notification failed: ${res.status} ${res.statusText}`, { orderId, body });
  }
  return res.status;
}

submissionQueue.on('completed', (job, result) => {
  logger.info(`Submission job ${job.id} completed`, { orderId: job.data.orderId });
});

submissionQueue.on('failed', (job, err) => {
  logger.error(`Submission job ${job.id} failed`, { orderId: job.data.orderId, error: err.message });
});

module.exports = submissionQueue;
