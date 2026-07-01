const Bull = require('bull');
const config = require('../config');
const resultChecker = require('../scrapers/check-results');
const logger = require('../utils/logger');

const resultQueue = new Bull('dv-result-check', {
  redis: { host: config.redis.host, port: config.redis.port },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

resultQueue.process(config.queues.resultConcurrency, async (job) => {
  const { orders } = job.data;
  logger.info(`Processing result check batch: ${orders.length} orders`);

  const results = [];

  for (const order of orders) {
    try {
      let confirmationNumber = order.confirmation_number;

      if (!confirmationNumber && order.recovery_data) {
        logger.info(`Attempting confirmation number recovery for order ${order.id}`);
        confirmationNumber = await resultChecker.recoverConfirmationNumber(order.recovery_data);
        if (confirmationNumber) {
          await updateOrderConfirmation(order.id, confirmationNumber);
        }
      }

      if (!confirmationNumber) {
        results.push({ order_id: order.id, result: 'no_confirmation', error: 'MISSING_CONFIRMATION' });
        continue;
      }

      const result = await resultChecker.check(
        confirmationNumber,
        order.last_name,
        order.birth_year,
      );

      await updateOrderResult(order.id, result);
      results.push({ order_id: order.id, ...result });

      await rateLimitDelay();
    } catch (err) {
      logger.error(`Result check failed for order ${order.id}`, err);
      results.push({ order_id: order.id, result: 'error', error: err.message });
    }
  }

  return { processed: orders.length, results };
});

async function updateOrderResult(orderId, result) {
  try {
    const fetch = require('node-fetch');
  } catch (e) {
    const http = require('http');
    const urlObj = new URL(`${config.api.baseUrl}/orders/${orderId}/result`);
    const data = JSON.stringify({
      result: result.selected ? 'winner' : 'loser',
      case_number: result.case_number || null,
      checked_at: new Date().toISOString(),
    });
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
      const req = http.request(options, (res) => resolve(res.statusCode));
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

async function updateOrderConfirmation(orderId, confirmationNumber) {
  try {
    const http = require('http');
    const urlObj = new URL(`${config.api.baseUrl}/orders/${orderId}/confirmation`);
    const data = JSON.stringify({ confirmation_number: confirmationNumber });
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
    new Promise((resolve, reject) => {
      const req = http.request(options, (res) => resolve(res.statusCode));
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (e) {}
}

async function rateLimitDelay() {
  return new Promise(resolve => setTimeout(resolve, 3000));
}

resultQueue.on('completed', (job, result) => {
  logger.info(`Result check batch ${job.id} completed: ${result.processed} orders`);
});

resultQueue.on('failed', (job, err) => {
  logger.error(`Result check batch ${job.id} failed`, { error: err.message });
});

module.exports = resultQueue;
