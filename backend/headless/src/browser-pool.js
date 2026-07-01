const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('./config');
const proxyManager = require('./utils/proxy');
const logger = require('./utils/logger');

puppeteer.use(StealthPlugin());

class BrowserPool {
  constructor() {
    this.browsers = [];
    this.minSize = config.browserPool.min;
    this.maxSize = config.browserPool.max;
  }

  async initialize() {
    for (let i = 0; i < this.minSize; i++) {
      await this.createBrowser();
    }
    logger.info(`Browser pool initialized with ${this.browsers.length} browsers`);
  }

  async createBrowser() {
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1366,768',
      ...proxyManager.getLaunchArgs(),
    ];

    try {
      const browser = await puppeteer.launch({
        executablePath: config.puppeteer.executablePath,
        headless: config.puppeteer.headless,
        args: launchArgs,
        defaultViewport: { width: 1366, height: 768 },
      });

      const entry = { browser, inUse: false, createdAt: Date.now() };
      this.browsers.push(entry);
      logger.info('Browser created');
      return entry;
    } catch (err) {
      logger.error('Failed to create browser', err);
      throw err;
    }
  }

  async acquire() {
    const available = this.browsers.find(b => !b.inUse);
    if (available) {
      available.inUse = true;
      return available.browser;
    }

    if (this.browsers.length < this.maxSize) {
      const entry = await this.createBrowser();
      entry.inUse = true;
      return entry.browser;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.acquire();
  }

  async release(browser) {
    const entry = this.browsers.find(b => b.browser === browser);
    if (entry) {
      entry.inUse = false;
    }
  }

  async closeAll() {
    for (const entry of this.browsers) {
      try {
        await entry.browser.close();
      } catch (err) {
        logger.error('Error closing browser', err);
      }
    }
    this.browsers = [];
    logger.info('All browsers closed');
  }

  async healthCheck() {
    const alive = [];
    for (const entry of this.browsers) {
      try {
        const pages = await entry.browser.pages();
        alive.push({ pages: pages.length, inUse: entry.inUse });
      } catch {
        this.browsers = this.browsers.filter(b => b !== entry);
        await this.createBrowser();
      }
    }
    return { total: this.browsers.length, inUse: alive.filter(a => a.inUse).length, alive };
  }
}

module.exports = new BrowserPool();
