// ROTATION SYSTEM - Core implementation
// 2 modes: GEO-AWARE (preferred) + STANDARD (fallback)

const crypto = require('crypto');

class RotationSystem {
  constructor(redisClient = null) {
    this.redis = redisClient;
    this.allDomains = this.loadAllDomains();
    
    // In-memory fallback (when Redis not available)
    this.memoryCache = {
      seenDomains: new Map(), // userId:product -> Set(domains)
      queryCounts: new Map(), // userId:product -> count
      locations: new Map()    // userId -> {lat, lon, timestamp}
    };
    
    // Config
    this.config = {
      // Geo-aware thresholds (meters)
      sameStreet: 100,
      sameDistrict: 1000,
      sameCity: 5000,
      sameRegion: 50000,
      
      // Rotation
      maxOffset: 500,  // Max domain offset for rotation
      ttlDays: 30,     // History TTL
      
      // Privacy
      anonymize: true,
      storeLocation: false
    };
  }
  
  /**
   * Load all 1000 domains from domains-1000-nl-final.js
   * FILTERED to electronics only for products
   */
  loadAllDomains() {
    try {
      const domains = require('./domains-1000-nl-final');
      const allDomains = [...domains.giganci, ...domains.niszowe];
      
      // Filter to electronics domains only
      const electronicsKeywords = [
        'bol.com', 'coolblue', 'mediamarkt', 'saturn', 'wehkamp',
        'belsimpel', 'mobiel', 'kpn', 'vodafone', 't-mobile', 'tele2',
        'apple', 'samsung', 'sony', 'lg', 'philips', 'canon', 'nikon',
        'alternate', 'azerty', 'tweakers', 'beslist', 'informatique',
        'centralpoint', 'mycom', 'paradigit', 'conrad', 'game-mania',
        'nedgame', 'dyson', 'garmin', 'tomtom',
        'elektro', 'laptop', 'computer', 'gaming', 'telefoon', 'gsm',
        'smartphone', 'tablet', 'ipad', 'tv', 'audio', 'camera',
        'drone', 'smart-home', 'domotica', 'led', 'batterij', 'accu',
        'kabel', 'printer', 'gadget', 'tech', 'electronica', 'hardware'
      ];
      
      const electronicsDomains = allDomains.filter(domain =>
        electronicsKeywords.some(keyword => domain.includes(keyword))
      );
      
      console.log(`[Rotation] Loaded ${electronicsDomains.length} electronics domains (filtered from ${allDomains.length})`);
      
      return electronicsDomains;
    } catch (error) {
      console.error('[Rotation] Failed to load domains:', error.message);
      return [];
    }
  }
  
  /**
   * MAIN FUNCTION - Select domains for user
   * Automatically chooses geo-aware or standard mode
   */
  async selectDomainsForUser(userId, productName, options = {}) {
    const {
      userLocation = null,  // {lat, lon} or null
      geoEnabled = false,   // User consent for geolocation
      maxDomains = 30
    } = options;
    
    let selectedDomains;
    
    if (geoEnabled && userLocation && this.redis) {
      // GEO-AWARE ROTATION
      console.log(`[Rotation] GEO-AWARE mode for user ${userId}`);
      selectedDomains = await this.selectDomainsWithGeo(
        userId,
        productName,
        userLocation,
        maxDomains
      );
    } else {
      // STANDARD ROTATION (fallback)
      console.log(`[Rotation] STANDARD mode for user ${userId}`);
      selectedDomains = await this.selectDomainsStandard(
        userId,
        productName,
        maxDomains
      );
    }
    
    return selectedDomains;
  }
  
