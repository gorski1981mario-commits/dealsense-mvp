/**
 * SMART CRAWLER 2026 - Z PARSERAMI + AUTO-LEARNING
 * 
 * Features:
 * 1. Dedykowane parsery dla top 10 sklepów (85% rynku)
 * 2. 3 fallbacki per parser (regex, selektory, xpath)
 * 3. Automatyczne logowanie failed parserów
 * 4. Manual review queue
 * 5. Fallback na SearchAPI po 3 failures (24h)
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
const { getParser } = require('./parsers');
const ParserLogger = require('./parser-logger');

chromium.use(StealthPlugin);

class SmartCrawler2026 {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.parserLogger = new ParserLogger();
    
    this.proxyConfig = {
      enabled: options.proxy?.enabled || false,
      username: options.proxy?.username,
      password: options.proxy?.password
    };
    
    this.stats = {
      requests: 0,
      successes: 0,
      failures: 0,
      searchAPIFallbacks: 0
    };
  }

  /**
   * Launch browser with stealth
   */
  async launch() {
    if (this.browser) return;

    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    };

    if (this.proxyConfig.enabled && this.proxyConfig.username) {
      launchOptions.proxy = {
        server: 'http://geo.iproyal.com:12321',
        username: this.proxyConfig.username,
        password: this.proxyConfig.password
      };
    }

    this.browser = await chromium.launch(launchOptions);
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'nl-NL',
      timezoneId: 'Europe/Amsterdam'
    });
    
    // Block heavy resources
    await this.context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        return route.abort();
      }
      route.continue();
    });
  }

  /**
   * Crawl shop with smart parser
   */
  async crawlShop(domain, product) {
    this.stats.requests++;
    
    // Check if SearchAPI fallback is enabled
    const useSearchAPI = await this.parserLogger.isSearchAPIFallbackEnabled(domain);
    if (useSearchAPI) {
      console.log(`[Smart Crawler] 🔄 Using SearchAPI fallback for ${domain}`);
      this.stats.searchAPIFallbacks++;
      return await this.searchAPIFallback(product);
    }
    
    // Get parser for domain
    const parser = getParser(domain);
    if (!parser) {
      console.log(`[Smart Crawler] ⚠️  No parser for ${domain}, using generic`);
      return await this.genericCrawl(domain, product);
    }
    
    console.log(`[Smart Crawler] Using parser: ${parser.name}`);
    
    try {
      if (!this.browser) await this.launch();
      
      const page = await this.context.newPage();
      page.setDefaultTimeout(10000);
      
      try {
        // Build URL using parser
        const url = parser.searchUrl(product);
        
        console.log(`[Smart Crawler] Opening: ${url}`);
        
        // Navigate
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        // Wait for JS
        await page.waitForTimeout(2000);
        
        // Extract prices using parser (with 3 fallbacks)
        const prices = await parser.extractPrices(page);
        
        if (prices.length === 0) {
          // Log failure
          const html = await page.content();
          await this.parserLogger.logFailure(domain, url, html, 'No prices found');
          
          // Check if should fallback to SearchAPI
          await this.parserLogger.shouldFallbackToSearchAPI(domain);
          
          this.stats.failures++;
          return { success: false, prices: [], domain };
        }
        
        // Success!
        this.stats.successes++;
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        console.log(`[Smart Crawler] ✅ ${domain} - ${prices.length} prices, avg €${avgPrice.toFixed(2)}`);
        
        return {
          success: true,
          prices,
          avgPrice,
          domain
        };
        
      } finally {
        await page.close();
      }
      
    } catch (error) {
      this.stats.failures++;
      console.log(`[Smart Crawler] ❌ ${domain} - ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        domain
      };
    }
  }

  /**
   * Generic crawl (for shops without parser)
   */
  async genericCrawl(domain, product) {
    try {
      if (!this.browser) await this.launch();
      
      const page = await this.context.newPage();
      page.setDefaultTimeout(10000);
      
      try {
        const url = `https://${domain}/zoeken?q=${encodeURIComponent(product)}`;
        
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        await page.waitForTimeout(2000);
        
        // Generic regex extraction
        const prices = await page.evaluate(() => {
          const text = document.body ? document.body.innerText : '';
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length === 0) {
          const html = await page.content();
          await this.parserLogger.logFailure(domain, url, html);
          this.stats.failures++;
          return { success: false, prices: [], domain };
        }
        
        this.stats.successes++;
        return {
          success: true,
          prices,
          avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
          domain
        };
        
      } finally {
        await page.close();
      }
      
    } catch (error) {
      this.stats.failures++;
      return { success: false, error: error.message, domain };
    }
  }

  /**
   * SearchAPI fallback
   */
  async searchAPIFallback(product) {
    console.log(`[Smart Crawler] Using SearchAPI for: ${product}`);
    
    // TODO: Implement SearchAPI call
    return {
      success: false,
      searchAPI: true,
      message: 'SearchAPI not implemented yet'
    };
  }

  /**
   * Get stats
   */
  getStats() {
    const successRate = this.stats.requests > 0
      ? (this.stats.successes / this.stats.requests * 100).toFixed(1)
      : 0;
    
    return {
      ...this.stats,
      successRate: successRate + '%'
    };
  }

  /**
   * Get manual review queue
   */
  async getReviewQueue() {
    return await this.parserLogger.getReviewQueue();
  }

  /**
   * Close
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
    await this.parserLogger.close();
  }
}

module.exports = SmartCrawler2026;
