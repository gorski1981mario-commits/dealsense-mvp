/**
 * STEALTH CRAWLER 2026 - Z PLAYWRIGHT-EXTRA
 * 
 * FIX 4: Fingerprint - playwright-extra + stealth plugin
 * 
 * Instalacja:
 * npm install playwright-extra puppeteer-extra-plugin-stealth
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

// Use stealth plugin
chromium.use(StealthPlugin);

class StealthCrawler2026 {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.proxyConfig = options.proxy || null;
    
    // Random User Agents (Chrome 126+ NL)
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    ];
  }

  /**
   * Launch with stealth
   */
  async launch() {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    };

    // Add proxy
    if (this.proxyConfig) {
      launchOptions.proxy = { server: this.proxyConfig };
    }

    this.browser = await chromium.launch(launchOptions);
    
    // Random user agent
    const randomUA = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    this.context = await this.browser.newContext({
      userAgent: randomUA,
      viewport: { width: 1920, height: 1080 },
      locale: 'nl-NL',
      timezoneId: 'Europe/Amsterdam',
      // Extra fingerprint masking
      extraHTTPHeaders: {
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    
    // Block heavy resources
    await this.context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        return route.abort();
      }
      
      // Block analytics
      const url = route.request().url();
      if (url.includes('google-analytics') || 
          url.includes('facebook') ||
          url.includes('hotjar') ||
          url.includes('doubleclick')) {
        return route.abort();
      }
      
      route.continue();
    });
  }

  /**
   * Fetch with stealth
   */
  async fetch(url) {
    if (!this.browser) await this.launch();
    
    const page = await this.context.newPage();
    page.setDefaultTimeout(10000);
    
    try {
      // Navigate
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      // Wait for prices
      try {
        await page.waitForFunction(() => {
          const text = document.body ? document.body.innerText : '';
          return text.includes('€');
        }, { timeout: 5000 });
      } catch (e) {}
      
      // Remove overlays
      await page.evaluate(() => {
        const overlays = document.querySelectorAll('[class*="cookie"], [class*="overlay"], [class*="modal"]');
        overlays.forEach(el => el.remove());
      });
      
      // Extract prices
      const data = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText : '';
        const priceRegex = /€\s*(\d{1,4})[.,](\d{2})/g;
        const prices = [];
        let match;
        
        while ((match = priceRegex.exec(bodyText)) !== null) {
          const price = parseFloat(`${match[1]}.${match[2]}`);
          if (price > 10 && price < 10000) {
            prices.push(price);
          }
        }
        
        return { prices: [...new Set(prices)] };
      });
      
      return data;
      
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = StealthCrawler2026;
