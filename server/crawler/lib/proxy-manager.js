// Proxy Manager - Residential proxy rotation with anti-ban protection

const axios = require('axios')

class ProxyManager {
  constructor(config) {
    this.config = config
    this.enabled = config.enabled
    this.provider = config.provider
    this.proxyPool = []
    this.currentIndex = 0
    this.failedProxies = new Set()
    
    if (this.enabled) {
      this.initialize()
    }
  }

  async initialize() {
    console.log(`Initializing proxy manager (${this.provider})...`)
    
    switch (this.provider) {
      case 'brightdata':
        this.initBrightData()
        break
      case 'smartproxy':
        this.initSmartProxy()
        break
      default:
        console.warn('Unknown proxy provider, proxies disabled')
        this.enabled = false
    }
  }

  /**
   * BrightData (Luminati) configuration
   * Best for NL residential IPs
   */
  initBrightData() {
    const username = process.env.BRIGHTDATA_USERNAME
    const password = process.env.BRIGHTDATA_PASSWORD
    const port = process.env.BRIGHTDATA_PORT || 22225

    if (!username || !password) {
      console.error('BrightData credentials missing')
      this.enabled = false
      return
    }

    // BrightData uses single endpoint with session rotation
    this.proxyEndpoint = {
      host: 'brd.superproxy.io',
      port: port,
      auth: {
        username: `${username}-country-nl`,  // Force NL IPs
        password: password
      }
    }

    console.log('✓ BrightData proxy initialized (NL residential)')
  }

  /**
   * SmartProxy configuration
   * Alternative to BrightData
   */
  initSmartProxy() {
    const username = process.env.SMARTPROXY_USERNAME
    const password = process.env.SMARTPROXY_PASSWORD
    const port = process.env.SMARTPROXY_PORT || 7000

    if (!username || !password) {
      console.error('SmartProxy credentials missing')
      this.enabled = false
      return
    }

    this.proxyEndpoint = {
      host: 'gate.smartproxy.com',
      port: port,
      auth: {
        username: `${username}-country-nl-session-${Date.now()}`,
        password: password
      }
    }

    console.log('✓ SmartProxy initialized (NL residential)')
  }

  /**
   * Get proxy for domain
   * Uses sticky sessions (same IP for 5 min per domain)
   */
  async getProxy(domain) {
    if (!this.enabled) {
      return null
    }

    // Check if domain is in failed list
    if (this.failedProxies.has(domain)) {
      // Reset after 10 minutes
      setTimeout(() => this.failedProxies.delete(domain), 10 * 60 * 1000)
    }

    // For residential proxies, we use session-based rotation
    // Same session = same IP for configured duration (sticky)
    const sessionId = this.getSessionId(domain)

    return {
      ...this.proxyEndpoint,
      auth: {
        username: this.proxyEndpoint.auth.username.replace(/session-\d+/, `session-${sessionId}`),
        password: this.proxyEndpoint.auth.password
      }
    }
  }

  /**
   * Get session ID for domain (sticky sessions)
   * Same domain = same session for 5 minutes
   */
  getSessionId(domain) {
    const now = Date.now()
    const stickyDuration = this.config.pool.sticky * 1000 // 5 min default
    return Math.floor(now / stickyDuration) + domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  }

  /**
   * Mark proxy as failed for domain
   */
  markFailed(domain) {
    this.failedProxies.add(domain)
    console.warn(`Proxy marked as failed for ${domain}`)
  }

  /**
   * Test proxy connection
   */
  async testProxy() {
    if (!this.enabled) {
      return { success: false, error: 'Proxies disabled' }
    }

    try {
      const proxy = await this.getProxy('test.com')
      const response = await axios.get('https://api.ipify.org?format=json', {
        proxy: {
          host: proxy.host,
          port: proxy.port,
          auth: proxy.auth
        },
        timeout: 10000
      })

      return {
        success: true,
        ip: response.data.ip,
        provider: this.provider
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get proxy stats
   */
  getStats() {
    return {
      enabled: this.enabled,
      provider: this.provider,
      failedDomains: this.failedProxies.size
    }
  }
}

module.exports = { ProxyManager }
