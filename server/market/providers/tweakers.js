"use strict";

const http = require("http");
const https = require("https");
const axiosLib = require("axios");
const cheerio = require("cheerio");

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

// Rate limiter (max 1 request/sekunda)
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

// Cache (15 minut TTL)
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function cleanPrice(priceText) {
  if (!priceText) return 0;
  
  // "€ 919,00" → 919.00
  // "€919" → 919
  // "919,00" → 919.00
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
      console.log(`[Tweakers] Cache hit: ${q} (${cached.offers.length} offers)`);
    }
    return cached.offers;
  }

  // Rate limiting
  await rateLimiter.wait();

  const url = `https://tweakers.net/pricewatch/search/`;
  
  try {
    if (LOG_HTTP) {
      console.log(`[Tweakers] Scraping: ${q}`);
    }

    const response = await axios.get(url, {
      params: {
        keyword: q
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Referer': 'https://tweakers.net/'
      },
      timeout: 8000,
      validateStatus: () => true
    });

    if (!response || response.status < 200 || response.status >= 300) {
      if (LOG_HTTP) {
        console.error(`[Tweakers] Non-2xx response:`, { status: response?.status, q });
      }
      return null;
    }

    const html = response.data;
    const $ = cheerio.load(html);
    
    const offers = [];
    const want = Math.max(1, Math.min(Number(maxResults) || 30, 100));

    // FILTR GIGANTÓW - Tweakers zwraca TYLKO niszowe!
    // Google Shopping i SERP API już dają gigantów
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

    // Tweakers może mieć różne struktury HTML - próbujemy kilka selektorów
    const selectors = [
      '.shop-listing',
      '.product-listing',
      'tr.shop',
      '.pricewatch-shop'
    ];

    let foundOffers = false;

    for (const selector of selectors) {
      const elements = $(selector);
      
      if (elements.length === 0) continue;

      elements.each((i, el) => {
        if (offers.length >= want) return false;

        const $el = $(el);
        
        // Próbuj różne selektory dla nazwy sklepu
        let shop = $el.find('.shop-name').text().trim() ||
                   $el.find('.shopName').text().trim() ||
                   $el.find('td.shop a').text().trim() ||
                   $el.find('.name').text().trim();
        
        // FILTRUJ GIGANTÓW - skip jeśli to gigant!
        if (isGiant(shop)) {
          return; // continue
        }
        
        // Próbuj różne selektory dla ceny
        let priceText = $el.find('.price').text().trim() ||
                        $el.find('.shopPrice').text().trim() ||
                        $el.find('td.price').text().trim() ||
                        $el.find('.amount').text().trim();
        
        const price = cleanPrice(priceText);
        
        // Próbuj różne selektory dla URL
        let offerUrl = $el.find('a').attr('href') || '';
        if (offerUrl && !offerUrl.startsWith('http')) {
          offerUrl = `https://tweakers.net${offerUrl}`;
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
            _source: "tweakers"
          });
          
          foundOffers = true;
        }
      });

      if (foundOffers) break;
    }

    if (LOG_HTTP) {
      console.log(`[Tweakers] Found ${offers.length} offers for: ${q}`);
    }

    // Cache result
    if (offers.length > 0) {
      cache.set(cacheKey, {
        offers,
        timestamp: Date.now()
      });
    }

    return offers.length > 0 ? offers : null;

  } catch (error) {
    if (LOG_HTTP) {
      console.error(`[Tweakers] Scraping error:`, {
        q,
        message: error.message,
        code: error.code
      });
    }
    return null;
  }
}

module.exports = {
  fetchOffers,
};
