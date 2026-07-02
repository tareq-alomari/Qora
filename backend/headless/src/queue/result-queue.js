const Bull = require('bull');
const fetch = require('node-fetch');
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

      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      logger.error(`Result check failed for order ${order.id}`, err);
      results.push({ order_id: order.id, result: 'error', error: err.message });
    }
  }

  return { processed: orders.length, results };
});

async function callApi(method, path, body) {
  const url = `${config.api.baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.api.key,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    logger.error(`API call failed: ${res.status} ${path}`);
  }
  return res.status;
}

async function updateOrderResult(orderId, result) {
  return callApi('PATCH', `/orders/${orderId}/result`, {
    result: result.selected ? 'winner' : 'loser',
    case_number: result.case_number || null,
    checked_at: new Date().toISOString(),
  });
}

async function updateOrderConfirmation(orderId, confirmationNumber) {
  return callApi('PATCH', `/orders/${orderId}/confirmation`, {
    confirmation_number: confirmationNumber,
  });
}

resultQueue.on('completed', (job, result) => {
  logger.info(`Result check batch ${job.id} completed: ${result.processed} orders`);
});

resultQueue.on('failed', (job, err) => {
  logger.error(`Result check batch ${job.id} failed`, { error: err.message });
});

module.exports = resultQueue;
