const config = require('../config');

class ProxyManager {
  constructor() {
    this.proxies = config.proxy.list;
    this.currentIndex = 0;
    this.rotationTimer = null;
  }

  startRotation() {
    if (this.proxies.length < 2) return;
    this.rotationTimer = setInterval(() => {
      this.rotate();
    }, config.proxy.rotationInterval);
  }

  stopRotation() {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  rotate() {
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
  }

  getCurrentProxy() {
    if (this.proxies.length === 0) return null;
    const proxy = this.proxies[this.currentIndex];
    const parts = proxy.split('://');
    if (parts.length < 2) return null;
    const [protocol, rest] = parts;
    const authIdx = rest.lastIndexOf('@');
    if (authIdx !== -1) {
      const credentials = rest.substring(0, authIdx);
      const [host, port] = rest.substring(authIdx + 1).split(':');
      return { protocol, host, port: parseInt(port), credentials };
    }
    const [host, port] = rest.split(':');
    return { protocol, host, port: parseInt(port) };
  }

  getLaunchArgs() {
    const proxy = this.getCurrentProxy();
    if (!proxy) return [];
    const args = [`--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`];
    return args;
  }
}

module.exports = new ProxyManager();
