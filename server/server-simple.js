const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_SHOPPING_API_KEY: process.env.GOOGLE_SHOPPING_API_KEY,
  USE_MOCK_FALLBACK: process.env.USE_MOCK_FALLBACK === 'true',
  
  PRICING_NICHE_EXCEPTION_ENABLED: process.env.PRICING_NICHE_EXCEPTION_ENABLED === 'true',
  PRICING_NICHE_EXCL: parseFloat(process.env.PRICING_NICHE_EXCL) || 4.0,
  PRICING_NICHE_MIN_RATING: parseFloat(process.env.PRICING_NICHE_MIN_RATING) || 4.0,
  PRICING_NICHE_MIN_REVIEWS: parseInt(process.env.PRICING_NICHE_MIN_REVIEWS) || 30,
  
  PRICING_SCAM_MIN_R: parseFloat(process.env.PRICING_SCAM_MIN_R) || 4.0,
  PRICING_V2_MAX_RAT: parseFloat(process.env.PRICING_V2_MAX_RAT) || 4.6,
  PRICING_V2_MIN_RAT: parseFloat(process.env.PRICING_V2_MIN_RAT) || 4.0,
  PRICING_V2_MIN_REV: parseInt(process.env.PRICING_V2_MIN_REV) || 30,
  
  MARKET_DISK_CACHE: process.env.MARKET_DISK_CACHE === '1',
  MARKET_LOG_SILENT: process.env.MARKET_LOG_SILENT === '1'
};

function filterOffersByPricingRules(offers, basePrice) {
  if (!offers || offers.length === 0) return [];
  
  return offers.filter(offer => {
    if (!offer.price || offer.price <= 0) return false;
    
    const rating = parseFloat(offer.rating) || 0;
    const reviews = parseInt(offer.reviews) || 0;
    
    if (ENV.PRICING_NICHE_EXCEPTION_ENABLED) {
      if (rating < ENV.PRICING_NICHE_MIN_RATING) return false;
      if (reviews < ENV.PRICING_NICHE_MIN_REVIEWS) return false;
    }
    
    if (rating < ENV.PRICING_SCAM_MIN_R) return false;
    
    if (rating > ENV.PRICING_V2_MAX_RAT) return false;
    if (rating < ENV.PRICING_V2_MIN_RAT) return false;
    if (reviews < ENV.PRICING_V2_MIN_REV) return false;
    
    const priceRatio = offer.price / basePrice;
    if (priceRatio < ENV.PRICING_NICHE_EXCL) return false;
    
    return true;
  });
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
    config: {
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

app.post('/api/compare', (req, res) => {
  try {
    const { product, basePrice, offers } = req.body;
    
    if (!product || !basePrice || !offers) {
      return res.status(400).json({ 
        error: 'Missing required fields: product, basePrice, offers' 
      });
    }
    
    const filteredOffers = filterOffersByPricingRules(offers, basePrice);
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
