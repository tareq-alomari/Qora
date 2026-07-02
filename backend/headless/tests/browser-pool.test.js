jest.mock('../src/utils/proxy', () => ({
  getLaunchArgs: jest.fn().mockReturnValue([]),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('BrowserPool', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('initializes with minimum browser count', async () => {
    const mockBrowser = { close: jest.fn(), pages: jest.fn().mockResolvedValue([]) };
    const puppeteer = require('puppeteer-extra');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    const browserPool = require('../src/browser-pool');
    await browserPool.initialize();

    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  test('acquires and releases browser', async () => {
    const mockBrowser = { close: jest.fn(), pages: jest.fn().mockResolvedValue([]) };
    const puppeteer = require('puppeteer-extra');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    const browserPool = require('../src/browser-pool');
    await browserPool.initialize();

    const browser = await browserPool.acquire();
    expect(browser).toBe(mockBrowser);

    browserPool.release(mockBrowser);
    const reacquired = await browserPool.acquire();
    expect(reacquired).toBe(mockBrowser);
  });

  test('returns health status', async () => {
    const mockBrowser = { close: jest.fn(), pages: jest.fn().mockResolvedValue([]) };
    const puppeteer = require('puppeteer-extra');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    const browserPool = require('../src/browser-pool');
    await browserPool.initialize();

    const health = await browserPool.healthCheck();
    expect(health.total).toBe(1);
    expect(health.inUse).toBe(0);
  });

  test('closes all browsers', async () => {
    const mockBrowser = { close: jest.fn(), pages: jest.fn().mockResolvedValue([]) };
    const puppeteer = require('puppeteer-extra');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    const browserPool = require('../src/browser-pool');
    await browserPool.initialize();

    await browserPool.closeAll();
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(browserPool.browsers).toHaveLength(0);
  });

  test('creates new browser when pool is not full', async () => {
    const mockBrowser = { close: jest.fn(), pages: jest.fn().mockResolvedValue([]) };
    const puppeteer = require('puppeteer-extra');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    const browserPool = require('../src/browser-pool');

    const browser = await browserPool.acquire();
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    expect(browser).toBe(mockBrowser);
  });
});
