// Connection Pool - Reuse browser connections for 10x faster crawling
// Instead of opening new browser for each request, reuse existing ones

class ConnectionPool {
  constructor(config = {}) {
    this.maxConnections = config.maxConnections || 20
    this.maxIdleTime = config.maxIdleTime || 300000 // 5 min
    this.pool = new Map()
    this.stats = {
      created: 0,
      reused: 0,
      closed: 0
    }

    // Cleanup idle connections every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Get connection from pool or create new
   * Reusing connections = 10x faster (no browser startup)
   */
  async getConnection(domain, browserFactory) {
    const existing = this.pool.get(domain)

    // Reuse existing connection if available and not idle
    if (existing && !this.isIdle(existing)) {
      existing.lastUsed = Date.now()
      this.stats.reused++
      return existing.browser
    }

    // Close idle connection
    if (existing && this.isIdle(existing)) {
      await this.closeConnection(domain)
    }

    // Check pool size limit
    if (this.pool.size >= this.maxConnections) {
      await this.evictOldest()
    }

    // Create new connection
    const browser = await browserFactory()
    
    this.pool.set(domain, {
      browser,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      requestCount: 0
    })

    this.stats.created++
    console.log(`🔌 New connection for ${domain} (pool: ${this.pool.size}/${this.maxConnections})`)

    return browser
  }

  /**
   * Check if connection is idle
   */
  isIdle(connection) {
    const idleTime = Date.now() - connection.lastUsed
    return idleTime > this.maxIdleTime
  }

  /**
   * Close connection for domain
   */
  async closeConnection(domain) {
    const connection = this.pool.get(domain)
    
    if (connection) {
      try {
        await connection.browser.close()
        this.pool.delete(domain)
        this.stats.closed++
        console.log(`🔌 Closed connection for ${domain}`)
      } catch (error) {
        console.error(`Failed to close connection for ${domain}:`, error.message)
      }
    }
  }

  /**
   * Evict oldest connection when pool is full
   */
  async evictOldest() {
    let oldest = null
    let oldestTime = Infinity

    for (const [domain, connection] of this.pool.entries()) {
      if (connection.lastUsed < oldestTime) {
        oldestTime = connection.lastUsed
        oldest = domain
      }
    }

    if (oldest) {
      await this.closeConnection(oldest)
    }
  }

  /**
   * Cleanup idle connections
   */
  async cleanup() {
    const toClose = []

    for (const [domain, connection] of this.pool.entries()) {
      if (this.isIdle(connection)) {
        toClose.push(domain)
      }
    }

    for (const domain of toClose) {
      await this.closeConnection(domain)
    }

    if (toClose.length > 0) {
      console.log(`🧹 Cleaned up ${toClose.length} idle connections`)
    }
  }

  /**
   * Close all connections (graceful shutdown)
   */
  async closeAll() {
    console.log(`🔌 Closing all ${this.pool.size} connections...`)

    const closePromises = []
    for (const [domain, connection] of this.pool.entries()) {
      closePromises.push(
        connection.browser.close().catch(err => 
          console.error(`Failed to close ${domain}:`, err.message)
        )
      )
    }

    await Promise.all(closePromises)
    this.pool.clear()
    console.log('✅ All connections closed')
  }

  /**
   * Get pool stats
   */
  getStats() {
    return {
      activeConnections: this.pool.size,
      maxConnections: this.maxConnections,
      ...this.stats,
      reuseRate: this.stats.reused / (this.stats.created + this.stats.reused) || 0
    }
  }
}

module.exports = { ConnectionPool }
