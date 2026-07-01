const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logger } = require('./logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const ENCRYPTION_ENABLED = process.env.FILE_ENCRYPTION_ENABLED === 'true';

let encryptionKey = null;

const getFileKey = () => {
  if (encryptionKey) return encryptionKey;
  const keyStr = process.env.ENCRYPTION_KEY;
  if (!keyStr) {
    throw new Error('ENCRYPTION_KEY is required for file encryption');
  }
  encryptionKey = crypto.scryptSync(keyStr, 'qor3a-file-encryption', 32);
  return encryptionKey;
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const encryptBuffer = (buffer) => {
  const key = getFileKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
};

const decryptBuffer = (buffer) => {
  const key = getFileKey();
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

const save = async (buffer, filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  ensureDir(path.dirname(fullPath));
  const data = ENCRYPTION_ENABLED ? encryptBuffer(buffer) : buffer;
  fs.writeFileSync(fullPath, data);
  logger.info(`File saved: ${fullPath}${ENCRYPTION_ENABLED ? ' (encrypted)' : ''}`);
  return filePath;
};

const read = async (filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath);
  if (ENCRYPTION_ENABLED) {
    return decryptBuffer(data);
  }
  return data;
};

const getUrl = (filePath) => {
  if (process.env.S3_ENDPOINT) {
    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filePath}`;
  }
  return `/uploads/${filePath}`;
};

const remove = async (filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    logger.info(`File deleted: ${fullPath}`);
  }
};

module.exports = { save, read, getUrl, remove };
