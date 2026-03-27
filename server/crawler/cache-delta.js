/**
 * CACHE DELTA MANAGER
 * 
 * Save 60-70% requests by caching unchanged prices
 * 
 * Logic:
 * 1. Check cache before scraping
 * 2. If price exists AND age < 30min → skip scrape
 * 3. If age > 30min OR no cache → scrape + update cache
 * 
 * Redis key: cache:{domain}:{product}
 * Value: { price, timestamp }
 */

const Redis = require('ioredis');

class CacheManager {
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
    
    this.cacheMaxAge = 30 * 60 * 1000; // 30 minutes
    this.cacheTTL = 3600; // 1 hour
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0
    };
  }

  /**
   * Check cache before scraping
   * Returns cached data if fresh, null if stale/missing
   */
  async checkCache(domain, product) {
    try {
      const key = `cache:${domain}:${product}`;
      const cached = await this.redis.hgetall(key);
      
      if (!cached || !cached.price || !cached.timestamp) {
        this.stats.misses++;
        return null;
      }
      
      const age = Date.now() - parseInt(cached.timestamp);
      
      // Skip if price unchanged for 30 minutes
      if (age < this.cacheMaxAge) {
        this.stats.hits++;
        console.log(`[Cache] ✅ HIT for ${domain} (age: ${Math.round(age / 1000)}s, price: €${cached.price})`);
        
        return {
          price: parseFloat(cached.price),
          timestamp: parseInt(cached.timestamp),
          age,
          cached: true
        };
      }
      
      // Cache expired
      this.stats.misses++;
      console.log(`[Cache] ❌ EXPIRED for ${domain} (age: ${Math.round(age / 1000)}s)`);
      return null;
      
    } catch (error) {
      console.error(`[Cache] Error checking cache:`, error.message);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Save price to cache
   */
  async saveCache(domain, product, price) {
    try {
      const key = `cache:${domain}:${product}`;
      
      await this.redis.hmset(key, {
        price: price.toString(),
        timestamp: Date.now().toString()
      });
      
      await this.redis.expire(key, this.cacheTTL);
      
      this.stats.saves++;
      console.log(`[Cache] 💾 SAVED ${domain} - €${price}`);
      
    } catch (error) {
      console.error(`[Cache] Error saving cache:`, error.message);
    }
  }

  /**
   * Check if price changed (for entropy calculation)
   */
  async priceChanged(domain, product, newPrice) {
    try {
      const key = `cache:${domain}:${product}`;
      const cached = await this.redis.hgetall(key);
      
      if (!cached || !cached.price) {
        return true; // No previous price = changed
      }
      
      const oldPrice = parseFloat(cached.price);
      const changed = Math.abs(oldPrice - newPrice) > 0.01;
      
      if (changed) {
        const diff = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
        console.log(`[Cache] 📊 Price changed: ${domain} - €${oldPrice} → €${newPrice} (${diff}%)`);
      }
      
      return changed;
      
    } catch (error) {
      console.error(`[Cache] Error checking price change:`, error.message);
      return true;
    }
  }

  /**
   * Batch check cache for multiple domains
   */
  async batchCheckCache(domains, product) {
    const results = await Promise.all(
      domains.map(domain => this.checkCache(domain, product))
    );
    
    const hits = results.filter(r => r !== null).length;
    const hitRate = (hits / domains.length * 100).toFixed(1);
    
    console.log(`[Cache] Batch check: ${hits}/${domains.length} hits (${hitRate}%)`);
    
    return results;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      saves: this.stats.saves,
      total,
      hitRate: hitRate + '%',
      savings: hitRate + '% requests saved'
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0
    };
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
  }
}

module.exports = CacheManager;