  /**
   * GEO-AWARE ROTATION
   * Intelligent rotation based on distance between users
   */
  async selectDomainsWithGeo(userId, productName, userLocation, maxDomains) {
    if (!this.redis) {
      console.warn('[Rotation] Redis not available, falling back to standard');
      return this.selectDomainsStandard(userId, productName, maxDomains);
    }
    
    // 1. Anonymize location (privacy)
    const anonLocation = this.config.anonymize 
      ? this.anonymizeLocation(userLocation)
      : userLocation;
    
    // 2. Store user location temporarily (1h TTL)
    if (!this.config.storeLocation) {
      // Only store in memory for current request
      await this.redis.geoadd(
        'users:locations:temp',
        anonLocation.lon,
        anonLocation.lat,
        userId
      );
      await this.redis.expire('users:locations:temp', 3600); // 1h
    }
    
    // 3. Find nearby users (50km radius)
    const nearbyUsers = await this.findNearbyUsers(
      anonLocation,
      productName,
      50000
    );
    
    // 4. Calculate rotation intensity
    let intensity = 0.0;
    if (nearbyUsers.length > 0) {
      const closest = nearbyUsers[0];
      const distance = this.calculateDistance(anonLocation, closest.location);
      intensity = this.calculateRotationIntensity(distance);
      
      console.log(`[Rotation] Nearest user: ${distance}m away, intensity: ${intensity}`);
    } else {
      console.log(`[Rotation] No nearby users, using base seed`);
    }
    
    // 5. Calculate seed with geo offset
    const queryCount = await this.getQueryCount(userId, productName);
    const baseSeed = this.hashToSeed(`${userId}:${productName}:${queryCount}`);
    const offset = Math.floor(intensity * this.config.maxOffset);
    const finalSeed = (baseSeed + offset) % this.allDomains.length;
    
    console.log(`[Rotation] Seed: ${baseSeed} + offset: ${offset} = ${finalSeed}`);
    
    // 6. Select domains
    const domains = this.selectDomainsFromSeed(finalSeed, maxDomains);
    
    // 7. Track seen domains
    await this.trackSeenDomains(userId, productName, domains);
    
    return domains;
  }
  
  /**
   * STANDARD ROTATION (fallback)
   * Hash-based rotation without geolocation
   */
  async selectDomainsStandard(userId, productName, maxDomains) {
    // 1. Get query count
    const queryCount = await this.getQueryCount(userId, productName);
    
    // 2. Calculate seed
    const seed = this.hashToSeed(`${userId}:${productName}:${queryCount}`);
    
    // 3. Get seen domains
    const seenDomains = await this.getSeenDomains(userId, productName);
    
    // 4. Select candidates
    let candidates = this.selectDomainsFromSeed(seed, 40);
    
    // 5. Filter out seen domains
    candidates = candidates.filter(d => !seenDomains.has(d));
    
    // 6. If not enough, get more
    let currentSeed = seed;
    while (candidates.length < maxDomains) {
      currentSeed = (currentSeed + 1) % this.allDomains.length;
      const next = this.allDomains[currentSeed];
      if (!seenDomains.has(next) && !candidates.includes(next)) {
        candidates.push(next);
      }
    }
    
    const selected = candidates.slice(0, maxDomains);
    
    console.log(`[Rotation] Selected ${selected.length} domains (${seenDomains.size} already seen)`);
    
    // 7. Track seen domains
    await this.trackSeenDomains(userId, productName, selected);
    
    return selected;
  }
  
  /**
   * Find nearby users who searched for same product
   */
  async findNearbyUsers(location, productName, radiusMeters) {
    if (!this.redis) return [];
    
    try {
      // Find users within radius
      const nearby = await this.redis.georadius(
        'users:locations:temp',
        location.lon,
        location.lat,
        radiusMeters,
        'm',
        'WITHDIST',
        'ASC'
      );
      
      // Filter: only users who searched this product
      const relevant = [];
      for (const [userId, distance] of nearby) {
        const hasQueried = await this.redis.sismember(
          `user:${userId}:queries`,
          productName
        );
        
        if (hasQueried) {
          // Get user location
          const pos = await this.redis.geopos('users:locations:temp', userId);
          if (pos && pos[0]) {
            relevant.push({
              userId,
              distance: parseFloat(distance),
              location: { lon: pos[0][0], lat: pos[0][1] }
            });
          }
        }
      }
      
      return relevant;
    } catch (error) {
      console.error('[Rotation] Error finding nearby users:', error.message);
      return [];
    }
  }
  
  /**
   * Calculate rotation intensity based on distance
   */
  calculateRotationIntensity(distanceMeters) {
    if (distanceMeters < this.config.sameStreet) {
      return 1.0; // Same street - MAX rotation
    } else if (distanceMeters < this.config.sameDistrict) {
      return 0.8; // Same district - High rotation
    } else if (distanceMeters < this.config.sameCity) {
      return 0.5; // Same city - Medium rotation
    } else if (distanceMeters < this.config.sameRegion) {
      return 0.2; // Same region - Low rotation
    } else {
      return 0.0; // Different cities - No rotation
    }
  }
  
