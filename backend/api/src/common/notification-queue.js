const Bull = require('bull');
const db = require('../database/db');
const { logger } = require('./logger');
const whatsapp = require('./whatsapp');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;

let notificationQueue = null;

try {
  notificationQueue = new Bull('notifications', {
    redis: { host: REDIS_HOST, port: REDIS_PORT },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  notificationQueue.process(async (job) => {
    const { notificationId, phone, title, body } = job.data;

    const priorities = ['whatsapp', 'pwa'];

    for (const ch of priorities) {
      if (ch === 'whatsapp' && phone) {
        const sent = await whatsapp.sendMessage(phone, 'qor3a_notification', [title, body]);
        if (sent) {
          await db('notifications').where({ id: notificationId }).update({
            channel: 'whatsapp',
            status: 'sent',
            sent_at: db.fn.now(),
          });
          return { channel: 'whatsapp' };
        }
      }
      if (ch === 'pwa') {
        await db('notifications').where({ id: notificationId }).update({
          channel: 'pwa',
          status: 'sent',
          sent_at: db.fn.now(),
        });
        return { channel: 'pwa' };
      }
    }

    await db('notifications').where({ id: notificationId }).update({ status: 'failed' });
    throw new Error('All channels failed');
  });

  notificationQueue.on('failed', (job, err) => {
    logger.error(`Notification ${job.id} failed: ${err.message}`);
  });

  notificationQueue.on('completed', (job) => {
    logger.info(`Notification ${job.id} sent via ${job.returnvalue?.channel}`);
  });
} catch (err) {
  logger.warn(`Bull queue not available: ${err.message}. Running in sync mode.`);
}

const enqueue = async (data, priority = 3) => {
  if (notificationQueue) {
    await notificationQueue.add(data, { priority });
  }
};

module.exports = { notificationQueue, enqueue };
