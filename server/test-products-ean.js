"use strict";

/**
 * TEST PRODUKTÓW - 5 RÓŻNYCH KATEGORII (EAN)
 * 
 * Testujemy:
 * - Deal Score V2
 * - Cost Optimization
 * - Cache First
 * - Query Scoring
 * - Rotation Engine
 */

// Load .env.test if exists, otherwise .env
const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  // FORCE override existing env vars
  require('dotenv').config({ path: envTestPath, override: true });
  console.log('✅ Loaded .env.test (with override)');
  console.log('🔑 API Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
} else {
  require('dotenv').config();
  console.log('✅ Loaded .env');
}

const { fetchMarketOffers, getCostOptimizationStats } = require('./market-api');

// Test products - RÓŻNORODNOŚĆ KATEGORII
const TEST_PRODUCTS = [
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    category: 'AGD (odkurzacze)',
    description: 'Popularny odkurzacz - test cache first'
  },
  {
    name: 'Philips Hue White Starter Kit',
    ean: '8718696449578',
    basePrice: 89,
    category: 'Oświetlenie Smart Home',
    description: 'Popularne oświetlenie - test query scoring'
  },
  {
    name: 'Nike Air Max 90',
    ean: '0195866171657',
    basePrice: 139,
    category: 'Obuwie sportowe',
    description: 'Popularne buty - test rotation'
  },
  {
    name: 'LEGO Technic Lamborghini',
    ean: '5702017153209',
    basePrice: 379,
    category: 'Zabawki',
    description: 'Popularne LEGO - test niche boost'
  },
  {
    name: 'Oral-B iO Series 9',
    ean: '4210201307891',
    basePrice: 299,
    category: 'Higiena osobista',
    description: 'Szczoteczka elektryczna - test adaptive fetch'
  }
];

/**
 * Formatuje cenę
 */
function formatPrice(price) {
  if (!price || price <= 0) return 'N/A';
  return `€${price.toFixed(2)}`;
}

/**
 * Formatuje oszczędności
 */
function formatSavings(price, basePrice) {
  if (!price || !basePrice || price >= basePrice) return 'Brak';
  const savings = basePrice - price;
  const percent = ((savings / basePrice) * 100).toFixed(1);
  return `€${savings.toFixed(2)} (${percent}%)`;
}

/**
 * Testuje pojedynczy produkt
 */
async function testProduct(product, index) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST ${index + 1}/5: ${product.name}`);
  console.log('='.repeat(80));
  console.log(`Kategoria: ${product.category}`);
  console.log(`EAN: ${product.ean}`);
  console.log(`Cena bazowa: ${formatPrice(product.basePrice)}`);
  console.log(`Opis: ${product.description}`);
  console.log('-'.repeat(80));

  try {
    const startTime = Date.now();
    
    // Fetch offers
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'nl'
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas wyszukiwania: ${duration}ms`);
    console.log(`📦 Znaleziono ofert: ${offers.length}`);
    
    if (offers.length === 0) {
      console.log('❌ Brak ofert - sprawdź API keys lub użyj mock data');
      return;
    }
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    if (sorted.length === 0) {
      console.log('❌ Brak ofert z cenami');
      return;
    }
    
    // Statystyki
    const prices = sorted.map(o => o.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log('\n📊 STATYSTYKI:');
    console.log(`   Średnia cena: ${formatPrice(avgPrice)}`);
    console.log(`   Najtańsza: ${formatPrice(minPrice)}`);
    console.log(`   Najdroższa: ${formatPrice(maxPrice)}`);
    console.log(`   Maksymalne przebicie: ${formatSavings(minPrice, product.basePrice)}`);
    
    // TOP 10 ofert
    console.log('\n🏆 TOP 10 OFERT:');
    console.log('-'.repeat(80));
    console.log('Nr | Sklep                    | Cena      | Oszczędność      | Score | Trust | Source');
    console.log('-'.repeat(80));
    
    sorted.slice(0, 10).forEach((offer, i) => {
      const shop = (offer.seller || 'Unknown').substring(0, 24).padEnd(24);
      const price = formatPrice(offer.price).padEnd(9);
      const savings = formatSavings(offer.price, product.basePrice).padEnd(16);
      const score = offer._dealScore?.dealScore 
        ? offer._dealScore.dealScore.toFixed(1).padStart(5) 
        : 'N/A  ';
      const trust = offer._dealScore?.trustScore 
        ? Math.round(offer._dealScore.trustScore).toString().padStart(5)
        : 'N/A  ';
      const source = (offer._source || 'unknown').padEnd(10);
      
      console.log(`${String(i + 1).padStart(2)} | ${shop} | ${price} | ${savings} | ${score} | ${trust} | ${source}`);
    });
    
    // Źródła danych
    const sources = {};
    offers.forEach(o => {
      const src = o._source || 'unknown';
      sources[src] = (sources[src] || 0) + 1;
    });
    
    console.log('\n📍 ŹRÓDŁA DANYCH:');
    Object.entries(sources).forEach(([src, count]) => {
      const percent = ((count / offers.length) * 100).toFixed(1);
      console.log(`   ${src}: ${count} ofert (${percent}%)`);
    });
    
    // Deal Score statistics
    const withScore = offers.filter(o => o._dealScore?.dealScore);
    if (withScore.length > 0) {
      const avgScore = withScore.reduce((sum, o) => sum + o._dealScore.dealScore, 0) / withScore.length;
      const avgTrust = withScore.reduce((sum, o) => sum + (o._dealScore.trustScore || 0), 0) / withScore.length;
      
      console.log('\n⭐ DEAL SCORE STATISTICS:');
      console.log(`   Średni Deal Score: ${avgScore.toFixed(1)}/10`);
      console.log(`   Średni Trust Score: ${avgTrust.toFixed(0)}/100`);
    }
    
  } catch (error) {
    console.error(`❌ Błąd: ${error.message}`);
    console.error(error.stack);
  }
}

