# 🚀 PRODUCTION CRAWLER - 7 DAY IMPLEMENTATION PLAN

## 📋 OVERVIEW

Transform crawler from basic scraper to production-grade system with:
- Redis Priority Queue (smart domain selection)
- Batch Concurrent Processing (30-50 domains parallel)
- Cache Delta (60-70% request savings)
- Smart Proxy Rotation (sticky sessions)
- Quality Control (auto-rotate on failures)
- Ultra-lightweight Playwright (3-5s timeouts)
- Fallback & Blacklist (SearchAPI backup)

---

## 🎯 DAY 1: REDIS PRIORITY QUEUE

**Goal:** Smart domain selection based on priority factors

**Priority Factors:**
1. **High Entropy** - domains with frequent price changes
2. **Live Scans** - products currently being scanned by users
3. **Price Drops >15%** - significant price changes in last 24h
4. **Niche Shops** - highest deal potential

**Implementation:**
```javascript
// crawler/priority-queue.js
class PriorityQueue {
  async calculatePriority(domain, product) {
    let score = 0;
    
    // High entropy (price changes frequency)
    const entropy = await redis.get(`entropy:${domain}`);
    score += entropy * 10;
    
    // Live scans (users scanning this product now)
    const liveScans = await redis.get(`live:${product}`);
    score += liveScans * 20;
    
    // Price drops >15% in 24h
    const priceDrop = await redis.get(`drop:${domain}:${product}`);
    if (priceDrop > 15) score += 50;
    
    // Niche shops bonus
    if (isNicheShop(domain)) score += 30;
    
    return score;
  }
  
  async getTopDomains(limit = 50) {
    // Get top 30-50 domains every 30 seconds
    return await redis.zrevrange('priority:domains', 0, limit);
  }
  
  async getBaselineDomains() {
    // Remaining 450 domains - once per hour
    return await redis.zrevrange('baseline:domains', 0, -1);
  }
}
```

**Redis Keys:**
- `entropy:{domain}` - price change frequency score
- `live:{product}` - number of active scans
- `drop:{domain}:{product}` - price drop percentage
- `priority:domains` - sorted set (top 30-50)
- `baseline:domains` - sorted set (remaining 450)

**Scheduler:**
- Top 30-50 domains: every 30 seconds
- Baseline 450 domains: every 60 minutes

---

## 🎯 DAY 2: BATCH CONCURRENT PROCESSING

**Goal:** Process 30-50 domains in parallel, not sequentially

**Implementation:**
```javascript
// crawler/batch-processor.js
class BatchProcessor {
  constructor() {
    this.concurrencyLimit = 30; // Max 30 concurrent to avoid proxy burn
  }
  
  async processBatch(domains, product) {
    const results = [];
    
    // Split into chunks of 30
    for (let i = 0; i < domains.length; i += this.concurrencyLimit) {
      const batch = domains.slice(i, i + this.concurrencyLimit);
      
      // Process 30 domains in parallel
      const batchResults = await Promise.allSettled(
        batch.map(domain => this.scrapeDomain(domain, product))
      );
      
      results.push(...batchResults);
      
      // Small delay between batches
      await this.delay(2000);
    }
    
    return results;
  }
  
  async scrapeDomain(domain, product) {
    // Single domain scrape with timeout
    return await Promise.race([
      this.scraper.scrape(domain, product),
      this.timeout(10000) // 10s max per domain
    ]);
  }
}
```

