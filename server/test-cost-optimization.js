"use strict";

/**
 * TEST COST OPTIMIZATION
 * 
 * 5 kontrolowanych testów wyszukiwania produktów
 * Pokazuje: sklepy, ceny, przebicia, źródła danych, oszczędności
 */

require('dotenv').config();

const { fetchMarketOffers, getCostOptimizationStats } = require('./market-api');

// Test products - RÓŻNORODNOŚĆ KATEGORII!
const TEST_PRODUCTS = [
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
    category: 'AGD (odkurzacze)',
    description: 'Popularny odkurzacz - cache first'
  },
  {
    name: 'Philips Hue White Starter Kit',
    ean: '8718696449578',
    basePrice: 89,
    category: 'Oświetlenie Smart Home',
    description: 'Popularne oświetlenie - cache first'
  },
  {
    name: 'Nike Air Max 90',
    ean: '0195866171657',
    basePrice: 139,
    category: 'Obuwie sportowe',
    description: 'Popularne buty - cache first'
  },
  {
    name: 'LEGO Technic Lamborghini',
    ean: '5702017153209',
    basePrice: 379,
    category: 'Zabawki',
    description: 'Popularne LEGO - cache first'
  },
  {
    name: 'Oral-B iO Series 9',
    ean: '4210201307891',
    basePrice: 299,
    category: 'Higiena osobista',
    description: 'Szczoteczka elektryczna - medium popularity'
  }
];

/**
 * Formatuje wyniki testu
 */
