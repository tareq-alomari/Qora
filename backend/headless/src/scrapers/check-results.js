const config = require('../config');
const browserPool = require('../browser-pool');
const captchaHandler = require('../captcha-handler');
const logger = require('../utils/logger');

class ResultChecker {
  async check(confirmationNumber, lastName, birthYear) {
    const browser = await browserPool.acquire();
    let page = null;

    try {
      page = await browser.newPage();
      await page.setDefaultTimeout(config.puppeteer.timeout);
      await page.goto(config.dvLottery.escUrl, { waitUntil: 'networkidle2' });

      await this.fillCheckForm(page, confirmationNumber, lastName, birthYear);
      await captchaHandler.solve(page);

      const submitBtn = await page.$('#ctl00_ContentPlaceHolder1_btnSubmit, input[type="submit"]');
      if (!submitBtn) throw new Error('CHECK_SUBMIT_BUTTON_NOT_FOUND');
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

      const result = await this.parseResult(page);

      await page.close();
      await browserPool.release(browser);

      return result;
    } catch (err) {
      if (page) {
        await page.screenshot({ path: `/tmp/result_failure_${Date.now()}.png` }).catch(() => {});
        await page.close().catch(() => {});
      }
      await browserPool.release(browser);
      throw err;
    }
  }

  async recoverConfirmationNumber(data) {
    const browser = await browserPool.acquire();
    let page = null;

    try {
      page = await browser.newPage();
      await page.setDefaultTimeout(config.puppeteer.timeout);
      await page.goto(config.dvLottery.recoveryUrl, { waitUntil: 'networkidle2' });

      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtLastName', data.last_name);
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtFirstName', data.first_name);
      if (data.middle_name) {
        await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtMiddleName', data.middle_name);
      }
      await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlBirthMonth', this.padMonth(data.birth_date));
      await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlBirthDay', this.padDay(data.birth_date));
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtBirthYear', data.birth_year);
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtEmail', data.email);

      await captchaHandler.solve(page);

      const submitBtn = await page.$('#ctl00_ContentPlaceHolder1_btnSubmit, input[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      }

      const confElement = await page.$('span[id*="Confirmation"], .confirmation-number');
      const confText = confElement ? await page.evaluate(el => el.textContent, confElement) : null;
      const match = confText ? confText.match(/\b(\d{4}[A-Z0-9]{12})\b/) : null;

      await page.close();
      await browserPool.release(browser);

      return match ? match[1] : null;
    } catch (err) {
      if (page) {
        await page.close().catch(() => {});
      }
      await browserPool.release(browser);
      throw err;
    }
  }

  async fillCheckForm(page, confirmationNumber, lastName, birthYear) {
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtConfirmationNumber', confirmationNumber);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtLastName', lastName);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtYearOfBirth', String(birthYear));
  }

  async parseResult(page) {
    const bodyText = await page.evaluate(() => document.body.innerText);

    if (bodyText.includes('has been selected') || bodyText.includes('Congratulations')) {
      const caseNumberMatch = bodyText.match(/Case Number[:\s]*([A-Z0-9]+)/i);
      return {
        selected: true,
        case_number: caseNumberMatch ? caseNumberMatch[1] : null,
        raw_text: bodyText.substring(0, 500),
      };
    }

    if (bodyText.includes('has not been selected') || bodyText.includes('not selected')) {
      return { selected: false, raw_text: bodyText.substring(0, 200) };
    }

    if (bodyText.includes('not valid') || bodyText.includes('Information entered is not valid')) {
      return { selected: false, error: 'INVALID_ENTRY_DATA', raw_text: bodyText.substring(0, 200) };
    }

    logger.warn('Could not determine result from page text');
    return { selected: false, error: 'UNKNOWN_RESULT', raw_text: bodyText.substring(0, 500) };
  }

  async typeField(page, id, value) {
    try {
      const el = await page.$(`#${id}, input[name$="${id}"]`);
      if (el) {
        await el.click({ clickCount: 3 });
        await el.type(String(value), { delay: 20 });
      }
    } catch (err) {
      logger.warn(`Could not fill field ${id}: ${err.message}`);
    }
  }

  async selectDropdown(page, id, value) {
    try {
      await page.select(`#${id}`, String(value));
    } catch (err) {
      logger.warn(`Could not select dropdown ${id}: ${err.message}`);
    }
  }

  padMonth(dateStr) {
    if (!dateStr) return '01';
    const d = new Date(dateStr);
    return String(d.getMonth() + 1).padStart(2, '0');
  }

  padDay(dateStr) {
    if (!dateStr) return '01';
    const d = new Date(dateStr);
    return String(d.getDate()).padStart(2, '0');
  }
}

module.exports = new ResultChecker();
