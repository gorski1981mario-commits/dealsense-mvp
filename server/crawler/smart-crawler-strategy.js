// SMART CRAWLER STRATEGY
// MAX PERFORMANCE + MIN KOSZTY
// Cache-first, Priority Queue, Smart Targeting

const Redis = require('ioredis')
const Bull = require('bull')
const smartRotation = require('./smart-rotation')

// Redis client for caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Bull queue for priority-based crawling
const crawlerQueue = new Bull('crawler', process.env.REDIS_URL || 'redis://localhost:6379')

// Domain lists
const domains = require('./domains-1000-nl-final')

/**
 * SMART CRAWLER STRATEGY
 * 
 * 1. CACHE FIRST (90% hit rate)
 * 2. SMART TARGETING (10-30 domen zamiast 1000)
 * 3. PRIORITY QUEUE (giganci fast, niszowe slow)
 * 4. 60/40 MIX (60% niszowych = przebicia)
 */
class SmartCrawlerStrategy {
  constructor() {
    this.cacheExpiry = 3600 // 1 hour
    this.maxConcurrent = 5 // Max 5 requests/sec per domain
  }

  /**
   * MAIN ENTRY POINT
   * Inteligentne wyszukiwanie z cache i smart targeting
   */
  async search(options) {
    const {
      query,           // "iPhone 15 Pro" lub null
      ean,             // "8719273287891" lub null
      category,        // "electronics", "telecom", etc.
      packageType,     // "free" | "plus" | "pro" | "finance"
      userId
    } = options

    console.log('[Smart Crawler] Search:', { query, ean, category, packageType })

    // 1. CHECK CACHE FIRST (90% oszczędności!)
    const cacheKey = this.getCacheKey(query, ean, category)
    const cached = await this.getFromCache(cacheKey)
    
    if (cached) {
      console.log('[Smart Crawler] Cache HIT! ✅ Cost: €0.001')
      
      // Apply smart rotation (każdy user widzi inną kolejność!)
      const filtered = this.smartFilter(cached.offers, packageType)
      const basePrice = query ? 999 : null // TODO: Get real base price from query/ean
      const rotated = smartRotation.rotateOffers(filtered, userId, packageType, basePrice)
      
      return {
        offers: rotated,
        cached: true,
        scrapedAt: cached.scrapedAt,
        cost: 0.001
      }
    }

    console.log('[Smart Crawler] Cache MISS. Starting smart crawl...')

    // 2. SMART TARGETING (nie wszystkie 1000 domen!)
    const targetDomains = this.getTargetDomains(category, ean)
    console.log(`[Smart Crawler] Targeting ${targetDomains.length} domains (not 1000!)`)

    // 3. PRIORITY QUEUE (giganci fast, niszowe slow)
    const jobs = targetDomains.map(domain => ({
      domain,
      query,
      ean,
      category,
      priority: this.getPriority(domain)
    }))

    // 4. EXECUTE CRAWL (parallel with rate limiting)
    const results = await this.executeCrawl(jobs)
    
    // 5. AGGREGATE & FILTER
    const allOffers = this.aggregateResults(results)
    
    // 6. CACHE FOR 1 HOUR
    await this.saveToCache(cacheKey, allOffers)
    
    // 7. SMART FILTER based on package
    const filtered = this.smartFilter(allOffers, packageType)
    
    // 8. SMART ROTATION (każdy user widzi inną kolejność!)
    const basePrice = query ? 999 : null // TODO: Get real base price from query/ean
    const rotated = smartRotation.rotateOffers(filtered, userId, packageType, basePrice)

    const cost = this.calculateCost(targetDomains.length, false)
    console.log(`[Smart Crawler] Done! Cost: €${cost}`)

    return {
      offers: rotated,
      cached: false,
      scrapedAt: Date.now(),
      cost
    }
  }

  /**
   * SMART TARGETING
   * Zamiast 1000 domen, wybieramy tylko 10-30 najlepszych dla kategorii
   */
  getTargetDomains(category, ean) {
    // EAN SCAN: tylko 10 domen (5 gigantów + 5 niszowych)
    if (ean) {
      const giganci = domains.giganci.slice(0, 5)
      const niszowe = domains.niszowe.slice(0, 5)
      return [...giganci, ...niszowe]
    }

    // CONFIGURATOR: 20-30 domen z kategorii
    const categoryMap = {
      'electronics': {
        giganci: domains.giganci.slice(0, 20), // Top 20 electronics gigantów
        niszowe: domains.niszowe.slice(0, 30)  // Top 30 electronics niszowych
      },
      'telecom': {
        giganci: ['kpn.com', 'vodafone.nl', 't-mobile.nl', 'tele2.nl', 'simyo.nl'],
        niszowe: ['hollandsnieuwe.nl', 'youfone.nl', 'ben.nl', 'lebara.nl', 'budgetmobiel.nl']
      },
      'energy': {
        giganci: ['vattenfall.nl', 'essent.nl', 'eneco.nl', 'greenchoice.nl'],
        niszowe: ['gaslicht.com', 'energiedirect.nl', 'budget-energie.nl', 'oxxio.nl']
      },
      'insurance': {
        giganci: ['independer.nl', 'polis-direct.nl', 'centraal-beheer.nl', 'aegon.nl'],
        niszowe: ['inshared.nl', 'nationale-nederlanden.nl', 'reaal.nl', 'univé.nl']
      },
      'travel': {
        giganci: ['booking.com', 'hotels.com', 'expedia.nl', 'tui.nl', 'corendon.nl'],
        niszowe: ['sunweb.nl', 'd-reizen.nl', 'prijsvrij.nl', 'vakantiediscounter.nl']
      }
    }

    const targets = categoryMap[category] || {
      giganci: domains.giganci.slice(0, 8),
      niszowe: domains.niszowe.slice(0, 12)
    }

    // 60/40 mix (60% niszowych = przebicia!)
    return [...targets.niszowe, ...targets.giganci]
  }

