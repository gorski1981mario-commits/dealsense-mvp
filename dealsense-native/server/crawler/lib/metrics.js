// Metrics Collector - Track crawler performance and success rates

class MetricsCollector {
  constructor() {
    this.stats = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        cached: 0
      },
      byCategory: {},
      byDomain: {},
      durations: [],
      errors: []
    }

    // Reset stats every hour
    setInterval(() => this.resetHourlyStats(), 3600000)
  }

  /**
   * Record successful request
   */
  recordSuccess(category, domain) {
    this.stats.requests.total++
    this.stats.requests.success++
    
    this.incrementCategory(category, 'success')
    this.incrementDomain(domain, 'success')
  }

  /**
   * Record failed request
   */
  recordFailure(category, domain, error) {
    this.stats.requests.total++
    this.stats.requests.failed++
    
    this.incrementCategory(category, 'failed')
    this.incrementDomain(domain, 'failed')
    
    // Store error details
    this.stats.errors.push({
      category,
      domain,
      error: error.message,
      timestamp: Date.now()
    })

    // Keep only last 100 errors
    if (this.stats.errors.length > 100) {
      this.stats.errors.shift()
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(category) {
    this.stats.requests.cached++
    this.incrementCategory(category, 'cached')
  }

  /**
   * Record request duration
   */
  recordDuration(category, domain, duration) {
    this.stats.durations.push({
      category,
      domain,
      duration,
      timestamp: Date.now()
    })

    // Keep only last 1000 durations
    if (this.stats.durations.length > 1000) {
      this.stats.durations.shift()
    }
  }

  /**
   * Increment category counter
   */
  incrementCategory(category, type) {
    if (!this.stats.byCategory[category]) {
      this.stats.byCategory[category] = { success: 0, failed: 0, cached: 0 }
    }
    this.stats.byCategory[category][type]++
  }

  /**
   * Increment domain counter
   */
  incrementDomain(domain, type) {
    if (!this.stats.byDomain[domain]) {
      this.stats.byDomain[domain] = { success: 0, failed: 0 }
    }
    this.stats.byDomain[domain][type]++
  }

  /**
   * Get current stats
   */
  getStats() {
    const avgDuration = this.stats.durations.length > 0
      ? this.stats.durations.reduce((sum, d) => sum + d.duration, 0) / this.stats.durations.length
      : 0

    const successRate = this.stats.requests.total > 0
      ? (this.stats.requests.success / this.stats.requests.total) * 100
      : 0

    return {
      requests: this.stats.requests,
      successRate: successRate.toFixed(2) + '%',
      avgDuration: Math.round(avgDuration) + 'ms',
      byCategory: this.stats.byCategory,
      topDomains: this.getTopDomains(10),
      recentErrors: this.stats.errors.slice(-10)
    }
  }

  /**
   * Get top domains by request count
   */
  getTopDomains(limit = 10) {
    return Object.entries(this.stats.byDomain)
      .map(([domain, stats]) => ({
        domain,
        total: stats.success + stats.failed,
        successRate: ((stats.success / (stats.success + stats.failed)) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  }

  /**
   * Reset hourly stats (keep cumulative)
   */
  resetHourlyStats() {
    // Keep errors and durations from last hour only
    const oneHourAgo = Date.now() - 3600000
    
    this.stats.errors = this.stats.errors.filter(e => e.timestamp > oneHourAgo)
    this.stats.durations = this.stats.durations.filter(d => d.timestamp > oneHourAgo)
  }

  /**
   * Export stats for monitoring dashboard
   */
  export() {
    return {
      timestamp: Date.now(),
      ...this.getStats()
    }
  }
}

module.exports = { MetricsCollector }
