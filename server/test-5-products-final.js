"use strict";

/**
 * TEST 5 NOWYCH PRODUKTÓW - RECOMMENDED CONFIG
 * 
 * Różne kategorie:
 * 1. Laptop (wysokocenny)
 * 2. Smartwatch (średniocenny)
 * 3. Kamera (niszowy)
 * 4. Słuchawki (popularny)
 * 5. Tablet (warianty)
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
    name: 'MacBook Air M2 13 inch',
    ean: '194253081470',
    basePrice: 1249,
    category: 'Laptop (wysokocenny)'
  },
  {
    name: 'Apple Watch Series 9 41mm',
    ean: '0195949042669',
    basePrice: 449,
    category: 'Smartwatch (średniocenny)'
  },
  {
    name: 'GoPro Hero 12 Black',
    ean: '0818279036046',
    basePrice: 449,
    category: 'Kamera (niszowy)'
  },
  {
    name: 'AirPods Pro 2nd Generation',
    ean: '0194253398721',
    basePrice: 279,
    category: 'Słuchawki (popularny)'
  },
  {
    name: 'iPad 10th Generation 64GB',
    ean: '0194253081470',
    basePrice: 429,
    category: 'Tablet (warianty)'
  }
];

const USER_ID = 'test_user_final';

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`PRODUKT ${index + 1}/5: ${product.name}`);
  console.log(`📦 Kategoria: ${product.category}`);
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
        category: product.category,
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
      category: product.category,
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
      category: product.category,
      basePrice: product.basePrice,
      status: 'ERROR',
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST 5 NOWYCH PRODUKTÓW - RECOMMENDED CONFIG                                     ║');
  console.log('║              Weryfikacja: Czy config działa uniwersalnie?                                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 KONFIGURACJA:');
  console.log('   ✅ Price Range: 40%-150% (węższy)');
  console.log('   ✅ Banned Keywords: ON (case, cover, band, filter, etc.)');
  console.log('   ✅ Quality Filter: ON');
  console.log('   ❌ Canonical Filter: OFF');
  console.log('   ✅ DealScore V2: ON (trust 25)');
  console.log('   ✅ STANDARD Rotation: ON');
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
    const avgOffersAll = successful.reduce((sum, r) => sum + r.offersCount, 0) / successful.length;
    
    console.log(`💰 Średnie oszczędności: ${avgSavingsAll.toFixed(1)}%`);
    console.log(`📦 Średnia liczba ofert: ${avgOffersAll.toFixed(1)}`);
    console.log('');
    
    console.log('PER KATEGORIA:');
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.product}`);
      console.log(`   ${r.category}: ${r.offersCount} ofert, ${r.avgSavings}% avg savings`);
    });
  }
  
  console.log('');
  
  if (results.some(r => r.status === 'NO_OFFERS' || r.status === 'ERROR')) {
    console.log('❌ PROBLEMY:');
    results.filter(r => r.status !== 'SUCCESS').forEach(r => {
      console.log(`   - ${r.product}: ${r.status}`);
    });
    console.log('');
  }
  
  console.log('═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY');
  console.log('═'.repeat(100));
  console.log('');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-5-products-final-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 5 Products - RECOMMENDED CONFIG Final Verification',
    date: new Date().toISOString(),
    configuration: {
      priceRange: '40%-150%',
      bannedKeywords: true,
      qualityFilter: true,
      canonicalFilter: false,
      dealScoreV2: true,
      trustThreshold: 25,
      standardRotation: true
    },
    successRate: `${successRate}%`,
    avgSavings: successful.length > 0 ? `${(successful.reduce((sum, r) => sum + parseFloat(r.avgSavings), 0) / successful.length).toFixed(1)}%` : 'N/A',
    results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
