const { logger } = require('./logger');

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

const sendMessage = async (to, templateName, parameters = []) => {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WhatsApp not configured, skipping message');
    return false;
  }

  try {
    const fetch = require('node-fetch');
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/^967/, '967'),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'ar' },
          components: parameters.length > 0 ? [{
            type: 'body',
            parameters: parameters.map(p => ({ type: 'text', text: p })),
          }] : [],
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.warn(`WhatsApp API error: ${err}`);
      return false;
    }

    logger.info(`WhatsApp message sent to ${to}: ${templateName}`);
    return true;
  } catch (err) {
    logger.warn(`WhatsApp send failed: ${err.message}`);
    return false;
  }
};

const sendOtp = async (phone, otp) => {
  return sendMessage(phone, 'qor3a_otp', [otp]);
};

const sendStatusUpdate = async (phone, status, orderNumber) => {
  const templates = {
    payment_confirmed: { name: 'qor3a_payment_confirmed', params: [orderNumber] },
    approved: { name: 'qor3a_approved', params: [orderNumber] },
    submitted: { name: 'qor3a_submitted', params: [orderNumber] },
    completed: { name: 'qor3a_completed', params: [orderNumber] },
    cancelled: { name: 'qor3a_cancelled', params: [orderNumber] },
    photo_rejected: { name: 'qor3a_photo_rejected', params: [orderNumber] },
    needs_correction: { name: 'qor3a_needs_correction', params: [orderNumber] },
    winner: { name: 'qor3a_winner', params: [orderNumber] },
    loser: { name: 'qor3a_loser', params: [orderNumber] },
  };

  const tmpl = templates[status];
  if (!tmpl) return false;

  return sendMessage(phone, tmpl.name, tmpl.params);
};

module.exports = { sendMessage, sendOtp, sendStatusUpdate };
