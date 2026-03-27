/**
 * CUSTOM CRAWLER ENGINE
 * 
 * Używa dedykowanych crawlerów dla TOP 5 sklepów
 * Fallback na generic crawler dla niszowych
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
const { getCustomCrawler } = require('./custom-crawlers-top5');

chromium.use(StealthPlugin);

class CustomCrawlerEngine {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    
    this.proxyConfig = {
      enabled: options.proxy?.enabled || false,
      username: options.proxy?.username,
      password: options.proxy?.password
    };
    
    this.stats = {
      requests: 0,
      successes: 0,
      failures: 0,
      customCrawlerUsed: 0,
      genericCrawlerUsed: 0
    };
  }

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

  async crawl(domain, product) {
    this.stats.requests++;
    
    const customCrawler = getCustomCrawler(domain);
    
    if (customCrawler) {
      console.log(`[Custom] Using ${customCrawler.name} crawler (${customCrawler.marketShare} market share)`);
      this.stats.customCrawlerUsed++;
      return await this.crawlWithCustom(customCrawler, product);
    } else {
      console.log(`[Generic] No custom crawler for ${domain}`);
      this.stats.genericCrawlerUsed++;
      return await this.crawlGeneric(domain, product);
    }
  }

  async crawlWithCustom(crawler, product) {
    try {
      if (!this.browser) await this.launch();
      
      const page = await this.context.newPage();
      page.setDefaultTimeout(15000);
      
      try {
        const url = crawler.buildUrl(product);
        console.log(`[Custom] Opening: ${url}`);
        
        // Navigate
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        // Wait for custom conditions
        const conditionsMet = await crawler.waitConditions(page);
        
        if (!conditionsMet) {
          console.log(`[Custom] Wait conditions not met`);
        }
        
        // Extract prices using custom logic
        const prices = await crawler.extractPrices(page);
        
        if (prices.length === 0) {
          this.stats.failures++;
          return { success: false, prices: [], domain: crawler.name };
        }
        
        this.stats.successes++;
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        console.log(`[Custom] ✅ ${crawler.name} - ${prices.length} prices, avg €${avgPrice.toFixed(2)}`);
        
        return {
          success: true,
          prices,
          avgPrice,
          domain: crawler.name,
          marketShare: crawler.marketShare
        };
        
      } finally {
        await page.close();
      }
      
    } catch (error) {
      this.stats.failures++;
      console.log(`[Custom] ❌ ${crawler.name} - ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        domain: crawler.name
      };
    }
  }

  async crawlGeneric(domain, product) {
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

  getStats() {
    const successRate = this.stats.requests > 0
      ? (this.stats.successes / this.stats.requests * 100).toFixed(1)
      : 0;
    
    return {
      ...this.stats,
      successRate: successRate + '%'
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}

module.exports = CustomCrawlerEngine;
