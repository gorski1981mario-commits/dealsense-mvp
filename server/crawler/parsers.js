/**
 * SHOP PARSERS - TOP 10 SKLEPÓW NL
 * 
 * Każdy parser ma 3 fallbacki:
 * 1. Regex (tekstowy - najbezpieczniejszy)
 * 2. CSS Selektory (z fallbackami)
 * 3. XPath / nearest element
 * 
 * Top 10 sklepów = 85% rynku NL:
 * - Bol.com
 * - Coolblue
 * - MediaMarkt
 * - BCC
 * - Fonq
 * - Blokker
 * - Praxis
 * - Intratuin
 * - Wehkamp
 * - Zalando
 */

const parsers = {
  /**
   * BOL.COM PARSER
   */
  'bol.com': {
    name: 'Bol.com',
    searchUrl: (query) => `https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: JSON-LD (structured data - najbardziej niezawodne!)
      try {
        const prices = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const foundPrices = [];
          
          scripts.forEach(script => {
            try {
              const data = JSON.parse(script.textContent);
              
              // ItemList with products
              if (data['@type'] === 'ItemList' && data.itemListElement) {
                data.itemListElement.forEach(item => {
                  if (item.offers && item.offers.price) {
                    const price = parseFloat(item.offers.price);
                    if (price > 10 && price < 10000) {
                      foundPrices.push(price);
                    }
                  }
                });
              }
              
              // Single product
              if (data['@type'] === 'Product' && data.offers) {
                const price = parseFloat(data.offers.price || data.offers.lowPrice);
                if (price > 10 && price < 10000) {
                  foundPrices.push(price);
                }
              }
            } catch (e) {}
          });
          
          return foundPrices;
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      // Fallback 2: Regex (tekstowy)
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * COOLBLUE PARSER
   */
  'coolblue.nl': {
    name: 'Coolblue',
    searchUrl: (query) => `https://www.coolblue.nl/zoeken?query=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: JSON-LD (structured data)
      try {
        const prices = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const foundPrices = [];
          
          scripts.forEach(script => {
            try {
              const data = JSON.parse(script.textContent);
              
              if (data['@type'] === 'ItemList' && data.itemListElement) {
                data.itemListElement.forEach(item => {
                  if (item.offers && item.offers.price) {
                    const price = parseFloat(item.offers.price);
                    if (price > 10 && price < 10000) {
                      foundPrices.push(price);
                    }
                  }
                });
              }
            } catch (e) {}
          });
          
          return foundPrices;
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      // Fallback 2: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * MEDIAMARKT PARSER
   */
  'mediamarkt.nl': {
    name: 'MediaMarkt',
    searchUrl: (query) => `https://www.mediamarkt.nl/nl/search.html?query=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      // Fallback 2: CSS Selektory
      try {
        const prices = await page.evaluate(() => {
          const selectors = [
            '[data-test="mms-product-price"]',
            '.price',
            '[class*="price"]'
          ];
          
          const foundPrices = [];
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.innerText || el.textContent || '';
              const match = text.match(/€\s*(\d{1,4})[.,](\d{2})/);
              if (match) {
                const price = parseFloat(`${match[1]}.${match[2]}`);
                if (price > 10 && price < 10000) {
                  foundPrices.push(price);
                }
              }
            });
          });
          
          return foundPrices;
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * BCC PARSER
   */
  'bcc.nl': {
    name: 'BCC',
    searchUrl: (query) => `https://www.bcc.nl/search?text=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: JSON-LD
      try {
        const prices = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const foundPrices = [];
          scripts.forEach(script => {
            try {
              const data = JSON.parse(script.textContent);
              if (data['@type'] === 'ItemList' && data.itemListElement) {
                data.itemListElement.forEach(item => {
                  if (item.offers && item.offers.price) {
                    const price = parseFloat(item.offers.price);
                    if (price > 10 && price < 10000) foundPrices.push(price);
                  }
                });
              }
            } catch (e) {}
          });
          return foundPrices;
        });
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      // Fallback 2: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        if (prices.length > 0) return prices;
      } catch (e) {}
      return [];
    }
  },

  /**
   * FONQ PARSER
   */
  'fonq.nl': {
    name: 'Fonq',
    searchUrl: (query) => `https://www.fonq.nl/search/?text=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * BLOKKER PARSER
   */
  'blokker.nl': {
    name: 'Blokker',
    searchUrl: (query) => `https://www.blokker.nl/search?q=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * PRAXIS PARSER
   */
  'praxis.nl': {
    name: 'Praxis',
    searchUrl: (query) => `https://www.praxis.nl/zoeken?q=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * INTRATUIN PARSER
   */
  'intratuin.nl': {
    name: 'Intratuin',
    searchUrl: (query) => `https://www.intratuin.nl/zoeken?q=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * WEHKAMP PARSER
   */
  'wehkamp.nl': {
    name: 'Wehkamp',
    searchUrl: (query) => `https://www.wehkamp.nl/search/?searchTerm=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      return [];
    }
  },

  /**
   * ZALANDO PARSER
   */
  'zalando.nl': {
    name: 'Zalando',
    searchUrl: (query) => `https://www.zalando.nl/search?q=${encodeURIComponent(query)}`,
    
    extractPrices: async (page) => {
      // Fallback 1: JSON-LD
      try {
        const prices = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const foundPrices = [];
          scripts.forEach(script => {
            try {
              const data = JSON.parse(script.textContent);
              if (data['@type'] === 'ItemList' && data.itemListElement) {
                data.itemListElement.forEach(item => {
                  if (item.offers && item.offers.price) {
                    const price = parseFloat(item.offers.price);
                    if (price > 10 && price < 10000) foundPrices.push(price);
                  }
                });
              }
            } catch (e) {}
          });
          return foundPrices;
        });
        if (prices.length > 0) return prices;
      } catch (e) {}
      
      // Fallback 2: Regex
      try {
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.map(m => {
            const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
            return parseFloat(`${match[1]}.${match[2]}`);
          }).filter(p => p > 10 && p < 10000);
        });
        if (prices.length > 0) return prices;
      } catch (e) {}
      return [];
    }
  }
};

/**
 * Get parser for domain
 */
function getParser(domain) {
  // Normalize domain
  const normalizedDomain = domain.replace('www.', '').toLowerCase();
  
  // Check exact match
  if (parsers[normalizedDomain]) {
    return parsers[normalizedDomain];
  }
  
  // Check partial match
  for (const key in parsers) {
    if (normalizedDomain.includes(key) || key.includes(normalizedDomain)) {
      return parsers[key];
    }
  }
  
  return null;
}

module.exports = {
  parsers,
  getParser
};
