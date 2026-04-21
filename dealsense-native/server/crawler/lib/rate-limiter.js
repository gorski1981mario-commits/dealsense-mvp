// Rate Limiter - Per-domain request throttling
// Prevents bot detection and server overload

class RateLimiter {
  constructor(config) {
    this.config = config
    this.domainQueues = new Map()
  }

  /**
   * Wait before making request to domain
   * Ensures we don't exceed rate limits
   */
  async wait(domain) {
    const limit = this.getLimit(domain)
    const minDelay = 60000 / limit // Convert req/min to ms between requests
    
    // Get or create queue for domain
    if (!this.domainQueues.has(domain)) {
      this.domainQueues.set(domain, {
        lastRequest: 0,
        queue: []
      })
    }

    const queue = this.domainQueues.get(domain)
    const now = Date.now()
    const timeSinceLastRequest = now - queue.lastRequest

    // If enough time has passed, proceed immediately
    if (timeSinceLastRequest >= minDelay) {
      queue.lastRequest = now
      return
    }

    // Otherwise, wait
    const waitTime = minDelay - timeSinceLastRequest
    
    // Add random jitter (±20%) to make it more human-like
    const jitter = waitTime * 0.2 * (Math.random() - 0.5)
    const finalWait = Math.max(0, waitTime + jitter)

    await this.sleep(finalWait)
    queue.lastRequest = Date.now()
  }

  /**
   * Get rate limit for domain
   */
  getLimit(domain) {
    // Check if domain has custom limit
    if (this.config[domain]) {
      return this.config[domain]
    }

    // Check domain category
    if (domain.includes('bol.com') || domain.includes('coolblue')) {
      return this.config.aggressive // Fast sites can handle more
    }

    if (domain.includes('hypothe') || domain.includes('lening') || domain.includes('verzekering')) {
      return this.config.finance // Financial sites are conservative
    }

    return this.config.default
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get stats for monitoring
   */
  getStats() {
    const stats = {}
    
    for (const [domain, queue] of this.domainQueues.entries()) {
      stats[domain] = {
        limit: this.getLimit(domain),
        lastRequest: queue.lastRequest,
        timeSinceLastRequest: Date.now() - queue.lastRequest
      }
    }

    return stats
  }

  /**
   * Clear old queues (cleanup)
   */
  cleanup() {
    const now = Date.now()
    const maxAge = 3600000 // 1 hour

    for (const [domain, queue] of this.domainQueues.entries()) {
      if (now - queue.lastRequest > maxAge) {
        this.domainQueues.delete(domain)
      }
    }
  }
}

module.exports = { RateLimiter }
