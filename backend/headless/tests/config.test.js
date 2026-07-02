describe('Headless Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('uses default values when env vars are missing', () => {
    delete process.env.API_BASE_URL;
    delete process.env.REDIS_HOST;
    delete process.env.PUPPETEER_TIMEOUT;

    const config = require('../src/config');

    expect(config.api.baseUrl).toBe('http://localhost:3000/api/v1');
    expect(config.redis.host).toBe('localhost');
    expect(config.redis.port).toBe(6379);
    expect(config.puppeteer.timeout).toBe(30000);
    expect(config.puppeteer.headless).toBe(true);
    expect(config.dvLottery.entryUrl).toBe('https://dvprogram.state.gov/AES/');
    expect(config.dvLottery.maxRetries).toBe(3);
  });

  test('reads environment variables when set', () => {
    process.env.API_BASE_URL = 'http://api.example.com/v1';
    process.env.API_KEY = 'test-key-123';
    process.env.REDIS_HOST = 'redis.example.com';
    process.env.REDIS_PORT = '6380';
    process.env.PUPPETEER_HEADLESS = 'false';
    process.env.BROWSER_POOL_MIN = '2';
    process.env.BROWSER_POOL_MAX = '10';

    const config = require('../src/config');

    expect(config.api.baseUrl).toBe('http://api.example.com/v1');
    expect(config.api.key).toBe('test-key-123');
    expect(config.redis.host).toBe('redis.example.com');
    expect(config.redis.port).toBe(6380);
    expect(config.puppeteer.headless).toBe(false);
    expect(config.browserPool.min).toBe(2);
    expect(config.browserPool.max).toBe(10);
  });

  test('parses proxy list correctly', () => {
    process.env.PROXY_LIST = 'http://user1:pass1@proxy1:8080,http://user2:pass2@proxy2:8080';

    const config = require('../src/config');

    expect(config.proxy.list).toHaveLength(2);
    expect(config.proxy.list[0]).toBe('http://user1:pass1@proxy1:8080');
    expect(config.proxy.list[1]).toBe('http://user2:pass2@proxy2:8080');
  });

  test('handles empty proxy list', () => {
    delete process.env.PROXY_LIST;

    const config = require('../src/config');

    expect(config.proxy.list).toEqual([]);
  });

  test('handles missing CAPTCHA API key gracefully', () => {
    delete process.env.CAPTCHA_API_KEY;

    const config = require('../src/config');

    expect(config.captcha.apiKey).toBe('');
  });
});
