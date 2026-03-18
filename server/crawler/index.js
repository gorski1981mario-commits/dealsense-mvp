// DealSense Crawler - Main Entry Point
// Optimized multi-source crawler for NL market

const Queue = require('bull')
const cheerio = require('cheerio')
const Redis = require('ioredis')
const config = require('./config')
const StealthBrowser = require('./lib/stealth-browser')
const { ParserRegistry } = require('./lib/parser-registry')
const { RateLimiter } = require('./lib/rate-limiter')
const { ErrorHandler } = require('./lib/error-handler')
const { MetricsCollector } = require('./lib/metrics')
const AIRanking = require('./lib/ai-ranking')

class DealSenseCrawler {
  constructor() {
    this.redis = new Redis(config.queue.redis)
    this.queue = new Queue(config.queue.name, { redis: config.queue.redis })
    this.parserRegistry = new ParserRegistry()
    this.rateLimiter = new RateLimiter(config.rateLimit)
    this.metrics = new MetricsCollector()
    
    // Initialize Proxy Manager
    const { ProxyManager } = require('./lib/proxy-manager')
    this.proxyManager = new ProxyManager(config.proxy)
    
    // Stealth browser pool (reuse browsers for performance)
    this.browserPool = new Map()
    
    this.setupQueue()
    this.loadParsers()
  }

  setupQueue() {
    // Process jobs with category-specific concurrency
    this.queue.process('products', config.queue.concurrency.products, this.processJob.bind(this))
    this.queue.process('diensten', config.queue.concurrency.diensten, this.processJob.bind(this))
    this.queue.process('finance', config.queue.concurrency.finance, this.processJob.bind(this))

    // Event handlers
    this.queue.on('completed', (job, result) => {
      this.metrics.recordSuccess(job.data.category, job.data.domain)
      console.log(`✓ Job ${job.id} completed: ${job.data.url}`)
    })

    this.queue.on('failed', (job, err) => {
      this.metrics.recordFailure(job.data.category, job.data.domain, err)
      ErrorHandler.log(err, `Job ${job.id} failed: ${job.data.url}`)
    })

    this.queue.on('stalled', (job) => {
      console.warn(`⚠ Job ${job.id} stalled: ${job.data.url}`)
    })
  }

  loadParsers() {
    // Load all parsers from parsers/ directory
    this.parserRegistry.loadAll()
    console.log(`Loaded ${this.parserRegistry.count()} parsers`)
  }

  /**
   * Add crawl job to queue
   */
  async enqueue(url, options = {}) {
    const {
      category = 'products',
      priority = 3,
      ean = null,
      searchQuery = null,
      metadata = {}
    } = options

    // Check cache first
    const cacheKey = this.getCacheKey(url, ean, searchQuery)
    const cached = await this.getFromCache(cacheKey)
    
    if (cached) {
      this.metrics.recordCacheHit(category)
      return { cached: true, data: cached }
    }

    // Extract domain
    const domain = new URL(url).hostname.replace('www.', '')

    // Add to queue
    const job = await this.queue.add(category, {
      url,
      domain,
      category,
      ean,
      searchQuery,
      metadata,
      cacheKey
    }, {
      priority: config.domainPriority[domain] || config.domainPriority.default,
      attempts: config.queue.retry.attempts,
      backoff: config.queue.retry.backoff
    })

    return { cached: false, jobId: job.id }
  }

  /**
   * Process single crawl job
   */
  async processJob(job) {
    const { url, domain, category, cacheKey } = job.data
    const startTime = Date.now()

    try {
      // Rate limiting
      await this.rateLimiter.wait(domain)

      // Get proxy
      const proxy = await this.proxyManager.getProxy(domain)

      // Get parser
      const parser = this.parserRegistry.getParser(domain, category)

      // Make request
      const html = await this.fetch(url, { proxy, domain })

      // Parse data
      const data = await parser.parse(html, job.data)

      // Validate
      if (!this.validateData(data, category)) {
        throw new Error('Invalid data structure')
      }

      // Cache result
      await this.saveToCache(cacheKey, data, category)

      // Record metrics
      const duration = Date.now() - startTime
      this.metrics.recordDuration(category, domain, duration)

      return data

    } catch (error) {
      ErrorHandler.handle(error, { job: job.data })
      throw error
    }
  }

  /**
   * Fetch URL with Playwright Stealth
   * 100% UNDETECTABLE - bypasses Cloudflare, DataDome, PerimeterX
   */
  async fetch(url, options = {}) {
    const { domain } = options

    // Get or create browser for this domain
    let browser = this.browserPool.get(domain)
    
    if (!browser) {
      browser = new StealthBrowser({
        enabled: config.proxy.enabled,
        provider: config.proxy.provider,
        username: process.env.PROXY_USERNAME,
        password: process.env.PROXY_PASSWORD
      })
      this.browserPool.set(domain, browser)
    }

    try {
      // Fetch with human-like behavior (random delays, mouse movements, scrolling)
      const html = await browser.fetch(url)
      return html

    } catch (error) {
      // If browser fails, close it and remove from pool
      await browser.close()
      this.browserPool.delete(domain)
      throw error
    }
  }

  /**
   * Get data from cache
   */
  async getFromCache(key) {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      ErrorHandler.log(error, 'Cache read error')
      return null
    }
  }

  /**
   * Save data to cache
   */
  async saveToCache(key, data, category) {
    try {
      const ttl = config.cache.ttl[category] || config.cache.ttl.products
      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      ErrorHandler.log(error, 'Cache write error')
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(url, ean, searchQuery) {
    if (ean) return `ean:${ean}`
    if (searchQuery) return `search:${Buffer.from(searchQuery).toString('base64')}`
    return `url:${Buffer.from(url).toString('base64')}`
  }

  /**
   * Validate parsed data
   */
  validateData(data, category) {
    if (!data || typeof data !== 'object') return false

    // Category-specific validation
    switch (category) {
      case 'products':
        return data.offers && Array.isArray(data.offers) && data.offers.length > 0
      case 'diensten':
      case 'finance':
        return data.providers && Array.isArray(data.providers) && data.providers.length > 0
      default:
        return true
    }
  }

  /**
   * Rank results using AI Ranking 4.0
   * Prioritizes niszowe shops for best deals
   */
  rankResults(offers, userPreferences = {}) {
    return AIRanking.rank(offers, userPreferences)
  }

  /**
   * Get queue stats
   */
  async getStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount()
    ])

    return {
      waiting,
      active,
      completed,
      failed,
      metrics: this.metrics.getStats()
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down crawler...')
    
    // Close all browsers in pool
    for (const [domain, browser] of this.browserPool.entries()) {
      console.log(`Closing browser for ${domain}...`)
      await browser.close()
    }
    this.browserPool.clear()
    
    await this.queue.close()
    await this.redis.quit()
    console.log('Crawler stopped')
  }
}

// Export singleton
module.exports = new DealSenseCrawler()
