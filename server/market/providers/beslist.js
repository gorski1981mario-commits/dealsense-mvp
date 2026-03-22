"use strict";

const http = require("http");
const https = require("https");
const axiosLib = require("axios");
const cheerio = require("cheerio");

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

// Rate limiter
const rateLimiter = {
  lastRequest: 0,
  minDelay: 1000,
  
  async wait() {
    const now = Date.now();
    const timeSince = now - this.lastRequest;
    
    if (timeSince < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSince));
    }
    
    this.lastRequest = Date.now();
  }
};

// Cache
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function cleanPrice(priceText) {
  if (!priceText) return 0;
  const cleaned = String(priceText)
    .replace(/[€\s]/g, '')
    .replace(',', '.')
    .trim();
  return parseFloat(cleaned) || 0;
}

async function fetchOffers({ query, maxResults }) {
  const q = (query && String(query).trim()) || "";
  if (!q) return null;

  const LOG_HTTP = (() => {
    const v = String(process.env.MARKET_LOG_HTTP || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  // Check cache
  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (LOG_HTTP) {
      console.log(`[Beslist] Cache hit: ${q} (${cached.offers.length} offers)`);
    }
    return cached.offers;
  }

  await rateLimiter.wait();

  // Beslist URL format
  const url = `https://www.beslist.nl/products/q/${encodeURIComponent(q)}`;
  
  try {
    if (LOG_HTTP) {
      console.log(`[Beslist] Scraping: ${q}`);
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
      },
      timeout: 8000,
      validateStatus: () => true
    });

    if (!response || response.status < 200 || response.status >= 300) {
      if (LOG_HTTP) {
        console.error(`[Beslist] Non-2xx response:`, { status: response?.status, q });
      }
      return null;
    }

    const html = response.data;
    const $ = cheerio.load(html);
    
    const offers = [];
    const want = Math.max(1, Math.min(Number(maxResults) || 30, 100));

    // FILTR GIGANTÓW - Beslist zwraca TYLKO niszowe!
    const GIANTS = [
      'bol.com', 'bol',
      'amazon.nl', 'amazon',
      'coolblue',
      'mediamarkt', 'media markt',
      'wehkamp',
      'zalando',
      'bijenkorf', 'de bijenkorf'
    ];

    function isGiant(shopName) {
      const lower = shopName.toLowerCase();
      return GIANTS.some(giant => lower.includes(giant));
    }

    // Beslist selectors (trzeba sprawdzić prawdziwą strukturę)
    const selectors = [
      '.product-item',
      '.product',
      'article.product',
      '.listing-item'
    ];

    let foundOffers = false;

    for (const selector of selectors) {
      const elements = $(selector);
      
      if (elements.length === 0) continue;

      elements.each((i, el) => {
        if (offers.length >= want) return false;

        const $el = $(el);
        
        // Wyciągnij nazwę sklepu
        let shop = $el.find('.shop-name').text().trim() ||
                   $el.find('.merchant').text().trim() ||
                   $el.find('.store').text().trim() ||
                   $el.find('a[data-shop]').attr('data-shop') || '';
        
        // FILTRUJ GIGANTÓW
        if (isGiant(shop)) {
          return;
        }
        
        // Wyciągnij cenę
        let priceText = $el.find('.price').text().trim() ||
                        $el.find('.product-price').text().trim() ||
                        $el.find('[data-price]').attr('data-price') || '';
        
        const price = cleanPrice(priceText);
        
        // Wyciągnij URL
        let offerUrl = $el.find('a').attr('href') || '';
        if (offerUrl && !offerUrl.startsWith('http')) {
          offerUrl = `https://www.beslist.nl${offerUrl}`;
        }

        if (shop && price > 0) {
          offers.push({
            seller: shop,
            price: price,
            currency: "EUR",
            availability: "in_stock",
            reviewScore: 0,
            reviewCount: 0,
            url: offerUrl,
            title: q,
            thumbnail: "",
            deliveryTime: null,
            _source: "beslist"
          });
          
          foundOffers = true;
        }
      });

      if (foundOffers) break;
    }

    if (LOG_HTTP) {
      console.log(`[Beslist] Found ${offers.length} NISZOWE offers for: ${q}`);
    }

    // Cache
    if (offers.length > 0) {
      cache.set(cacheKey, {
        offers,
        timestamp: Date.now()
      });
    }

    return offers.length > 0 ? offers : null;

  } catch (error) {
    if (LOG_HTTP) {
      console.error(`[Beslist] Scraping error:`, {
        q,
        message: error.message
      });
    }
    return null;
  }
}

module.exports = {
  fetchOffers,
};
