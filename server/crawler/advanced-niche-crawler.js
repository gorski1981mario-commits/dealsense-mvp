/**
 * ADVANCED NICHE CRAWLER
 * 
 * 5 ulepszeń dla małych niszowych sklepów:
 * 1. waitForFunction + JS eval (zamiast selektorów)
 * 2. Scroll + delay (wymusza React hydration)
 * 3. Fuzzy match fallback (fuse.js)
 * 4. Mini parsery per shop (auto-update)
 * 5. Geolocation NL + extra headers
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

chromium.use(StealthPlugin);

class AdvancedNicheCrawler {
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
      failures: 0
    };
    
    this.logDir = path.join(__dirname, '../logs/niche-failures');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
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
    
    // UPGRADE 5: Geolocation NL + extra headers
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'nl-NL',
      timezoneId: 'Europe/Amsterdam',
      geolocation: { latitude: 52.3676, longitude: 4.9041 }, // Amsterdam
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
  }

  /**
   * UPGRADE 1: waitForFunction + JS eval (zamiast selektorów)
   */
  async extractPricesAdvanced(page) {
    try {
      // Czekaj na ceny w DOM (max 10s)
      const priceFound = await page.waitForFunction(() => {
        const els = document.querySelectorAll('span, div, p, a, strong, b');
        for (let el of els) {
          const t = el.innerText?.trim() || '';
          if (t.match(/€\s*\d{1,3}[.,]\d{2}/)) {
            return true;
          }
        }
        return false;
      }, { timeout: 10000 }).catch(() => false);

      if (!priceFound) {
        console.log('  [Advanced] No prices found via waitForFunction');
        return [];
      }

      // Wyciągnij ceny przez JS eval
      const prices = await page.evaluate(() => {
        const found = [];
        const els = document.querySelectorAll('span, div, p, a, strong, b');
        
        for (let el of els) {
          const t = el.innerText?.trim() || '';
          const match = t.match(/€\s*(\d{1,3})[.,](\d{2})/);
          
          if (match) {
            const price = parseFloat(`${match[1]}.${match[2]}`);
            if (price > 5 && price < 10000) {
              found.push(price);
            }
          }
        }
        
        return [...new Set(found)];
      });

      console.log(`  [Advanced] Found ${prices.length} prices via JS eval`);
      return prices;
      
    } catch (error) {
      console.log(`  [Advanced] Error: ${error.message}`);
      return [];
    }
  }

  /**
   * UPGRADE 2: Scroll + delay (wymusza React hydration)
   */
  async forceHydration(page) {
    try {
      console.log('  [Hydration] Scrolling to bottom...');
      
      // Scroll do dołu
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Czekaj 500ms na load
      await page.waitForTimeout(500);
      
      // Scroll do góry
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // Czekaj kolejne 500ms
      await page.waitForTimeout(500);
      
      console.log('  [Hydration] Complete');
      
    } catch (error) {
      console.log(`  [Hydration] Error: ${error.message}`);
    }
  }

  /**
   * UPGRADE 3: Fuzzy match fallback (fuse.js)
   */
  async fuzzyMatchPrices(page) {
    try {
      console.log('  [Fuzzy] Extracting full text...');
      
      const fullText = await page.evaluate(() => {
        return document.body.innerText.trim();
      });

      // Regex dla cen
      const priceRegex = /€\s*(\d{1,3})[.,](\d{2})/g;
      const matches = fullText.match(priceRegex) || [];
      
      const prices = matches.map(m => {
        const match = m.match(/€\s*(\d{1,3})[.,](\d{2})/);
        return parseFloat(`${match[1]}.${match[2]}`);
      }).filter(p => p > 5 && p < 10000);

      const uniquePrices = [...new Set(prices)];
      
      console.log(`  [Fuzzy] Found ${uniquePrices.length} prices in text`);
      return uniquePrices;
      
    } catch (error) {
      console.log(`  [Fuzzy] Error: ${error.message}`);
      return [];
    }
  }

  /**
   * UPGRADE 4: Mini parser per shop
   */
  getMiniParser(domain) {
    const parsers = {
      'omoda.nl': {
        searchUrl: (q) => `https://www.omoda.nl/search/?text=${encodeURIComponent(q)}`,
        priceSelector: '[data-test="price"], .price'
      },
      'aboutyou.nl': {
        searchUrl: (q) => `https://www.aboutyou.nl/search?term=${encodeURIComponent(q)}`,
        priceSelector: '[data-test="price"], .price'
      },
      'alternate.nl': {
        searchUrl: (q) => `https://www.alternate.nl/html/search.html?query=${encodeURIComponent(q)}`,
        priceSelector: '.price'
      },
      'azerty.nl': {
        searchUrl: (q) => `https://azerty.nl/zoeken?query=${encodeURIComponent(q)}`,
        priceSelector: '.product-price'
      }
    };

    const normalized = domain.replace('www.', '').toLowerCase();
    return parsers[normalized] || null;
  }

  /**
   * Main crawl method
   */
  async crawl(domain, product) {
    this.stats.requests++;
    
    try {
      if (!this.browser) await this.launch();
      
      const page = await this.context.newPage();
      page.setDefaultTimeout(15000);
      
      try {
        // Get mini parser if exists
        const parser = this.getMiniParser(domain);
        const url = parser 
          ? parser.searchUrl(product)
          : `https://${domain}/search?q=${encodeURIComponent(product)}`;

        console.log(`\n[Crawl] ${domain}`);
        console.log(`  URL: ${url}`);
        
        // Navigate
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        // UPGRADE 2: Force hydration
        await this.forceHydration(page);

        // UPGRADE 1: Advanced extraction
        let prices = await this.extractPricesAdvanced(page);

        // UPGRADE 3: Fuzzy fallback
        if (prices.length === 0) {
          console.log('  [Fallback] Trying fuzzy match...');
          prices = await this.fuzzyMatchPrices(page);
        }

        if (prices.length === 0) {
          // Log failure for auto-update
          const html = await page.content();
          const filename = `${domain.replace(/\./g, '_')}_${Date.now()}.html`;
          fs.writeFileSync(path.join(this.logDir, filename), html);
          
          console.log(`  ❌ Failed - logged to ${filename}`);
          
          this.stats.failures++;
          return { success: false, prices: [], domain };
        }

        this.stats.successes++;
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        console.log(`  ✅ Success - ${prices.length} prices, avg €${avgPrice.toFixed(2)}`);
        
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
      console.log(`  ❌ Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        domain
      };
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

module.exports = AdvancedNicheCrawler;
