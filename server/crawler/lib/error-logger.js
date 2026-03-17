// Error Logger - Redis-based error tracking
// Logs all crawler failures with timestamp, domain, error type
// Used by AI agents for self-healing

const Redis = require('ioredis')

class ErrorLogger {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig)
    this.errorKey = 'crawler:errors'
    this.statsKey = 'crawler:error_stats'
    this.blocklistKey = 'crawler:blocklist' // Domains blocked for 24h
  }

  /**
   * Log crawler error
   */
  async logError(domain, errorType, details = {}) {
    const timestamp = new Date().toISOString()
    const date = timestamp.split('T')[0]

    const errorEntry = {
      domain,
      errorType, // 'cloudflare', 'captcha', '403', '429', 'timeout', etc.
      timestamp,
      date,
      details: {
        url: details.url,
        proxy: details.proxy,
        userAgent: details.userAgent,
        requestCount: details.requestCount,
        ...details
      }
    }

    // Add to error log (sorted set by timestamp)
    await this.redis.zadd(
      this.errorKey,
      Date.now(),
      JSON.stringify(errorEntry)
    )

    // Update error stats per domain
    const statKey = `${this.statsKey}:${domain}:${date}`
    await this.redis.hincrby(statKey, errorType, 1)
    await this.redis.expire(statKey, 86400 * 7) // Keep 7 days

    // Update total error count
    await this.redis.hincrby(`${this.statsKey}:total:${date}`, errorType, 1)

    // Check if domain should be blocklisted (>5 errors in 15 min)
    const recentErrors = await this.getRecentErrors(domain, 15)
    if (recentErrors.length >= 5) {
      await this.blockDomain(domain, 24) // Block for 24 hours
      console.log(`🚫 Domain ${domain} blocklisted for 24h (${recentErrors.length} errors in 15min)`)
    }

    return errorEntry
  }

  /**
   * Get recent errors for domain (last N minutes)
   */
  async getRecentErrors(domain, minutes = 15) {
    const since = Date.now() - (minutes * 60 * 1000)
    const errors = await this.redis.zrangebyscore(this.errorKey, since, '+inf')
    
    return errors
      .map(e => JSON.parse(e))
      .filter(e => e.domain === domain)
  }

  /**
   * Get all errors for today
   */
  async getTodayErrors() {
    const today = new Date().toISOString().split('T')[0]
    const errors = await this.redis.zrangebyscore(
      this.errorKey,
      Date.now() - 86400000, // Last 24h
      '+inf'
    )
    
    return errors
      .map(e => JSON.parse(e))
      .filter(e => e.date === today)
  }

  /**
   * Get error stats for today
   */
  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0]
    const stats = await this.redis.hgetall(`${this.statsKey}:total:${today}`)
    
    const total = Object.values(stats).reduce((sum, count) => sum + parseInt(count), 0)
    
    return {
      date: today,
      total,
      byType: stats,
      topDomains: await this.getTopErrorDomains(today)
    }
  }

  /**
   * Get domains with most errors today
   */
  async getTopErrorDomains(date, limit = 10) {
    const pattern = `${this.statsKey}:*:${date}`
    const keys = await this.redis.keys(pattern)
    
    const domainStats = []
    for (const key of keys) {
      const domain = key.split(':')[2]
      if (domain === 'total') continue
      
      const stats = await this.redis.hgetall(key)
      const total = Object.values(stats).reduce((sum, count) => sum + parseInt(count), 0)
      
      domainStats.push({ domain, total, byType: stats })
    }
    
    return domainStats
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  }

  /**
   * Block domain for N hours
   */
  async blockDomain(domain, hours = 24) {
    const until = Date.now() + (hours * 60 * 60 * 1000)
    await this.redis.zadd(this.blocklistKey, until, domain)
    
    return {
      domain,
      blockedUntil: new Date(until).toISOString(),
      hours
    }
  }

  /**
   * Check if domain is blocked
   */
  async isBlocked(domain) {
    const score = await this.redis.zscore(this.blocklistKey, domain)
    if (!score) return false
    
    const blockedUntil = parseInt(score)
    if (Date.now() > blockedUntil) {
      // Block expired, remove
      await this.redis.zrem(this.blocklistKey, domain)
      return false
    }
    
    return {
      blocked: true,
      until: new Date(blockedUntil).toISOString(),
      remainingHours: Math.round((blockedUntil - Date.now()) / 3600000)
    }
  }

  /**
   * Get all blocked domains
   */
  async getBlockedDomains() {
    const now = Date.now()
    
    // Remove expired blocks
    await this.redis.zremrangebyscore(this.blocklistKey, '-inf', now)
    
    // Get active blocks
    const blocked = await this.redis.zrange(this.blocklistKey, 0, -1, 'WITHSCORES')
    
    const domains = []
    for (let i = 0; i < blocked.length; i += 2) {
      const domain = blocked[i]
      const until = parseInt(blocked[i + 1])
      
      domains.push({
        domain,
        until: new Date(until).toISOString(),
        remainingHours: Math.round((until - now) / 3600000)
      })
    }
    
    return domains
  }

  /**
   * Clear old errors (keep last 7 days)
   */
  async cleanup() {
    const weekAgo = Date.now() - (7 * 86400000)
    const removed = await this.redis.zremrangebyscore(this.errorKey, '-inf', weekAgo)
    
    console.log(`🧹 Cleaned up ${removed} old error logs`)
    return removed
  }

  /**
   * Get error summary for AI analysis
   */
  async getAISummary() {
    const todayStats = await this.getTodayStats()
    const recentErrors = await this.redis.zrange(
      this.errorKey,
      -100, // Last 100 errors
      -1
    )
    
    const errors = recentErrors.map(e => JSON.parse(e))
    
    // Analyze patterns
    const patterns = {
      mostCommonError: this.getMostCommon(errors.map(e => e.errorType)),
      mostProblematicDomain: this.getMostCommon(errors.map(e => e.domain)),
      errorsByHour: this.groupByHour(errors),
      consecutiveFailures: this.findConsecutiveFailures(errors)
    }
    
    return {
      summary: todayStats,
      recentErrors: errors.slice(-20), // Last 20 errors
      patterns,
      blockedDomains: await this.getBlockedDomains()
    }
  }

  /**
   * Helper: Get most common value
   */
  getMostCommon(arr) {
    const counts = {}
    arr.forEach(val => counts[val] = (counts[val] || 0) + 1)
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }

  /**
   * Helper: Group errors by hour
   */
  groupByHour(errors) {
    const byHour = {}
    errors.forEach(e => {
      const hour = new Date(e.timestamp).getHours()
      byHour[hour] = (byHour[hour] || 0) + 1
    })
    return byHour
  }

  /**
   * Helper: Find consecutive failures on same domain
   */
  findConsecutiveFailures(errors) {
    const consecutive = {}
    let current = null
    let count = 0
    
    errors.forEach(e => {
      if (e.domain === current) {
        count++
      } else {
        if (count >= 3) {
          consecutive[current] = Math.max(consecutive[current] || 0, count)
        }
        current = e.domain
        count = 1
      }
    })
    
    return consecutive
  }
}

module.exports = ErrorLogger
