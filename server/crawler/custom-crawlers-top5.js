/**
 * CUSTOM CRAWLERS - TOP 5 SKLEPÓW NL
 * 
 * Dedykowane crawlery dla największych sklepów (80% rynku):
 * 1. Bol.com - 40% rynku NL
 * 2. Coolblue - 15% rynku
 * 3. MediaMarkt - 10% rynku
 * 4. Zalando - 8% rynku (moda)
 * 5. Wehkamp - 7% rynku
 * 
 * Każdy ma dedykowane:
 * - URL pattern
 * - Wait conditions (czeka na produkty załadowane przez JS)
 * - Selektory CSS/XPath
 * - Fallbacki
 */

const customCrawlers = {
  /**
   * BOL.COM CRAWLER - 40% rynku NL
   * Problem: React/Remix, produkty ładowane przez JavaScript
   */
  'bol.com': {
    name: 'Bol.com',
    marketShare: '40%',
    
    buildUrl: (query) => `https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(query)}`,
    
    waitConditions: async (page) => {
      // Czekaj na produkty (React renderuje je po load)
      try {
        await page.waitForSelector('[data-test="product-item"], .product-item', { 
          timeout: 10000 
        });
        
        // Dodatkowe czekanie na ceny
        await page.waitForTimeout(2000);
        
        return true;
      } catch (e) {
        return false;
      }
    },
    
    extractPrices: async (page) => {
      return await page.evaluate(() => {
        const prices = [];
        
        // Method 1: Data attributes
        const priceElements = document.querySelectorAll('[data-test="price"], [data-price]');
        priceElements.forEach(el => {
          const text = el.innerText || el.getAttribute('data-price') || '';
          const match = text.match(/€\s*(\d{1,4})[.,](\d{2})/);
          if (match) {
            const price = parseFloat(`${match[1]}.${match[2]}`);
            if (price > 10 && price < 10000) prices.push(price);
          }
        });
        
        // Method 2: Class-based
        if (prices.length === 0) {
          const priceClasses = document.querySelectorAll('.promo-price, .product-price, [class*="price"]');
          priceClasses.forEach(el => {
            const text = el.innerText || '';
            const match = text.match(/€\s*(\d{1,4})[.,](\d{2})/);
            if (match) {
              const price = parseFloat(`${match[1]}.${match[2]}`);
              if (price > 10 && price < 10000) prices.push(price);
            }
          });
        }
        
        // Method 3: Regex fallback
        if (prices.length === 0) {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          matches.forEach(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            const price = parseFloat(`${match[1]}.${match[2]}`);
            if (price > 10 && price < 10000) prices.push(price);
          });
        }
        
        return [...new Set(prices)];
      });
    }
  },

  /**
   * COOLBLUE CRAWLER - 15% rynku
   * Działa z JSON-LD
   */
  'coolblue.nl': {
    name: 'Coolblue',
    marketShare: '15%',
    
    buildUrl: (query) => `https://www.coolblue.nl/zoeken?query=${encodeURIComponent(query)}`,
    
    waitConditions: async (page) => {
      try {
        await page.waitForSelector('.product-card, [data-test="product"]', { 
          timeout: 8000 
        });
        await page.waitForTimeout(1000);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    extractPrices: async (page) => {
      return await page.evaluate(() => {
        const prices = [];
        
        // Method 1: JSON-LD (najbardziej niezawodne)
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => {
          try {
            const data = JSON.parse(script.textContent);
            if (data['@type'] === 'ItemList' && data.itemListElement) {
              data.itemListElement.forEach(item => {
                if (item.offers && item.offers.price) {
                  const price = parseFloat(item.offers.price);
                  if (price > 10 && price < 10000) prices.push(price);
                }
              });
            }
          } catch (e) {}
        });
        
        // Method 2: CSS selectors
        if (prices.length === 0) {
          const selectors = ['.sales-price__current', '[data-test="sales-price"]', '.product-card__price'];
          selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
              const match = (el.innerText || '').match(/€\s*(\d{1,4})[.,](\d{2})/);
              if (match) {
                const price = parseFloat(`${match[1]}.${match[2]}`);
                if (price > 10 && price < 10000) prices.push(price);
              }
            });
          });
        }
        
        return [...new Set(prices)];
      });
    }
  },

  /**
   * MEDIAMARKT CRAWLER - 10% rynku
   * Działa z regex
   */
  'mediamarkt.nl': {
    name: 'MediaMarkt',
    marketShare: '10%',
    
    buildUrl: (query) => `https://www.mediamarkt.nl/nl/search.html?query=${encodeURIComponent(query)}`,
    
    waitConditions: async (page) => {
      try {
        await page.waitForSelector('[data-test="mms-product-list-item"], .product', { 
          timeout: 8000 
        });
        await page.waitForTimeout(1000);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    extractPrices: async (page) => {
      return await page.evaluate(() => {
        const prices = [];
        const text = document.body.innerText;
        const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
        
        matches.forEach(m => {
          const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
          const price = parseFloat(`${match[1]}.${match[2]}`);
          if (price > 10 && price < 10000) prices.push(price);
        });
        
        return [...new Set(prices)];
      });
    }
  },

  /**
   * ZALANDO CRAWLER - 8% rynku (moda)
   * Problem: Heavy JavaScript
   */
  'zalando.nl': {
    name: 'Zalando',
    marketShare: '8%',
    
    buildUrl: (query) => `https://www.zalando.nl/search?q=${encodeURIComponent(query)}`,
    
    waitConditions: async (page) => {
      try {
        // Zalando ładuje produkty przez JS
        await page.waitForSelector('[data-testid="product-card"], .z-grid-item', { 
          timeout: 10000 
        });
        
        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(2000);
        
        return true;
      } catch (e) {
        return false;
      }
    },
    
    extractPrices: async (page) => {
      return await page.evaluate(() => {
        const prices = [];
        
        // Method 1: Data attributes
        const priceElements = document.querySelectorAll('[data-testid="price"], [class*="price"]');
        priceElements.forEach(el => {
          const text = el.innerText || '';
          const match = text.match(/€\s*(\d{1,4})[.,](\d{2})/);
          if (match) {
            const price = parseFloat(`${match[1]}.${match[2]}`);
            if (price > 10 && price < 10000) prices.push(price);
          }
        });
        
        // Method 2: Regex fallback
        if (prices.length === 0) {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          matches.forEach(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            const price = parseFloat(`${match[1]}.${match[2]}`);
            if (price > 10 && price < 10000) prices.push(price);
          });
        }
        
        return [...new Set(prices)];
      });
    }
  },

  /**
   * WEHKAMP CRAWLER - 7% rynku
   */
  'wehkamp.nl': {
    name: 'Wehkamp',
    marketShare: '7%',
    
    buildUrl: (query) => `https://www.wehkamp.nl/search/?searchTerm=${encodeURIComponent(query)}`,
    
    waitConditions: async (page) => {
      try {
        await page.waitForSelector('.product-card, [data-test="product"]', { 
          timeout: 8000 
        });
        await page.waitForTimeout(1000);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    extractPrices: async (page) => {
      return await page.evaluate(() => {
        const prices = [];
        const text = document.body.innerText;
        const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
        
        matches.forEach(m => {
          const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
          const price = parseFloat(`${match[1]}.${match[2]}`);
          if (price > 10 && price < 10000) prices.push(price);
        });
        
        return [...new Set(prices)];
      });
    }
  }
};

/**
 * Get custom crawler for domain
 */
function getCustomCrawler(domain) {
  const normalizedDomain = domain.replace('www.', '').toLowerCase();
  
  if (customCrawlers[normalizedDomain]) {
    return customCrawlers[normalizedDomain];
  }
  
  for (const key in customCrawlers) {
    if (normalizedDomain.includes(key) || key.includes(normalizedDomain)) {
      return customCrawlers[key];
    }
  }
  
  return null;
}

module.exports = {
  customCrawlers,
  getCustomCrawler
};
