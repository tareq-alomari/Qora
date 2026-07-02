describe('ProxyManager', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    const proxyManager = require('../src/utils/proxy');
    proxyManager.stopRotation();
  });

  test('parses proxy with credentials', () => {
    process.env.PROXY_LIST = 'http://user:pass@proxy.example.com:8080';
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');
    const proxy = proxyManager.getCurrentProxy();

    expect(proxy).toEqual({
      protocol: 'http',
      host: 'proxy.example.com',
      port: 8080,
      credentials: 'user:pass',
    });
  });

  test('parses proxy without credentials', () => {
    process.env.PROXY_LIST = 'http://proxy.example.com:8080';
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');
    const proxy = proxyManager.getCurrentProxy();

    expect(proxy).toEqual({
      protocol: 'http',
      host: 'proxy.example.com',
      port: 8080,
    });
  });

  test('returns null when no proxies configured', () => {
    delete process.env.PROXY_LIST;
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');
    const proxy = proxyManager.getCurrentProxy();

    expect(proxy).toBeNull();
  });

  test('generates correct launch args with proxy', () => {
    process.env.PROXY_LIST = 'http://proxy.example.com:3128';
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');
    const args = proxyManager.getLaunchArgs();

    expect(args).toEqual(['--proxy-server=http://proxy.example.com:3128']);
  });

  test('generates empty launch args without proxy', () => {
    delete process.env.PROXY_LIST;
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');
    const args = proxyManager.getLaunchArgs();

    expect(args).toEqual([]);
  });

  test('rotates through proxies', () => {
    process.env.PROXY_LIST = 'http://proxy1:8080,http://proxy2:8080,http://proxy3:8080';
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');

    const first = proxyManager.getCurrentProxy();
    proxyManager.rotate();
    const second = proxyManager.getCurrentProxy();
    proxyManager.rotate();
    const third = proxyManager.getCurrentProxy();
    proxyManager.rotate();
    const fourth = proxyManager.getCurrentProxy();

    expect(first.host).toBe('proxy1');
    expect(second.host).toBe('proxy2');
    expect(third.host).toBe('proxy3');
    expect(fourth.host).toBe('proxy1');
  });

  test('starts and stops rotation timer', () => {
    jest.useFakeTimers();
    delete process.env.PROXY_LIST;
    process.env.PROXY_LIST = 'http://proxy1:8080,http://proxy2:8080';
    process.env.PROXY_ROTATION_INTERVAL = '1000';
    jest.resetModules();

    const proxyManager = require('../src/utils/proxy');

    proxyManager.startRotation();
    const first = proxyManager.getCurrentProxy();
    expect(first.host).toBe('proxy1');

    jest.advanceTimersByTime(1000);
    const second = proxyManager.getCurrentProxy();
    expect(second.host).toBe('proxy2');

    proxyManager.stopRotation();
    jest.useRealTimers();
  });
});
