"use strict";

/**
 * TEST 1 PRODUKTU - ULEPSZONY DEALSCORE V2
 * 
 * Sprawdzamy gdzie dokładnie oferty są wycinane
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

// 1 PRODUKT
const TEST_PRODUCT = {
  name: 'Sony WH-1000XM5',
  ean: '4548736134980',
  basePrice: 399
};

const USER_ID = 'test_user_789';

async function runTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST 1 PRODUKTU - ULEPSZONY DEALSCORE V2                                         ║');
  console.log('║              Analiza: Gdzie oferty są wycinane                                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 Produkt: ${TEST_PRODUCT.name}`);
  console.log(`💰 Cena bazowa: €${TEST_PRODUCT.basePrice}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(TEST_PRODUCT.name, TEST_PRODUCT.ean, {
      basePrice: TEST_PRODUCT.basePrice,
      location: 'nl',
      userId: USER_ID,
      productName: TEST_PRODUCT.name,
      scanCount: 0,
      maxResults: 3
    });
    
    const duration = Date.now() - startTime;
    
    console.log('\n' + '═'.repeat(100));
    console.log('📊 WYNIK');
    console.log('═'.repeat(100));
    
    if (!offers || offers.length === 0) {
      console.log('\n❌ BRAK OFERT - WSZYSTKIE WYCIĘTE!');
      console.log('\n⚠️  SPRAWDŹ LOGI POWYŻEJ:');
      console.log('   1. [MARKET] SearchAPI returned: X offers - ile ofert z API?');
      console.log('   2. [DealScoreV2] Stats: X/Y valid - ile przeszło DealScore?');
      console.log('   3. [RotationEngine] - ile po rotacji?');
    } else {
      console.log(`\n✅ ZNALEZIONO ${offers.length} OFERT`);
      console.log(`⏱️  Czas: ${duration}ms\n`);
      
      offers.forEach((offer, i) => {
        const price = offer.price || 0;
        const savings = TEST_PRODUCT.basePrice - price;
        const savingsPercent = ((savings / TEST_PRODUCT.basePrice) * 100).toFixed(1);
        const dealScore = offer._dealScore?.dealScore || 0;
        const trustScore = offer._dealScore?.trustScore || 0;
        const position = offer._position || 'N/A';
        const segment = offer._rotationScore?.segment || 'N/A';
        
        console.log(`${i + 1}. ${offer.seller}`);
        console.log(`   Cena: €${price.toFixed(2)} (${savingsPercent}% oszczędności)`);
        console.log(`   Deal Score: ${dealScore.toFixed(1)}, Trust: ${trustScore}`);
        console.log(`   Position: ${position}, Segment: ${segment}`);
        console.log('');
      });
    }
    
    console.log('═'.repeat(100));
    console.log('✅ TEST ZAKOŃCZONY');
    console.log('═'.repeat(100));
    console.log('');
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
  }
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