  /**
   * Calculate distance between two locations (Haversine formula)
   */
  calculateDistance(loc1, loc2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = loc1.lat * Math.PI / 180;
    const φ2 = loc2.lat * Math.PI / 180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
    const Δλ = (loc2.lon - loc1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  /**
   * Anonymize location (round to ~100m)
   */
  anonymizeLocation(location) {
    return {
      lat: Math.round(location.lat * 1000) / 1000,
      lon: Math.round(location.lon * 1000) / 1000
    };
  }
  
  /**
   * Select domains starting from seed
   */
  selectDomainsFromSeed(seed, count) {
    const selected = [];
    for (let i = 0; i < count; i++) {
      const index = (seed + i) % this.allDomains.length;
      selected.push(this.allDomains[index]);
    }
    return selected;
  }
  
  /**
   * Hash string to seed (0-999)
   */
  hashToSeed(input) {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return parseInt(hash.substring(0, 8), 16) % this.allDomains.length;
  }
  
  /**
   * Get query count for user+product
   */
  async getQueryCount(userId, productName) {
    const key = `${userId}:${productName}`;
    
    if (this.redis) {
      try {
        const redisKey = `user:${userId}:${productName}:count`;
        const count = await this.redis.incr(redisKey);
        await this.redis.expire(redisKey, this.config.ttlDays * 86400);
        return count - 1; // Return previous count (before increment)
      } catch (error) {
        // Fall through to memory
      }
    }
    
    // In-memory fallback
    const current = this.memoryCache.queryCounts.get(key) || 0;
    this.memoryCache.queryCounts.set(key, current + 1);
    return current;
  }
  
  /**
   * Get domains user has already seen
   */
  async getSeenDomains(userId, productName) {
    const key = `${userId}:${productName}`;
    
    if (this.redis) {
      try {
        const redisKey = `user:${userId}:${productName}:seen`;
        const domains = await this.redis.smembers(redisKey);
        return new Set(domains);
      } catch (error) {
        // Fall through to memory
      }
    }
    
    // In-memory fallback
    if (!this.memoryCache.seenDomains.has(key)) {
      this.memoryCache.seenDomains.set(key, new Set());
    }
    return this.memoryCache.seenDomains.get(key);
  }
  
  /**
   * Track which domains user has seen
   */
  async trackSeenDomains(userId, productName, domains) {
    const key = `${userId}:${productName}`;
    
    if (this.redis) {
      try {
        const redisKey = `user:${userId}:${productName}:seen`;
        await this.redis.sadd(redisKey, ...domains);
        await this.redis.expire(redisKey, this.config.ttlDays * 86400);
        
        // Also track that user queried this product
        await this.redis.sadd(`user:${userId}:queries`, productName);
        await this.redis.expire(`user:${userId}:queries`, this.config.ttlDays * 86400);
        return;
      } catch (error) {
        // Fall through to memory
      }
    }
    
    // In-memory fallback
    if (!this.memoryCache.seenDomains.has(key)) {
      this.memoryCache.seenDomains.set(key, new Set());
    }
    const seenSet = this.memoryCache.seenDomains.get(key);
    domains.forEach(d => seenSet.add(d));
  }
  
  /**
   * Get statistics
   */
  async getStats(userId, productName) {
    if (!this.redis) {
      return {
        queryCount: 0,
        seenDomains: 0,
        coverage: 0
      };
    }
    
    try {
      const queryCount = await this.redis.get(`user:${userId}:${productName}:count`) || 0;
      const seenDomains = await this.redis.scard(`user:${userId}:${productName}:seen`) || 0;
      const coverage = (seenDomains / this.allDomains.length) * 100;
      
      return {
        queryCount: parseInt(queryCount),
        seenDomains,
        coverage: Math.round(coverage)
      };
    } catch (error) {
      return { queryCount: 0, seenDomains: 0, coverage: 0 };
    }
  }
}

module.exports = RotationSystem;
