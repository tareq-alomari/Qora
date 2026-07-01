const config = require('../config');
const browserPool = require('../browser-pool');
const captchaHandler = require('../captcha-handler');
const logger = require('../utils/logger');

class EntrySubmitter {
  constructor() {
    this.retryCount = 0;
  }

  async submit(orderData) {
    const browser = await browserPool.acquire();
    let page = null;

    try {
      page = await browser.newPage();
      await page.setDefaultTimeout(config.puppeteer.timeout);
      await page.goto(config.dvLottery.entryUrl, { waitUntil: 'networkidle2' });

      const currentUrl = page.url();
      if (currentUrl.includes('countdown') || currentUrl.includes('inactive')) {
        throw new Error('DV LOTTERY SITE INACTIVE - registration window closed');
      }

      await this.fillPartOne(page, orderData.personal_data);
      await this.uploadPhoto(page, orderData.photo_path, orderData.photo_buffer);
      await this.fillAddress(page, orderData.address);
      await this.fillContact(page, orderData.contact);
      await this.fillEducation(page, orderData.education_level);
      await this.fillMaritalStatus(page, orderData.marital_status, orderData.spouse_data);
      await this.fillChildren(page, orderData.children_data);

      await this.solveCaptcha(page);

      await this.reviewAndSubmit(page);

      const confirmationNumber = await this.extractConfirmation(page);

      await page.close();
      await browserPool.release(browser);

      return { success: true, confirmation_number: confirmationNumber };
    } catch (err) {
      await page.screenshot({ path: `/tmp/entry_failure_${Date.now()}.png` }).catch(() => {});
      await page.close().catch(() => {});
      await browserPool.release(browser);
      throw err;
    }
  }

