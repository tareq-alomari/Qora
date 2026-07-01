const Redis = require('ioredis');

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let redis = null;

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      return;
    }
  });
}

const setOtp = async (phone, code, ttlSeconds = 300) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.setex(`otp:${phone}`, ttlSeconds, code);
    } catch {
      fallbackSet(phone, code, ttlSeconds);
    }
  } else {
    fallbackSet(phone, code, ttlSeconds);
  }
};

const getOtp = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      return await redis.get(`otp:${phone}`);
    } catch {
      return fallbackGet(phone);
    }
  }
  return fallbackGet(phone);
};

const delOtp = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.del(`otp:${phone}`);
    } catch {
      fallbackDel(phone);
    }
  } else {
    fallbackDel(phone);
  }
};

const setRefreshToken = async (userId, token, ttlSeconds = 604800) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.setex(`refresh:${userId}`, ttlSeconds, token);
    } catch {
      fallbackSet(`refresh:${userId}`, token, ttlSeconds);
    }
  } else {
    fallbackSet(`refresh:${userId}`, token, ttlSeconds);
  }
};

const getRefreshToken = async (userId) => {
  if (redis && REDIS_ENABLED) {
    try {
      return await redis.get(`refresh:${userId}`);
    } catch {
      return fallbackGet(`refresh:${userId}`);
    }
  }
  return fallbackGet(`refresh:${userId}`);
};

const fallbackStore = new Map();

const fallbackSet = (key, value, ttlSeconds) => {
  fallbackStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

const fallbackGet = (key) => {
  const stored = fallbackStore.get(key);
  if (!stored) return null;
  if (Date.now() > stored.expiresAt) {
    fallbackStore.delete(key);
    return null;
  }
  return stored.value;
};

const fallbackDel = (key) => {
  fallbackStore.delete(key);
};

const delRefreshToken = async (userId) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.del(`refresh:${userId}`);
    } catch {
      fallbackDel(`refresh:${userId}`);
    }
  } else {
    fallbackDel(`refresh:${userId}`);
  }
};

const setOtpAttempts = async (phone, attempts, ttlSeconds = 1800) => {
  const val = String(attempts);
  if (redis && REDIS_ENABLED) {
    try {
      await redis.setex(`otp_attempts:${phone}`, ttlSeconds, val);
    } catch {
      fallbackSet(`otp_attempts:${phone}`, val, ttlSeconds);
    }
  } else {
    fallbackSet(`otp_attempts:${phone}`, val, ttlSeconds);
  }
};

const getOtpAttempts = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      const val = await redis.get(`otp_attempts:${phone}`);
      return val ? parseInt(val) : 0;
    } catch {
      return parseInt(fallbackGet(`otp_attempts:${phone}`) || '0');
    }
  }
  return parseInt(fallbackGet(`otp_attempts:${phone}`) || '0');
};

const delOtpAttempts = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.del(`otp_attempts:${phone}`);
    } catch {
      fallbackDel(`otp_attempts:${phone}`);
    }
  } else {
    fallbackDel(`otp_attempts:${phone}`);
  }
};

const setOtpLocked = async (phone, ttlSeconds = 1800) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.setex(`otp_locked:${phone}`, ttlSeconds, '1');
    } catch {
      fallbackSet(`otp_locked:${phone}`, '1', ttlSeconds);
    }
  } else {
    fallbackSet(`otp_locked:${phone}`, '1', ttlSeconds);
  }
};

const getOtpLocked = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      return await redis.get(`otp_locked:${phone}`);
    } catch {
      return fallbackGet(`otp_locked:${phone}`);
    }
  }
  return fallbackGet(`otp_locked:${phone}`);
};

const delOtpLocked = async (phone) => {
  if (redis && REDIS_ENABLED) {
    try {
      await redis.del(`otp_locked:${phone}`);
    } catch {
      fallbackDel(`otp_locked:${phone}`);
    }
  } else {
    fallbackDel(`otp_locked:${phone}`);
  }
};

module.exports = { setOtp, getOtp, delOtp, setRefreshToken, getRefreshToken, delRefreshToken, redis, setOtpAttempts, getOtpAttempts, delOtpAttempts, setOtpLocked, getOtpLocked, delOtpLocked };
