// DealSense Crawler - Main Entry Point
// Optimized multi-source crawler for NL market

const Queue = require('bull')
const axios = require('axios')
const cheerio = require('cheerio')
const Redis = require('ioredis')
const config = require('./config')
const { ProxyManager } = require('./lib/proxy-manager')
const { ParserRegistry } = require('./lib/parser-registry')
const { RateLimiter } = require('./lib/rate-limiter')
const { ErrorHandler } = require('./lib/error-handler')
const { MetricsCollector } = require('./lib/metrics')

class DealSenseCrawler {
  constructor() {
    this.redis = new Redis(config.queue.redis)
    this.queue = new Queue(config.queue.name, { redis: config.queue.redis })
    this.proxyManager = new ProxyManager(config.proxy)
    this.parserRegistry = new ParserRegistry()
    this.rateLimiter = new RateLimiter(config.rateLimit)
    this.metrics = new MetricsCollector()
    
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
   * Fetch URL with anti-bot protection
   */
  async fetch(url, options = {}) {
    const { proxy, domain } = options

    // Get random user agent
    const userAgent = this.getRandomUserAgent()

    // Build headers
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.google.nl/'
    }

    // Make request
    const response = await axios.get(url, {
      headers,
      proxy: proxy ? {
        host: proxy.host,
        port: proxy.port,
        auth: proxy.auth
      } : undefined,
      timeout: config.timeout.request,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
    })

    // Check for Cloudflare challenge
    if (response.data.includes('cf-browser-verification')) {
      throw new Error('Cloudflare challenge detected')
    }

    // Check for CAPTCHA
    if (response.data.includes('recaptcha') || response.data.includes('captcha')) {
      throw new Error('CAPTCHA detected')
    }

    return response.data
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
   * Get random user agent
   */
  getRandomUserAgent() {
    const agents = config.userAgents
    return agents[Math.floor(Math.random() * agents.length)]
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
    await this.queue.close()
    await this.redis.quit()
    console.log('Crawler stopped')
  }
}

// Export singleton
module.exports = new DealSenseCrawler()