function formatTestResults(product, results, testNumber) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST ${testNumber}/5: ${product.name}`);
  console.log('='.repeat(80));
  console.log(`Kategoria: ${product.category.toUpperCase()}`);
  console.log(`Opis: ${product.description}`);
  console.log(`Cena bazowa: €${product.basePrice}`);
  console.log('-'.repeat(80));
  
  if (!results || results.length === 0) {
    console.log('❌ BRAK WYNIKÓW');
    return;
  }
  
  console.log(`✅ Znaleziono ${results.length} ofert\n`);
  
  // Sortuj po cenie (najtańsze pierwsze)
  const sorted = results.slice().sort((a, b) => (a.price || 0) - (b.price || 0));
  
  // Pokaż TOP 10 ofert
  const top10 = sorted.slice(0, 10);
  
  console.log('TOP 10 OFERT:');
  console.log('-'.repeat(80));
  console.log('Nr | Sklep                    | Cena      | Oszczędność | Score | Trust | Source');
  console.log('-'.repeat(80));
  
  top10.forEach((offer, index) => {
    const seller = (offer.seller || 'Unknown').substring(0, 24).padEnd(24);
    const price = `€${(offer.price || 0).toFixed(2)}`.padEnd(9);
    const savings = product.basePrice - (offer.price || 0);
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    const savingsStr = `€${savings.toFixed(2)} (${savingsPercent}%)`.padEnd(11);
    const score = offer._dealScore?.dealScore ? offer._dealScore.dealScore.toFixed(1) : 'N/A';
    const scoreStr = score.toString().padEnd(5);
    const trust = offer._dealScore?.trustScore ? offer._dealScore.trustScore : 'N/A';
    const trustStr = trust.toString().padEnd(5);
    const source = (offer._source || 'unknown').padEnd(8);
    
    console.log(`${(index + 1).toString().padStart(2)} | ${seller} | ${price} | ${savingsStr} | ${scoreStr} | ${trustStr} | ${source}`);
  });
  
  // Statystyki
  console.log('\n' + '-'.repeat(80));
  console.log('STATYSTYKI:');
  console.log('-'.repeat(80));
  
  const prices = sorted.map(o => o.price || 0).filter(p => p > 0);
  const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  const maxSavings = product.basePrice - minPrice;
  const maxSavingsPercent = ((maxSavings / product.basePrice) * 100).toFixed(1);
  
  console.log(`Średnia cena: €${avgPrice.toFixed(2)}`);
  console.log(`Najtańsza: €${minPrice.toFixed(2)}`);
  console.log(`Najdroższa: €${maxPrice.toFixed(2)}`);
  console.log(`Maksymalne przebicie: €${maxSavings.toFixed(2)} (${maxSavingsPercent}%)`);
  
  // Deal scores
  const scores = sorted
    .map(o => o._dealScore?.dealScore || 0)
    .filter(s => s > 0);
  
  if (scores.length > 0) {
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const maxScore = Math.max(...scores);
    console.log(`Średni Deal Score: ${avgScore.toFixed(2)}/10`);
    console.log(`Najwyższy Deal Score: ${maxScore.toFixed(1)}/10`);
  }
  
  // Trust scores
  const trustScores = sorted
    .map(o => o._dealScore?.trustScore || 0)
    .filter(t => t > 0);
  
  if (trustScores.length > 0) {
    const avgTrust = trustScores.reduce((sum, t) => sum + t, 0) / trustScores.length;
    console.log(`Średni Trust Score: ${avgTrust.toFixed(1)}/100`);
  }
  
  // Sources
  const sources = {};
  sorted.forEach(o => {
    const source = o._source || 'unknown';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  console.log('\nŹródła danych:');
  Object.entries(sources).forEach(([source, count]) => {
    const percent = ((count / sorted.length) * 100).toFixed(1);
    console.log(`  ${source}: ${count} ofert (${percent}%)`);
  });
}

/**
 * Główna funkcja testowa
 */
async function runTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'COST OPTIMIZATION - TEST SUITE' + ' '.repeat(27) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');
  console.log('Testujemy 5 produktów z RÓŻNYCH KATEGORII (z EAN):');
  console.log('1. Dyson V15 Detect (AGD - odkurzacze)');
  console.log('2. Philips Hue White (Oświetlenie Smart Home)');
  console.log('3. Nike Air Max 90 (Obuwie sportowe)');
  console.log('4. LEGO Technic Lamborghini (Zabawki)');
  console.log('5. Oral-B iO Series 9 (Higiena osobista)');
  console.log('\n');
  
  const startTime = Date.now();
  
  // Run tests
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const product = TEST_PRODUCTS[i];
    
    try {
      const results = await fetchMarketOffers(product.name, product.ean, {
        userBasePrice: product.basePrice,
        maxResults: 50
      });
      
      formatTestResults(product, results, i + 1);
      
      // Wait 2s between tests (avoid rate limiting)
      if (i < TEST_PRODUCTS.length - 1) {
        console.log('\n⏳ Czekam 2s przed następnym testem...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log('\n' + '='.repeat(80));
      console.log(`TEST ${i + 1}/5: ${product.name}`);
      console.log('='.repeat(80));
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Final statistics
  console.log('\n\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(25) + 'FINAL STATISTICS' + ' '.repeat(37) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');
  
  const stats = getCostOptimizationStats();
  
  console.log('CACHE STATISTICS:');
  console.log('-'.repeat(80));
  console.log(`Cache Hits: ${stats.cache.hits}`);
  console.log(`Cache Misses: ${stats.cache.misses}`);
  console.log(`Hit Rate: ${stats.cache.hitRate}`);
  console.log(`Multi-user Sharing: ${stats.cache.multiUserSharing} times`);
  console.log(`Total Savings: $${stats.cache.totalSavings.toFixed(3)}`);
  console.log(`Estimated Monthly Savings: ${stats.cache.estimatedMonthlySavings}`);
  
  console.log('\n');
  console.log('SOURCE STATISTICS:');
  console.log('-'.repeat(80));
  Object.entries(stats.sources.sources).forEach(([source, data]) => {
    if (data.requests > 0) {
      console.log(`${source.toUpperCase()}:`);
      console.log(`  Requests: ${data.requests}`);
      console.log(`  Cost: $${data.cost.toFixed(3)}`);
      console.log(`  Offers: ${data.offers}`);
      console.log(`  Avg offers/request: ${(data.offers / data.requests).toFixed(1)}`);
    }
  });
  
  console.log('\nTOTAL:');
  console.log(`  Total Requests: ${stats.sources.total.requests}`);
  console.log(`  Total Cost: $${stats.sources.total.cost.toFixed(3)}`);
  console.log(`  Avg Cost/Request: $${stats.sources.total.avgCostPerRequest}`);
  console.log(`  Avg Offers/Request: ${stats.sources.total.avgOffersPerRequest}`);
  
  console.log('\n');
  console.log('QUERY STATISTICS:');
  console.log('-'.repeat(80));
  console.log(`Total Queries: ${stats.queries.totalQueries}`);
  console.log(`Total Searches: ${stats.queries.totalSearches}`);
  console.log(`Total Offers: ${stats.queries.totalOffers}`);
  console.log(`Avg Offers/Search: ${stats.queries.avgOffersPerSearch}`);
  
  if (stats.queries.topQueries && stats.queries.topQueries.length > 0) {
    console.log('\nTop Queries:');
    stats.queries.topQueries.slice(0, 5).forEach((q, i) => {
      console.log(`  ${i + 1}. "${q.query}" - ${q.searches} searches, ${q.avgOffers} avg offers, score ${q.avgDealScore}, CTR ${q.ctr}`);
    });
  }
  
  console.log('\n');
  console.log('FETCH STATISTICS:');
  console.log('-'.repeat(80));
  console.log(`Total Fetches: ${stats.fetch.totalFetches}`);
  console.log(`Early Stops: ${stats.fetch.earlyStops}`);
  console.log(`Full Fetches: ${stats.fetch.fullFetches}`);
  console.log(`Early Stop Rate: ${stats.fetch.earlyStopRate}`);
  console.log(`Avg Offers/Fetch: ${stats.fetch.avgOffersPerFetch}`);
  
  console.log('\n');
  console.log('='.repeat(80));
  console.log(`✅ TESTY ZAKOŃCZONE w ${totalTime}s`);
  console.log('='.repeat(80));
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
