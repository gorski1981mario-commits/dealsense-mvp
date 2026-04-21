/**
 * KWANT CACHE STUB
 * Uproszczony cache dla KWANT (bez Upstash Redis)
 */

const memoryCache = new Map();

// Get z cache
async function get(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  // Sprawdź TTL
  if (cached.expiresAt && Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.value;
}

// Set do cache
async function set(key, value, ttlSeconds = 3600) {
  const expiresAt = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
  memoryCache.set(key, { value, expiresAt });
  return true;
}

// Delete z cache
async function del(key) {
  return memoryCache.delete(key);
}

// Clear całego cache
async function clear() {
  memoryCache.clear();
  return true;
}

// Stats
async function stats() {
  return {
    keys: memoryCache.size,
    type: 'memory',
    stub: true
  };
}

module.exports = {
  get,
  set,
  del,
  clear,
  stats
};
