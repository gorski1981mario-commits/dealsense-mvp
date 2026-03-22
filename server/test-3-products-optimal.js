"use strict";

/**
 * TEST 3 PRODUKTÓW - OPTYMALNA KANONICZNA WERSJA
 * 
 * Konfiguracja:
 * - Quality Filter: ON
 * - Canonical Filter: OFF
 * - DealScore V2: ON (trust 30, reference price fallback)
 * - STANDARD Rotation: ON (40/30/20/10)
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

process.env.MARKET_CACHE_BYPASS = 'true';

const { fetchMarketOffers } = require('./market-api');

const TEST_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 128GB',
    ean: '0195949112683',
    basePrice: 1329
  },
  {
    name: 'Dyson V12 Detect Slim',
    ean: '5025155071953',
    basePrice: 599
  },
  {
    name: 'Garmin Forerunner 255',
    ean: '0753759292904',
    basePrice: 349
  }
];

const USER_ID = 'test_user_optimal';

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`PRODUKT ${index + 1}/3: ${product.name}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log('═'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'nl',
      userId: USER_ID,
      productName: product.name,
      scanCount: 0,
      maxResults: 3
    });
    
    const duration = Date.now() - startTime;
    
    if (!offers || offers.length === 0) {
      console.log(`\n❌ BRAK OFERT (${duration}ms)\n`);
      return {
        product: product.name,
        basePrice: product.basePrice,
        status: 'NO_OFFERS',
        duration
      };
    }
    
    console.log(`\n✅ ${offers.length} OFERT (${duration}ms)\n`);
    
    const results = offers.slice(0, 3).map((offer, i) => {
      const price = offer.price || 0;
      const savings = product.basePrice - price;
      const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
      const dealScore = offer._dealScore?.dealScore || 0;
      const trustScore = offer._dealScore?.trustScore || 0;
      
      console.log(`${i + 1}. ${offer.seller}`);
      console.log(`   €${price.toFixed(2)} (${savingsPercent}% oszczędności)`);
      console.log(`   Score: ${dealScore.toFixed(1)}, Trust: ${trustScore}`);
      console.log('');
      
      return {
        seller: offer.seller,
        price,
        savings,
        savingsPercent: parseFloat(savingsPercent),
        dealScore,
        trustScore
      };
    });
    
    const avgSavings = results.reduce((sum, r) => sum + r.savingsPercent, 0) / results.length;
    
    return {
      product: product.name,
      basePrice: product.basePrice,
      status: 'SUCCESS',
      offersCount: offers.length,
      duration,
      avgSavings: avgSavings.toFixed(1),
      topOffers: results
    };
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}\n`);
    return {
      product: product.name,
      basePrice: product.basePrice,
      status: 'ERROR',
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST 3 PRODUKTÓW - OPTYMALNA KANONICZNA WERSJA                                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 KONFIGURACJA:');
  console.log('   ✅ Quality Filter: ON');
  console.log('   ❌ Canonical Filter: OFF (za restrykcyjny)');
  console.log('   ✅ DealScore V2: ON (trust 30, reference fallback)');
  console.log('   ✅ STANDARD Rotation: ON (40/30/20/10)');
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const result = await testProduct(TEST_PRODUCTS[i], i);
    results.push(result);
    
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('⏳ Pauza 2 sekundy...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // PODSUMOWANIE
  console.log('\n' + '═'.repeat(100));
  console.log('📊 PODSUMOWANIE');
  console.log('═'.repeat(100));
  console.log('');
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const successRate = ((successful.length / results.length) * 100).toFixed(0);
  
  console.log(`✅ Success Rate: ${successful.length}/${results.length} (${successRate}%)`);
  console.log('');
  
  if (successful.length > 0) {
    const avgSavingsAll = successful.reduce((sum, r) => sum + parseFloat(r.avgSavings), 0) / successful.length;
    console.log(`💰 Średnie oszczędności: ${avgSavingsAll.toFixed(1)}%`);
    console.log('');
    
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.product}: ${r.offersCount} ofert, ${r.avgSavings}% avg savings`);
    });
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY');
  console.log('═'.repeat(100));
  console.log('');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-3-products-optimal-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 3 Products - Optimal Canonical Version',
    date: new Date().toISOString(),
    configuration: {
      qualityFilter: true,
      canonicalFilter: false,
      dealScoreV2: true,
      standardRotation: true
    },
    successRate: `${successRate}%`,
    results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
