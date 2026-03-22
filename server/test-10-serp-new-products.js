"use strict";

/**
 * TEST 10 NOWYCH PRODUKTÓW - SERP API PRIMARY
 * Zupełnie inne produkty niż w poprzednich testach
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

// 10 NOWYCH PRODUKTÓW - mix kategorii
const TEST_PRODUCTS = [
  {
    name: 'AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    category: 'Audio'
  },
  {
    name: 'iPad Pro 11 M4',
    ean: '0195949650321',
    basePrice: 1099,
    category: 'Tablets'
  },
  {
    name: 'Sony WH-1000XM5',
    ean: '4548736134980',
    basePrice: 399,
    category: 'Headphones'
  },
  {
    name: 'Nintendo Switch OLED',
    ean: '0045496882747',
    basePrice: 349,
    category: 'Gaming'
  },
  {
    name: 'Apple Watch Series 9',
    ean: '0195949650444',
    basePrice: 449,
    category: 'Smartwatches'
  },
  {
    name: 'Canon EOS R6 Mark II',
    ean: '4549292193923',
    basePrice: 2699,
    category: 'Cameras'
  },
  {
    name: 'Bose QuietComfort Ultra',
    ean: '0017817841115',
    basePrice: 449,
    category: 'Headphones'
  },
  {
    name: 'Logitech MX Master 3S',
    ean: '5099206098527',
    basePrice: 109,
    category: 'Accessories'
  },
  {
    name: 'Samsung Galaxy Watch 6',
    ean: '8806094937350',
    basePrice: 319,
    category: 'Smartwatches'
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
      console.log('❌ Brak ofert z SERP API');
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
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    const shopsCount = new Set(sorted.map(o => o.seller)).size;
    const cheapest = sorted[0];
    const savings = product.basePrice - cheapest.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    // Quality checks
    const qualityChecks = {
      hasRefurbished: sorted.some(o => {
        const title = String(o.title || '').toLowerCase();
        return title.includes('refurbished') || title.includes('renewed') || title.includes('used');
      }),
      hasAccessories: sorted.some(o => {
        const title = String(o.title || '').toLowerCase();
        return title.includes('case') || title.includes('cover') || title.includes('adapter');
      }),
      hasBundles: sorted.some(o => {
        const title = String(o.title || '').toLowerCase();
        return title.includes('bundle') || title.includes('set') || title.includes('+');
      }),
      avgTrust: sorted.reduce((sum, o) => sum + (o._dealScore?.trustScore || 0), 0) / sorted.length
    };
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT z ${shopsCount} SKLEPÓW`);
    console.log(`📡 ŹRÓDŁO: ${sources.join(', ')}`);
    console.log(`⏱️  Czas: ${duration}ms`);
    console.log('');
    
    // Quality checks
    console.log('🔍 QUALITY CHECKS:');
    console.log(`   ${qualityChecks.hasRefurbished ? '❌' : '✅'} Refurbished/Used: ${qualityChecks.hasRefurbished ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   ${qualityChecks.hasAccessories ? '❌' : '✅'} Accessories: ${qualityChecks.hasAccessories ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   ${qualityChecks.hasBundles ? '❌' : '✅'} Bundles: ${qualityChecks.hasBundles ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   🛡️  Avg Trust: ${qualityChecks.avgTrust.toFixed(0)}/100`);
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
      avgDealScore: sorted.reduce((sum, o) => sum + (o._dealScore?.dealScore || 0), 0) / sorted.length,
      avgTrustScore: qualityChecks.avgTrust,
      qualityIssues: {
        hasRefurbished: qualityChecks.hasRefurbished,
        hasAccessories: qualityChecks.hasAccessories,
        hasBundles: qualityChecks.hasBundles
      },
      source: sources[0] || 'unknown',
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
  console.log('║                    TEST 10 NOWYCH PRODUKTÓW - SERP API PRIMARY                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 SERP API Key:', process.env.SERPAPI_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('📡 PRIMARY: SERP API (NL)');
  console.log('📡 FALLBACK: WYŁĄCZONY');
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
  console.log('📊 PODSUMOWANIE - SERP API PRIMARY (10 NOWYCH PRODUKTÓW)');
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
    
    // Quality issues
    const hasRefurbishedCount = successful.filter(r => r.qualityIssues.hasRefurbished).length;
    const hasAccessoriesCount = successful.filter(r => r.qualityIssues.hasAccessories).length;
    const hasBundlesCount = successful.filter(r => r.qualityIssues.hasBundles).length;
    
    console.log('\n📈 ŚREDNIE WARTOŚCI:');
    console.log(`   Ofert na produkt: ${avgOffers.toFixed(1)}`);
    console.log(`   Sklepów na produkt: ${avgShops.toFixed(1)}`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   Czas wyszukiwania: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Deal Score: ${avgDealScore.toFixed(1)}/10`);
    console.log(`   Trust Score: ${avgTrustScore.toFixed(0)}/100`);
    
    console.log('\n🛡️  QUALITY FILTER EFFECTIVENESS:');
    console.log(`   ❌ Refurbished/Used found: ${hasRefurbishedCount}/${successful.length} (${((hasRefurbishedCount/successful.length)*100).toFixed(0)}%)`);
    console.log(`   ❌ Accessories found: ${hasAccessoriesCount}/${successful.length} (${((hasAccessoriesCount/successful.length)*100).toFixed(0)}%)`);
    console.log(`   ❌ Bundles found: ${hasBundlesCount}/${successful.length} (${((hasBundlesCount/successful.length)*100).toFixed(0)}%)`);
    
    const totalIssues = hasRefurbishedCount + hasAccessoriesCount + hasBundlesCount;
    const filterEffectiveness = ((1 - (totalIssues / (successful.length * 3))) * 100).toFixed(1);
    console.log(`   ✅ Filter Effectiveness: ${filterEffectiveness}%`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)}) - ${r.bestShop}`);
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
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-serp-new-products-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 10 Nowych Produktów - SERP API PRIMARY',
    date: new Date().toISOString(),
    primarySource: 'SERP API (NL)',
    fallbackEnabled: false,
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
