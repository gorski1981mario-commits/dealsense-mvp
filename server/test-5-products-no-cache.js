"use strict";

/**
 * TEST 5 RÓŻNYCH PRODUKTÓW - BEZ CACHE
 * Każdy test to świeże zapytanie do SearchAPI
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

const TEST_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 256GB',
    ean: '0195949038753',
    basePrice: 1329,
    category: 'Smartphones'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    ean: '8806095307220',
    basePrice: 1449,
    category: 'Smartphones'
  },
  {
    name: 'Sony PlayStation 5',
    ean: '0711719560050',
    basePrice: 549,
    category: 'Gaming'
  },
  {
    name: 'Apple AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    category: 'Audio'
  },
  {
    name: 'DeLonghi Magnifica S',
    ean: '8004399329164',
    basePrice: 399,
    category: 'Koffieapparaten'
  }
];

const results = [];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/5: ${product.name} (${product.category})`);
  console.log(`💰 CENA BAZOWA: €${product.basePrice}`);
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
      console.log('❌ Brak ofert');
      results.push({
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        offersFound: 0,
        bestPrice: null,
        savings: null,
        duration,
        status: 'NO_OFFERS'
      });
      return;
    }
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    const shopsCount = new Set(sorted.map(o => o.seller)).size;
    const cheapest = sorted[0];
    const savings = product.basePrice - cheapest.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT z ${shopsCount} SKLEPÓW`);
    console.log(`⏱️  Czas: ${duration}ms`);
    console.log('');
    
    // TOP 5
    console.log('🏆 TOP 5 OFERT:\n');
    sorted.slice(0, 5).forEach((offer, i) => {
      const shop = offer.seller || 'Unknown';
      const price = offer.price;
      const offerSavings = product.basePrice - price;
      const offerPercent = ((offerSavings / product.basePrice) * 100).toFixed(1);
      const dealScore = offer._dealScore?.dealScore || 0;
      const trustScore = offer._dealScore?.trustScore || 0;
      
      const status = offerSavings > 0 ? '✅' : '❌';
      
      console.log(`${i + 1}. ${status} ${shop}`);
      console.log(`   💰 €${price.toFixed(2)} (${offerSavings > 0 ? '-' : '+'}€${Math.abs(offerSavings).toFixed(2)} / ${offerPercent}%)`);
      console.log(`   ⭐ Score: ${dealScore.toFixed(1)}/10 | 🛡️  Trust: ${trustScore}/100`);
      console.log('');
    });
    
    console.log('─'.repeat(100));
    console.log('📊 NAJLEPSZA OFERTA:');
    console.log(`   🏪 ${cheapest.seller}`);
    console.log(`   💰 €${cheapest.price.toFixed(2)}`);
    console.log(`   💸 OSZCZĘDNOŚĆ: €${savings.toFixed(2)} (${savingsPercent}%)`);
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
      duration: Date.now() - startTime,
      status: 'ERROR',
      error: error.message
    });
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST 5 PRODUKTÓW - BEZ CACHE (ŚWIEŻE ZAPYTANIA)                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 API Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true (każdy test = nowe zapytanie do SearchAPI)');
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
  console.log('📊 PODSUMOWANIE I WNIOSKI');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  
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
    sorted.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)}) - ${r.bestShop}`);
    });
    
    console.log('\n🏪 NAJCZĘSTSZE SKLEPY:');
    const shopCounts = {};
    successful.forEach(r => {
      shopCounts[r.bestShop] = (shopCounts[r.bestShop] || 0) + 1;
    });
    Object.entries(shopCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([shop, count]) => {
        console.log(`   ${shop}: ${count}x najlepsza oferta`);
      });
    
    console.log('\n💡 WNIOSKI:');
    console.log(`   ✅ SearchAPI działa poprawnie (${successful.length}/${TEST_PRODUCTS.length} testów udanych)`);
    console.log(`   ✅ Średnio ${avgOffers.toFixed(0)} ofert z ${avgShops.toFixed(0)} sklepów na produkt`);
    console.log(`   ✅ Średnie oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   ✅ Średni czas odpowiedzi: ${avgDuration.toFixed(0)}ms (~${(avgDuration/1000).toFixed(1)}s)`);
    console.log(`   ✅ Deal Score V2 działa (średnia: ${avgDealScore.toFixed(1)}/10)`);
    console.log(`   ✅ Trust Engine działa (średnia: ${avgTrustScore.toFixed(0)}/100)`);
    
    if (avgDuration > 2000) {
      console.log(`   ⚠️  Czas odpowiedzi > 2s - rozważ optymalizację`);
    }
    if (avgSavings < 10) {
      console.log(`   ⚠️  Niskie oszczędności - sprawdź ceny bazowe`);
    }
  }
  
  if (failed.length > 0) {
    console.log('\n❌ NIEUDANE TESTY:');
    failed.forEach(r => {
      console.log(`   ${r.product}: ${r.status} ${r.error || ''}`);
    });
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TESTY ZAKOŃCZONE!');
  console.log('═'.repeat(100));
  console.log('\n');
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
