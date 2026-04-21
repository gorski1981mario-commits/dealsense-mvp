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

// Test products - RÓŻNORODNOŚĆ KATEGORII (karuzela nowych produktów)
const TEST_PRODUCTS = [
  {
    name: 'Levi\'s 501 Original Jeans',
    ean: '737247293916',
    category: 'Moda - Jeans',
    basePrice: 99.00,
    description: 'Klasyczne jeans Levi\'s'
  },
  {
    name: 'Nivea Men Creme',
    ean: '4005800133948',
    category: 'Kosmetyki',
    basePrice: 8.99,
    description: 'Krem do twarzy dla mężczyzn'
  },
  {
    name: 'Adidas 3kg Dumbbell Set',
    ean: '4055740205874',
    category: 'Sport - Fitness',
    basePrice: 39.99,
    description: 'Zestaw hantli Adidas'
  },
  {
    name: 'Samsung 55" TU8500 Crystal UHD',
    ean: '8806090142545',
    category: 'Elektronika - TV',
    basePrice: 599.00,
    description: 'Telewizor Samsung 55" 4K'
  },
  {
    name: 'Philips Airfryer XXL HD9255',
    ean: '8710103636579',
    category: 'AGD - Frytkownice',
    basePrice: 229.00,
    description: 'Airfryer Philips XXL'
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
    const result = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'nl'
    });
    
    const duration = Date.now() - startTime;
    
    // fetchMarketOffers zwraca obiekt { offers: [...], smartBundles: [...] }
    const offers = result?.offers || [];
    
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
    
    // Statystyki cen
    const prices = sorted.map(o => o.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxSavings = product.basePrice - minPrice;
    const maxSavingsPercent = maxSavings > 0 ? (maxSavings / product.basePrice * 100) : 0;
    
    console.log('\n📊 STATYSTYKI:');
    console.log(`   Średnia cena: €${avgPrice.toFixed(2)}`);
    console.log(`   Najtańsza: ${formatPrice(minPrice)}`);
    console.log(`   Najdroższa: ${formatPrice(maxPrice)}`);
    console.log(`   Maksymalne przebicie: ${formatPrice(maxSavings)} (${maxSavingsPercent.toFixed(1)}%)`);
    
    console.log('\n🏆 WSZYSTKIE OFERTY:');
    console.log('─'.repeat(80));
    console.log('Nr | Sklep                    | Cena      | Oszczędność      | Source');
    console.log('─'.repeat(80));
    
    sorted.forEach((offer, i) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = savings > 0 ? (savings / product.basePrice * 100).toFixed(1) : 'Brak';
      const savingsText = savings > 0 ? `${formatPrice(savings)} (${savingsPercent}%)` : 'Brak';
      const shopName = offer.shop || offer.seller || 'Unknown';
      
      console.log(`${(i + 1).toString().padEnd(3)} | ${shopName.substring(0, 24).padEnd(24)} | ${formatPrice(offer.price).padEnd(10)} | ${savingsText.padEnd(17)} | ${offer._source || 'google'}`);
    });
    
    console.log('\n📍 ŹRÓDŁA DANYCH:');
    const sources = {};
    offers.forEach(o => {
      const source = o._source || 'google';
      sources[source] = (sources[source] || 0) + 1;
    });
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} ofert (${(count / offers.length * 100).toFixed(1)}%)`);
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
