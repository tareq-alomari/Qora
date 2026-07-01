const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const save = async (buffer, filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, buffer);
  logger.info(`File saved: ${fullPath}`);
  return filePath;
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

module.exports = { save, getUrl, remove };
