"use strict";

/**
 * TEST 10 PRODUKTÓW - Z CATEGORY SEARCH PROFILES
 * PRIMARY: SearchAPI (NL)
 * FALLBACK: SERP API (NL)
 * 
 * NOWE: Każda kategoria ma własny profil wyszukiwania!
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
const { detectCategoryWithConfidence } = require('./lib/categoryDetector');
const { getCategoryProfile } = require('./lib/categorySearchProfiles');

// 10 PRODUKTÓW - RÓŻNE KATEGORIE
const TEST_PRODUCTS = [
  // 1. ELEKTRONIKA
  {
    name: 'iPhone 15 Pro 128GB',
    ean: '0195949112683',
    basePrice: 1329,
    expectedCategory: 'electronics'
  },
  // 2. MODA
  {
    name: 'Nike Air Max 90 men black size 42',
    ean: '0195866137790',
    basePrice: 149,
    expectedCategory: 'fashion'
  },
  // 3. DOM I OGRÓD
  {
    name: 'Philips Airfryer XXL',
    ean: '8710103906803',
    basePrice: 249,
    expectedCategory: 'home_garden'
  },
  // 4. ZDROWIE I FITNESS
  {
    name: 'Oral-B iO Series 9',
    ean: '4210201371410',
    basePrice: 299,
    expectedCategory: 'health_fitness'
  },
  // 5. AUTO I AKCESORIA
  {
    name: 'Bosch Aerotwin Ruitenwissers',
    ean: '3397007297',
    basePrice: 45,
    expectedCategory: 'automotive'
  },
  // 6. ZABAWKI I EDUKACJA
  {
    name: 'LEGO Technic 8+ set',
    ean: '5702017153940',
    basePrice: 89,
    expectedCategory: 'toys_education'
  },
  // 7. NARZĘDZIA DIY
  {
    name: 'Bosch GSR 18V-55 brushless',
    ean: '3165140888042',
    basePrice: 179,
    expectedCategory: 'tools_diy'
  },
  // 8. ELEKTRONIKA - AUDIO
  {
    name: 'AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    expectedCategory: 'electronics'
  },
  // 9. MODA - OUTDOOR
  {
    name: 'The North Face Thermoball Jacket',
    ean: '0001888181786',
    basePrice: 229,
    expectedCategory: 'fashion'
  },
  // 10. DOM - CLEANING
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    expectedCategory: 'home_garden'
  }
];

const results = [];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/10: ${product.name}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log(`🔍 EAN: ${product.ean}`);
  
  // Category detection
  const detection = detectCategoryWithConfidence(product.name, product.ean);
  const profile = getCategoryProfile(detection.category);
  
  console.log(`📦 Kategoria: ${profile.name} (confidence: ${detection.confidence}%)`);
  console.log(`⚙️  Strategia: ${profile.priority} | Strictness: ${profile.strictness}`);
  console.log(`📊 Oczekiwane oszczędności: ${profile.expectedSavings.min}-${profile.expectedSavings.max}%`);
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
        expectedCategory: product.expectedCategory,
        detectedCategory: detection.category,
        categoryMatch: product.expectedCategory === detection.category,
        confidence: detection.confidence,
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
    
    // Sprawdź czy oszczędności są w zakresie
    const inRange = parseFloat(savingsPercent) >= profile.expectedSavings.min && 
                    parseFloat(savingsPercent) <= profile.expectedSavings.max;
    console.log(`   📈 W ZAKRESIE: ${inRange ? '✅' : '⚠️'} (oczekiwano: ${profile.expectedSavings.min}-${profile.expectedSavings.max}%)`);
    console.log('─'.repeat(100));
    
    results.push({
      product: product.name,
      expectedCategory: product.expectedCategory,
      detectedCategory: detection.category,
      categoryMatch: product.expectedCategory === detection.category,
      confidence: detection.confidence,
      basePrice: product.basePrice,
      offersFound: sorted.length,
      shopsCount,
      bestShop: cheapest.seller,
      bestPrice: cheapest.price,
      savings,
      savingsPercent: parseFloat(savingsPercent),
      inExpectedRange: inRange,
      expectedRange: `${profile.expectedSavings.min}-${profile.expectedSavings.max}%`,
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
      expectedCategory: product.expectedCategory,
      detectedCategory: detection.category,
      categoryMatch: product.expectedCategory === detection.category,
      confidence: detection.confidence,
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
  console.log('║              TEST 10 PRODUKTÓW - Z CATEGORY SEARCH PROFILES                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SearchAPI Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🔑 SERP API Key:', process.env.SERPAPI_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('📡 PRIMARY: SearchAPI (NL)');
  console.log('📡 FALLBACK: SERP API (NL)');
  console.log('🎯 NOWE: Category Search Profiles (7 kategorii)');
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
  console.log('📊 PODSUMOWANIE - CATEGORY SEARCH PROFILES');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  const categoryMatches = results.filter(r => r.categoryMatch).length;
  const inRange = successful.filter(r => r.inExpectedRange).length;
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  console.log(`🎯 Category detection accuracy: ${categoryMatches}/${TEST_PRODUCTS.length} (${((categoryMatches/TEST_PRODUCTS.length)*100).toFixed(0)}%)`);
  console.log(`📈 Oszczędności w zakresie: ${inRange}/${successful.length} (${successful.length > 0 ? ((inRange/successful.length)*100).toFixed(0) : 0}%)`);
  
  if (successful.length > 0) {
    const avgOffers = successful.reduce((sum, r) => sum + r.offersFound, 0) / successful.length;
    const avgShops = successful.reduce((sum, r) => sum + r.shopsCount, 0) / successful.length;
    const avgSavings = successful.reduce((sum, r) => sum + r.savingsPercent, 0) / successful.length;
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    console.log('\n📈 ŚREDNIE WARTOŚCI:');
    console.log(`   Ofert na produkt: ${avgOffers.toFixed(1)}`);
    console.log(`   Sklepów na produkt: ${avgShops.toFixed(1)}`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   Czas wyszukiwania: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Category confidence: ${avgConfidence.toFixed(0)}%`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.slice(0, 5).forEach((r, i) => {
      const rangeTag = r.inExpectedRange ? ' ✅' : ' ⚠️';
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)})${rangeTag}`);
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
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-categories-with-profiles-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 10 - Category Search Profiles',
    date: new Date().toISOString(),
    primarySource: 'SearchAPI (NL)',
    fallbackSource: 'SERP API (NL)',
    categoryProfilesEnabled: true,
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    categoryAccuracy: `${categoryMatches}/${TEST_PRODUCTS.length}`,
    savingsInRange: `${inRange}/${successful.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
