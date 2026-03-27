/**
 * REDIS CACHE for Reviews
 * TTL: 30 days (świeże opinie, nie stare dane)
 */

const redis = require('redis');

let client = null;

// Initialize Redis client
async function initRedis() {
  if (client) return client;
  
  try {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
    
    if (!redisUrl) {
      console.warn('[Reviews Cache] No Redis URL - using memory cache');
      return null;
    }
    
    client = redis.createClient({
      url: redisUrl
    });
    
    client.on('error', (err) => console.error('[Reviews Cache] Redis error:', err));
    
    await client.connect();
    console.log('[Reviews Cache] Redis connected');
    
    return client;
  } catch (error) {
    console.error('[Reviews Cache] Redis init error:', error.message);
    return null;
  }
}

// Memory cache fallback
const memoryCache = new Map();

/**
 * Get from cache
 */
async function cacheGet(key) {
  try {
    const redisClient = await initRedis();
    
    if (redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Memory cache fallback
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
      return null;
    }
  } catch (error) {
    console.error('[Reviews Cache] Get error:', error.message);
    return null;
  }
}

/**
 * Set to cache
 */
async function cacheSet(key, value, ttlSeconds = 30 * 24 * 60 * 60) {
  try {
    const redisClient = await initRedis();
    
    if (redisClient) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      // Memory cache fallback
      memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttlSeconds * 1000)
      });
      
      // Cleanup old entries
      if (memoryCache.size > 1000) {
        const now = Date.now();
        for (const [k, v] of memoryCache.entries()) {
          if (v.expires < now) {
            memoryCache.delete(k);
          }
        }
      }
    }
  } catch (error) {
    console.error('[Reviews Cache] Set error:', error.message);
  }
}

module.exports = {
  cacheGet,
  cacheSet
};
