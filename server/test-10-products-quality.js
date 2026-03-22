"use strict";

/**
 * TEST 10 PRODUKTÓW - QUALITY FILTER
 * Kontrolowane testy z EAN - sprawdzamy jak działa filtrowanie śmieci
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
    category: 'Smartphones',
    expectedIssues: ['accessories', 'refurbished', 'wrong storage']
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    ean: '8806095307220',
    basePrice: 1449,
    category: 'Smartphones',
    expectedIssues: ['accessories', 'bundles', 'wrong storage']
  },
  {
    name: 'Sony PlayStation 5',
    ean: '0711719560050',
    basePrice: 549,
    category: 'Gaming',
    expectedIssues: ['bundles', 'used', 'accessories']
  },
  {
    name: 'Apple AirPods Pro 2',
    ean: '0194253911821',
    basePrice: 279,
    category: 'Audio',
    expectedIssues: ['refurbished', 'used']
  },
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    category: 'Home Appliances',
    expectedIssues: ['refurbished', 'outlet']
  },
  {
    name: 'Nike Air Max 90',
    ean: '0195866171657',
    basePrice: 139,
    category: 'Footwear',
    expectedIssues: ['wrong model', 'wrong size']
  },
  {
    name: 'LEGO Technic Lamborghini',
    ean: '5702017153209',
    basePrice: 379,
    category: 'Toys',
    expectedIssues: ['used', 'incomplete']
  },
  {
    name: 'DeLonghi Magnifica S',
    ean: '8004399329164',
    basePrice: 399,
    category: 'Coffee Machines',
    expectedIssues: ['refurbished', 'used']
  },
  {
    name: 'Philips Hue White Starter Kit',
    ean: '8718696449578',
    basePrice: 89,
    category: 'Smart Home',
    expectedIssues: ['bundles', 'accessories']
  },
  {
    name: 'Oral-B iO Series 9',
    ean: '4210201307891',
    basePrice: 299,
    category: 'Personal Care',
    expectedIssues: ['refurbished', 'accessories']
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
      location: 'nl'
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
      
      // Flaguj podejrzane
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
  console.log('║                    TEST 10 PRODUKTÓW - QUALITY FILTER (KONTROLOWANE TESTY)                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 API Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('🚫 CACHE BYPASS: true');
  console.log('🛡️  QUALITY FILTER: enabled (refurbished, accessories, bundles, wrong specs)');
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
  console.log('📊 PODSUMOWANIE I WNIOSKI - QUALITY FILTER');
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
    console.log(`   ✅ Filter Effectiveness: ${filterEffectiveness}% (im wyżej, tym lepiej)`);
    
    console.log('\n🏆 NAJLEPSZE PRZEBICIA:');
    const sorted = [...successful].sort((a, b) => b.savingsPercent - a.savingsPercent);
    sorted.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.product}: ${r.savingsPercent.toFixed(1)}% (€${r.savings.toFixed(2)}) - ${r.bestShop}`);
    });
    
    console.log('\n💡 WNIOSKI:');
    console.log(`   ✅ Quality Filter działa (${filterEffectiveness}% effectiveness)`);
    console.log(`   ✅ Średnio ${avgOffers.toFixed(0)} ofert z ${avgShops.toFixed(0)} sklepów na produkt`);
    console.log(`   ✅ Średnie oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   ✅ Średni czas odpowiedzi: ${avgDuration.toFixed(0)}ms (~${(avgDuration/1000).toFixed(1)}s)`);
    console.log(`   ✅ Deal Score: ${avgDealScore.toFixed(1)}/10 (wysoka jakość)`);
    console.log(`   ✅ Trust Score: ${avgTrustScore.toFixed(0)}/100`);
    console.log(`   ✅ Similarity: ${avgSimilarity.toFixed(1)}% (>85% = dokładne dopasowanie)`);
    
    if (totalIssues > 0) {
      console.log(`   ⚠️  UWAGA: ${totalIssues} problemów jakości znalezionych - rozważ zaostrzenie filtrów`);
    } else {
      console.log(`   🎉 PERFECT! Żadnych problemów jakości - filtry działają idealnie!`);
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
