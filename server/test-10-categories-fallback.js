"use strict";

/**
 * TEST 10 PRODUKTÓW - RÓŻNE KATEGORIE + FALLBACK
 * PRIMARY: SearchAPI (NL)
 * FALLBACK: SERP API (NL)
 * 
 * KATEGORIE Z OBRAZKA:
 * - Elektronika dom i ogród
 * - Moda
 * - Zdrowie i uroda
 * - Sport i fitness
 * - Auto i akcesoria
 * - Meble i edukacja
 * - Zwierzęta
 * - Narzędzia - DIY
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

// 10 PRODUKTÓW - RÓŻNE KATEGORIE (core aplikacji)
const TEST_PRODUCTS = [
  // 1. ELEKTRONIKA DOM I OGRÓD
  {
    name: 'Philips Hue White Starter Kit',
    ean: '8718696449578',
    basePrice: 89,
    category: 'Elektronika dom i ogród'
  },
  // 2. MODA
  {
    name: 'Nike Air Max 90',
    ean: '0195866137790',
    basePrice: 149,
    category: 'Moda'
  },
  // 3. ZDROWIE I URODA
  {
    name: 'Oral-B iO Series 9',
    ean: '4210201371410',
    basePrice: 299,
    category: 'Zdrowie i uroda'
  },
  // 4. SPORT I FITNESS
  {
    name: 'Garmin Forerunner 255',
    ean: '0753759292904',
    basePrice: 349,
    category: 'Sport i fitness'
  },
  // 5. AUTO I AKCESORIA
  {
    name: 'Bosch Aerotwin Ruitenwissers',
    ean: '3397007297',
    basePrice: 45,
    category: 'Auto i akcesoria'
  },
  // 6. MEBLE I EDUKACJA
  {
    name: 'IKEA MARKUS Bureaustoel',
    ean: '0000000000000', // IKEA nie używa EAN
    basePrice: 199,
    category: 'Meble i edukacja'
  },
  // 7. ZWIERZĘTA
  {
    name: 'Royal Canin Medium Adult 15kg',
    ean: '3182550402163',
    basePrice: 69,
    category: 'Zwierzęta'
  },
  // 8. NARZĘDZIA - DIY
  {
    name: 'Bosch GSR 18V-55',
    ean: '3165140888042',
    basePrice: 179,
    category: 'Narzędzia - DIY'
  },
  // 9. ELEKTRONIKA - KUCHNIA
  {
    name: 'Philips Airfryer XXL',
    ean: '8710103906803',
    basePrice: 249,
    category: 'Elektronika dom i ogród'
  },
  // 10. SPORT - OUTDOOR
  {
    name: 'The North Face Thermoball Jacket',
    ean: '0001888181786',
    basePrice: 229,
    category: 'Sport i fitness'
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
    const usedFallback = sources.some(s => s.includes('serpapi'));
    const primarySource = usedFallback ? 'SERP API (NL) - FALLBACK' : 'SearchAPI (NL) - PRIMARY';
    
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
  console.log('║              TEST 10 KATEGORII - SearchAPI (NL) PRIMARY + SERP API (NL) FALLBACK               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SearchAPI Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🔑 SERP API Key:', process.env.SERPAPI_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('📡 PRIMARY: SearchAPI (NL)');
  console.log('📡 FALLBACK: SERP API (NL) - NAPRAWIONY!');
  console.log('');
  console.log('📦 KATEGORIE:');
  console.log('   1. Elektronika dom i ogród');
  console.log('   2. Moda');
  console.log('   3. Zdrowie i uroda');
  console.log('   4. Sport i fitness');
  console.log('   5. Auto i akcesoria');
  console.log('   6. Meble i edukacja');
  console.log('   7. Zwierzęta');
  console.log('   8. Narzędzia - DIY');
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
  console.log('📊 PODSUMOWANIE - POKRYCIE KATEGORII');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  const usedPrimary = successful.filter(r => !r.usedFallback).length;
  const usedFallback = successful.filter(r => r.usedFallback).length;
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  console.log(`📡 SearchAPI (NL) użyty: ${usedPrimary}/${successful.length} razy`);
  console.log(`📡 SERP API (NL) użyty: ${usedFallback}/${successful.length} razy (fallback)`);
  
  // Pokrycie kategorii
  const categories = {};
  successful.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { success: 0, total: 0 };
    }
    categories[r.category].success++;
  });
  
  TEST_PRODUCTS.forEach(p => {
    if (!categories[p.category]) {
      categories[p.category] = { success: 0, total: 0 };
    }
    categories[p.category].total++;
  });
  
  console.log('\n📦 POKRYCIE KATEGORII:');
  Object.keys(categories).sort().forEach(cat => {
    const data = categories[cat];
    const coverage = ((data.success / data.total) * 100).toFixed(0);
    const status = coverage >= 50 ? '✅' : '❌';
    console.log(`   ${status} ${cat}: ${data.success}/${data.total} (${coverage}%)`);
  });
  
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
    console.log('\n❌ NIEUDANE TESTY (brak pokrycia):');
    failed.forEach(r => {
      console.log(`   ${r.product} (${r.category}): ${r.status} ${r.error || ''}`);
    });
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TEST ZAKOŃCZONY!');
  console.log('═'.repeat(100));
  console.log('\n');
  
  // Zapisz wyniki
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-categories-fallback-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 10 Kategorii - SearchAPI NL PRIMARY + SERP API NL FALLBACK',
    date: new Date().toISOString(),
    primarySource: 'SearchAPI (NL)',
    fallbackSource: 'SERP API (NL)',
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    primaryUsage: `${usedPrimary}/${successful.length}`,
    fallbackUsage: `${usedFallback}/${successful.length}`,
    categoryCoverage: categories,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
