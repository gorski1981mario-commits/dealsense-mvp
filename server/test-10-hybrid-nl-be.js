"use strict";

/**
 * TEST 10 PRODUKTÓW - HYBRID STRATEGY
 * PRIMARY: SERP API (NL/Holandia)
 * FALLBACK: SearchAPI (BE/Belgia)
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

// 10 PRODUKTÓW - mix z poprzednich testów
const TEST_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 128GB',
    ean: '0195949112683',
    basePrice: 1329,
    category: 'Smartphones'
  },
  {
    name: 'MacBook Pro 14 M3',
    ean: '0195949112683',
    basePrice: 2199,
    category: 'Laptops'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    ean: '8806095093086',
    basePrice: 1449,
    category: 'Smartphones'
  },
  {
    name: 'AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    category: 'Audio'
  },
  {
    name: 'PlayStation 5',
    ean: '0711719560050',
    basePrice: 549,
    category: 'Gaming'
  },
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    category: 'Home Appliances'
  },
  {
    name: 'Apple Watch Series 9',
    ean: '0195949650444',
    basePrice: 449,
    category: 'Smartwatches'
  },
  {
    name: 'Bose QuietComfort Ultra',
    ean: '0017817841115',
    basePrice: 449,
    category: 'Headphones'
  },
  {
    name: 'Nintendo Switch OLED',
    ean: '0045496882747',
    basePrice: 349,
    category: 'Gaming'
  },
  {
    name: 'GoPro Hero 12 Black',
    ean: '0818279036220',
    basePrice: 449,
    category: 'Cameras'
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
      location: 'nl'
    });
    
    const duration = Date.now() - startTime;
    
    if (!offers || offers.length === 0) {
      console.log('❌ Brak ofert (nawet z fallback)');
      results.push({
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        offersFound: 0,
        source: 'none',
        usedFallback: false,
        duration,
        status: 'NO_OFFERS'
      });
      return;
    }
    
    // Sprawdź źródło
    const sources = [...new Set(offers.map(o => o._source))];
    const usedFallback = sources.some(s => s.includes('searchapi_be') || s.includes('google_searchapi_be'));
    const primarySource = usedFallback ? 'SearchAPI (BE) - FALLBACK' : 'SERP API (NL) - PRIMARY';
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    const shopsCount = new Set(sorted.map(o => o.seller)).size;
    const cheapest = sorted[0];
    const savings = product.basePrice - cheapest.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT z ${shopsCount} SKLEPÓW`);
    console.log(`📡 ŹRÓDŁO: ${primarySource}`);
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
      const trustScore = offer._dealScore?.trustScore || 0;
      const source = offer._source || 'unknown';
      
      const status = offerSavings > 0 ? '✅' : '❌';
      
      console.log(`${i + 1}. ${status} ${shop} [${source}]`);
      console.log(`   💰 €${price.toFixed(2)} (${offerSavings > 0 ? '-' : '+'}€${Math.abs(offerSavings).toFixed(2)} / ${offerPercent}%)`);
      console.log(`   ⭐ Score: ${dealScore.toFixed(1)}/10 | 🛡️  Trust: ${trustScore}/100`);
      console.log('');
    });
    
    console.log('─'.repeat(100));
    console.log('📊 NAJLEPSZA OFERTA:');
    console.log(`   🏪 ${cheapest.seller}`);
    console.log(`   💰 €${cheapest.price.toFixed(2)}`);
    console.log(`   💸 OSZCZĘDNOŚĆ: €${savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`   📡 ŹRÓDŁO: ${primarySource}`);
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
      avgDealScore: sorted.reduce((sum, o) => sum + (o._dealScore?.dealScore || 0), 0) / sorted.length,
      avgTrustScore: sorted.reduce((sum, o) => sum + (o._dealScore?.trustScore || 0), 0) / sorted.length,
      source: primarySource,
      usedFallback,
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
      usedFallback: false,
      duration: Date.now() - startTime,
      status: 'ERROR',
      error: error.message
    });
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST 10 PRODUKTÓW - HYBRID STRATEGY                                          ║');
  console.log('║                    PRIMARY: SERP API (NL) → FALLBACK: SearchAPI (BE)                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SERP API Key:', process.env.SERPAPI_API_KEY?.substring(0, 10) + '...');
  console.log('🔑 SearchAPI Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('📡 PRIMARY: SERP API (NL/Holandia)');
  console.log('📡 FALLBACK: SearchAPI (BE/Belgia)');
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
  console.log('📊 PODSUMOWANIE - HYBRID STRATEGY (NL PRIMARY + BE FALLBACK)');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  const usedPrimary = successful.filter(r => !r.usedFallback).length;
  const usedFallback = successful.filter(r => r.usedFallback).length;
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  console.log(`📡 SERP API (NL) użyty: ${usedPrimary}/${successful.length} razy`);
  console.log(`📡 SearchAPI (BE) użyty: ${usedFallback}/${successful.length} razy (fallback)`);
  
  if (successful.length > 0) {
    const avgOffers = successful.reduce((sum, r) => sum + r.offersFound, 0) / successful.length;
    const avgShops = successful.reduce((sum, r) => sum + r.shopsCount, 0) / successful.length;
    const avgSavings = successful.reduce((sum, r) => sum + r.savingsPercent, 0) / successful.length;
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const avgDealScore = successful.reduce((sum, r) => sum + r.avgDealScore, 0) / successful.length;
    const avgTrustScore = successful.reduce((sum, r) => sum + r.avgTrustScore, 0) / successful.length;
    
    console.log('\n📈 ŚREDNIE WARTOŚCI:');
    console.log(`   Ofert na produkt: ${avgOffers.toFixed(1)}`);
    console.log(`   Sklepów na produkt: ${avgShops.toFixed(1)}`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   Czas wyszukiwania: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Deal Score: ${avgDealScore.toFixed(1)}/10`);
    console.log(`   Trust Score: ${avgTrustScore.toFixed(0)}/100`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.slice(0, 5).forEach((r, i) => {
      const fallbackTag = r.usedFallback ? ' [FALLBACK]' : ' [PRIMARY]';
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)}) - ${r.bestShop}${fallbackTag}`);
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
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-hybrid-nl-be-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 10 - HYBRID STRATEGY (NL PRIMARY + BE FALLBACK)',
    date: new Date().toISOString(),
    primarySource: 'SERP API (NL)',
    fallbackSource: 'SearchAPI (BE)',
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    primaryUsage: `${usedPrimary}/${successful.length}`,
    fallbackUsage: `${usedFallback}/${successful.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
