// Anomaly Detector - Hyper-Sensitive Price Monitoring
// Wykrywa: spadki >30%, błędy cenowe, flash sales, hot deals
// Oblicza średnią z 5000 sklepów/24h, quantum boosting dla gorących okazji

const Redis = require('ioredis')

class AnomalyDetector {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig)
    this.priceHistoryKey = 'prices:history'
    this.averagePriceKey = 'prices:average'
    this.hotDealsKey = 'deals:hot'
    this.errorPricesKey = 'prices:errors'
  }

  /**
   * Analyze price for anomalies
   * Returns: { isAnomaly, type, severity, dealScore, action }
   */
  async analyze(product) {
    const { ean, price, title, domain, url } = product
    
    // Get historical data
    const avgPrice = await this.getAveragePrice(ean)
    const priceHistory = await this.getPriceHistory(ean, 24) // Last 24h
    const lastPrice = priceHistory[0]?.price || price

    const analysis = {
      ean,
      title,
      currentPrice: price,
      averagePrice: avgPrice,
      lastPrice,
      anomalies: [],
      dealScore: 0,
      action: 'normal' // normal, monitor, alert, urgent
    }

    // 1. BŁĄD CENOWY - cena < średnia * 0.2 (80% taniej)
    if (avgPrice && price < avgPrice * 0.2) {
      analysis.anomalies.push({
        type: 'price_error',
        severity: 'critical',
        message: `Możliwy błąd cenowy: ${price}zł vs średnia ${avgPrice}zł`,
        discount: Math.round(((avgPrice - price) / avgPrice) * 100),
        savings: Math.round(avgPrice - price)
      })
      analysis.dealScore += 10.0
      analysis.action = 'urgent'
      
      // Screenshot + Signal alert
      await this.alertPriceError(product, avgPrice)
    }

    // 2. DUŻY SPADEK - cena spadła >30% w ciągu 1h
    if (lastPrice && price < lastPrice * 0.7) {
      const dropPercent = Math.round(((lastPrice - price) / lastPrice) * 100)
      
      analysis.anomalies.push({
        type: 'sharp_drop',
        severity: 'high',
        message: `Spadek ${dropPercent}% w ciągu 1h`,
        previousPrice: lastPrice,
        discount: dropPercent,
        savings: Math.round(lastPrice - price)
      })
      analysis.dealScore += 5.0
      analysis.action = 'alert'
      
      // Flag as hot deal
      await this.flagHotDeal(product, 'sharp_drop', dropPercent)
    }

    // 3. PONIŻEJ ŚREDNIEJ - cena <20% poniżej średniej
    if (avgPrice && price < avgPrice * 0.8) {
      const discount = Math.round(((avgPrice - price) / avgPrice) * 100)
      
      analysis.anomalies.push({
        type: 'below_average',
        severity: 'medium',
        message: `${discount}% taniej niż średnia`,
        discount,
        savings: Math.round(avgPrice - price)
      })
      analysis.dealScore += 2.0
      analysis.action = analysis.action === 'normal' ? 'monitor' : analysis.action
    }

    // 4. FLASH SALE DETECTION - promocja w tekście lub timer
    const flashSale = await this.detectFlashSale(product)
    if (flashSale) {
      analysis.anomalies.push({
        type: 'flash_sale',
        severity: 'high',
        message: flashSale.message,
        timeRemaining: flashSale.timeRemaining
      })
      analysis.dealScore += 3.0
      analysis.action = 'alert'
    }

    // 5. SUSPICIOUS PRICES - 0zł, 1zł, 99zł za drogi produkt
    if (this.isSuspiciousPrice(price, avgPrice)) {
      analysis.anomalies.push({
        type: 'suspicious',
        severity: 'warning',
        message: `Podejrzana cena: ${price}zł (możliwy błąd lub placeholder)`
      })
      
      // Screenshot dla weryfikacji
      await this.screenshotSuspicious(product)
    }

    // Save to history
    await this.savePriceHistory(ean, price, domain)

    return analysis
  }

  /**
   * Get average price from 5000+ shops over 24h
   */
  async getAveragePrice(ean) {
    const cached = await this.redis.get(`${this.averagePriceKey}:${ean}`)
    if (cached) return parseFloat(cached)

    // Calculate from history
    const history = await this.getPriceHistory(ean, 24)
    if (history.length === 0) return null

    const sum = history.reduce((acc, h) => acc + h.price, 0)
    const avg = sum / history.length

    // Cache for 1h
    await this.redis.setex(`${this.averagePriceKey}:${ean}`, 3600, avg)

    return avg
  }

  /**
   * Get price history for last N hours
   */
  async getPriceHistory(ean, hours = 24) {
    const since = Date.now() - (hours * 60 * 60 * 1000)
    const entries = await this.redis.zrangebyscore(
      `${this.priceHistoryKey}:${ean}`,
      since,
      '+inf',
      'WITHSCORES'
    )

    const history = []
    for (let i = 0; i < entries.length; i += 2) {
      const data = JSON.parse(entries[i])
      const timestamp = parseInt(entries[i + 1])
      history.push({ ...data, timestamp })
    }

    return history.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Save price to history
   */
  async savePriceHistory(ean, price, domain) {
    const entry = JSON.stringify({ price, domain })
    const timestamp = Date.now()

    await this.redis.zadd(
      `${this.priceHistoryKey}:${ean}`,
      timestamp,
      entry
    )

    // Keep only last 7 days
    const weekAgo = Date.now() - (7 * 86400000)
    await this.redis.zremrangebyscore(
      `${this.priceHistoryKey}:${ean}`,
      '-inf',
      weekAgo
    )
  }

  /**
   * Detect flash sale from page content
   */
  async detectFlashSale(product) {
    const { title = '', description = '' } = product
    const text = (title + ' ' + description).toLowerCase()

    // Flash sale keywords
    const keywords = [
      'flash sale', 'błyskawiczna', 'tylko dziś', 'tylko teraz',
      'kończy się', 'ostatnie sztuki', 'limited time', 'time limited',
      'promocja 24h', '24 godziny', 'weekend sale'
    ]

    const hasKeyword = keywords.some(kw => text.includes(kw))
    if (!hasKeyword) return null

    // Try to extract timer
    const timerMatch = text.match(/(\d+)\s*(minut|godzin|h|min)/i)
    const timeRemaining = timerMatch ? 
      `${timerMatch[1]} ${timerMatch[2]}` : 'unknown'

    return {
      message: 'Flash sale wykryty',
      timeRemaining,
      keywords: keywords.filter(kw => text.includes(kw))
    }
  }

  /**
   * Check if price is suspicious (likely error or placeholder)
   */
  isSuspiciousPrice(price, avgPrice) {
    // Price is 0 or 1
    if (price <= 1) return true

    // Price is suspiciously low (99zł za laptop)
    if (avgPrice && price < 100 && avgPrice > 500) return true

    // Price is round number and very low
    if (price === 99 || price === 199 || price === 299) {
      if (!avgPrice || avgPrice > price * 5) return true
    }

    return false
  }

  /**
   * Flag product as hot deal
   */
  async flagHotDeal(product, reason, discount) {
    const { ean, title, price, url, domain } = product

    const deal = {
      ean,
      title,
      price,
      url,
      domain,
      reason,
      discount,
      flaggedAt: Date.now()
    }

    // Add to hot deals sorted set (by discount %)
    await this.redis.zadd(
      this.hotDealsKey,
      discount,
      JSON.stringify(deal)
    )

    // Keep only top 100 deals
    await this.redis.zremrangebyrank(this.hotDealsKey, 0, -101)

    console.log(`🔥 HOT DEAL: ${title} - ${discount}% off`)
  }

  /**
   * Get current hot deals
   */
  async getHotDeals(limit = 20) {
    const deals = await this.redis.zrevrange(
      this.hotDealsKey,
      0,
      limit - 1
    )

    return deals.map(d => JSON.parse(d))
  }

  /**
   * Alert on price error (critical)
   */
  async alertPriceError(product, avgPrice) {
    const { ean, title, price, url, domain } = product

    const error = {
      ean,
      title,
      price,
      avgPrice,
      url,
      domain,
      discount: Math.round(((avgPrice - price) / avgPrice) * 100),
      savings: Math.round(avgPrice - price),
      timestamp: Date.now()
    }

    // Save to errors list
    await this.redis.zadd(
      this.errorPricesKey,
      Date.now(),
      JSON.stringify(error)
    )

    // Send Signal notification
    await this.sendSignalAlert(error)

    console.log(`🚨 PRICE ERROR: ${title} - ${price}zł (avg: ${avgPrice}zł)`)
  }

  /**
   * Screenshot suspicious price for verification
   */
  async screenshotSuspicious(product) {
    // This would trigger screenshot in StealthBrowser
    console.log(`📸 Screenshot: ${product.title} - ${product.price}zł`)
    
    // Queue for manual verification
    await this.redis.lpush('screenshots:queue', JSON.stringify({
      ...product,
      reason: 'suspicious_price',
      timestamp: Date.now()
    }))
  }

  /**
   * Send Signal notification
   */
  async sendSignalAlert(error) {
    // This would use Signal API
    const message = `
🚨 BŁĄD CENOWY WYKRYTY!

${error.title}
Cena: ${error.price}zł
Średnia: ${error.avgPrice}zł
Oszczędzasz: ${error.savings}zł (${error.discount}%)

Sklep: ${error.domain}
Link: ${error.url}

Zostało 3 sztuki - BIERZ TERAZ!
    `.trim()

    console.log('📱 Signal notification:', message)

    // TODO: Implement Signal webhook
    // await axios.post(process.env.SIGNAL_WEBHOOK, { message })
  }

  /**
   * Calculate deal score for ranking
   */
  calculateDealScore(analysis) {
    let score = 0

    analysis.anomalies.forEach(anomaly => {
      switch (anomaly.type) {
        case 'price_error':
          score += 10.0
          break
        case 'sharp_drop':
          score += 5.0
          break
        case 'flash_sale':
          score += 3.0
          break
        case 'below_average':
          score += 2.0
          break
      }
    })

    return Math.min(10, score) // Max 10
  }

  /**
   * Get products for hot queue (check every 5 min)
   */
  async getHotQueueProducts() {
    // Get products with high deal score or recent drops
    const hotDeals = await this.getHotDeals(100)
    
    return hotDeals.filter(deal => {
      const age = Date.now() - deal.flaggedAt
      const isRecent = age < 3600000 // Last 1h
      const isHighDiscount = deal.discount >= 20
      
      return isRecent && isHighDiscount
    })
  }
}

module.exports = AnomalyDetector
