/**
 * FALLBACK & BLACKLIST MANAGER
 * 
 * Features:
 * - Track failures per domain
 * - 3 consecutive failures = 24h blacklist
 * - Blacklisted domains = SearchAPI fallback
 * - Auto-recovery after 24h
 */

const Redis = require('ioredis');

class FallbackManager {
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
    
    this.failureCount = new Map(); // domain -> count
    this.maxFailures = 3;
    this.blacklistDuration = 86400; // 24 hours
  }

  /**
   * Record failure for domain
   */
  async recordFailure(domain, error = null) {
    const count = (this.failureCount.get(domain) || 0) + 1;
    this.failureCount.set(domain, count);
    
    console.log(`[Fallback] ❌ Failure #${count} for ${domain}${error ? ': ' + error : ''}`);
    
    // 3 failures in a row = 24h blacklist
    if (count >= this.maxFailures) {
      await this.blacklist(domain);
      this.failureCount.delete(domain);
    }
  }

  /**
   * Record success (reset failure count)
   */
  recordSuccess(domain) {
    if (this.failureCount.has(domain)) {
      this.failureCount.delete(domain);
      console.log(`[Fallback] ✅ Success for ${domain} - failure count reset`);
    }
  }

  /**
   * Blacklist domain for 24 hours
   */
  async blacklist(domain) {
    try {
      console.log(`[Fallback] 🚫 BLACKLISTING ${domain} for 24h (3 consecutive failures)`);
      
      // Add to Redis blacklist with 24h TTL
      await this.redis.setex(`blacklist:${domain}`, this.blacklistDuration, Date.now().toString());
      
      // Remove from priority queue
      await this.redis.zrem('priority:domains', domain);
      
      // Track blacklist event
      await this.redis.incr('stats:blacklisted');
      
    } catch (error) {
      console.error(`[Fallback] Error blacklisting domain:`, error.message);
    }
  }

  /**
   * Check if domain is blacklisted
   */
  async isBlacklisted(domain) {
    try {
      const exists = await this.redis.exists(`blacklist:${domain}`);
      return exists === 1;
    } catch (error) {
      console.error(`[Fallback] Error checking blacklist:`, error.message);
      return false;
    }
  }

  /**
   * Get blacklist info for domain
   */
  async getBlacklistInfo(domain) {
    try {
      const timestamp = await this.redis.get(`blacklist:${domain}`);
      if (!timestamp) return null;
      
      const ttl = await this.redis.ttl(`blacklist:${domain}`);
      
      return {
        blacklisted: true,
        since: new Date(parseInt(timestamp)),
        expiresIn: ttl,
        expiresAt: new Date(Date.now() + ttl * 1000)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fallback to SearchAPI
   */
  async fallbackToSearchAPI(product) {
    console.log(`[Fallback] 🔄 Using SearchAPI fallback for: ${product}`);
    
    try {
      // Use SearchAPI.io as fallback
      const searchAPI = require('../market/providers/searchapi');
      const results = await searchAPI.search(product, {
        country: 'nl',
        language: 'nl'
      });
      
      console.log(`[Fallback] ✅ SearchAPI returned ${results.length} results`);
      return results;
      
    } catch (error) {
      console.error(`[Fallback] SearchAPI failed:`, error.message);
      return [];
    }
  }

  /**
   * Get blacklist statistics
   */
  async getStats() {
    try {
      const blacklistedCount = await this.redis.get('stats:blacklisted') || 0;
      
      // Get all blacklisted domains
      const keys = await this.redis.keys('blacklist:*');
      const currentBlacklisted = keys.map(k => k.replace('blacklist:', ''));
      
      return {
        totalBlacklisted: parseInt(blacklistedCount),
        currentBlacklisted: currentBlacklisted.length,
        domains: currentBlacklisted
      };
    } catch (error) {
      return {
        totalBlacklisted: 0,
        currentBlacklisted: 0,
        domains: []
      };
    }
  }

  /**
   * Manually remove from blacklist
   */
  async removeFromBlacklist(domain) {
    try {
      await this.redis.del(`blacklist:${domain}`);
      console.log(`[Fallback] ✅ Removed ${domain} from blacklist`);
    } catch (error) {
      console.error(`[Fallback] Error removing from blacklist:`, error.message);
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
  }
}

module.exports = FallbackManager;
