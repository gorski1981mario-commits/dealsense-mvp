"use strict";

/**
 * TEST 10 PRODUKTÓW - SERP API FALLBACK
 * Testujemy premium produkty które nie były dostępne w SearchAPI BE
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

// PREMIUM PRODUKTY które nie były dostępne w BE
const TEST_PRODUCTS = [
  {
    name: 'MacBook Pro 14 M3',
    ean: '0195949112683',
    basePrice: 2199,
    category: 'Laptops'
  },
  {
    name: 'iPad Air 11 M2 128GB',
    ean: '0195949650123',
    basePrice: 699,
    category: 'Tablets'
  },
  {
    name: 'Bose QuietComfort Ultra',
    ean: '0017817841115',
    basePrice: 449,
    category: 'Headphones'
  },
  {
    name: 'GoPro Hero 12 Black',
    ean: '0818279036220',
    basePrice: 449,
    category: 'Cameras'
  },
  {
    name: 'Nespresso Vertuo Next',
    ean: '7630054458354',
    basePrice: 149,
    category: 'Coffee Machines'
  },
  {
    name: 'Sonos Beam Gen 2',
    ean: '8717755779410',
    basePrice: 499,
    category: 'Soundbars'
  },
  {
    name: 'Apple AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    category: 'Audio'
  },
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    category: 'Home Appliances'
  },
  {
    name: 'DeLonghi Magnifica S',
    ean: '8004399329164',
    basePrice: 399,
    category: 'Coffee Machines'
  },
  {
    name: 'Garmin Fenix 7',
    ean: '0753759282844',
    basePrice: 699,
    category: 'Smartwatches'
  }
];

const results = [];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/10: ${product.name}`);
  console.log(`📦 Kategoria: ${product.category}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log(`🔍 EAN: ${product.ean}`);
  console.log('═'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'be'
    });
    
    const duration = Date.now() - startTime;
    
    if (!offers || offers.length === 0) {
      console.log('❌ Brak ofert (nawet z SERP fallback)');
      results.push({
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        offersFound: 0,
        source: 'none',
        duration,
        status: 'NO_OFFERS'
      });
      return;
    }
    
    // Sprawdź źródło
    const sources = [...new Set(offers.map(o => o._source))];
    const usedSerpFallback = sources.includes('serpapi');
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    const shopsCount = new Set(sorted.map(o => o.seller)).size;
    const cheapest = sorted[0];
    const savings = product.basePrice - cheapest.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT z ${shopsCount} SKLEPÓW`);
    console.log(`📡 ŹRÓDŁO: ${sources.join(', ')} ${usedSerpFallback ? '(SERP FALLBACK!)' : ''}`);
    console.log(`⏱️  Czas: ${duration}ms`);
    console.log('');
    
    // TOP 3
    console.log('🏆 TOP 3 OFERT:\n');
    sorted.slice(0, 3).forEach((offer, i) => {
      const shop = offer.seller || 'Unknown';
      const price = offer.price;
      const offerSavings = product.basePrice - price;
      const offerPercent = ((offerSavings / product.basePrice) * 100).toFixed(1);
      const dealScore = offer._dealScore?.dealScore || 0;
      const source = offer._source || 'unknown';
      
      const status = offerSavings > 0 ? '✅' : '❌';
      
      console.log(`${i + 1}. ${status} ${shop} [${source}]`);
      console.log(`   💰 €${price.toFixed(2)} (${offerSavings > 0 ? '-' : '+'}€${Math.abs(offerSavings).toFixed(2)} / ${offerPercent}%)`);
      console.log(`   ⭐ Score: ${dealScore.toFixed(1)}/10`);
      console.log('');
    });
    
    console.log('─'.repeat(100));
    console.log('📊 NAJLEPSZA OFERTA:');
    console.log(`   🏪 ${cheapest.seller}`);
    console.log(`   💰 €${cheapest.price.toFixed(2)}`);
    console.log(`   💸 OSZCZĘDNOŚĆ: €${savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`   📡 ŹRÓDŁO: ${cheapest._source || 'unknown'}`);
    console.log('─'.repeat(100));
    
    results.push({
      product: product.name,
      category: product.category,
      basePrice: product.basePrice,
      offersFound: sorted.length,
      shopsCount,
      bestShop: cheapest.seller,
      bestPrice: cheapest.price,
      savings,
      savingsPercent: parseFloat(savingsPercent),
      source: usedSerpFallback ? 'serpapi' : 'searchapi',
      duration,
      status: 'SUCCESS'
    });
    
  } catch (error) {
    console.error(`❌ Błąd: ${error.message}`);
    results.push({
      product: product.name,
      category: product.category,
      basePrice: product.basePrice,
      offersFound: 0,
      source: 'error',
      duration: Date.now() - startTime,
      status: 'ERROR',
      error: error.message
    });
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST 10 PRODUKTÓW - SERP API FALLBACK                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SearchAPI Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🔑 SERP API Key:', process.env.SERPAPI_API_KEY === 'your_serpapi_key_here' ? 'PLACEHOLDER (nie zadziała)' : (process.env.SERPAPI_API_KEY?.substring(0, 10) + '...'));
  console.log('🚫 CACHE BYPASS: true');
  console.log('🌍 PRIMARY: Belgium (BE)');
  console.log('📡 FALLBACK: SERP API (NL)');
  console.log('');
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    await testProduct(TEST_PRODUCTS[i], i);
    
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 3 sekundy przed następnym testem...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // WNIOSKI
  console.log('\n' + '═'.repeat(100));
  console.log('📊 PODSUMOWANIE - SERP API FALLBACK TEST');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  const serpUsed = successful.filter(r => r.source === 'serpapi').length;
  const searchApiUsed = successful.filter(r => r.source === 'searchapi').length;
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  console.log(`📡 SERP API użyty: ${serpUsed}/${successful.length} razy`);
  console.log(`📡 SearchAPI użyty: ${searchApiUsed}/${successful.length} razy`);
  
  if (successful.length > 0) {
    const avgSavings = successful.reduce((sum, r) => sum + r.savingsPercent, 0) / successful.length;
    
    console.log('\n📈 ŚREDNIE WARTOŚCI:');
    console.log(`   Ofert na produkt: ${(successful.reduce((sum, r) => sum + r.offersFound, 0) / successful.length).toFixed(1)}`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)}) - ${r.bestShop} [${r.source}]`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ NIEUDANE TESTY:');
    failed.forEach(r => {
      console.log(`   ${r.product}: ${r.status} ${r.error || ''}`);
    });
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY!');
  console.log('═'.repeat(100));
  console.log('\n');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-serp-fallback-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test SERP API Fallback',
    date: new Date().toISOString(),
    serpApiEnabled: process.env.SERPAPI_API_KEY !== 'your_serpapi_key_here',
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    serpUsageRate: `${serpUsed}/${successful.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
