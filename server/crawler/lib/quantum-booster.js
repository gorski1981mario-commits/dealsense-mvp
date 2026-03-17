// Quantum Booster - Entropy-Based Hot Deal Prioritization
// Źródła entropii: gyro + accelerometer + random.org + user scans
// Boost crawling: 15min → 30s dla produktów z wysoką entropią

const axios = require('axios')
const Redis = require('ioredis')

class QuantumBooster {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig)
    this.entropyKey = 'quantum:entropy'
    this.userScansKey = 'quantum:user_scans'
    this.boostQueueKey = 'quantum:boost_queue'
    this.randomOrgUrl = 'https://www.random.org/integers/'
  }

  /**
   * Calculate quantum entropy for product
   * Returns: 0.0 - 1.0 (higher = hotter deal)
   */
  async calculateEntropy(ean, userScanData = null) {
    const entropy = {
      ean,
      sources: {},
      total: 0,
      timestamp: Date.now()
    }

    // 1. User Scans Entropy (0.0 - 0.4)
    const userScans = await this.getUserScans(ean, 5) // Last 5 minutes
    entropy.sources.userScans = Math.min(0.4, userScans.length * 0.08)
    
    // 2. Phone Sensors Entropy (0.0 - 0.3)
    if (userScanData?.sensors) {
      const sensorEntropy = this.calculateSensorEntropy(userScanData.sensors)
      entropy.sources.sensors = sensorEntropy
    } else {
      entropy.sources.sensors = 0
    }

    // 3. Random.org True Random (0.0 - 0.3)
    const randomEntropy = await this.getRandomOrgEntropy()
    entropy.sources.random = randomEntropy

    // Total entropy
    entropy.total = Object.values(entropy.sources).reduce((a, b) => a + b, 0)

    // Save to Redis
    await this.saveEntropy(ean, entropy)

    return entropy
  }

  /**
   * Get user scans for product in last N minutes
   */
  async getUserScans(ean, minutes = 5) {
    const since = Date.now() - (minutes * 60 * 1000)
    const scans = await this.redis.zrangebyscore(
      `${this.userScansKey}:${ean}`,
      since,
      '+inf'
    )

    return scans.map(s => JSON.parse(s))
  }

  /**
   * Record user scan
   */
  async recordUserScan(ean, userId, metadata = {}) {
    const scan = {
      userId,
      ean,
      timestamp: Date.now(),
      metadata
    }

    await this.redis.zadd(
      `${this.userScansKey}:${ean}`,
      scan.timestamp,
      JSON.stringify(scan)
    )

    // Keep only last 1 hour
    const hourAgo = Date.now() - 3600000
    await this.redis.zremrangebyscore(
      `${this.userScansKey}:${ean}`,
      '-inf',
      hourAgo
    )

    // Check if we should boost this product
    const scans = await this.getUserScans(ean, 5)
    if (scans.length >= 3) {
      console.log(`🔥 QUANTUM BOOST: ${ean} - ${scans.length} scans in 5min`)
      await this.boostProduct(ean, 'high_user_interest')
    }

    return scan
  }

  /**
   * Calculate entropy from phone sensors (gyro + accelerometer)
   */
  calculateSensorEntropy(sensors) {
    const { gyro, accel } = sensors

    if (!gyro && !accel) return 0

    let entropy = 0

    // Gyroscope entropy (rotation randomness)
    if (gyro) {
      const gyroMagnitude = Math.sqrt(
        gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2
      )
      // Normalize to 0-0.15
      entropy += Math.min(0.15, gyroMagnitude / 10)
    }

    // Accelerometer entropy (movement randomness)
    if (accel) {
      const accelMagnitude = Math.sqrt(
        accel.x ** 2 + accel.y ** 2 + accel.z ** 2
      )
      // Normalize to 0-0.15
      entropy += Math.min(0.15, accelMagnitude / 20)
    }

    return Math.min(0.3, entropy)
  }

  /**
   * Get true random entropy from Random.org
   */
  async getRandomOrgEntropy() {
    try {
      const response = await axios.get(this.randomOrgUrl, {
        params: {
          num: 1,
          min: 0,
          max: 100,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new'
        },
        timeout: 2000
      })

      const randomValue = parseInt(response.data.trim())
      // Normalize to 0-0.3
      return (randomValue / 100) * 0.3

    } catch (error) {
      // Fallback to Math.random if Random.org fails
      return Math.random() * 0.3
    }
  }

  /**
   * Save entropy to Redis
   */
  async saveEntropy(ean, entropy) {
    await this.redis.setex(
      `${this.entropyKey}:${ean}`,
      3600, // 1 hour TTL
      JSON.stringify(entropy)
    )
  }

  /**
   * Get entropy for product
   */
  async getEntropy(ean) {
    const data = await this.redis.get(`${this.entropyKey}:${ean}`)
    return data ? JSON.parse(data) : null
  }

  /**
   * Boost product crawling (15min → 30s)
   */
  async boostProduct(ean, reason) {
    const boost = {
      ean,
      reason,
      boostedAt: Date.now(),
      interval: 30000, // 30 seconds
      priority: 'urgent'
    }

    // Add to boost queue (sorted by priority)
    await this.redis.zadd(
      this.boostQueueKey,
      10, // High priority score
      JSON.stringify(boost)
    )

    console.log(`⚡ BOOST: ${ean} - crawling every 30s (reason: ${reason})`)

    return boost
  }

  /**
   * Get products in boost queue
   */
  async getBoostQueue() {
    const items = await this.redis.zrevrange(this.boostQueueKey, 0, -1)
    return items.map(i => JSON.parse(i))
  }

  /**
   * Remove product from boost queue (after deal expires)
   */
  async removeBoost(ean) {
    const items = await this.getBoostQueue()
    const toRemove = items.find(i => i.ean === ean)
    
    if (toRemove) {
      await this.redis.zrem(this.boostQueueKey, JSON.stringify(toRemove))
      console.log(`🔻 Boost removed: ${ean}`)
    }
  }

  /**
   * Calculate deal score with quantum boost
   * Base score + entropy multiplier
   */
  calculateDealScore(baseScore, entropy) {
    if (!entropy) return baseScore

    // Quantum multiplier: 1.0x - 2.5x based on entropy
    const multiplier = 1.0 + (entropy.total * 1.5)

    const boostedScore = baseScore * multiplier

    return {
      base: baseScore,
      entropy: entropy.total,
      multiplier,
      final: Math.min(10, boostedScore)
    }
  }

  /**
   * Detect quantum correlation (multiple users scanning same product)
   */
  async detectCorrelation(ean) {
    const scans = await this.getUserScans(ean, 10) // Last 10 minutes

    if (scans.length < 3) return null

    // Get unique users
    const uniqueUsers = new Set(scans.map(s => s.userId))

    // Correlation strength
    const correlation = {
      ean,
      userCount: uniqueUsers.size,
      scanCount: scans.length,
      timeWindow: 10, // minutes
      strength: Math.min(1.0, uniqueUsers.size / 5), // 0-1.0
      isHot: uniqueUsers.size >= 3
    }

    if (correlation.isHot) {
      console.log(`🌟 QUANTUM CORRELATION: ${ean} - ${uniqueUsers.size} users in 10min`)
      await this.boostProduct(ean, 'quantum_correlation')
    }

    return correlation
  }

  /**
   * Get hot products (high entropy or correlation)
   */
  async getHotProducts(threshold = 0.7) {
    const keys = await this.redis.keys(`${this.entropyKey}:*`)
    const hotProducts = []

    for (const key of keys) {
      const data = await this.redis.get(key)
      if (!data) continue

      const entropy = JSON.parse(data)
      if (entropy.total >= threshold) {
        hotProducts.push(entropy)
      }
    }

    // Sort by entropy (highest first)
    return hotProducts.sort((a, b) => b.total - a.total)
  }

  /**
   * Social signals integration (Twitter/X monitoring)
   */
  async checkSocialSignals(ean, productName) {
    // This would integrate with Twitter/X API
    // For now, simulate
    const socialBuzz = {
      ean,
      productName,
      mentions: 0,
      sentiment: 'neutral',
      boost: 0
    }

    // TODO: Implement Twitter/X API integration
    // const tweets = await searchTwitter(productName + ' okazja')
    // if (tweets.length >= 10) {
    //   socialBuzz.mentions = tweets.length
    //   socialBuzz.sentiment = 'positive'
    //   socialBuzz.boost = 0.2
    //   await this.boostProduct(ean, 'social_buzz')
    // }

    return socialBuzz
  }

  /**
   * Cleanup old entropy data
   */
  async cleanup() {
    // Remove expired entropy entries (>1h old)
    const keys = await this.redis.keys(`${this.entropyKey}:*`)
    let removed = 0

    for (const key of keys) {
      const data = await this.redis.get(key)
      if (!data) continue

      const entropy = JSON.parse(data)
      const age = Date.now() - entropy.timestamp

      if (age > 3600000) { // 1 hour
        await this.redis.del(key)
        removed++
      }
    }

    console.log(`🧹 Cleaned up ${removed} old entropy entries`)
    return removed
  }

  /**
   * Get quantum boost summary
   */
  async getSummary() {
    const boostQueue = await this.getBoostQueue()
    const hotProducts = await this.getHotProducts(0.7)

    return {
      boostQueue: {
        count: boostQueue.length,
        products: boostQueue.slice(0, 10)
      },
      hotProducts: {
        count: hotProducts.length,
        top10: hotProducts.slice(0, 10)
      },
      stats: {
        avgEntropy: hotProducts.length > 0 ?
          hotProducts.reduce((sum, p) => sum + p.total, 0) / hotProducts.length : 0,
        maxEntropy: hotProducts.length > 0 ?
          Math.max(...hotProducts.map(p => p.total)) : 0
      }
    }
  }
}

module.exports = QuantumBooster
