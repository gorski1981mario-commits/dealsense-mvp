"use strict";

/**
 * TEST 10 NOWYCH PRODUKTÓW - QUALITY FILTER
 * Zupełnie inne produkty niż w pierwszym teście
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
    name: 'MacBook Pro 14 M3',
    ean: '0195949112683',
    basePrice: 2199,
    category: 'Laptops',
    expectedIssues: ['refurbished', 'wrong model', 'accessories']
  },
  {
    name: 'iPad Air 11 M2 128GB',
    ean: '0195949650123',
    basePrice: 699,
    category: 'Tablets',
    expectedIssues: ['refurbished', 'wrong storage']
  },
  {
    name: 'Bose QuietComfort Ultra',
    ean: '0017817841115',
    basePrice: 449,
    category: 'Headphones',
    expectedIssues: ['refurbished', 'used']
  },
  {
    name: 'GoPro Hero 12 Black',
    ean: '0818279036220',
    basePrice: 449,
    category: 'Cameras',
    expectedIssues: ['bundles', 'accessories']
  },
  {
    name: 'Nespresso Vertuo Next',
    ean: '7630054458354',
    basePrice: 149,
    category: 'Coffee Machines',
    expectedIssues: ['bundles', 'refurbished']
  },
  {
    name: 'Fitbit Charge 6',
    ean: '0810038854502',
    basePrice: 159,
    category: 'Wearables',
    expectedIssues: ['refurbished', 'accessories']
  },
  {
    name: 'Kindle Paperwhite 11th Gen',
    ean: '0840080557731',
    basePrice: 159,
    category: 'E-readers',
    expectedIssues: ['refurbished', 'bundles']
  },
  {
    name: 'Sonos Beam Gen 2',
    ean: '8717755779410',
    basePrice: 499,
    category: 'Soundbars',
    expectedIssues: ['refurbished', 'outlet']
  },
  {
    name: 'Garmin Fenix 7',
    ean: '0753759282844',
    basePrice: 699,
    category: 'Smartwatches',
    expectedIssues: ['refurbished', 'wrong model']
  },
  {
    name: 'Ring Video Doorbell Pro 2',
    ean: '0840080533056',
    basePrice: 279,
    category: 'Smart Home',
    expectedIssues: ['bundles', 'refurbished']
  }
];

const results = [];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/10: ${product.name}`);
  console.log(`📦 Kategoria: ${product.category}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log(`🔍 EAN: ${product.ean}`);
  console.log(`⚠️  Oczekiwane problemy: ${product.expectedIssues.join(', ')}`);
  console.log('═'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'be'
    });
    
    const duration = Date.now() - startTime;
    
    if (!offers || offers.length === 0) {
      console.log('❌ Brak ofert po filtrach');
      results.push({
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        offersFound: 0,
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
    
    // Sprawdź jakość ofert
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
      avgSimilarity: sorted.reduce((sum, o) => sum + (o._similarity || 0), 0) / sorted.length,
      avgTrust: sorted.reduce((sum, o) => sum + (o._dealScore?.trustScore || 0), 0) / sorted.length
    };
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT z ${shopsCount} SKLEPÓW`);
    console.log(`⏱️  Czas: ${duration}ms`);
    console.log('');
    
    // Quality checks
    console.log('🔍 QUALITY CHECKS:');
    console.log(`   ${qualityChecks.hasRefurbished ? '❌' : '✅'} Refurbished/Used: ${qualityChecks.hasRefurbished ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   ${qualityChecks.hasAccessories ? '❌' : '✅'} Accessories: ${qualityChecks.hasAccessories ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   ${qualityChecks.hasBundles ? '❌' : '✅'} Bundles: ${qualityChecks.hasBundles ? 'FOUND (BAD!)' : 'None (GOOD!)'}`);
    console.log(`   ⭐ Avg Similarity: ${qualityChecks.avgSimilarity.toFixed(1)}% (min 85%)`);
    console.log(`   🛡️  Avg Trust: ${qualityChecks.avgTrust.toFixed(0)}/100`);
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
      const similarity = offer._similarity || 0;
      
      const status = offerSavings > 0 ? '✅' : '❌';
      
      console.log(`${i + 1}. ${status} ${shop}`);
      console.log(`   💰 €${price.toFixed(2)} (${offerSavings > 0 ? '-' : '+'}€${Math.abs(offerSavings).toFixed(2)} / ${offerPercent}%)`);
      console.log(`   ⭐ Score: ${dealScore.toFixed(1)}/10 | 🛡️  Trust: ${trustScore}/100 | 🎯 Similarity: ${similarity}%`);
      
      if (offer._suspicious) {
        console.log(`   ⚠️  SUSPICIOUS: ${offer._suspiciousReason}`);
      }
      
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
      avgSimilarity: qualityChecks.avgSimilarity,
      qualityIssues: {
        hasRefurbished: qualityChecks.hasRefurbished,
        hasAccessories: qualityChecks.hasAccessories,
        hasBundles: qualityChecks.hasBundles
      },
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
  console.log('║                    TEST 10 NOWYCH PRODUKTÓW - QUALITY FILTER (BELGIA)                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 API Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('🌍 LOCATION: Belgium (BE)');
  console.log('🛡️  QUALITY FILTER: enabled (adaptive mode)');
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
  console.log('📊 PODSUMOWANIE - TEST 2 (NOWE PRODUKTY)');
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
    const avgSimilarity = successful.reduce((sum, r) => sum + r.avgSimilarity, 0) / successful.length;
    
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
    console.log(`   Similarity: ${avgSimilarity.toFixed(1)}%`);
    
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
  console.log('✅ TEST 2 ZAKOŃCZONY!');
  console.log('═'.repeat(100));
  console.log('\n');
  
  // Zapisz wyniki
  const fs = require('fs');
  const resultsPath = path.join(__dirname, 'test-results', 'test-10-new-products-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    testName: 'Test 2 - 10 Nowych Produktów',
    date: new Date().toISOString(),
    location: 'Belgium (BE)',
    successRate: `${successful.length}/${TEST_PRODUCTS.length}`,
    results: results
  }, null, 2));
  
  console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
