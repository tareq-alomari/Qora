const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT = 'qor3a-2026-encryption';

let cachedKey = null;

const getKey = () => {
  const keyStr = process.env.ENCRYPTION_KEY;
  if (!keyStr) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  if (cachedKey) return cachedKey;
  cachedKey = crypto.scryptSync(keyStr, SALT, KEY_LENGTH);
  return cachedKey;
};

const clearKeyCache = () => {
  cachedKey = null;
};

const encrypt = (plaintext) => {
  if (plaintext === null || plaintext === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  const key = getKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) return null;
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
};

const encryptBuffer = (buffer) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const prefix = Buffer.concat([iv, authTag]);
  return Buffer.concat([prefix, encrypted]);
};

const decryptBuffer = (buffer) => {
  const key = getKey();
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = buffer.subarray(IV_LENGTH + 16);
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch (err) {
    return null;
  }
};

const encryptColumns = (data, columns) => {
  if (!data) return data;
  const result = { ...data };
  for (const col of columns) {
    if (result[col] !== undefined && result[col] !== null) {
      result[col] = encrypt(result[col]);
    }
  }
  return result;
};

const decryptColumns = (data, columns) => {
  if (!data) return data;
  const result = { ...data };
  for (const col of columns) {
    if (result[col]) {
      const decrypted = decrypt(result[col]);
      if (decrypted !== null) {
        result[col] = decrypted;
      }
    }
  }
  return result;
};

module.exports = {
  encrypt,
  decrypt,
  encryptBuffer,
  decryptBuffer,
  encryptColumns,
  decryptColumns,
  clearKeyCache,
};
