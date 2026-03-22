"use strict";

/**
 * TEST 3 PRODUKTÓW - MATHEMATICAL ROTATION (WSZYSTKIE FILTRY WYŁĄCZONE)
 * 
 * WERSJA TESTOWA
 * 
 * Sprawdzamy czy mathematical rotation działa na surowych ofertach
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

// WYMUŚ BYPASS CACHE
process.env.MARKET_CACHE_BYPASS = 'true';

const { fetchMarketOffers } = require('./market-api');
const { clearHistory } = require('./lib/mathematicalRotation');

// 3 RÓŻNE PRODUKTY
const TEST_PRODUCTS = [
  {
    name: 'Sony WH-1000XM5',
    ean: '4548736134980',
    basePrice: 399,
    category: 'electronics'
  },
  {
    name: 'Dyson V12 Detect Slim',
    ean: '5025155071953',
    basePrice: 599,
    category: 'home_garden'
  },
  {
    name: 'Garmin Forerunner 255',
    ean: '0753759292904',
    basePrice: 349,
    category: 'health_fitness'
  }
];

const SCANS_PER_PRODUCT = 3; // 3 skany każdego produktu
const USER_ID = 'test_user_456';

async function testProduct(product, productIndex) {
  console.log('\n' + '═'.repeat(100));
  console.log(`PRODUKT ${productIndex + 1}/3: ${product.name}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log('═'.repeat(100));
  
  const productResults = [];
  
  for (let scanCount = 0; scanCount < SCANS_PER_PRODUCT; scanCount++) {
    console.log(`\n--- Scan ${scanCount + 1}/${SCANS_PER_PRODUCT} ---`);
    
    const startTime = Date.now();
    
    try {
      const offers = await fetchMarketOffers(product.name, product.ean, {
        basePrice: product.basePrice,
        location: 'nl',
        userId: USER_ID,
        productName: product.name,
        scanCount: scanCount,
        maxResults: 3
      });
      
      const duration = Date.now() - startTime;
      
      if (!offers || offers.length === 0) {
        console.log('❌ Brak ofert');
        productResults.push({
          scanCount: scanCount + 1,
          shops: [],
          prices: [],
          duration,
          status: 'NO_OFFERS'
        });
        continue;
      }
      
      const shops = offers.slice(0, 3).map(o => o.seller || 'Unknown');
      const prices = offers.slice(0, 3).map(o => o.price || 0);
      
      console.log(`✅ ${offers.length} ofert, ⏱️ ${duration}ms`);
      
      // Wyświetl TOP 3
      shops.forEach((shop, i) => {
        const price = prices[i];
        const savings = product.basePrice - price;
        const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
        const position = offers[i]._position || 'N/A';
        const segment = offers[i]._rotationScore?.segment || 'N/A';
        
        console.log(`   ${i + 1}. ${shop} - €${price.toFixed(2)} (${savingsPercent}%) [${position}] [${segment}]`);
      });
      
      productResults.push({
        scanCount: scanCount + 1,
        shops,
        prices,
        duration,
        status: 'SUCCESS'
      });
      
    } catch (error) {
      console.error(`❌ Błąd: ${error.message}`);
      productResults.push({
        scanCount: scanCount + 1,
        shops: [],
        prices: [],
        duration: Date.now() - startTime,
        status: 'ERROR',
        error: error.message
      });
    }
    
    // Pauza między skanami
    if (scanCount < SCANS_PER_PRODUCT - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return {
    product: product.name,
    basePrice: product.basePrice,
    scans: productResults
  };
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST 3 PRODUKTÓW - MATHEMATICAL ROTATION                                          ║');
  console.log('║              WSZYSTKIE FILTRY WYŁĄCZONE (wersja testowa)                                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`🔄 Skanów na produkt: ${SCANS_PER_PRODUCT}`);
  console.log(`📦 Produktów: ${TEST_PRODUCTS.length}`);
  console.log('');
  console.log('⚠️  FILTRY WYŁĄCZONE:');
  console.log('   - Quality Filter: OFF');
  console.log('   - Canonical Filter: OFF');
  console.log('   - Deal Truth: OFF');
  console.log('');
  console.log('✅ AKTYWNE:');
  console.log('   - Mathematical Rotation: ON');
  console.log('   - Deal Score V2: ON');
  console.log('');
  
  // Wyczyść historię przed testem
  clearHistory(USER_ID);
  
  const allResults = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const result = await testProduct(TEST_PRODUCTS[i], i);
    allResults.push(result);
    
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 3 sekundy przed następnym produktem...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // ANALIZA
  console.log('\n' + '═'.repeat(100));
  console.log('📊 ANALIZA WYNIKÓW');
  console.log('═'.repeat(100));
  
  allResults.forEach((productResult, i) => {
    console.log(`\n${i + 1}. ${productResult.product}:`);
    
    const successful = productResult.scans.filter(s => s.status === 'SUCCESS');
    console.log(`   Udane skany: ${successful.length}/${SCANS_PER_PRODUCT}`);
    
    if (successful.length > 0) {
      const allShops = successful.flatMap(s => s.shops);
      const uniqueShops = new Set(allShops);
      const diversity = ((uniqueShops.size / allShops.length) * 100).toFixed(1);
      
      console.log(`   Unikalne sklepy: ${uniqueShops.size}/${allShops.length}`);
      console.log(`   Różnorodność: ${diversity}%`);
      
      // Sprawdź powtórzenia
      let hasOverlap = false;
      for (let j = 0; j < successful.length - 1; j++) {
        const overlap = successful[j].shops.filter(shop => 
          successful[j + 1].shops.includes(shop)
        );
        if (overlap.length > 0) {
          hasOverlap = true;
          console.log(`   Scan ${j + 1} vs ${j + 2}: ${overlap.length} powtórzeń (${overlap.join(', ')})`);
        }
      }
      
      if (!hasOverlap) {
        console.log(`   ✅ Brak powtórzeń między skanami!`);
      }
    }
  });
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY!');
  console.log('═'.repeat(100));
  console.log('');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-3-products-mathematical-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 3 Products - Mathematical Rotation (No Filters)',
    date: new Date().toISOString(),
    filtersDisabled: ['Quality Filter', 'Canonical Filter', 'Deal Truth'],
    mathematicalRotationEnabled: true,
    userId: USER_ID,
    scansPerProduct: SCANS_PER_PRODUCT,
    results: allResults
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
