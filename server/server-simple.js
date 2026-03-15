const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const DynamicPricingEngine = require('./pricing-dynamic');
const GoogleShoppingAPI = require('./google-shopping');
const APICache = require('./api-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('Redis connected');
  });
}

const dynamicPricing = new DynamicPricingEngine(redisClient);

const apiCache = new APICache(redisClient, {
  defaultTTL: 21600 // 6 hours cache
});

let googleShopping = null;
if (process.env.GOOGLE_SHOPPING_API_KEY) {
  googleShopping = new GoogleShoppingAPI(process.env.GOOGLE_SHOPPING_API_KEY);
  console.log('Google Shopping API initialized');
} else {
  console.warn('Google Shopping API key not found - /api/search will not work');
}

app.use(cors());
app.use(express.json());

console.log('DEBUG: process.env.PRICING_NICHE_EXCL =', process.env.PRICING_NICHE_EXCL);
console.log('DEBUG: typeof =', typeof process.env.PRICING_NICHE_EXCL);
console.log('DEBUG: parseFloat =', parseFloat(process.env.PRICING_NICHE_EXCL));

const isProduction = process.env.NODE_ENV === 'production';
const nicheExcl = process.env.PRICING_NICHE_EXCL 
  ? parseFloat(process.env.PRICING_NICHE_EXCL) 
  : (isProduction ? 0.3 : 4.0);

console.log('DEBUG: Final nicheExcl =', nicheExcl);

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_SHOPPING_API_KEY: process.env.GOOGLE_SHOPPING_API_KEY,
  USE_MOCK_FALLBACK: process.env.USE_MOCK_FALLBACK === 'true',
  USE_DYNAMIC_PRICING: process.env.USE_DYNAMIC_PRICING === 'true',
  
  PRICING_NICHE_EXCEPTION_ENABLED: process.env.PRICING_NICHE_EXCEPTION_ENABLED === 'true',
  PRICING_NICHE_EXCL: nicheExcl,
  PRICING_NICHE_MIN_RATING: parseFloat(process.env.PRICING_NICHE_MIN_RATING) || 4.0,
  PRICING_NICHE_MIN_REVIEWS: parseInt(process.env.PRICING_NICHE_MIN_REVIEWS) || 30,
  
  PRICING_SCAM_MIN_R: parseFloat(process.env.PRICING_SCAM_MIN_R) || 4.0,
  PRICING_V2_MAX_RAT: parseFloat(process.env.PRICING_V2_MAX_RAT) || 4.6,
  PRICING_V2_MIN_RAT: parseFloat(process.env.PRICING_V2_MIN_RAT) || 4.0,
  PRICING_V2_MIN_REV: parseInt(process.env.PRICING_V2_MIN_REV) || 30,
  
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
    
    if (ENV.USE_DYNAMIC_PRICING && redisClient) {
      const dealId = `${productId}:${offer.store}:${offer.price}`;
      const decision = await dynamicPricing.shouldAcceptOffer(offer, basePrice, dealId);
      
      if (!decision.accept) {
        continue;
      }
      
      offer.dynamicDecision = decision;
    } else {
      const priceRatio = offer.price / basePrice;
      if (priceRatio < ENV.PRICING_NICHE_EXCL) continue;
    }
    
    filtered.push(offer);
  }
  
  return filtered;
}

function sortOffersByPrice(offers) {
  return [...offers].sort((a, b) => a.price - b.price);
}

function getTopOffers(offers, count = 3) {
  const sorted = sortOffersByPrice(offers);
  return sorted.slice(0, count);
}

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
    },
    dynamic_pricing: ENV.USE_DYNAMIC_PRICING ? dynamicPricing.getStats() : null
  });
});

