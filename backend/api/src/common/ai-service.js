const fetch = require('node-fetch');
const FormData = require('form-data');
const { logger } = require('./logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = parseInt(process.env.AI_VALIDATION_TIMEOUT_MS) || 10000;

const validatePhoto = async (photoBuffer, filename = 'photo.jpg') => {
  try {
    const form = new FormData();
    form.append('photo', photoBuffer, { filename, contentType: 'image/jpeg' });

    const response = await fetch(`${AI_SERVICE_URL}/api/v1/validate`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn(`AI service returned ${response.status}`);
      return { success: false, error: 'AI_SERVICE_ERROR' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    if (err.name === 'AbortError') {
      logger.warn(`AI service timeout after ${TIMEOUT_MS}ms`);
      return { success: false, error: 'AI_SERVICE_TIMEOUT' };
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.type === 'system') {
      logger.warn(`AI service unreachable at ${AI_SERVICE_URL}: ${err.message}`);
      return { success: false, error: 'AI_SERVICE_UNAVAILABLE' };
    }
    logger.error(`AI service error: ${err.message}`);
    return { success: false, error: 'AI_SERVICE_ERROR' };
  }
};

module.exports = { validatePhoto };