/**
 * Główna funkcja testowa
 */
async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST PRODUKTÓW - 5 RÓŻNYCH KATEGORII                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\nTestujemy:');
  console.log('✅ Deal Score V2 (reference price, trust engine, niche boost)');
  console.log('✅ Cost Optimization (cache first, query scoring, adaptive fetch)');
  console.log('✅ Rotation Engine (40/30/20/10)');
  console.log('✅ Real API (SearchAPI.io + SerpAPI fallback)');
  console.log('\nProdukty:');
  TEST_PRODUCTS.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.category})`);
  });
  console.log('');
  
  // Run tests sequentially
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    await testProduct(TEST_PRODUCTS[i], i);
    
    // Pauza między testami (żeby nie przekroczyć rate limits)
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 2 sekundy przed następnym testem...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Final statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINALNE STATYSTYKI - COST OPTIMIZATION');
  console.log('='.repeat(80));
  
  try {
    const stats = getCostOptimizationStats();
    
    console.log('\n💾 CACHE STATISTICS:');
    console.log(`   Cache Hits: ${stats.cache.hits}`);
    console.log(`   Cache Misses: ${stats.cache.misses}`);
    console.log(`   Hit Rate: ${stats.cache.hitRate}%`);
    console.log(`   Multi-user Sharing: ${stats.cache.multiUserSharing} times`);
    console.log(`   Total Savings: $${stats.cache.totalSavings.toFixed(3)}`);
    console.log(`   Estimated Monthly Savings: $${stats.cache.estimatedMonthlySavings.toFixed(2)}`);
    
    console.log('\n📍 SOURCE STATISTICS:');
    Object.entries(stats.sources.usage).forEach(([source, data]) => {
      console.log(`   ${source}: ${data.requests} requests, ${data.offers} ofert, $${data.cost.toFixed(3)} cost`);
    });
    console.log(`   Total Cost: $${stats.sources.totalCost.toFixed(3)}`);
    
    console.log('\n🔍 QUERY STATISTICS:');
    console.log(`   Total Queries: ${stats.queries.totalQueries}`);
    console.log(`   Cold Starts: ${stats.queries.coldStarts}`);
    console.log(`   Optimized: ${stats.queries.optimized}`);
    
    console.log('\n⚡ FETCH STATISTICS:');
    console.log(`   Total Fetches: ${stats.fetch.totalFetches}`);
    console.log(`   Early Stops: ${stats.fetch.earlyStops}`);
    console.log(`   Full Fetches: ${stats.fetch.fullFetches}`);
    
  } catch (error) {
    console.log('⚠️  Statystyki niedostępne:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TESTY ZAKOŃCZONE!');
  console.log('='.repeat(80));
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
