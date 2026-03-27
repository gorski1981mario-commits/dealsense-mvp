/**
 * SMART PROXY MANAGER
 * 
 * Features:
 * - Rotate proxy every 4-5 requests
 * - Sticky session 5-10 minutes (same IP for product)
 * - Auto-rotate entire pool on quality issues
 */

class ProxyManager {
  constructor(config = {}) {
    this.enabled = config.enabled || process.env.USE_PROXY === 'true';
    this.provider = config.provider || process.env.PROXY_PROVIDER || 'iproyal';
    this.username = config.username || process.env.PROXY_USERNAME;
    this.password = config.password || process.env.PROXY_PASSWORD;
    
    this.requestCount = 0;
    this.currentProxy = null;
    this.sessionStart = null;
    this.rotateInterval = this.getRandomInterval(); // 4-5 requests
    
    // Proxy pool
    this.proxyPool = [];
    this.currentProxyIndex = 0;
  }

  /**
   * Get proxy for request (with smart rotation)
   */
  async getProxy() {
    if (!this.enabled) {
      return null;
    }

    const now = Date.now();
    const sessionAge = this.sessionStart ? now - this.sessionStart : Infinity;
    
    // Rotate if:
    // 1. Every 4-5 requests
    // 2. Session older than 10 minutes
    // 3. No current proxy
    const shouldRotate = 
      this.requestCount >= this.rotateInterval ||
      sessionAge > 10 * 60 * 1000 ||
      !this.currentProxy;
    
    if (shouldRotate) {
      this.currentProxy = await this.rotateProxy();
      this.sessionStart = now;
      this.requestCount = 0;
      this.rotateInterval = this.getRandomInterval(); // New random interval
      
      console.log(`[Proxy] 🔄 Rotated (next rotate in ${this.rotateInterval} requests)`);
    }
    
    this.requestCount++;
    return this.currentProxy;
  }

  /**
   * Rotate to next proxy
   */
  async rotateProxy() {
    // For IPRoyal, we use rotating residential proxy
    // Each request gets different IP automatically
    const proxy = this.buildProxyUrl();
    
    return proxy;
  }

  /**
   * Rotate entire proxy pool (called by quality control)
   */
  async rotateEntirePool() {
    console.log(`[Proxy] 🔥 Rotating ENTIRE proxy pool`);
    
    // Reset session
    this.currentProxy = null;
    this.sessionStart = null;
    this.requestCount = 0;
    this.rotateInterval = this.getRandomInterval();
    
    // Force new proxy on next request
    return true;
  }

  /**
   * Build proxy URL based on provider
   */
  buildProxyUrl() {
    if (!this.enabled) return null;

    // IPRoyal residential proxies (rotating)
    if (this.provider === 'iproyal') {
      return `http://${this.username}:${this.password}@geo.iproyal.com:12321`;
    }

    // BrightData residential proxies
    if (this.provider === 'brightdata') {
      return `http://${this.username}:${this.password}@brd.superproxy.io:22225`;
    }

    // SmartProxy residential proxies
    if (this.provider === 'smartproxy') {
      return `http://${this.username}:${this.password}@gate.smartproxy.com:7000`;
    }

    return null;
  }

  /**
   * Get random rotation interval (4-5 requests)
   */
  getRandomInterval() {
    return Math.floor(Math.random() * 2) + 4; // 4 or 5
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    const sessionAge = this.sessionStart ? Date.now() - this.sessionStart : 0;
    
    return {
      enabled: this.enabled,
      provider: this.provider,
      requestCount: this.requestCount,
      rotateInterval: this.rotateInterval,
      sessionAge: Math.round(sessionAge / 1000) + 's',
      currentProxy: this.currentProxy ? 'Active' : 'None'
    };
  }
}

module.exports = ProxyManager;
