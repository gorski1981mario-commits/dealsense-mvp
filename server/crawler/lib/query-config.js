// Query Config System - Smart Crawling Configuration
// Crawler czyta config z Redis, wysyła tylko potrzebne dane
// Response: JSON + screenshot tylko na hot deals

const Redis = require('ioredis')

class QueryConfig {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig)
    this.configKey = 'crawler:query_config'
  }

  /**
   * Initialize default query configs
   */
  async initialize() {
    const configs = {
      // Price drop detection
      price_drop: {
        queryType: 'price_drop',
        minDrop: 25, // Minimum 25% drop
        responseFormat: 'json',
        fields: ['price', 'oldPrice', 'url', 'title', 'domain'],
        screenshot: true, // Only on match
        deepDive: true, // Check 5-10 similar sites
        priority: 'high'
      },

      // Price error detection
      price_error: {
        queryType: 'price_error',
        threshold: 0.2, // Price < avg * 0.2
        responseFormat: 'json',
        fields: ['price', 'avgPrice', 'url', 'title', 'domain', 'savings'],
        screenshot: true,
        deepDive: true,
        priority: 'critical',
        alert: 'signal' // Send Signal notification
      },

      // Flash sale detection
      flash_sale: {
        queryType: 'flash_sale',
        keywords: ['flash', 'alleen vandaag', 'laatste kans', 'timer'],
        responseFormat: 'json',
        fields: ['price', 'url', 'title', 'timeRemaining'],
        screenshot: true,
        deepDive: false,
        priority: 'high'
      },

      // Baseline price check (no screenshot)
      baseline: {
        queryType: 'baseline',
        responseFormat: 'json',
        fields: ['price', 'url', 'title', 'inStock'],
        screenshot: false, // Save bandwidth
        deepDive: false,
        priority: 'low',
        cache: {
          enabled: true,
          ttl: 3600 // 1 hour
        }
      },

      // Stock check only
      stock_check: {
        queryType: 'stock_check',
        responseFormat: 'json',
        fields: ['inStock', 'url'],
        screenshot: false,
        deepDive: false,
        priority: 'low'
      }
    }

    for (const [name, config] of Object.entries(configs)) {
      await this.saveConfig(name, config)
    }

    console.log(`✅ Initialized ${Object.keys(configs).length} query configs`)
  }

  /**
   * Save query config
   */
  async saveConfig(name, config) {
    await this.redis.hset(this.configKey, name, JSON.stringify(config))
  }

  /**
   * Get query config
   */
  async getConfig(name) {
    const configStr = await this.redis.hget(this.configKey, name)
    return configStr ? JSON.parse(configStr) : null
  }

  /**
   * Get config for domain based on priority
   */
  async getConfigForDomain(domain, isPriority = false) {
    if (isPriority) {
      // Priority domains: check for deals
      return await this.getConfig('price_drop')
    } else {
      // Baseline domains: just price check
      return await this.getConfig('baseline')
    }
  }

  /**
   * Build crawler query from config
   */
  buildQuery(config, product) {
    const query = {
      type: config.queryType,
      url: product.url,
      fields: config.fields,
      options: {
        screenshot: config.screenshot,
        deepDive: config.deepDive,
        cache: config.cache
      }
    }

    // Add type-specific parameters
    switch (config.queryType) {
      case 'price_drop':
        query.minDrop = config.minDrop
        break

      case 'price_error':
        query.threshold = config.threshold
        break

      case 'flash_sale':
        query.keywords = config.keywords
        break
    }

    return query
  }

  /**
   * Parse response based on config
   */
  parseResponse(html, config, product) {
    const response = {
      type: config.queryType,
      domain: product.domain,
      url: product.url,
      timestamp: Date.now()
    }

    // Extract only requested fields
    const data = {}
    for (const field of config.fields) {
      data[field] = this.extractField(html, field, product)
    }

    response.data = data

    // Check if matches criteria
    response.match = this.checkMatch(data, config)

    // Add screenshot only if match and config allows
    if (response.match && config.screenshot) {
      response.screenshot = `screenshots/${product.domain}_${Date.now()}.png`
    }

    return response
  }

  /**
   * Extract field from HTML
   */
  extractField(html, field, product) {
    // This would use parser to extract specific field
    // Simplified for now
    switch (field) {
      case 'price':
        return product.price || 0
      case 'oldPrice':
        return product.oldPrice || 0
      case 'url':
        return product.url
      case 'title':
        return product.title
      case 'domain':
        return product.domain
      case 'inStock':
        return product.inStock !== false
      case 'avgPrice':
        return product.avgPrice || 0
      case 'savings':
        return product.avgPrice ? product.avgPrice - product.price : 0
      case 'timeRemaining':
        return product.timeRemaining || null
      default:
        return null
    }
  }

  /**
   * Check if response matches config criteria
   */
  checkMatch(data, config) {
    switch (config.queryType) {
      case 'price_drop':
        if (data.oldPrice && data.price) {
          const drop = ((data.oldPrice - data.price) / data.oldPrice) * 100
          return drop >= config.minDrop
        }
        return false

      case 'price_error':
        if (data.avgPrice && data.price) {
          return data.price < data.avgPrice * config.threshold
        }
        return false

      case 'flash_sale':
        if (data.title) {
          return config.keywords.some(kw => 
            data.title.toLowerCase().includes(kw)
          )
        }
        return false

      case 'baseline':
        return data.price > 0

      case 'stock_check':
        return data.inStock === true

      default:
        return false
    }
  }

  /**
   * Get response size estimate
   */
  getResponseSize(response) {
    let size = JSON.stringify(response.data).length

    if (response.screenshot) {
      size += 50000 // ~50KB per screenshot
    }

    return size
  }

  /**
   * Calculate bandwidth savings
   */
  async calculateSavings() {
    // Full response (all fields + screenshot): ~60KB
    const fullResponse = 60000

    // Optimized response (selected fields only): ~1KB
    const optimizedResponse = 1000

    // Screenshot only on hot deals (5% of requests)
    const screenshotRate = 0.05

    // Average response size
    const avgOptimized = optimizedResponse + (fullResponse * screenshotRate)

    const savings = {
      full: fullResponse,
      optimized: Math.round(avgOptimized),
      saved: fullResponse - avgOptimized,
      savingsPercent: Math.round(((fullResponse - avgOptimized) / fullResponse) * 100)
    }

    return savings
  }

  /**
   * Get statistics
   */
  async getStats() {
    const configs = await this.redis.hgetall(this.configKey)
    const bandwidthSavings = await this.calculateSavings()

    return {
      totalConfigs: Object.keys(configs).length,
      configs: Object.keys(configs),
      bandwidthSavings: {
        perRequest: `${bandwidthSavings.savingsPercent}% saved`,
        perDay: `${Math.round(bandwidthSavings.saved * 38400 / 1024 / 1024)}MB saved` // 38,400 requests/day
      }
    }
  }
}

module.exports = QueryConfig
