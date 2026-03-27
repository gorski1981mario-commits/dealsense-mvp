/**
 * PARSER LOGGER - Automatyczne logowanie failed parserów
 * 
 * Funkcje:
 * 1. Loguje URL + HTML gdy parser zawiedzie
 * 2. Manual review queue dla 0 cen po 3 próbach
 * 3. Fallback na SearchAPI dla failed sklepów (24h)
 */

const fs = require('fs').promises;
const path = require('path');
const Redis = require('ioredis');

class ParserLogger {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      lazyConnect: true,
      retryStrategy: () => null
    });
    
    this.useRedis = false;
    this.memoryQueue = new Map(); // In-memory fallback
    
    this.redis.on('ready', () => {
      this.useRedis = true;
    });
    
    this.redis.on('error', () => {
      this.useRedis = false;
    });
    
    this.logDir = path.join(__dirname, '../logs/parser-failures');
  }

  /**
   * Log failed parser (URL + HTML)
   */
  async logFailure(domain, url, html, error = null) {
    const timestamp = new Date().toISOString();
    const filename = `${domain.replace(/\./g, '_')}_${Date.now()}.html`;
    
    try {
      // Ensure log directory exists
      await fs.mkdir(this.logDir, { recursive: true });
      
      // Save HTML to file
      const filePath = path.join(this.logDir, filename);
      const content = `
<!--
PARSER FAILURE LOG
Domain: ${domain}
URL: ${url}
Timestamp: ${timestamp}
Error: ${error || 'No prices found'}
-->

${html}
      `;
      
      await fs.writeFile(filePath, content, 'utf8');
      
      console.log(`[Parser Logger] 📝 Logged failure: ${filename}`);
      
      // Add to manual review queue
      await this.addToReviewQueue(domain, url, filePath);
      
      return filePath;
      
    } catch (err) {
      console.error(`[Parser Logger] Error logging failure:`, err.message);
      return null;
    }
  }

  /**
   * Add to manual review queue
   */
  async addToReviewQueue(domain, url, logFile) {
    const queueItem = {
      domain,
      url,
      logFile,
      timestamp: Date.now(),
      attempts: 1
    };
    
    // In-memory fallback
    if (!this.useRedis) {
      const key = `${domain}:${url}`;
      const existing = this.memoryQueue.get(key);
      
      if (existing) {
        existing.attempts++;
        this.memoryQueue.set(key, existing);
      } else {
        this.memoryQueue.set(key, queueItem);
      }
      
      console.log(`[Parser Logger] Added to review queue (in-memory): ${domain} (${queueItem.attempts} attempts)`);
      return;
    }
    
    // Redis
    try {
      const key = `review:${domain}:${url}`;
      const existing = await this.redis.get(key);
      
      if (existing) {
        const data = JSON.parse(existing);
        data.attempts++;
        await this.redis.setex(key, 86400, JSON.stringify(data)); // 24h TTL
      } else {
        await this.redis.setex(key, 86400, JSON.stringify(queueItem));
      }
      
      console.log(`[Parser Logger] Added to review queue: ${domain} (${queueItem.attempts} attempts)`);
      
    } catch (err) {
      console.error(`[Parser Logger] Error adding to queue:`, err.message);
    }
  }

  /**
   * Check if should fallback to SearchAPI
   */
  async shouldFallbackToSearchAPI(domain) {
    // In-memory fallback
    if (!this.useRedis) {
      // Check if domain has 3+ failures
      let failureCount = 0;
      for (const [key, item] of this.memoryQueue.entries()) {
        if (key.startsWith(domain)) {
          failureCount += item.attempts;
        }
      }
      
      return failureCount >= 3;
    }
    
    // Redis
    try {
      const keys = await this.redis.keys(`review:${domain}:*`);
      
      let totalAttempts = 0;
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const item = JSON.parse(data);
          totalAttempts += item.attempts;
        }
      }
      
      // If 3+ failures, fallback to SearchAPI for 24h
      if (totalAttempts >= 3) {
        await this.enableSearchAPIFallback(domain);
        return true;
      }
      
      return false;
      
    } catch (err) {
      console.error(`[Parser Logger] Error checking fallback:`, err.message);
      return false;
    }
  }

  /**
   * Enable SearchAPI fallback for domain (24h)
   */
  async enableSearchAPIFallback(domain) {
    console.log(`[Parser Logger] 🔄 Enabling SearchAPI fallback for ${domain} (24h)`);
    
    // In-memory fallback
    if (!this.useRedis) {
      this.memoryQueue.set(`fallback:${domain}`, {
        domain,
        enabled: true,
        timestamp: Date.now()
      });
      
      // Auto-cleanup after 24h
      setTimeout(() => this.memoryQueue.delete(`fallback:${domain}`), 86400000);
      return;
    }
    
    // Redis
    try {
      await this.redis.setex(`fallback:${domain}`, 86400, '1');
    } catch (err) {
      console.error(`[Parser Logger] Error enabling fallback:`, err.message);
    }
  }

  /**
   * Check if SearchAPI fallback is enabled
   */
  async isSearchAPIFallbackEnabled(domain) {
    // In-memory fallback
    if (!this.useRedis) {
      return this.memoryQueue.has(`fallback:${domain}`);
    }
    
    // Redis
    try {
      return await this.redis.exists(`fallback:${domain}`) === 1;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get manual review queue
   */
  async getReviewQueue() {
    // In-memory fallback
    if (!this.useRedis) {
      const queue = [];
      for (const [key, item] of this.memoryQueue.entries()) {
        if (key.startsWith('review:') || !key.includes(':')) {
          queue.push(item);
        }
      }
      return queue.sort((a, b) => b.attempts - a.attempts);
    }
    
    // Redis
    try {
      const keys = await this.redis.keys('review:*');
      const queue = [];
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          queue.push(JSON.parse(data));
        }
      }
      
      return queue.sort((a, b) => b.attempts - a.attempts);
      
    } catch (err) {
      console.error(`[Parser Logger] Error getting queue:`, err.message);
      return [];
    }
  }

  /**
   * Close
   */
  async close() {
    if (this.redis && this.useRedis) {
      await this.redis.quit();
    }
  }
}

module.exports = ParserLogger;