**Benefits:**
- 30-50x faster than sequential
- Controlled concurrency (no proxy overload)
- Promise.allSettled (failures don't block batch)

---

## 🎯 DAY 3: CACHE DELTA

**Goal:** Save 60-70% requests by caching unchanged prices

**Implementation:**
```javascript
// crawler/cache-delta.js
class CacheManager {
  async checkCache(domain, product) {
    const key = `cache:${domain}:${product}`;
    const cached = await redis.hgetall(key);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    
    // Skip if price unchanged for 30 minutes
    if (age < 30 * 60 * 1000) {
      console.log(`[Cache] Hit for ${domain} - ${product} (age: ${age}ms)`);
      return cached;
    }
    
    return null;
  }
  
  async saveCache(domain, product, price) {
    const key = `cache:${domain}:${product}`;
    await redis.hmset(key, {
      price,
      timestamp: Date.now()
    });
    await redis.expire(key, 3600); // 1 hour TTL
  }
}
```

**Redis Keys:**
- `cache:{domain}:{product}` - hash with price + timestamp

**Logic:**
1. Check cache before scraping
2. If price exists AND age < 30min → skip scrape
3. If age > 30min OR no cache → scrape + update cache
4. **Savings: 60-70% requests**

---

## 🎯 DAY 4: SMART PROXY ROTATION

**Goal:** Rotate proxy every 4-5 requests, sticky session 5-10min

**Implementation:**
```javascript
// crawler/proxy-manager.js
class ProxyManager {
  constructor() {
    this.requestCount = 0;
    this.currentProxy = null;
    this.sessionStart = null;
    this.rotateInterval = 4; // Rotate every 4-5 requests
  }
  
  async getProxy() {
    const now = Date.now();
    const sessionAge = now - this.sessionStart;
    
    // Rotate if:
    // 1. Every 4-5 requests
    // 2. Session older than 10 minutes
    if (
      this.requestCount >= this.rotateInterval ||
      sessionAge > 10 * 60 * 1000 ||
      !this.currentProxy
    ) {
      this.currentProxy = await this.rotateProxy();
      this.sessionStart = now;
      this.requestCount = 0;
      this.rotateInterval = Math.floor(Math.random() * 2) + 4; // 4-5
    }
    
    this.requestCount++;
    return this.currentProxy;
  }
  
  async rotateProxy() {
    // Get new proxy from IPRoyal pool
    const proxy = await this.proxyPool.getNext();
    console.log(`[Proxy] Rotated to ${proxy.id}`);
    return proxy;
  }
}
```

**Benefits:**
- Sticky session (same IP for 5-10min)
- Avoids mid-product IP changes
- Rotates every 4-5 requests (anti-pattern)

---

## 🎯 DAY 5: QUALITY CONTROL

**Goal:** Auto-rotate proxy pool if success rate < 85%

**Implementation:**
```javascript
// crawler/quality-control.js
class QualityControl {
  constructor() {
    this.successCount = 0;
    this.totalCount = 0;
    this.checkInterval = 100; // Check every 100 requests
  }
  
  async recordResult(success) {
    this.totalCount++;
    if (success) this.successCount++;
    
    // Check every 100 requests
    if (this.totalCount % this.checkInterval === 0) {
      await this.checkQuality();
    }
  }
  
  async checkQuality() {
    const successRate = (this.successCount / this.totalCount) * 100;
    
    console.log(`[QC] Success rate: ${successRate.toFixed(1)}% (${this.successCount}/${this.totalCount})`);
    
    // If success rate < 85%, rotate entire proxy pool
    if (successRate < 85) {
      console.log(`[QC] ⚠️ Low success rate! Rotating proxy pool...`);
      await this.proxyManager.rotateEntirePool();
      
      // Reset counters
      this.successCount = 0;
      this.totalCount = 0;
    }
  }
}
```

**Thresholds:**
- Check every 100 requests
- Success rate < 85% → rotate entire pool
- Auto-recovery from proxy issues

---

## 🎯 DAY 6: ULTRA-LIGHTWEIGHT PLAYWRIGHT

**Goal:** Reduce Playwright overhead from 30s to 3-5s

**Implementation:**
```javascript
// crawler/lib/ultra-light-browser.js
class UltraLightBrowser {
  async launch() {
    this.browser = await playwright.chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
  }
  
  async fetch(url) {
    const page = await this.browser.newPage();
    
    try {
      // Wait for domcontentloaded (NOT networkidle)
      await page.goto(url, {
        waitUntil: 'domcontentloaded', // Much faster
        timeout: 5000 // 3-5s max
      });
      
      // Auto-click cookies (fast)
      await this.handleCookies(page);
      
      // Extract data with page.evaluate + regex (NO CSS selectors)
      const data = await page.evaluate(() => {
        // Regex extraction (faster than querySelector)
        const html = document.body.innerHTML;
        
        // Price regex
        const priceMatch = html.match(/€\s*(\d+)[.,](\d{2})/);
        const price = priceMatch ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`) : null;
        
        // Product title regex
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;
        
        return { price, title };
      });
      
      return data;
      
    } finally {
      await page.close();
    }
  }
  
  async handleCookies(page) {
    // Fast cookie handling (max 2s)
    await page.waitForTimeout(2000);
    
    const clicked = await page.evaluate(() => {
      // Smart cookie detection (from previous implementation)
      // ... (same as before)
    });
  }
}
```

**Optimizations:**
- `waitUntil: 'domcontentloaded'` (not networkidle)
- 3-5s timeout (not 30s)
- `page.evaluate` + regex (not CSS selectors)
- Fast cookie handling (2s max)
- **Result: 3-5s per page (vs 30s before)**

---

## 🎯 DAY 7: FALLBACK & BLACKLIST

**Goal:** Auto-blacklist failing domains, fallback to SearchAPI

**Implementation:**
```javascript
// crawler/fallback-manager.js
class FallbackManager {
  constructor() {
    this.failureCount = new Map(); // domain -> count
  }
  
