// UWAGA: To jest wersja z Google Shopping API (SearchAPI) z 15.03.2026
// Oryginalny server-simple.js pozostaje niezmieniony
// Ten plik zawiera: Google Shopping API, cache 6h, rate limiting, store blacklist

const express = require('express');
const cors = require('cors');
const GoogleShoppingAPI = require('./google-shopping');
const APICache = require('./api-cache');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Redis client (optional)
let redisClient = null;
let apiCache = null;

// Initialize Google Shopping API
const googleShopping = new GoogleShoppingAPI(process.env.GOOGLE_SHOPPING_API_KEY);

// Initialize API Cache (works without Redis)
apiCache = new APICache(redisClient, {
  defaultTTL: 21600 // 6 hours
});

console.log('Google Shopping API initialized');

// Environment variables with production fallbacks
console.log('DEBUG: process.env.PRICING_NICHE_EXCL =', process.env.PRICING_NICHE_EXCL);
console.log('DEBUG: typeof =', typeof process.env.PRICING_NICHE_EXCL);
console.log('DEBUG: parseFloat =', parseFloat(process.env.PRICING_NICHE_EXCL));

const isProduction = process.env.NODE_ENV === 'production';
const nicheExcl = process.env.PRICING_NICHE_EXCL 
  ? parseFloat(process.env.PRICING_NICHE_EXCL) 
  : (isProduction ? 0.3 : 4.0);

const nicheMinRating = process.env.PRICING_NICHE_MIN_RATING 
  ? parseFloat(process.env.PRICING_NICHE_MIN_RATING)
  : (isProduction ? 3.8 : 4.0);

const nicheMinReviews = process.env.PRICING_NICHE_MIN_REVIEWS
  ? parseInt(process.env.PRICING_NICHE_MIN_REVIEWS)
  : (isProduction ? 15 : 30);

const v2MinRat = process.env.PRICING_V2_MIN_RAT
  ? parseFloat(process.env.PRICING_V2_MIN_RAT)
  : (isProduction ? 3.8 : 4.0);

const v2MinRev = process.env.PRICING_V2_MIN_REV
  ? parseInt(process.env.PRICING_V2_MIN_REV)
  : (isProduction ? 15 : 30);

console.log('DEBUG: Final nicheExcl =', nicheExcl);
console.log('DEBUG: Final nicheMinRating =', nicheMinRating);
console.log('DEBUG: Final nicheMinReviews =', nicheMinReviews);
console.log('DEBUG: Final v2MinRat =', v2MinRat);
console.log('DEBUG: Final v2MinRev =', v2MinRev);

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_SHOPPING_API_KEY: process.env.GOOGLE_SHOPPING_API_KEY,
  USE_MOCK_FALLBACK: process.env.USE_MOCK_FALLBACK === 'true',
  USE_DYNAMIC_PRICING: process.env.USE_DYNAMIC_PRICING === 'true',
  
  PRICING_NICHE_EXCEPTION_ENABLED: process.env.PRICING_NICHE_EXCEPTION_ENABLED === 'true',
  PRICING_NICHE_EXCL: nicheExcl,
  PRICING_NICHE_MIN_RATING: nicheMinRating,
  PRICING_NICHE_MIN_REVIEWS: nicheMinReviews,
  
  PRICING_SCAM_MIN_R: parseFloat(process.env.PRICING_SCAM_MIN_R) || 4.0,
  PRICING_V2_MAX_RAT: parseFloat(process.env.PRICING_V2_MAX_RAT) || 4.6,
  PRICING_V2_MIN_RAT: v2MinRat,
  PRICING_V2_MIN_REV: v2MinRev,
  
  MARKET_DISK_CACHE: process.env.MARKET_DISK_CACHE === '1',
  MARKET_LOG_SILENT: process.env.MARKET_LOG_SILENT === '1'
};

