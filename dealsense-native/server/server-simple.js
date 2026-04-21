/**
 * DEALSENSE KWANT BACKEND - SIMPLIFIED VERSION
 * Uproszczona wersja backendu z podstawowymi endpointami
 * Bez Stripe, Auth, Billing - tylko KWANT engine
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// KWANT Engine imports
const { fetchMarketOffers } = require("./market-api");
const { getTop3EchoOffers } = require("./engine/offerEngine");
const { parseEchoTop3Input } = require("./engine/input");
const { rateLimit } = require("./engine/rateLimit");

// Load EAN database
let eanDatabase = {};
try {
  const eanDbPath = path.join(__dirname, 'ean-database.json');
  const eanDbData = fs.readFileSync(eanDbPath, 'utf8');
  eanDatabase = JSON.parse(eanDbData);
  console.log('[EAN DB] Loaded', Object.keys(eanDatabase).length, 'products');
} catch (error) {
  console.error('[EAN DB] Error loading database:', error);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'dealsense-kwant-backend',
    version: '1.0.0-simple',
    timestamp: new Date().toISOString()
  });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    kwant: {
      engine: 'active',
      cache: 'memory',
      queue: 'stub'
    },
    endpoints: [
      '/health',
      '/api/status',
      '/api/scan',
      '/api/top3',
      '/api/market'
    ]
  });
});

// KWANT TOP 3 Endpoint
app.post('/api/top3', async (req, res) => {
  try {
    const { product_name, base_price, ean } = req.body;
    
    if (!product_name) {
      return res.status(400).json({ error: 'product_name is required' });
    }

    console.log(`[TOP3] Request: ${product_name}, base_price: ${base_price}, ean: ${ean}`);

    const input = parseEchoTop3Input({
      product_name,
      base_price: base_price || 0,
      ean: ean || null
    });

    const result = await getTop3EchoOffers(input);

    res.json({
      success: true,
      product_name,
      base_price,
      result
    });

  } catch (error) {
    console.error('[TOP3] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend works',
    base_price: 999.99,
    test: true
  });
});

// Test POST endpoint
app.post('/api/test-post', (req, res) => {
  res.json({
    success: true,
    message: 'POST works',
    base_price: 888.88,
    test: true,
    received_body: req.body
  });
});

// Market Offers Endpoint (with anti-scam filtering)
app.post('/api/market', async (req, res) => {
  try {
    console.log('[MARKET] Request body:', req.body)
    let { product_name, ean } = req.body;

    // Look up product name from EAN database if available
    if (ean && eanDatabase[ean]) {
      product_name = eanDatabase[ean].name;
      console.log(`[EAN DB] Found product: ${product_name} for EAN: ${ean}`);
    }

    if (!product_name) {
      return res.status(400).json({ error: 'product_name is required' });
    }

    console.log(`[MARKET] Request: ${product_name}, ean: ${ean}`);

    const rawOffers = await fetchMarketOffers(product_name, ean || null);

    // Apply anti-scam filtering
    const { isScam } = require('./scoring/isScam');
    
    // Calculate market average for price validation
    const validPrices = rawOffers
      .map(o => o.price)
      .filter(p => typeof p === 'number' && p > 0);
    const marketAvg = validPrices.length > 0 
      ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length 
      : 0;

    // Filter out scam offers
    const cleanOffers = rawOffers.filter(offer => {
      try {
        return !isScam(offer, marketAvg);
      } catch (err) {
        console.error('[MARKET] isScam error:', err);
        return true; // Keep offer if filtering fails
      }
    });

    console.log(`[MARKET] Filtered: ${rawOffers.length} → ${cleanOffers.length} offers (removed ${rawOffers.length - cleanOffers.length} scam)`);

    // Sort by price (lowest first for alternatives)
    const sortedOffers = cleanOffers.sort((a, b) => a.price - b.price);

    console.log('[BACKEND] sortedOffers:', sortedOffers.map(o => ({ shop: o.seller, price: o.price })));

    // Calculate base price (highest price from offers)
    const basePrice = sortedOffers.length > 0 ? Math.max(...sortedOffers.map(o => o.price)) : 0;

    console.log('[BACKEND] basePrice:', basePrice);

    // Find base shop (shop with highest price)
    const baseShopIndex = sortedOffers.findIndex(o => o.price === basePrice);
    const baseShop = baseShopIndex >= 0 ? sortedOffers[baseShopIndex].seller : 'Unknown';

    console.log('[BACKEND] baseShop:', baseShop);

    // Remove base shop from alternatives
    const alternatives = sortedOffers.filter(o => o.price !== basePrice);

    console.log('[BACKEND] alternatives:', alternatives.map(o => ({ shop: o.seller, price: o.price })));

    // Take all alternatives (dynamic: 1, 2, or 3) + base shop
    const topOffers = alternatives.slice(0, 3);
    topOffers.unshift({ seller: baseShop, price: basePrice, url: '#', _source: 'base' });

    console.log('[BACKEND] topOffers:', topOffers.map(o => ({ shop: o.seller, price: o.price, _source: o._source })));

    const responseData = {
      success: true,
      product_name,
      ean,
      base_price: basePrice,
      offers: topOffers,
      count: topOffers.length,
      meta: {
        rawCount: rawOffers.length,
        filteredCount: cleanOffers.length,
        scamRemoved: rawOffers.length - cleanOffers.length,
        marketAvg: Math.round(marketAvg * 100) / 100
      }
    };

    console.log('[BACKEND] RESPONSE:', JSON.stringify(responseData, null, 2));

    res.json(responseData);

  } catch (error) {
    console.error('[MARKET] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Scan QR Endpoint (simplified)
app.post('/api/scan-qr', async (req, res) => {
  try {
    const { data, type, maxOffers } = req.body;
    
    console.log(`[SCAN-QR] data: ${data}, type: ${type}, maxOffers: ${maxOffers}`);

    // Simplified response - w pełnej wersji: parsowanie QR, wyciąganie produktu, etc.
    res.json({
      success: true,
      message: 'QR code scanned successfully',
      data,
      type,
      maxOffers: maxOffers || 3,
      action: 'scan_complete'
    });

  } catch (error) {
    console.error('[SCAN-QR] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Scan Product Endpoint (URL/price based)
app.post('/api/scan', async (req, res) => {
  try {
    const { url, price, product_name, category, packageType } = req.body;
    
    console.log(`[SCAN] url: ${url}, price: ${price}, product: ${product_name}, package: ${packageType}`);

    // Rate limiting
    const rateLimitResult = rateLimit(req.ip, packageType || 'free');
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining
      });
    }

    // Determine maxOffers based on package
    const maxOffers = (packageType === 'pro' || packageType === 'finance') ? 10 : 3;

    // Get TOP 3 (or TOP 10) offers
    const input = parseEchoTop3Input({
      product_name: product_name || 'Product',
      base_price: price || 0,
      ean: null
    });

    const result = await getTop3EchoOffers(input);

    res.json({
      success: true,
      url,
      price,
      product_name,
      packageType,
      maxOffers,
      result,
      rateLimitRemaining: rateLimitResult.remaining
    });

  } catch (error) {
    console.error('[SCAN] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 DEALSENSE KWANT BACKEND - SIMPLIFIED');
  console.log('='.repeat(60));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API Status: http://localhost:${PORT}/api/status`);
  console.log(`✅ Network: http://10.16.41.182:${PORT}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   POST /api/scan       - Scan product (URL/price)`);
  console.log(`   POST /api/scan-qr    - Scan QR code`);
  console.log(`   POST /api/top3       - Get TOP 3 offers`);
  console.log(`   POST /api/market     - Get market offers`);
  console.log('');
  console.log('🔧 KWANT Engine: ACTIVE');
  console.log('💾 Cache: Memory (stub)');
  console.log('📊 Queue: Stub (no Upstash)');
  console.log('='.repeat(60));
});

module.exports = app;
