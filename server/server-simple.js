/**
 * DEALSENSE KWANT BACKEND - SIMPLIFIED VERSION
 * Uproszczona wersja backendu z podstawowymi endpointami
 * Bez Stripe, Auth, Billing - tylko KWANT engine
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// KWANT Engine imports
const { fetchMarketOffers } = require("./market-api");
const { getTop3EchoOffers } = require("./engine/offerEngine");
const { parseEchoTop3Input } = require("./engine/input");
const { rateLimit } = require("./engine/rateLimit");

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

// Debug endpoint - sprawdź zmienne środowiskowe
app.get('/api/debug-env', (req, res) => {
  res.json({
    USE_OWN_CRAWLER: process.env.USE_OWN_CRAWLER,
    CRAWLER_MAX_DOMAINS: process.env.CRAWLER_MAX_DOMAINS,
    USE_PROXY: process.env.USE_PROXY,
    PROXY_PROVIDER: process.env.PROXY_PROVIDER,
    PROXY_HOST: process.env.PROXY_HOST ? 'SET' : 'NOT SET',
    USE_MOCK_FALLBACK: process.env.USE_MOCK_FALLBACK,
    MARKET_LOG_SILENT: process.env.MARKET_LOG_SILENT,
    ROTATION_ENABLED: process.env.ROTATION_ENABLED,
    USE_SMART_TARGETING: process.env.USE_SMART_TARGETING,
    NODE_ENV: process.env.NODE_ENV
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

// Market Offers Endpoint (with anti-scam filtering)
app.post('/api/market', async (req, res) => {
  try {
    const { product_name, ean, userId, userLocation, geoEnabled } = req.body;
    
    if (!product_name) {
      return res.status(400).json({ error: 'product_name is required' });
    }

    console.log(`[MARKET] Request: ${product_name}, ean: ${ean}, userId: ${userId}, geo: ${geoEnabled}`);

    const rawOffers = await fetchMarketOffers(product_name, ean || null, {
      userId,
      userLocation,
      geoEnabled
    });

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

    res.json({
      success: true,
      product_name,
      ean,
      offers: cleanOffers,
      count: cleanOffers.length,
      meta: {
        rawCount: rawOffers.length,
        filteredCount: cleanOffers.length,
        scamRemoved: rawOffers.length - cleanOffers.length,
        marketAvg: Math.round(marketAvg * 100) / 100
      }
    });

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
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 DEALSENSE KWANT BACKEND - SIMPLIFIED');
  console.log('='.repeat(60));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API Status: http://localhost:${PORT}/api/status`);
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
