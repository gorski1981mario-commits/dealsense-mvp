// Domain Manager - SQLite integration for crawler
// Manages 1011 NL domains with 44% giganci / 56% niszowe balance

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DomainManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../domains/domains.db');
    this.db = null;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Initialize database connection
   */
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Failed to connect to domains database:', err);
          reject(err);
        } else {
          console.log('✅ Connected to domains database (1011 domains)');
          resolve();
        }
      });
    });
  }

  /**
   * Get all active domains
   */
  async getAllDomains() {
    const cacheKey = 'all_domains';
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE active = 1 ORDER BY tier, priority',
        (err, rows) => {
          if (err) reject(err);
          else {
            this.cache.set(cacheKey, { data: rows, timestamp: Date.now() });
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Get domains by tier (giganci or niszowe)
   */
  async getDomainsByTier(tier) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE tier = ? AND active = 1 ORDER BY priority',
        [tier],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Get domains by category
   */
  async getDomainsByCategory(category) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE category = ? AND active = 1 ORDER BY tier, priority',
        [category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Get domains by tier AND category
   */
  async getDomainsByTierAndCategory(tier, category) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE tier = ? AND category = ? AND active = 1 ORDER BY priority',
        [tier, category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Get domain by name
   */
  async getDomain(domainName) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM domains WHERE domain = ?',
        [domainName],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Get GIGANCI domains (44% - big brands for baseline)
   */
  async getGiganciDomains() {
    return this.getDomainsByTier('giganci');
  }

  /**
   * Get NISZOWE domains (56% - specialists for best deals)
   */
  async getNiszoweDomains() {
    return this.getDomainsByTier('niszowe');
  }

  /**
   * Get domains with parsers
   */
  async getDomainsWithParsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE has_parser = 1 AND active = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Get domains without parsers (will use generic parser)
   */
  async getDomainsWithoutParsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM domains WHERE has_parser = 0 AND active = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * Get statistics
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tier_balance', (err, balanceRows) => {
        if (err) {
          reject(err);
          return;
        }

        this.db.all(
          'SELECT category, COUNT(*) as count FROM domains WHERE active = 1 GROUP BY category',
          (err, categoryRows) => {
            if (err) {
              reject(err);
              return;
            }

            this.db.get(
              'SELECT COUNT(*) as total FROM domains WHERE active = 1',
              (err, totalRow) => {
                if (err) reject(err);
                else {
                  resolve({
                    total: totalRow.total,
                    balance: balanceRows,
                    categories: categoryRows
                  });
                }
              }
            );
          }
        );
      });
    });
  }

  /**
   * Update domain (e.g., mark as inactive, update rate limit)
   */
  async updateDomain(domainName, updates) {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), domainName];

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE domains SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE domain = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  /**
   * Disable domain (set active = 0)
   */
  async disableDomain(domainName) {
    return this.updateDomain(domainName, { active: 0 });
  }

  /**
   * Enable domain (set active = 1)
   */
  async enableDomain(domainName) {
    return this.updateDomain(domainName, { active: 1 });
  }

  /**
   * Get domains for crawling (prioritized)
   * Returns mix of giganci and niszowe based on strategy
   */
  async getDomainsForCrawling(category, limit = 20) {
    // Strategy: 40% giganci, 60% niszowe
    const giganciLimit = Math.round(limit * 0.4);
    const niszoweLimit = limit - giganciLimit;

    const giganci = await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM domains 
         WHERE tier = 'giganci' AND category = ? AND active = 1 
         ORDER BY priority ASC, RANDOM() 
         LIMIT ?`,
        [category, giganciLimit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const niszowe = await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM domains 
         WHERE tier = 'niszowe' AND category = ? AND active = 1 
         ORDER BY priority ASC, RANDOM() 
         LIMIT ?`,
        [category, niszoweLimit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Shuffle mix
    return [...giganci, ...niszowe].sort(() => Math.random() - 0.5);
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Closed domains database connection');
    }
  }
}

module.exports = DomainManager;
