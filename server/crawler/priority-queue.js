/**
 * REDIS PRIORITY QUEUE
 * 
 * Smart domain selection based on:
 * 1. High Entropy (frequent price changes)
 * 2. Live Scans (users actively scanning product)
 * 3. Price Drops >15% (significant changes in 24h)
 * 4. Niche Shops (highest deal potential)
 * 
 * Top 30-50 domains: every 30 seconds
 * Baseline 450 domains: every 60 minutes
 */

const Redis = require('ioredis');

class PriorityQueue {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    // Niche shop domains (highest deal potential)
    this.nicheShops = new Set([
      'informatique.nl',
      'paradigit.nl',
      'yourbuild.nl',
      'hobo.nl',
      'cameraland.nl',
      'maxiaxi.com',
      'alternate.nl',
      'azerty.nl',
      'megekko.nl',
      'mycom.nl'
    ]);
  }

  /**
   * Calculate priority score for domain
   */
  async calculatePriority(domain, product) {
    let score = 0;
    
    try {
      // 1. HIGH ENTROPY - price changes frequency (0-100)
      const entropy = parseFloat(await this.redis.get(`entropy:${domain}`)) || 0;
      score += entropy * 10; // Max +1000
      
      // 2. LIVE SCANS - users scanning this product now (0-50)
      const liveScans = parseInt(await this.redis.get(`live:${product}`)) || 0;
      score += liveScans * 20; // Max +1000
      
      // 3. PRICE DROPS >15% in last 24h
      const priceDrop = parseFloat(await this.redis.get(`drop:${domain}:${product}`)) || 0;
      if (priceDrop > 15) {
        score += 50; // Bonus +50
      }
      
      // 4. NICHE SHOPS - highest deal potential
      if (this.isNicheShop(domain)) {
        score += 30; // Bonus +30
      }
      
      // 5. RECENT SUCCESS - domains that recently found deals
      const recentSuccess = parseInt(await this.redis.get(`success:${domain}`)) || 0;
      score += recentSuccess * 5; // Max +500
      
      return Math.round(score);
      
    } catch (error) {
      console.error(`[Priority] Error calculating priority for ${domain}:`, error.message);
      return 0;
    }
  }

  /**
   * Update entropy for domain (called after each scrape)
   */
  async updateEntropy(domain, priceChanged) {
    try {
      const key = `entropy:${domain}`;
      const current = parseFloat(await this.redis.get(key)) || 0;
      
      // Increase entropy if price changed, decrease if not
      const newEntropy = priceChanged 
        ? Math.min(current + 10, 100) 
        : Math.max(current - 1, 0);
      
      await this.redis.setex(key, 86400, newEntropy); // 24h TTL
      
    } catch (error) {
      console.error(`[Priority] Error updating entropy:`, error.message);
    }
  }

  /**
   * Track live scan (called when user starts scanning product)
   */
  async trackLiveScan(product) {
    try {
      const key = `live:${product}`;
      await this.redis.incr(key);
      await this.redis.expire(key, 300); // 5 min TTL
      
      console.log(`[Priority] Live scan tracked: ${product}`);
      
    } catch (error) {
      console.error(`[Priority] Error tracking live scan:`, error.message);
    }
  }

  /**
   * Record price drop (called when price change detected)
   */
  async recordPriceDrop(domain, product, dropPercentage) {
    try {
      if (dropPercentage > 15) {
        const key = `drop:${domain}:${product}`;
        await this.redis.setex(key, 86400, dropPercentage); // 24h TTL
        
        console.log(`[Priority] Price drop recorded: ${domain} - ${dropPercentage}%`);
      }
      
    } catch (error) {
      console.error(`[Priority] Error recording price drop:`, error.message);
    }
  }

  /**
   * Record successful scrape (found deal)
   */
  async recordSuccess(domain) {
    try {
      const key = `success:${domain}`;
      await this.redis.incr(key);
      await this.redis.expire(key, 3600); // 1h TTL
      
    } catch (error) {
      console.error(`[Priority] Error recording success:`, error.message);
    }
  }

  /**
   * Check if domain is niche shop
   */
  isNicheShop(domain) {
    return this.nicheShops.has(domain);
  }

  /**
   * Update priority for all domains
   */
  async updatePriorities(domains, product) {
    try {
      console.log(`[Priority] Updating priorities for ${domains.length} domains...`);
      
      const pipeline = this.redis.pipeline();
      
      for (const domain of domains) {
        const score = await this.calculatePriority(domain, product);
        
        // Add to priority sorted set
        pipeline.zadd('priority:domains', score, domain);
      }
      
      await pipeline.exec();
      
      console.log(`[Priority] ✅ Priorities updated`);
      
    } catch (error) {
      console.error(`[Priority] Error updating priorities:`, error.message);
    }
  }

  /**
   * Get top priority domains (scraped every 30 seconds)
   */
  async getTopDomains(limit = 50) {
    try {
      // Get top 30-50 domains with highest scores
      const domains = await this.redis.zrevrange('priority:domains', 0, limit - 1, 'WITHSCORES');
      
      // Parse results (domain, score, domain, score, ...)
      const result = [];
      for (let i = 0; i < domains.length; i += 2) {
        result.push({
          domain: domains[i],
          score: parseFloat(domains[i + 1])
        });
      }
      
      console.log(`[Priority] Top ${result.length} domains (scores: ${result[0]?.score || 0} - ${result[result.length - 1]?.score || 0})`);
      
      return result;
      
    } catch (error) {
      console.error(`[Priority] Error getting top domains:`, error.message);
      return [];
    }
  }

  /**
   * Get baseline domains (scraped every 60 minutes)
   */
  async getBaselineDomains() {
    try {
      // Get all domains except top 50
      const allDomains = await this.redis.zrevrange('priority:domains', 50, -1);
      
      console.log(`[Priority] Baseline: ${allDomains.length} domains`);
      
      return allDomains.map(domain => ({ domain, score: 0 }));
      
    } catch (error) {
      console.error(`[Priority] Error getting baseline domains:`, error.message);
      return [];
    }
  }

  /**
   * Get domains to scrape based on schedule
   */
  async getDomainsToScrape(product) {
    const now = Date.now();
    const lastTopScrape = parseInt(await this.redis.get('last:top:scrape')) || 0;
    const lastBaselineScrape = parseInt(await this.redis.get('last:baseline:scrape')) || 0;
    
    const domains = [];
    
    // Top domains every 30 seconds
    if (now - lastTopScrape > 30000) {
      const topDomains = await this.getTopDomains(50);
      domains.push(...topDomains);
      await this.redis.set('last:top:scrape', now);
      console.log(`[Priority] 🔥 Scraping TOP 50 domains`);
    }
    
    // Baseline domains every 60 minutes
    if (now - lastBaselineScrape > 3600000) {
      const baselineDomains = await this.getBaselineDomains();
      domains.push(...baselineDomains);
      await this.redis.set('last:baseline:scrape', now);
      console.log(`[Priority] 📊 Scraping BASELINE domains`);
    }
    
    return domains;
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
  }
}

module.exports = PriorityQueue;