app.post('/api/compare', async (req, res) => {
  try {
    const { product, basePrice, offers, productId } = req.body;
    
    if (!product || !basePrice || !offers) {
      return res.status(400).json({ 
        error: 'Missing required fields: product, basePrice, offers' 
      });
    }
    
    const pid = productId || product.replace(/\s+/g, '-').toLowerCase();
    
    const filteredOffers = await filterOffersByPricingRules(offers, basePrice, pid);
    const topOffers = getTopOffers(filteredOffers, 3);
    
    const savings = topOffers.length > 0 
      ? basePrice - topOffers[0].price 
      : 0;
    
    const savingsPercent = topOffers.length > 0
      ? ((savings / basePrice) * 100).toFixed(1)
      : 0;
    
    res.json({
      product,
      basePrice,
      totalOffers: offers.length,
      filteredOffers: filteredOffers.length,
      topOffers,
      savings: {
        amount: savings,
        percent: savingsPercent
      },
      usedDynamicPricing: ENV.USE_DYNAMIC_PRICING && redisClient !== null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing compare request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/test', (req, res) => {
  const { testData } = req.body;
  
  const results = testData.map(item => {
    const filtered = filterOffersByPricingRules(item.offers, item.basePrice);
    const top = getTopOffers(filtered, 3);
    
    return {
      product: item.product,
      basePrice: item.basePrice,
      totalOffers: item.offers.length,
      filteredOffers: filtered.length,
      topOffers: top,
      bestPrice: top.length > 0 ? top[0].price : null,
      savings: top.length > 0 ? item.basePrice - top[0].price : 0
    };
  });
  
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  
  res.json({
    results,
    summary: {
      totalProducts: results.length,
      totalSavings: totalSavings.toFixed(2),
      averageSavings: (totalSavings / results.length).toFixed(2)
    }
  });
});

app.post('/api/search', async (req, res) => {
  try {
    const { query, basePrice } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Missing required field: query' });
    }
    
    if (!googleShopping) {
      return res.status(503).json({ 
        error: 'Google Shopping API not configured',
        message: 'GOOGLE_SHOPPING_API_KEY environment variable is missing'
      });
    }
    
    const cacheKey = apiCache.generateKey('shopping', { query, country: 'nl' });
    
    const cached = await apiCache.get(cacheKey);
    if (cached) {
      console.log(`Returning cached results for: ${query}`);
      return res.json({
        ...cached,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }
    
    const rateLimitKey = `ratelimit:shopping:${query.toLowerCase().replace(/\s+/g, '-')}`;
    const rateLimit = await apiCache.checkRateLimit(rateLimitKey, 2, 86400);
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for: ${query}`);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum 2 API calls per product per day',
        query,
        retryAfter: '24 hours'
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
    
    if (offers.length === 0) {
      return res.json({
        query,
        basePrice: basePrice || null,
        totalOffers: 0,
        filteredOffers: 0,
        topOffers: [],
        savings: { amount: 0, percent: 0 },
        message: 'No offers found for this product',
        timestamp: new Date().toISOString()
      });
    }
    
    const calculatedBasePrice = basePrice || (offers.length > 0 ? Math.max(...offers.map(o => o.price)) : 0);
    
    const pid = query.replace(/\s+/g, '-').toLowerCase();
    const filteredOffers = await filterOffersByPricingRules(offers, calculatedBasePrice, pid);
    const topOffers = getTopOffers(filteredOffers, 3);
    
    const savings = topOffers.length > 0 ? calculatedBasePrice - topOffers[0].price : 0;
    const savingsPercent = topOffers.length > 0 ? ((savings / calculatedBasePrice) * 100).toFixed(1) : 0;
    
    const result = {
      query,
      basePrice: calculatedBasePrice,
      totalOffers: offers.length,
      filteredOffers: filteredOffers.length,
      topOffers,
      savings: {
        amount: savings,
        percent: savingsPercent
      },
      usedDynamicPricing: ENV.USE_DYNAMIC_PRICING && redisClient !== null,
      apiCalled: true,
      apiCallsRemaining: rateLimit.remaining - 1
    };
    
    await apiCache.set(cacheKey, result, 21600);
    
    res.json({
      ...result,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing search request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Dealsense Pricing Engine running on port ${PORT}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(`Niche Exception Enabled: ${ENV.PRICING_NICHE_EXCEPTION_ENABLED}`);
  console.log(`Min Rating: ${ENV.PRICING_NICHE_MIN_RATING}`);
  console.log(`Min Reviews: ${ENV.PRICING_NICHE_MIN_REVIEWS}`);
});
