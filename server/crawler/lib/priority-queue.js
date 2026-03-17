// Priority Queue System - Smart Domain Prioritization
// Top 50 domen z najwyższą entropią → crawl co 5min
// Pozostałe 950 domen → baseline co 1h
// Auto-boost: spadek >25% lub błąd → quantum boost 2.5x

const Redis = require('ioredis')

class PriorityQueue {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig)
    this.priorityKey = 'queue:priority' // Top 50 hot domains
    this.baselineKey = 'queue:baseline' // Remaining 950 domains
    this.entropyKey = 'queue:entropy_scores'
    this.dealsKey = 'queue:recent_deals'
    
    // Limits
    this.priorityLimit = 50 // Top 50 domains
    this.priorityInterval = 300000 // 5 minutes
    this.baselineInterval = 3600000 // 1 hour
  }

  /**
   * Initialize queues with 1000 domains
   */
  async initialize(domains) {
    console.log(`🚀 Initializing Priority Queue with ${domains.length} domains`)
    
    // Start with all domains in baseline
    for (const domain of domains) {
      await this.addToBaseline(domain, 0)
    }
    
    console.log(`✅ ${domains.length} domains added to baseline queue`)
  }

  /**
   * Add domain to priority queue (top 50)
   */
  async addToPriority(domain, score, reason = 'manual') {
    const entry = {
      domain,
      score,
      reason,
      addedAt: Date.now()
    }

    // Add to priority sorted set (by score)
    await this.redis.zadd(this.priorityKey, score, JSON.stringify(entry))

    // Keep only top 50
    const count = await this.redis.zcard(this.priorityKey)
    if (count > this.priorityLimit) {
      // Remove lowest scoring domains
      const removed = await this.redis.zpopmin(this.priorityKey, count - this.priorityLimit)
      
      // Move removed domains back to baseline
      for (let i = 0; i < removed.length; i += 2) {
        const removedEntry = JSON.parse(removed[i])
        await this.addToBaseline(removedEntry.domain, 0)
      }
    }

    // Remove from baseline if exists
    await this.removeFromBaseline(domain)

    console.log(`⚡ Priority: ${domain} (score: ${score}, reason: ${reason})`)
  }

  /**
   * Add domain to baseline queue
   */
  async addToBaseline(domain, score = 0) {
    const entry = {
      domain,
      score,
      addedAt: Date.now()
    }

    await this.redis.zadd(this.baselineKey, score, JSON.stringify(entry))
  }

  /**
   * Remove domain from baseline
   */
  async removeFromBaseline(domain) {
    const items = await this.redis.zrange(this.baselineKey, 0, -1)
    
    for (const item of items) {
      const entry = JSON.parse(item)
      if (entry.domain === domain) {
        await this.redis.zrem(this.baselineKey, item)
        break
      }
    }
  }

  /**
   * Get priority domains (top 50)
   */
  async getPriorityDomains() {
    const items = await this.redis.zrevrange(this.priorityKey, 0, -1)
    return items.map(i => JSON.parse(i))
  }

  /**
   * Get baseline domains (remaining 950)
   */
  async getBaselineDomains() {
    const items = await this.redis.zrange(this.baselineKey, 0, -1)
    return items.map(i => JSON.parse(i))
  }

  /**
   * Update entropy score for domain
   */
  async updateEntropyScore(domain, entropy) {
    await this.redis.hset(this.entropyKey, domain, entropy)

    // Check if should be promoted to priority
    if (entropy >= 0.7) {
      await this.addToPriority(domain, entropy * 100, 'high_entropy')
    }
  }

  /**
   * Record deal found on domain
   */
  async recordDeal(domain, dealData) {
    const { discount, type, price, avgPrice } = dealData

    // Calculate deal score
    let dealScore = 0

    if (type === 'price_error') {
      dealScore = 100 // Maximum priority
    } else if (type === 'sharp_drop' && discount >= 25) {
      dealScore = 80 + discount // 80-100 range
    } else if (type === 'below_average' && discount >= 20) {
      dealScore = 60 + discount // 60-80 range
    }

    // Auto-boost to priority if significant deal
    if (dealScore >= 60) {
      // Quantum boost 2.5x
      const boostedScore = dealScore * 2.5

      await this.addToPriority(domain, boostedScore, `deal_${type}_${discount}%`)

      console.log(`🔥 AUTO-BOOST: ${domain} - ${type} ${discount}% (score: ${boostedScore})`)
    }

    // Save deal to recent deals
    const deal = {
      domain,
      type,
      discount,
      price,
      avgPrice,
      score: dealScore,
      timestamp: Date.now()
    }

    await this.redis.zadd(this.dealsKey, Date.now(), JSON.stringify(deal))

    // Keep only last 1000 deals
    await this.redis.zremrangebyrank(this.dealsKey, 0, -1001)
  }

  /**
   * Get domains to crawl now
   */
  async getDomainsToProcess() {
    const now = Date.now()
    const results = {
      priority: [],
      baseline: []
    }

    // Priority domains (every 5 minutes)
    const priorityDomains = await this.getPriorityDomains()
    for (const entry of priorityDomains) {
      const timeSinceAdded = now - entry.addedAt
      
      // Crawl if added recently or if interval passed
      if (timeSinceAdded < this.priorityInterval || 
          timeSinceAdded % this.priorityInterval < 60000) {
        results.priority.push(entry.domain)
      }
    }

    // Baseline domains (every 1 hour)
    const baselineDomains = await this.getBaselineDomains()
    const baselineToProcess = Math.min(100, baselineDomains.length) // Process 100 at a time

    for (let i = 0; i < baselineToProcess; i++) {
      const entry = baselineDomains[i]
      const timeSinceAdded = now - entry.addedAt
      
      if (timeSinceAdded >= this.baselineInterval) {
        results.baseline.push(entry.domain)
        
        // Update timestamp
        entry.addedAt = now
        await this.redis.zadd(this.baselineKey, entry.score, JSON.stringify(entry))
      }
    }

    return results
  }

  /**
   * Get statistics
   */
  async getStats() {
    const priorityCount = await this.redis.zcard(this.priorityKey)
    const baselineCount = await this.redis.zcard(this.baselineKey)
    const recentDeals = await this.redis.zcard(this.dealsKey)

    const priorityDomains = await this.getPriorityDomains()
    const avgPriorityScore = priorityDomains.length > 0 ?
      priorityDomains.reduce((sum, d) => sum + d.score, 0) / priorityDomains.length : 0

    return {
      priority: {
        count: priorityCount,
        avgScore: Math.round(avgPriorityScore),
        interval: '5 minutes'
      },
      baseline: {
        count: baselineCount,
        interval: '1 hour'
      },
      recentDeals: {
        count: recentDeals,
        last24h: await this.getDealsCount(86400000)
      },
      savings: {
        requestsPerDay: this.calculateRequestsSaved(),
        costSavings: '€250/month vs full crawl'
      }
    }
  }

  /**
   * Get deals count in time window
   */
  async getDealsCount(timeWindow) {
    const since = Date.now() - timeWindow
    const deals = await this.redis.zrangebyscore(this.dealsKey, since, '+inf')
    return deals.length
  }

  /**
   * Calculate requests saved vs full crawl
   */
  calculateRequestsSaved() {
    // Full crawl: 1000 domains × 288 times/day (every 5min) = 288,000 requests
    const fullCrawl = 1000 * 288

    // Optimized:
    // - Priority: 50 domains × 288 times/day = 14,400 requests
    // - Baseline: 1000 domains × 24 times/day (every 1h) = 24,000 requests
    const optimized = 14400 + 24000

    const saved = fullCrawl - optimized
    const savingsPercent = Math.round((saved / fullCrawl) * 100)

    return {
      full: fullCrawl,
      optimized,
      saved,
      savingsPercent: `${savingsPercent}%`
    }
  }

  /**
   * Promote domain based on recent performance
   */
  async promoteBasedOnPerformance() {
    const deals = await this.redis.zrevrange(this.dealsKey, 0, 99) // Last 100 deals
    const domainScores = {}

    // Count deals per domain
    for (const dealStr of deals) {
      const deal = JSON.parse(dealStr)
      domainScores[deal.domain] = (domainScores[deal.domain] || 0) + deal.score
    }

    // Promote top performers
    const topDomains = Object.entries(domainScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20

    for (const [domain, score] of topDomains) {
      await this.addToPriority(domain, score, 'top_performer')
    }

    console.log(`📈 Promoted ${topDomains.length} top performing domains`)
  }
}

module.exports = PriorityQueue
