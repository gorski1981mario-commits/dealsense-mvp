"use strict";

/**
 * DEBUG TEST - PEŁNY RAPORT FILTRÓW
 * 
 * Pokazuje DOKŁADNIE gdzie każdy filtr wycina oferty
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

process.env.MARKET_CACHE_BYPASS = 'true';
process.env.MARKET_LOG_SILENT = 'false'; // WŁĄCZ WSZYSTKIE LOGI!

const { fetchMarketOffers } = require('./market-api');

const TEST_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 128GB',
    ean: '0195949042669',
    basePrice: 1329,
    category: 'Smartphone (high-end)'
  },
  {
    name: 'AirPods Pro 2nd Generation',
    ean: '0194253398721',
    basePrice: 279,
    category: 'Audio (popular)'
  },
  {
    name: 'iPad 10th Generation 64GB',
    ean: '0194253081470',
    basePrice: 429,
    category: 'Tablet (variants)'
  }
];

const USER_ID = 'test_debug_user';

async function testProductDebug(product, index) {
  console.log('\n' + '═'.repeat(120));
  console.log(`🔍 DEBUG PRODUKT ${index + 1}/3: ${product.name}`);
  console.log(`📦 Kategoria: ${product.category}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log('═'.repeat(120));
  console.log('');
  
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
    
    console.log('\n' + '─'.repeat(120));
    console.log('📊 WYNIK KOŃCOWY:');
    console.log('─'.repeat(120));
    
    if (!offers || offers.length === 0) {
      console.log(`❌ BRAK OFERT po wszystkich filtrach (${duration}ms)`);
      console.log('');
      return {
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        status: 'NO_OFFERS',
        duration,
        finalOffers: 0
      };
    }
    
    console.log(`✅ ${offers.length} OFERT FINALNYCH (${duration}ms)`);
    console.log('');
    
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
    
    return {
      product: product.name,
      category: product.category,
      basePrice: product.basePrice,
      status: 'SUCCESS',
      offersCount: offers.length,
      duration,
      topOffers: results
    };
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}\n`);
    console.error(error.stack);
    return {
      product: product.name,
      category: product.category,
      basePrice: product.basePrice,
      status: 'ERROR',
      error: error.message
    };
  }
}

async function runDebugTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                  🔍 DEBUG TEST - PEŁNY RAPORT FILTRÓW                                          ║');
  console.log('║                                  Pokazuje DOKŁADNIE gdzie wycina                                               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const result = await testProductDebug(TEST_PRODUCTS[i], i);
    results.push(result);
    
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('⏳ Pauza 3 sekundy...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // PODSUMOWANIE
  console.log('\n' + '═'.repeat(120));
  console.log('📊 PODSUMOWANIE DEBUG');
  console.log('═'.repeat(120));
  console.log('');
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const successRate = ((successful.length / results.length) * 100).toFixed(0);
  
  console.log(`✅ Success Rate: ${successful.length}/${results.length} (${successRate}%)`);
  console.log('');
  
  console.log('PER PRODUKT:');
  results.forEach((r, i) => {
    const icon = r.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${icon} ${i + 1}. ${r.product}: ${r.status} ${r.offersCount ? `(${r.offersCount} ofert)` : ''}`);
  });
  
  console.log('');
  console.log('═'.repeat(120));
  console.log('✅ DEBUG TEST ZAKOŃCZONY');
  console.log('═'.repeat(120));
  console.log('');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'debug-filters-report.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Debug Filters Report - Full Analysis',
    date: new Date().toISOString(),
    successRate: `${successRate}%`,
    results
  }, null, 2));
  
  console.log(`📁 Raport zapisany: ${resultsPath}\n`);
}

runDebugTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