  /**
   * PRIORITY QUEUE
   * Giganci = priority 1 (fast, expensive)
   * Niszowe = priority 3 (slow, cheap)
   */
  getPriority(domain) {
    const isGigant = domains.giganci.includes(domain)
    return isGigant ? 1 : 3
  }

  /**
   * EXECUTE CRAWL
   * Parallel execution with rate limiting
   */
  async executeCrawl(jobs) {
    const results = []
    
    // Add jobs to Bull queue
    for (const job of jobs) {
      await crawlerQueue.add(job, {
        priority: job.priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      })
    }

    // Wait for all jobs to complete
    // (In production, this would be handled by Bull workers)
    // For now, simulate with timeout
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock results (in production, fetch from Bull queue results)
    return jobs.map(job => ({
      domain: job.domain,
      offers: this.mockOffers(job.domain, job.query, job.ean)
    }))
  }

  /**
   * AGGREGATE RESULTS
   * Combine offers from all domains
   */
  aggregateResults(results) {
    const allOffers = []
    
    for (const result of results) {
      if (result.offers && result.offers.length > 0) {
        allOffers.push(...result.offers)
      }
    }

    // Sort by price (lowest first)
    return allOffers.sort((a, b) => a.price - b.price)
  }

  /**
   * SMART FILTER
   * Filter offers based on package type
   * 60% niszowych + 40% gigantów
   */
  smartFilter(allOffers, packageType) {
    const maxOffers = this.getMaxOffers(packageType)
    
    // Separate niszowe and giganci
    const niszowe = allOffers.filter(o => o.source === 'niszowy')
    const giganci = allOffers.filter(o => o.source === 'gigant')
    
    // Calculate 60/40 split
    const niszowyCount = Math.ceil(maxOffers * 0.6)
    const giganciCount = maxOffers - niszowyCount
    
    // Take top offers from each group
    const topNiszowe = niszowe.slice(0, niszowyCount)
    const topGiganci = giganci.slice(0, giganciCount)
    
    // Combine and sort by price
    const filtered = [...topNiszowe, ...topGiganci]
      .sort((a, b) => a.price - b.price)
    
    return filtered
  }

  /**
   * GET MAX OFFERS
   */
  getMaxOffers(packageType) {
    switch (packageType) {
      case 'free': return 3
      case 'plus': return 10
      case 'pro': return 25
      case 'finance': return 50
      default: return 3
    }
  }

  /**
   * CACHE LAYER
   */
  getCacheKey(query, ean, category) {
    if (ean) return `crawler:ean:${ean}`
    if (query) return `crawler:query:${Buffer.from(query).toString('base64')}:${category}`
    return `crawler:category:${category}`
  }

  async getFromCache(key) {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('[Cache Error]', error)
      return null
    }
  }

  async saveToCache(key, offers) {
    try {
      await redis.setex(key, this.cacheExpiry, JSON.stringify({
        offers,
        scrapedAt: Date.now()
      }))
    } catch (error) {
      console.error('[Cache Error]', error)
    }
  }

  /**
   * COST CALCULATION
   */
  calculateCost(domainCount, cached) {
    if (cached) return 0.001 // Cache hit
    return domainCount * 0.01 // €0.01 per domain
  }

  /**
   * MOCK OFFERS (for testing)
   * In production, replace with real crawler results
   */
  mockOffers(domain, query, ean) {
    const isNiszowy = domains.niszowe.includes(domain)
    const basePrice = 999
    const priceVariation = isNiszowy ? 0.95 : 1.05 // Niszowe 5% taniej
    
    return [{
      title: query || `Product ${ean}`,
      price: basePrice * priceVariation,
      seller: domain,
      source: isNiszowy ? 'niszowy' : 'gigant',
      condition: 'new',
      shipping: 0,
      rating: 4.5,
      reviews: 100,
      inStock: true,
      url: `https://${domain}/product`,
      cartUrl: `https://${domain}/cart/add`,
      dealScore: isNiszowy ? 8.5 : 7.0
    }]
  }
}

module.exports = new SmartCrawlerStrategy()
