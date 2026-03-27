// Direct Scraper - bypasses Redis queue, scrapes directly
// Simplified version for immediate results without Bull/Redis dependency

const cheerio = require('cheerio');
const { ParserRegistry } = require('./lib/parser-registry');
const GotFetcher = require('./lib/got-fetcher');

class DirectScraper {
  constructor() {
    this.parserRegistry = new ParserRegistry();
    this.parserRegistry.loadAll(); // Load all parsers from parsers/ directory
    this.cache = new Map(); // In-memory cache
    
    // Initialize GotFetcher with proxy support
    this.fetcher = new GotFetcher({
      enabled: process.env.USE_PROXY === 'true',
      provider: process.env.PROXY_PROVIDER || 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    });
  }

  /**
   * Scrape a single URL directly (no queue)
   */
  async scrapeUrl(url, options = {}) {
    const { category = 'products', ean = null, searchQuery = null } = options;

    try {
      // Extract domain
      const domain = new URL(url).hostname.replace('www.', '');
      
      // Check cache first
      const cacheKey = `${domain}:${searchQuery || ean || url}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        console.log(`[Direct Scraper] Cache hit for ${domain}`);
        return { offers: cached.offers, cached: true };
      }

      console.log(`[Direct Scraper] Fetching ${domain}...`);

      // Fetch HTML (simple fetch, no Playwright for now - too slow)
      const html = await this.fetchHtml(url);
      
      // Get parser for this domain
      const parser = this.parserRegistry.getParser(domain, category);
      
      // Parse HTML
      const data = await parser.parse(html, { url, ean, searchQuery, category });
      
      // Cache result
      if (data && data.offers && data.offers.length > 0) {
        this.cache.set(cacheKey, {
          offers: data.offers,
          timestamp: Date.now()
        });
      }

      return { offers: data.offers || [], cached: false };

    } catch (error) {
      console.error(`[Direct Scraper] Error scraping ${url}:`, error.message);
      return { offers: [], error: error.message };
    }
  }

  /**
   * Fetch HTML with smart fallback strategy:
   * 1. Try GotFetcher first (fast, works for simple sites)
   * 2. If fails with 404/418/403 -> fallback to Playwright (JavaScript rendering)
   */
  async fetchHtml(url) {
    // Random delay to avoid rate limiting (500-2000ms)
    const delay = Math.floor(Math.random() * 1500) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      // Try GotFetcher first (fast)
      const html = await this.fetcher.fetch(url);
      return html;
    } catch (error) {
      // Check if it's a bot detection error
      const needsPlaywright = 
        error.message.includes('404') ||
        error.message.includes('418') || // I'm a Teapot = bot detection
        error.message.includes('403') ||
        error.message.includes('NEEDS_PLAYWRIGHT');
      
      if (needsPlaywright) {
        console.log(`[Direct Scraper] GotFetcher blocked (${error.message}), trying Playwright...`);
        return await this.fetchWithPlaywright(url);
      }
      
      throw error;
    }
  }

  /**
   * Fetch HTML with Playwright (JavaScript rendering, stealth mode)
   */
  async fetchWithPlaywright(url) {
    const StealthBrowser = require('./lib/stealth-browser');
    
    const browser = new StealthBrowser({
      enabled: process.env.USE_PROXY === 'true',
      provider: process.env.PROXY_PROVIDER || 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    });
    
    try {
      await browser.launch();
      const html = await browser.fetch(url);
      return html;
    } finally {
      await browser.close();
    }
  }

  /**
   * Scrape multiple URLs in parallel (with concurrency limit)
   */
  async scrapeMultiple(urls, options = {}) {
    const { concurrency = 5 } = options;
    const results = [];

    // Process in batches to avoid overwhelming servers
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(urlConfig => this.scrapeUrl(urlConfig.url, urlConfig.options))
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
    }

    return results;
  }
}

// Export both instance and class
module.exports = new DirectScraper();
module.exports.DirectScraper = DirectScraper;