async function filterOffersByPricingRules(offers, basePrice, productId) {
  if (!offers || offers.length === 0) return [];
  
  const filtered = [];
  
  for (const offer of offers) {
    if (!offer.price || offer.price <= 0) continue;
    
    const rating = parseFloat(offer.rating) || 0;
    const reviews = parseInt(offer.reviews) || 0;
    
    if (ENV.PRICING_NICHE_EXCEPTION_ENABLED) {
      if (rating < ENV.PRICING_NICHE_MIN_RATING) continue;
      if (reviews < ENV.PRICING_NICHE_MIN_REVIEWS) continue;
    }
    
    if (rating < ENV.PRICING_SCAM_MIN_R) continue;
    
    if (rating > ENV.PRICING_V2_MAX_RAT) continue;
    if (rating < ENV.PRICING_V2_MIN_RAT) continue;
    if (reviews < ENV.PRICING_V2_MIN_REV) continue;
    
    const priceRatio = offer.price / basePrice;
    if (priceRatio < ENV.PRICING_NICHE_EXCL) continue;
    
    filtered.push(offer);
  }
  
  return filtered.sort((a, b) => a.price - b.price);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
    redis: redisClient ? 'connected' : 'disabled',
    config: {
      use_dynamic_pricing: ENV.USE_DYNAMIC_PRICING,
      niche_exception_enabled: ENV.PRICING_NICHE_EXCEPTION_ENABLED,
      niche_excl: ENV.PRICING_NICHE_EXCL,
      niche_min_rating: ENV.PRICING_NICHE_MIN_RATING,
      niche_min_reviews: ENV.PRICING_NICHE_MIN_REVIEWS,
      scam_min_rating: ENV.PRICING_SCAM_MIN_R,
      v2_max_rating: ENV.PRICING_V2_MAX_RAT,
      v2_min_rating: ENV.PRICING_V2_MIN_RAT,
      v2_min_reviews: ENV.PRICING_V2_MIN_REV
    }
  });
});

// Google Shopping API endpoint with cache and rate limiting
app.post('/api/search', async (req, res) => {
  try {
    const { query, basePrice } = req.body;
    
    if (!query || !basePrice) {
      return res.status(400).json({
        error: 'Missing required fields: query, basePrice'
      });
    }
    
    if (!ENV.GOOGLE_SHOPPING_API_KEY) {
      return res.status(503).json({
        error: 'Google Shopping API not configured',
        timestamp: new Date().toISOString()
      });
    }
    
    const rateLimitKey = `ratelimit:shopping:${query.toLowerCase().replace(/\s+/g, '-')}`;
    const rateLimit = await apiCache.checkRateLimit(rateLimitKey, 2, 86400);
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for: ${query}`);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum 2 requests per product per day',
        retryAfter: 86400
      });
    }
    
    console.log(`API call ${rateLimit.current}/2 for: ${query}`);
    console.log(`Searching Google Shopping for: ${query}`);
    
    const offers = await googleShopping.searchProduct(query, {
      country: 'nl',
      language: 'nl',
      limit: 20
    });
    
    console.log(`Found ${offers.length} offers from Google Shopping`);
    
    const filtered = await filterOffersByPricingRules(offers, basePrice, query);
    console.log(`${filtered.length} offers passed pricing filters`);
    
    const top3 = filtered.slice(0, 3);
    
    const savings = top3.length > 0 
      ? {
          amount: basePrice - top3[0].price,
          percent: (((basePrice - top3[0].price) / basePrice) * 100).toFixed(1)
        }
      : { amount: 0, percent: '0.0' };
    
    const result = {
      query,
      basePrice,
      totalOffers: offers.length,
      filteredOffers: filtered.length,
      topOffers: top3,
      savings,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
    
    // Save to cache (6h TTL)
    const cacheKey = `shopping:${query.toLowerCase().replace(/\s+/g, '-')}`;
    await apiCache.set(cacheKey, result, 21600);
    
    res.json(result);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Dealsense Pricing Engine running on port ${PORT}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(`Niche Exception Enabled: ${ENV.PRICING_NICHE_EXCEPTION_ENABLED}`);
  console.log(`Min Rating: ${ENV.PRICING_NICHE_MIN_RATING}`);
  console.log(`Min Reviews: ${ENV.PRICING_NICHE_MIN_REVIEWS}`);
});
