/**
 * BATCH CONCURRENT PROCESSOR
 * 
 * Process 30-50 domains in parallel (not sequential)
 * Limit concurrency to 30 to avoid proxy burn
 * Promise.allSettled (failures don't block batch)
 */

const DirectScraper = require('./direct-scraper');

class BatchProcessor {
  constructor(options = {}) {
    this.concurrencyLimit = options.concurrencyLimit || 20; // MAX 20-25 (chroni proxy)
    this.scraper = DirectScraper;
    this.timeoutMs = options.timeoutMs || 5000; // 5s per domain (ultra-fast)
  }

  /**
   * Process batch of domains in parallel
   */
  async processBatch(domains, product, options = {}) {
    console.log(`\n[Batch] Processing ${domains.length} domains (concurrency: ${this.concurrencyLimit})`);
    
    const startTime = Date.now();
    const results = [];
    
    // Split into chunks of 20-25 (chroni proxy)
    for (let i = 0; i < domains.length; i += this.concurrencyLimit) {
      const batch = domains.slice(i, i + this.concurrencyLimit);
      const batchNum = Math.floor(i / this.concurrencyLimit) + 1;
      
      console.log(`[Batch] Processing batch ${batchNum}/${Math.ceil(domains.length / this.concurrencyLimit)} (${batch.length} domains)`);
      
      // Process 30 domains in parallel
      const batchResults = await Promise.allSettled(
        batch.map(domainObj => this.scrapeDomain(domainObj.domain, product, options))
      );
      
      // Collect results
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const domain = batch[j].domain;
        
        if (result.status === 'fulfilled') {
          results.push({
            domain,
            success: true,
            offers: result.value.offers || [],
            cached: result.value.cached || false
          });
        } else {
          results.push({
            domain,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      }
      
      // Small delay between batches (avoid overwhelming proxy)
      if (i + this.concurrencyLimit < domains.length) {
        await this.delay(2000);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const successful = results.filter(r => r.success).length;
    const totalOffers = results.reduce((sum, r) => sum + (r.offers?.length || 0), 0);
    
    console.log(`[Batch] ✅ Completed in ${duration}s - ${successful}/${results.length} successful, ${totalOffers} offers found`);
    
    return results;
  }

  /**
   * Scrape single domain with timeout
   */
  async scrapeDomain(domain, product, options = {}) {
    try {
      // Race between scrape and timeout
      const result = await Promise.race([
        this.scraper.scrapeUrl(`https://${domain}/zoeken?q=${encodeURIComponent(product)}`, {
          category: 'products',
          searchQuery: product,
          ...options
        }),
        this.timeout(this.timeoutMs)
      ]);
      
      return result;
      
    } catch (error) {
      throw new Error(`${domain}: ${error.message}`);
    }
  }

  /**
   * Timeout promise
   */
  timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms);
    });
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics
   */
  getStats(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const cached = results.filter(r => r.cached).length;
    const totalOffers = results.reduce((sum, r) => sum + (r.offers?.length || 0), 0);
    
    return {
      total: results.length,
      successful,
      failed,
      cached,
      totalOffers,
      successRate: (successful / results.length * 100).toFixed(1) + '%'
    };
  }
}

module.exports = BatchProcessor;
