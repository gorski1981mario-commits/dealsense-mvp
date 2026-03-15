class APICache {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.defaultTTL = options.defaultTTL || 21600; // 6 hours default
    this.enabled = !!redisClient;
  }

  generateKey(prefix, params) {
    const sorted = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
    return `${prefix}:${JSON.stringify(sorted)}`;
  }

  async get(key) {
    if (!this.enabled) return null;
    
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        console.log(`Cache HIT: ${key}`);
        return data;
      }
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    if (!this.enabled) return false;
    
    try {
      const expiry = ttl || this.defaultTTL;
      await this.redis.setex(key, expiry, JSON.stringify(value));
      console.log(`Cache SET: ${key} (TTL: ${expiry}s)`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async checkRateLimit(key, maxRequests, windowSeconds) {
    if (!this.enabled) return { allowed: true, remaining: maxRequests };
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      const allowed = current <= maxRequests;
      const remaining = Math.max(0, maxRequests - current);
      
      console.log(`Rate limit check: ${key} - ${current}/${maxRequests} (allowed: ${allowed})`);
      
      return { allowed, remaining, current };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }

  async getStats() {
    if (!this.enabled) return { enabled: false };
    
    try {
      const info = await this.redis.info('stats');
      return {
        enabled: true,
        info: info
      };
    } catch (error) {
      return { enabled: true, error: error.message };
    }
  }
}

module.exports = APICache;
