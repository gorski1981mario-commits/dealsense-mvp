/**
 * TEST ADVANCED NICHE CRAWLER
 * 
 * Testuje 5 ulepszeń na tych samych niszowych sklepach
 * Expected: 60-80% success (było 15%)
 */

require('dotenv').config();
const AdvancedNicheCrawler = require('./crawler/advanced-niche-crawler');

const NICHE_SHOPS = [
  // Elektronika
  { domain: 'alternate.nl', product: 'Samsung Galaxy S24', category: 'Elektronika' },
  { domain: 'azerty.nl', product: 'iPhone 15', category: 'Elektronika' },
  { domain: 'megekko.nl', product: 'Sony WH-1000XM5', category: 'Elektronika' },
  
  // Moda
  { domain: 'aboutyou.nl', product: 'Nike Air Max', category: 'Moda' },
  { domain: 'omoda.nl', product: 'Sneakers', category: 'Moda' },
  { domain: 'vanharen.nl', product: 'Schoenen', category: 'Moda' },
  
  // Dom
  { domain: 'karwei.nl', product: 'Verfroller', category: 'Dom' },
  { domain: 'hornbach.nl', product: 'Boormachine', category: 'Dom' },
  
  // Sport
  { domain: 'decathlon.nl', product: 'Fiets', category: 'Sport' },
  { domain: 'bever.nl', product: 'Rugzak', category: 'Sport' }
];

async function runTest() {
  console.log('\n🚀 TESTING ADVANCED NICHE CRAWLER\n');
  console.log('Upgrades:');
  console.log('  1. waitForFunction + JS eval (zamiast selektorów)');
  console.log('  2. Scroll + delay (wymusza React hydration)');
  console.log('  3. Fuzzy match fallback (fuse.js)');
  console.log('  4. Mini parsery per shop');
  console.log('  5. Geolocation NL + extra headers\n');
  console.log(`Testing ${NICHE_SHOPS.length} shops`);
  console.log('Expected: 60-80% success (było 15%)\n');
  console.log('='.repeat(80));

  const crawler = new AdvancedNicheCrawler({
    proxy: { enabled: false }
  });

  const results = [];

  try {
    for (const shop of NICHE_SHOPS) {
      const result = await crawler.crawl(shop.domain, shop.product);
      results.push({
        ...shop,
        ...result
      });
      
      // Delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESULTS - ADVANCED vs BASIC');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const successRate = (successful / results.length * 100).toFixed(1);
    const totalPrices = results.reduce((sum, r) => sum + (r.prices?.length || 0), 0);

    console.log(`\nADVANCED: ${successRate}% (${successful}/${results.length})`);
    console.log(`BASIC:    15.4% (2/13)`);
    console.log(`IMPROVEMENT: ${(parseFloat(successRate) - 15.4).toFixed(1)}%`);
    console.log(`\nTotal prices: ${totalPrices}`);

    // Per category
    const categories = [...new Set(results.map(r => r.category))];
    
    console.log('\n📋 Per Category:');
    categories.forEach(cat => {
      const catResults = results.filter(r => r.category === cat);
      const catSuccess = catResults.filter(r => r.success).length;
      const catRate = (catSuccess / catResults.length * 100).toFixed(1);
      
      console.log(`\n${cat}: ${catRate}% (${catSuccess}/${catResults.length})`);
      catResults.forEach(r => {
        const status = r.success ? '✅' : '❌';
        const info = r.success ? `${r.prices.length} prices (€${r.avgPrice.toFixed(2)})` : 'Failed';
        console.log(`  ${status} ${r.domain.padEnd(20)} - ${info}`);
      });
    });

    // Working shops
    const workingShops = results.filter(r => r.success);
    
    if (workingShops.length > 0) {
      console.log('\n✅ WORKING SHOPS:');
      workingShops.forEach(s => {
        console.log(`  - ${s.domain} (${s.category}) - ${s.prices.length} prices`);
      });
    }

    console.log('\n📈 Crawler Statistics:');
    const stats = crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n🎯 VERDICT:');
    if (parseFloat(successRate) >= 60) {
      console.log(`✅ EXCELLENT! ${successRate}% success - upgrades zadziałały!`);
      console.log(`   Improvement: ${(parseFloat(successRate) - 15.4).toFixed(1)}% (było 15.4%)`);
      console.log(`   Można używać dla niszowych sklepów`);
    } else if (parseFloat(successRate) >= 40) {
      console.log(`⚠️  GOOD! ${successRate}% success - częściowa poprawa`);
      console.log(`   Improvement: ${(parseFloat(successRate) - 15.4).toFixed(1)}% (było 15.4%)`);
      console.log(`   Wymaga dalszych ulepszeń`);
    } else {
      console.log(`❌ POOR! ${successRate}% success - niewielka poprawa`);
      console.log(`   Improvement: ${(parseFloat(successRate) - 15.4).toFixed(1)}% (było 15.4%)`);
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTest().catch(console.error);
