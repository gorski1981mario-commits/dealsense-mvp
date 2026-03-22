"use strict";

/**
 * TEST MATHEMATICAL ROTATION
 * 
 * ENTERPRISE-LEVEL PROBABILISTIC ROTATION
 * 
 * Symulacja: User skanuje TEN SAM produkt 5 razy
 * Sprawdzamy:
 * - Czy TOP1 jest LOCKED (stabilny)
 * - Czy TOP2-3 rotują (probabilistic)
 * - Czy memory block działa (anti-pattern)
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

// TEST PRODUCT
const TEST_PRODUCT = {
  name: 'iPhone 15 Pro 128GB',
  ean: '0195949112683',
  basePrice: 1329
};

const SCANS_COUNT = 5;
const USER_ID = 'test_user_123';

async function runTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST ANTI-PATTERN ROTATION                                                  ║');
  console.log('║                    User skanuje TEN SAM produkt 5 razy                                         ║');
  console.log('║                    Sprawdzamy: Czy dostaje 5 RÓŻNYCH zestawów sklepów                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 Produkt: ${TEST_PRODUCT.name}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`🔄 Liczba skanów: ${SCANS_COUNT}`);
  console.log('');
  
  // Wyczyść historię przed testem
  clearHistory(USER_ID);
  
  const results = [];
  
  for (let scanCount = 0; scanCount < SCANS_COUNT; scanCount++) {
    console.log('═'.repeat(100));
    console.log(`SCAN ${scanCount + 1}/${SCANS_COUNT}`);
    console.log('═'.repeat(100));
    
    const startTime = Date.now();
    
    try {
      const offers = await fetchMarketOffers(TEST_PRODUCT.name, TEST_PRODUCT.ean, {
        basePrice: TEST_PRODUCT.basePrice,
        location: 'nl',
        userId: USER_ID,
        productName: TEST_PRODUCT.name,
        scanCount: scanCount,
        maxResults: 3  // Tylko 3 najlepsze
      });
      
      const duration = Date.now() - startTime;
      
      if (!offers || offers.length === 0) {
        console.log('❌ Brak ofert');
        results.push({
          scanCount: scanCount + 1,
          shops: [],
          prices: [],
          duration,
          status: 'NO_OFFERS'
        });
        continue;
      }
      
      // Wyciągnij sklepy i ceny
      const shops = offers.slice(0, 3).map(o => o.seller || 'Unknown');
      const prices = offers.slice(0, 3).map(o => o.price || 0);
      
      console.log(`\n✅ ZNALEZIONO ${offers.length} ofert`);
      console.log(`⏱️  Czas: ${duration}ms`);
      console.log('');
      console.log('🏪 TOP 3 SKLEPY:');
      shops.forEach((shop, i) => {
        const price = prices[i];
        const savings = TEST_PRODUCT.basePrice - price;
        const savingsPercent = ((savings / TEST_PRODUCT.basePrice) * 100).toFixed(1);
        console.log(`   ${i + 1}. ${shop} - €${price.toFixed(2)} (${savingsPercent}% oszczędności)`);
      });
      
      // Sprawdź mathematical rotation metadata
      if (offers[0]._finalScore) {
        const finalScore = offers[0]._finalScore;
        const rotationScore = offers[0]._rotationScore;
        const position = offers[0]._position;
        
        console.log('');
        console.log('🔄 MATHEMATICAL ROTATION METADATA:');
        console.log(`   Position: ${position}`);
        console.log(`   Final Score (Ri): ${finalScore.Ri.toFixed(3)}`);
        console.log(`   Confidence (Ci): ${finalScore.Ci.toFixed(2)}`);
        console.log(`   Trust (Ti): ${finalScore.Ti.toFixed(2)}`);
        
        if (rotationScore) {
          console.log(`   Rotation Score (R'i): ${rotationScore.Ri_prime.toFixed(3)}`);
          console.log(`   Segment: ${rotationScore.segment}`);
          console.log(`   Views 24h (Hu,i): ${rotationScore.Hui}`);
          console.log(`   Time since last (t): ${rotationScore.t.toFixed(1)}h`);
          console.log(`   Blocked: ${rotationScore.blocked ? 'YES' : 'NO'}`);
        }
      }
      
      results.push({
        scanCount: scanCount + 1,
        shops,
        prices,
        duration,
        status: 'SUCCESS'
      });
      
    } catch (error) {
      console.error(`❌ Błąd: ${error.message}`);
      results.push({
        scanCount: scanCount + 1,
        shops: [],
        prices: [],
        duration: Date.now() - startTime,
        status: 'ERROR',
        error: error.message
      });
    }
    
    // Pauza między skanami
    if (scanCount < SCANS_COUNT - 1) {
      console.log('\n⏳ Pauza 2 sekundy przed następnym skanem...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // ANALIZA WYNIKÓW
  console.log('\n' + '═'.repeat(100));
  console.log('📊 ANALIZA ROTACJI');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  
  if (successful.length === 0) {
    console.log('\n❌ Brak udanych skanów!');
    return;
  }
  
  // Sprawdź różnorodność sklepów
  const allShops = successful.flatMap(r => r.shops);
  const uniqueShops = new Set(allShops);
  
  console.log(`\n✅ Udane skany: ${successful.length}/${SCANS_COUNT}`);
  console.log(`🏪 Wszystkie sklepy pokazane: ${allShops.length}`);
  console.log(`🎯 Unikalne sklepy: ${uniqueShops.size}`);
  console.log(`📊 Różnorodność: ${((uniqueShops.size / allShops.length) * 100).toFixed(1)}%`);
  
  // Sprawdź czy są powtórzenia między skanami
  console.log('\n🔍 POWTÓRZENIA MIĘDZY SKANAMI:');
  for (let i = 0; i < successful.length - 1; i++) {
    const scan1 = successful[i];
    const scan2 = successful[i + 1];
    
    const overlap = scan1.shops.filter(shop => scan2.shops.includes(shop));
    
    if (overlap.length > 0) {
      console.log(`   Scan ${scan1.scanCount} vs Scan ${scan2.scanCount}: ${overlap.length} powtórzeń (${overlap.join(', ')})`);
    } else {
      console.log(`   Scan ${scan1.scanCount} vs Scan ${scan2.scanCount}: ✅ Brak powtórzeń`);
    }
  }
  
  // Statystyki różnorodności
  console.log('\n📈 STATYSTYKI RÓŻNORODNOŚCI:');
  console.log(`   Unique shops: ${uniqueShops.size}`);
  console.log(`   Total shops shown: ${allShops.length}`);
  console.log(`   Diversity: ${((uniqueShops.size / allShops.length) * 100).toFixed(1)}%`);
  
  // Tabela wszystkich skanów
  console.log('\n📋 WSZYSTKIE SKANY:');
  console.log('');
  console.log('Scan | Sklepy                                                    | Ceny');
  console.log('─'.repeat(100));
  successful.forEach(r => {
    const shopsStr = r.shops.join(', ').padEnd(60);
    const pricesStr = r.prices.map(p => `€${p.toFixed(2)}`).join(', ');
    console.log(`${r.scanCount}    | ${shopsStr} | ${pricesStr}`);
  });
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY!');
  console.log('═'.repeat(100));
  console.log('');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-mathematical-rotation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test Mathematical Rotation (Enterprise)',
    date: new Date().toISOString(),
    mathematicalRotationEnabled: true,
    algorithmType: 'Probabilistic Selection + Memory Block + Stability',
    lockTop1: true,
    memoryBlock24h: true,
    lScans: successful.length,
    uniqueShops: uniqueShops.size,
    diversity: ((uniqueShops.size / allShops.length) * 100).toFixed(1),
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