  async recordFailure(domain) {
    const count = (this.failureCount.get(domain) || 0) + 1;
    this.failureCount.set(domain, count);
    
    // 3 failures in a row = 24h blacklist
    if (count >= 3) {
      await this.blacklist(domain);
      this.failureCount.delete(domain);
    }
  }
  
  async blacklist(domain) {
    console.log(`[Blacklist] ${domain} blocked 3x - blacklisting for 24h`);
    
    // Add to Redis blacklist with 24h TTL
    await redis.setex(`blacklist:${domain}`, 86400, '1');
    
    // Remove from priority queue
    await redis.zrem('priority:domains', domain);
  }
  
  async isBlacklisted(domain) {
    return await redis.exists(`blacklist:${domain}`);
  }
  
  async fallbackToSearchAPI(product) {
    console.log(`[Fallback] Using SearchAPI for ${product}`);
    
    // Use SearchAPI.io as fallback
    const searchAPI = require('../market/providers/searchapi');
    return await searchAPI.search(product);
  }
}
```

**Logic:**
1. Track failures per domain
2. 3 consecutive failures → 24h blacklist
3. Blacklisted domains → use SearchAPI fallback
4. Auto-recovery after 24h

---

## 📊 EXPECTED RESULTS

**Before:**
- Sequential processing (1 domain at a time)
- No caching (100% requests)
- No priority (all domains equal)
- Slow Playwright (30s per page)
- No quality control
- **Total: ~500 domains × 30s = 4+ hours**

**After:**
- Batch concurrent (30-50 parallel)
- Cache delta (60-70% savings)
- Priority queue (top 30-50 every 30s)
- Ultra-light Playwright (3-5s per page)
- Quality control + auto-recovery
- **Total: ~150 domains × 5s / 30 concurrent = ~25 seconds**

**Improvement: 576x faster (4 hours → 25 seconds)**

---

## 🚀 IMPLEMENTATION ORDER

1. **Day 1:** Redis Priority Queue
2. **Day 2:** Batch Concurrent
3. **Day 3:** Cache Delta
4. **Day 4:** Proxy Rotation
5. **Day 5:** Quality Control
6. **Day 6:** Ultra-light Playwright
7. **Day 7:** Fallback + Blacklist

**Total: 7 days to production-grade crawler**
