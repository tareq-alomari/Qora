const multer = require('multer');
const sizeOf = require('image-size');
const { AppError } = require('./error-handler');

const storage = multer.memoryStorage();

const PHOTO_MAX_BYTES = 240 * 1024;
const PASSPORT_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_MIN_PX = 600;
const PHOTO_MAX_PX = 1200;

const photoFileFilter = (req, file, cb) => {
  if (file.mimetype !== 'image/jpeg') {
    return cb(new AppError('Photo must be JPEG format', 400, 'INVALID_FILE_TYPE'));
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return cb(new AppError(`Photo must be ≤240KB (got ${(file.size / 1024).toFixed(0)}KB)`, 400, 'PHOTO_TOO_LARGE'));
  }
  try {
    const dims = sizeOf(file.buffer);
    if (dims.width !== dims.height || dims.width < PHOTO_MIN_PX || dims.width > PHOTO_MAX_PX) {
      return cb(new AppError(`Photo must be square 600-1200px (got ${dims.width}x${dims.height})`, 400, 'INVALID_PHOTO_DIMENSIONS'));
    }
  } catch (e) {
    return cb(new AppError('Could not read photo dimensions', 400, 'INVALID_PHOTO'));
  }
  cb(null, true);
};

const receiptFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG/PNG files allowed', 400, 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

const passportFileFilter = (req, file, cb) => {
  if (file.mimetype !== 'image/jpeg') {
    return cb(new AppError('Passport scan must be JPEG format', 400, 'INVALID_FILE_TYPE'));
  }
  if (file.size > PASSPORT_MAX_BYTES) {
    return cb(new AppError(`Passport scan must be ≤5MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB)`, 400, 'FILE_TOO_LARGE'));
  }
  cb(null, true);
};

const uploadPhoto = multer({ storage, fileFilter: photoFileFilter, limits: { fileSize: PHOTO_MAX_BYTES, files: 1 } });
const uploadReceipt = multer({ storage, fileFilter: receiptFileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const uploadPassport = multer({ storage, fileFilter: passportFileFilter, limits: { fileSize: PASSPORT_MAX_BYTES, files: 1 } });

module.exports = { uploadPhoto, uploadReceipt, uploadPassport };
