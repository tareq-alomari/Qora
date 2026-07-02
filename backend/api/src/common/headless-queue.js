const Bull = require('bull');
const { logger } = require('./logger');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;

let submissionQueue = null;
let resultQueue = null;

try {
  submissionQueue = new Bull('dv-submission', {
    redis: { host: REDIS_HOST, port: REDIS_PORT },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  resultQueue = new Bull('dv-result-check', {
    redis: { host: REDIS_HOST, port: REDIS_PORT },
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 60000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  logger.info('Headless Bull queues initialized (dv-submission, dv-result-check)');
} catch (err) {
  logger.warn(`Bull queue not available for headless: ${err.message}`);
}

const enqueueSubmission = async (orderId, orderData) => {
  if (!submissionQueue) {
    throw new Error('Headless queue not available');
  }
  const job = await submissionQueue.add({ orderId, orderData });
  logger.info(`Enqueued submission for order ${orderId}`, { jobId: job.id });
  return { jobId: job.id, queue: 'dv-submission' };
};

const enqueueResultCheck = async (orders) => {
  if (!resultQueue) {
    throw new Error('Headless queue not available');
  }
  const job = await resultQueue.add({ orders });
  logger.info(`Enqueued result check batch: ${orders.length} orders`, { jobId: job.id });
  return { jobId: job.id, queue: 'dv-result-check' };
};

const getQueueStatus = async () => {
  const status = {};
  if (submissionQueue) {
    const [waiting, active, completed, failed] = await Promise.all([
      submissionQueue.getWaitingCount(),
      submissionQueue.getActiveCount(),
      submissionQueue.getCompletedCount(),
      submissionQueue.getFailedCount(),
    ]);
    status.submission = { waiting, active, completed, failed };
  }
  if (resultQueue) {
    const [waiting, active, completed, failed] = await Promise.all([
      resultQueue.getWaitingCount(),
      resultQueue.getActiveCount(),
      resultQueue.getCompletedCount(),
      resultQueue.getFailedCount(),
    ]);
    status.resultCheck = { waiting, active, completed, failed };
  }
  return status;
};

module.exports = { enqueueSubmission, enqueueResultCheck, getQueueStatus };
