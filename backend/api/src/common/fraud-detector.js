const db = require('../database/db');

const isSQLite = () => db && db.client && db.client.config && db.client.config.client === 'sqlite3';

const jsonExtract = (column, path) => {
  if (isSQLite()) {
    return db.raw(`json_extract(${column}, '$.${path}')`);
  }
  return db.raw(`${column}->>'${path}'`);
};

const timeInterval = (interval) => {
  if (isSQLite()) {
    return db.raw(`datetime('now', '-${interval}')`);
  }
  return db.raw(`NOW() - INTERVAL '${interval}'`);
};

const THRESHOLDS = {
  IP_ACCOUNT_LIMIT: 5,
  MIN_SUBMISSION_TIME_SECONDS: 30,
  EMPLOYEE_MAX_VERIFICATIONS_PER_HOUR: 30,
  NEW_ACCOUNT_MAX_ORDERS: 10,
  NEW_ACCOUNT_AGE_HOURS: 24,
};

const checkIpAccountCount = async (ip) => {
  const result = await db('users')
    .where(jsonExtract('metadata', 'registration_ip'), ip)
    .where('created_at', '>', timeInterval('24 hours'))
    .count('id as count')
    .first();

  const count = parseInt(result.count) || 0;
  return {
    flagged: count > THRESHOLDS.IP_ACCOUNT_LIMIT,
    count,
    threshold: THRESHOLDS.IP_ACCOUNT_LIMIT,
  };
};

const checkSubmissionSpeed = async (orderId, userId) => {
  const logs = await db('audit_logs')
    .where({ order_id: orderId, user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(2);

  if (logs.length < 2) {
    return { flagged: false, timeSeconds: null };
  }

  const diffMs = new Date(logs[0].created_at) - new Date(logs[1].created_at);
  const diffSeconds = diffMs / 1000;

  return {
    flagged: diffSeconds < THRESHOLDS.MIN_SUBMISSION_TIME_SECONDS,
    timeSeconds: Math.round(diffSeconds * 10) / 10,
  };
};

const checkEmployeeThroughput = async (employeeId) => {
  const result = await db('audit_logs')
    .where({ user_id: employeeId, action: 'verify_payment' })
    .where('created_at', '>', timeInterval('1 hour'))
    .count('id as count')
    .first();

  const count = parseInt(result.count) || 0;
  return {
    flagged: count > THRESHOLDS.EMPLOYEE_MAX_VERIFICATIONS_PER_HOUR,
    count,
    threshold: THRESHOLDS.EMPLOYEE_MAX_VERIFICATIONS_PER_HOUR,
  };
};

const checkNewAccountOrderRate = async (userId) => {
  const user = await db('users').where({ id: userId }).select('created_at').first();
  if (!user) {
    return { flagged: false, accountAge: null, orderCount: 0 };
  }

  const accountAgeHours = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60);

  if (accountAgeHours >= THRESHOLDS.NEW_ACCOUNT_AGE_HOURS) {
    return { flagged: false, accountAge: Math.round(accountAgeHours * 10) / 10, orderCount: 0 };
  }

  const result = await db('orders')
    .where({ user_id: userId })
    .count('id as count')
    .first();

  const count = parseInt(result.count) || 0;
  return {
    flagged: count >= THRESHOLDS.NEW_ACCOUNT_MAX_ORDERS,
    accountAge: Math.round(accountAgeHours * 10) / 10,
    orderCount: count,
  };
};

const flagOrder = async (orderId, userId, reason, level) => {
  const updates = {
    fraud_level: level,
    fraud_reason: reason,
    flagged_at: db.fn.now(),
  };

  if (level >= 3) {
    updates.status = 'cancelled';
  }

  await db('orders').where({ id: orderId }).update(updates);

  await db('audit_logs').insert({
    order_id: orderId,
    user_id: userId,
    action: 'fraud_flag',
    from_status: null,
    to_status: null,
    metadata: { reason, level },
    flag_level: level,
  });
};

module.exports = {
  checkIpAccountCount,
  checkSubmissionSpeed,
  checkEmployeeThroughput,
  checkNewAccountOrderRate,
  flagOrder,
  THRESHOLDS,
};