  async fillPartOne(page, data) {
    logger.info('Filling Part One: Personal Information');
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtLastName', data.last_name);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtFirstName', data.first_name);
    if (data.middle_name) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtMiddleName', data.middle_name);
    }

    const gender = data.gender === 'male' ? 'Male' : 'Female';
    await page.evaluate((v) => {
      const radio = document.querySelector(`input[name="ctl00$ContentPlaceHolder1$rblGender"][value="${v}"]`);
      if (radio) radio.click();
    }, gender);

    await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlBirthMonth', this.padMonth(data.birth_date));
    await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlBirthDay', this.padDay(data.birth_date));
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtBirthYear', data.birth_year);

    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtCityOfBirth', data.birth_city);
    await this.selectDropdownByLabel(page, 'ctl00_ContentPlaceHolder1_ddlCountryOfBirth', data.birth_country);
    await this.selectDropdownByLabel(page, 'ctl00_ContentPlaceHolder1_ddlEligibilityCountry', data.country_of_eligibility);
  }

  async uploadPhoto(page, photoPath, photoBuffer) {
    logger.info('Uploading photo');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('PHOTO_INPUT_NOT_FOUND');
    if (photoBuffer) {
      await fileInput.uploadFile({ contentType: 'image/jpeg', buffer: photoBuffer });
    } else if (photoPath) {
      await fileInput.uploadFile(photoPath);
    }
    await page.waitForTimeout(2000);
  }

  async fillAddress(page, data) {
    logger.info('Filling address information');
    if (data.in_care_of) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtInCareOf', data.in_care_of);
    }
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtAddress1', data.address_line1 || data.street);
    if (data.address_line2) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtAddress2', data.address_line2);
    }
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtCity', data.city);
    if (data.district) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtDistrict', data.district);
    }
    if (data.postal_code) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtPostalCode', data.postal_code);
    }
    await this.selectDropdownByLabel(page, 'ctl00_ContentPlaceHolder1_ddlCountry', data.country || 'YEMEN');
  }

  async fillContact(page, data) {
    logger.info('Filling contact information');
    if (data.phone) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtPhone', data.phone);
    }
    if (data.email) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtEmail', data.email);
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtConfirmEmail', data.email);
    }
  }

  async fillEducation(page, level) {
    logger.info(`Filling education level: ${level}`);
    const educationMap = {
      '1': 'Primary school only',
      '2': 'Some high school, no diploma',
      '3': 'High school diploma',
      '4': 'Vocational school',
      '5': 'Some university courses',
      '6': 'University degree',
      '7': 'Some graduate-level courses',
      '8': 'Master\'s degree',
      '9': 'Some doctoral-level courses',
      '10': 'Doctorate',
    };
    const label = educationMap[String(level)];
    if (label) {
      await this.selectDropdownByLabel(page, 'ctl00_ContentPlaceHolder1_ddlEducation', label);
    }
  }

  async fillMaritalStatus(page, status, spouseData) {
    logger.info(`Filling marital status: ${status}`);
    const statusMap = {
      single: 'Unmarried',
      married: 'Married and my spouse is NOT a U.S. citizen or U.S. LPR',
      married_usc_lpr: 'Married and my spouse IS a U.S. citizen or U.S. LPR',
      divorced: 'Divorced',
      widowed: 'Widowed',
      legally_separated: 'Legally separated',
    };
    const label = statusMap[status];
    if (!label) throw new Error(`Unknown marital status: ${status}`);

    await page.evaluate((v) => {
      const radio = document.querySelector(`input[name="ctl00$ContentPlaceHolder1$rblMaritalStatus"][value="${v}"]`);
      if (radio) radio.click();
    }, label);

    if (status === 'married' && spouseData) {
      await this.fillSpouseData(page, spouseData);
    }
  }

  async fillSpouseData(page, data) {
    logger.info('Filling spouse information');
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtSpouseLastName', data.last_name);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtSpouseFirstName', data.first_name);
    if (data.middle_name) {
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtSpouseMiddleName', data.middle_name);
    }
    await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlSpouseBirthMonth', this.padMonth(data.birth_date));
    await this.selectDropdown(page, 'ctl00_ContentPlaceHolder1_ddlSpouseBirthDay', this.padDay(data.birth_date));
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtSpouseBirthYear', data.birth_year);
    const gender = data.gender === 'male' ? 'Male' : 'Female';
    await page.evaluate((v) => {
      const radio = document.querySelector(`input[name="ctl00$ContentPlaceHolder1$rblSpouseGender"][value="${v}"]`);
      if (radio) radio.click();
    }, gender);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtSpouseCityOfBirth', data.birth_city);
    await this.selectDropdownByLabel(page, 'ctl00_ContentPlaceHolder1_ddlSpouseCountryOfBirth', data.birth_country);

    if (data.photo_buffer || data.photo_path) {
      const spouseFileInput = await page.$('input[type="file"][id*="Spouse"]');
      if (spouseFileInput) {
        if (data.photo_buffer) {
          await spouseFileInput.uploadFile({ contentType: 'image/jpeg', buffer: data.photo_buffer });
        } else {
          await spouseFileInput.uploadFile(data.photo_path);
        }
      }
    }
  }

  async fillChildren(page, children) {
    if (!children || children.length === 0) {
      logger.info('No children to enter');
      await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtNumChildren', '0');
      return;
    }

    logger.info(`Filling ${children.length} children`);
    await this.typeField(page, 'ctl00_ContentPlaceHolder1_txtNumChildren', String(children.length));

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const idx = i + 1;
      await this.typeField(page, `ctl00_ContentPlaceHolder1_txtChild${idx}LastName`, child.last_name);
      await this.typeField(page, `ctl00_ContentPlaceHolder1_txtChild${idx}FirstName`, child.first_name);
      if (child.middle_name) {
        await this.typeField(page, `ctl00_ContentPlaceHolder1_txtChild${idx}MiddleName`, child.middle_name);
      }
      await this.selectDropdown(page, `ctl00_ContentPlaceHolder1_ddlChild${idx}BirthMonth`, this.padMonth(child.birth_date));
      await this.selectDropdown(page, `ctl00_ContentPlaceHolder1_ddlChild${idx}BirthDay`, this.padDay(child.birth_date));
      await this.typeField(page, `ctl00_ContentPlaceHolder1_txtChild${idx}BirthYear`, child.birth_year);
      const gender = child.gender === 'male' ? 'Male' : 'Female';
      await page.evaluate((g, i) => {
        const radio = document.querySelector(`input[name="ctl00$ContentPlaceHolder1$rblChild${i}Gender"][value="${g}"]`);
        if (radio) radio.click();
      }, gender, idx);

      if (child.photo_buffer || child.photo_path) {
        const fileInput = await page.$(`input[type="file"][id*="Child${idx}"]`);
        if (fileInput) {
          if (child.photo_buffer) {
            await fileInput.uploadFile({ contentType: 'image/jpeg', buffer: child.photo_buffer });
          } else {
            await fileInput.uploadFile(child.photo_path);
          }
        }
      }
    }
  }

  async solveCaptcha(page) {
    logger.info('Solving CAPTCHA');
    const nextButton = await page.$('#ctl00_ContentPlaceHolder1_btnContinue, input[type="submit"][value*="Continue"]');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(3000);
    }
    await captchaHandler.solve(page);
  }

  async reviewAndSubmit(page) {
    logger.info('Reviewing and submitting entry');
    const submitBtn = await page.$('#ctl00_ContentPlaceHolder1_btnSubmit, input[type="submit"][value*="Submit"]');
    if (!submitBtn) throw new Error('SUBMIT_BUTTON_NOT_FOUND');
    await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
  }

  async extractConfirmation(page) {
    logger.info('Extracting confirmation number');
    const confElement = await page.$('#ctl00_ContentPlaceHolder1_lblConfirmationNumber, .confirmation-number, span[id*="Confirmation"]');
    if (!confElement) {
      await page.screenshot({ path: `/tmp/no_confirmation_${Date.now()}.png` });
      throw new Error('CONFIRMATION_NUMBER_NOT_FOUND');
    }
    const confText = await page.evaluate(el => el.textContent, confElement);
    const match = confText.match(/\b(\d{4}[A-Z0-9]{12})\b/);
    if (!match) {
      logger.warn(`Could not parse confirmation number from: ${confText}`);
      return confText.trim();
    }
    return match[1];
  }

  async typeField(page, id, value) {
    try {
      const el = await page.$(`#${id}, input[name$="${id}"]`);
      if (el) {
        await el.click({ clickCount: 3 });
        await el.type(String(value), { delay: 30 });
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

  async selectDropdownByLabel(page, id, label) {
    try {
      const el = await page.$(`#${id}`);
      if (!el) return;
      const options = await page.$$eval(`#${id} option`, (opts, lbl) => {
        const opt = opts.find(o => o.textContent.trim() === lbl || o.value === lbl);
        return opt ? opt.value : null;
      }, label);
      if (options) {
        await page.select(`#${id}`, options);
      }
    } catch (err) {
      logger.warn(`Could not select by label ${id}: ${err.message}`);
    }
  }

  padMonth(dateStr) {
    const d = new Date(dateStr);
    return String(d.getMonth() + 1).padStart(2, '0');
  }

  padDay(dateStr) {
    const d = new Date(dateStr);
    return String(d.getDate()).padStart(2, '0');
  }
}

module.exports = new EntrySubmitter();
