"use strict";

/**
 * TEST 5 PRODUKTÓW - CANONICAL PRODUCT ENGINE
 * 
 * Oszczędność kredytów - tylko 5 testów zamiast 10
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
const { createCanonicalProduct } = require('./lib/canonicalProductEngine');

// 5 NOWYCH PRODUKTÓW - RÓŻNE KATEGORIE (inne niż do tej pory)
const TEST_PRODUCTS = [
  {
    name: 'Sony WH-1000XM5',
    ean: '4548736134980',
    basePrice: 399,
    category: 'electronics'
  },
  {
    name: 'Garmin Forerunner 255',
    ean: '0753759292904',
    basePrice: 349,
    category: 'health_fitness'
  },
  {
    name: 'DeWalt DCD796',
    ean: '5035048661246',
    basePrice: 199,
    category: 'tools_diy'
  },
  {
    name: 'Dyson V12 Detect Slim',
    ean: '5025155071953',
    basePrice: 599,
    category: 'home_garden'
  },
  {
    name: 'LEGO Technic Porsche 911',
    ean: '5702017153940',
    basePrice: 169,
    category: 'toys_education'
  }
];

const results = [];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/5: ${product.name}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log(`🔍 EAN: ${product.ean}`);
  
  // Utwórz canonical product
  const canonical = createCanonicalProduct(product.name, product.ean, product.category);
  
  console.log(`📦 CANONICAL PRODUCT:`);
  console.log(`   ID: ${canonical.canonicalId}`);
  console.log(`   Brand: ${canonical.brand || 'N/A'}`);
  console.log(`   Model: ${canonical.model || 'N/A'}`);
  console.log(`   Variant: ${canonical.variant || 'N/A'}`);
  console.log(`   Color: ${canonical.color || 'N/A'}`);
  console.log('═'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'nl'
    });
    
    const duration = Date.now() - startTime;
    
    if (!offers || offers.length === 0) {
      console.log('❌ Brak ofert (po Canonical + Deal Truth filter)');
      results.push({
        product: product.name,
        canonical: canonical,
        basePrice: product.basePrice,
        offersFound: 0,
        realDeals: 0,
        fakeDeals: 0,
        duration,
        status: 'NO_OFFERS'
      });
      return;
    }
    
    // Sprawdź canonical metadata
    const tier1 = offers.filter(o => o._canonical?.matchTier === 1).length;
    const tier2 = offers.filter(o => o._canonical?.matchTier === 2).length;
    const tier3 = offers.filter(o => o._canonical?.matchTier === 3).length;
    
    // Sprawdź deal truth metadata
    const realDeals = offers.filter(o => o._dealTruth?.isReal === true).length;
    const fakeDeals = offers.filter(o => o._dealTruth?.isReal === false).length;
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    const shopsCount = new Set(sorted.map(o => o.seller)).size;
    const cheapest = sorted[0];
    const savings = product.basePrice - cheapest.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} REAL DEALS z ${shopsCount} SKLEPÓW`);
    console.log(`📊 CANONICAL MATCH: Tier 1: ${tier1}, Tier 2: ${tier2}, Tier 3: ${tier3}`);
    console.log(`🎯 DEAL TRUTH: Real: ${realDeals}, Fake: ${fakeDeals}`);
    console.log(`⏱️  Czas: ${duration}ms`);
    console.log('');
    
    // TOP 3
    console.log('🏆 TOP 3 REAL DEALS:\n');
    sorted.slice(0, 3).forEach((offer, i) => {
      const shop = offer.seller || 'Unknown';
      const price = offer.price;
      const offerSavings = product.basePrice - price;
      const offerPercent = ((offerSavings / product.basePrice) * 100).toFixed(1);
      const matchTier = offer._canonical?.matchTier || 'N/A';
      const matchScore = offer._canonical?.matchScore || 0;
      const dealTruth = offer._dealTruth?.isReal ? '✅ REAL' : '❌ FAKE';
      
      const status = offerSavings > 0 ? '✅' : '❌';
      
      console.log(`${i + 1}. ${status} ${shop}`);
      console.log(`   💰 €${price.toFixed(2)} (${offerSavings > 0 ? '-' : '+'}€${Math.abs(offerSavings).toFixed(2)} / ${offerPercent}%)`);
      console.log(`   📊 Match: Tier ${matchTier} (${matchScore}%) | ${dealTruth}`);
      console.log('');
    });
    
    console.log('─'.repeat(100));
    console.log('📊 NAJLEPSZA OFERTA:');
    console.log(`   🏪 ${cheapest.seller}`);
    console.log(`   💰 €${cheapest.price.toFixed(2)}`);
    console.log(`   💸 OSZCZĘDNOŚĆ: €${savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`   📊 Match Tier: ${cheapest._canonical?.matchTier || 'N/A'} (${cheapest._canonical?.matchScore || 0}%)`);
    console.log(`   🎯 Deal Truth: ${cheapest._dealTruth?.isReal ? '✅ REAL DEAL' : '❌ FAKE DEAL'}`);
    console.log('─'.repeat(100));
    
    results.push({
      product: product.name,
      canonical: canonical,
      basePrice: product.basePrice,
      offersFound: sorted.length,
      shopsCount,
      tier1Count: tier1,
      tier2Count: tier2,
      tier3Count: tier3,
      realDealsCount: realDeals,
      fakeDealsCount: fakeDeals,
      bestShop: cheapest.seller,
      bestPrice: cheapest.price,
      savings,
      savingsPercent: parseFloat(savingsPercent),
      bestMatchTier: cheapest._canonical?.matchTier,
      bestMatchScore: cheapest._canonical?.matchScore,
      bestDealTruth: cheapest._dealTruth?.isReal,
      duration,
      status: 'SUCCESS'
    });
    
  } catch (error) {
    console.error(`❌ Błąd: ${error.message}`);
    results.push({
      product: product.name,
      canonical: canonical,
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
  console.log('║              TEST 5 PRODUKTÓW - CANONICAL PRODUCT ENGINE (OSZCZĘDNOŚĆ KREDYTÓW)                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SearchAPI Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🔑 SERP API Key:', process.env.SERPAPI_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('🎯 CANONICAL ENGINE: ENABLED');
  console.log('🎯 PRODUCT-TO-BRAND MAPPING: ENABLED');
  console.log('🎯 MATCH TIERS: 1-3 (100%, 95%, 85%)');
  console.log('🎯 DEAL TRUTH: ENABLED (poluzowany)');
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
  console.log('📊 PODSUMOWANIE - CANONICAL PRODUCT ENGINE');
  console.log('═'.repeat(100));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  
  console.log(`\n✅ Udane testy: ${successful.length}/${TEST_PRODUCTS.length}`);
  console.log(`❌ Nieudane testy: ${failed.length}/${TEST_PRODUCTS.length}`);
  
  if (successful.length > 0) {
    const avgOffers = successful.reduce((sum, r) => sum + r.offersFound, 0) / successful.length;
    const avgTier1 = successful.reduce((sum, r) => sum + (r.tier1Count || 0), 0) / successful.length;
    const avgTier2 = successful.reduce((sum, r) => sum + (r.tier2Count || 0), 0) / successful.length;
    const avgTier3 = successful.reduce((sum, r) => sum + (r.tier3Count || 0), 0) / successful.length;
    const avgRealDeals = successful.reduce((sum, r) => sum + (r.realDealsCount || 0), 0) / successful.length;
    const avgFakeDeals = successful.reduce((sum, r) => sum + (r.fakeDealsCount || 0), 0) / successful.length;
    const avgSavings = successful.reduce((sum, r) => sum + r.savingsPercent, 0) / successful.length;
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    
    console.log('\n📈 ŚREDNIE WARTOŚCI:');
    console.log(`   Ofert na produkt: ${avgOffers.toFixed(1)}`);
    console.log(`   Tier 1 (EAN match): ${avgTier1.toFixed(1)}`);
    console.log(`   Tier 2 (Exact spec): ${avgTier2.toFixed(1)}`);
    console.log(`   Tier 3 (Fuzzy match): ${avgTier3.toFixed(1)}`);
    console.log(`   Real deals: ${avgRealDeals.toFixed(1)}`);
    console.log(`   Fake deals: ${avgFakeDeals.toFixed(1)}`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   Czas wyszukiwania: ${avgDuration.toFixed(0)}ms`);
    
    // Accuracy
    const totalDeals = successful.reduce((sum, r) => sum + (r.realDealsCount || 0) + (r.fakeDealsCount || 0), 0);
    const totalRealDeals = successful.reduce((sum, r) => sum + (r.realDealsCount || 0), 0);
    const accuracy = totalDeals > 0 ? ((totalRealDeals / totalDeals) * 100).toFixed(1) : 0;
    
    console.log(`\n🎯 ACCURACY: ${accuracy}% (${totalRealDeals}/${totalDeals} real deals)`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.forEach((r, i) => {
      const tierTag = r.bestMatchTier ? ` [Tier ${r.bestMatchTier}]` : '';
      const truthTag = r.bestDealTruth ? ' ✅' : ' ❌';
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)})${tierTag}${truthTag}`);
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
  const resultsPath = path.join(__dirname, 'test-results', 'test-5-canonical-engine-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 5 - Canonical Product Engine (Oszczędność kredytów)',
    date: new Date().toISOString(),
    canonicalEngineEnabled: true,
    productToBrandMappingEnabled: true,
    matchTiers: '1-3 (100%, 95%, 85%)',
    dealTruthEnabled: true,
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
