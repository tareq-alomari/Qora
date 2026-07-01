const config = require('../config');
const logger = require('../utils/logger');

class CaptchaHandler {
  constructor() {
    this.apiKey = config.captcha.apiKey;
    this.baseUrl = config.captcha.baseUrl;
  }

  async solve(page) {
    if (this.apiKey) {
      return this.solveWith2Captcha(page);
    }
    logger.warn('No CAPTCHA API key configured, falling back to manual queue');
    return this.solveManually(page);
  }

  async solveWith2Captcha(page) {
    const captchaImage = await page.$('img[src*="captcha"], img[id*="captcha"], #captcha_img');
    if (!captchaImage) {
      logger.error('CAPTCHA image not found on page');
      throw new Error('CAPTCHA_IMAGE_NOT_FOUND');
    }

    const src = await captchaImage.getProperty('src');
    const captchaUrl = await src.jsonValue();

    logger.info('Sending CAPTCHA to 2Captcha');
    const inRes = await fetch(`${this.baseUrl}/in.php`, {
      method: 'POST',
      body: new URLSearchParams({
        key: this.apiKey,
        method: 'base64',
        body: captchaUrl,
        json: '1',
      }),
    });
    const inData = await inRes.json();

    if (inData.status !== 1) {
      logger.error('2Captcha in.php failed', inData);
      throw new Error(`CAPTCHA_UPLOAD_FAILED: ${inData.request}`);
    }

    const requestId = inData.request;
    const timeout = config.captcha.timeout * 1000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 5000));
      const resRes = await fetch(`${this.baseUrl}/res.php`, {
        method: 'POST',
        body: new URLSearchParams({
          key: this.apiKey,
          action: 'get',
          id: requestId,
          json: '1',
        }),
      });
      const resData = await resRes.json();

      if (resData.status === 1) {
        logger.info('CAPTCHA solved successfully');
        const textInput = await page.$('input[name*="captcha"], input[id*="captcha"], #captcha_text');
        if (textInput) {
          await textInput.type(resData.request);
          return resData.request;
        }
        return resData.request;
      }

      if (resData.request !== 'CAPCHA_NOT_READY') {
        logger.error('2Captcha res.php error', resData);
        throw new Error(`CAPTCHA_SOLVE_FAILED: ${resData.request}`);
      }
    }

    throw new Error('CAPTCHA_TIMEOUT');
  }

  async solveManually(page) {
    const screenshotPath = `/tmp/captcha_${Date.now()}.png`;
    const captchaImage = await page.$('img[src*="captcha"], img[id*="captcha"], #captcha_img');
    if (captchaImage) {
      await captchaImage.screenshot({ path: screenshotPath });
    } else {
      await page.screenshot({ path: screenshotPath });
    }
    logger.info(`CAPTCHA screenshot saved: ${screenshotPath}. Manual intervention required.`);

    const existing = await page.$('#captcha_text, input[name*="captcha"]');
    if (existing) {
      const textarea = await page.$('textarea, input[type="text"]:not([name*="email"]):not([name*="phone"])');
      if (textarea) {
        await textarea.focus();
      }
    }
    return null;
  }
}

module.exports = new CaptchaHandler();
