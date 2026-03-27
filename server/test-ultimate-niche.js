/**
 * TEST ULTIMATE NICHE CRAWLER
 * 
 * TOP 10 NISZOWYCH SKLEPÓW NL
 * Expected: 65-75% success (było 30%)
 * 
 * 4 techniki:
 * 1. Human-like flow (scroll+hover+click+delays ~18s)
 * 2. Network intercept (XHR/Ajax price extraction)
 * 3. Dynamic parsers (custom per shop)
 * 4. Blacklist (skip after 5 failures)
 */

require('dotenv').config();
const UltimateNicheCrawler = require('./crawler/ultimate-niche-crawler');

// TOP 10 NISZOWYCH NL (focus na te sklepy)
const TOP_NICHE_SHOPS = [
  { domain: 'fonq.nl', product: 'Lamp', category: 'Dom' },
  { domain: 'blokker.nl', product: 'Koffiezetapparaat', category: 'Dom' },
  { domain: 'praxis.nl', product: 'Boormachine', category: 'Narzędzia' },
  { domain: 'intratuin.nl', product: 'Bloempot', category: 'Ogród' },
  { domain: 'bcc.nl', product: 'Laptop', category: 'Elektronika' },
  { domain: 'wehkamp.nl', product: 'Schoenen', category: 'Moda' },
  { domain: 'xenos.nl', product: 'Kussen', category: 'Dom' },
  { domain: 'hema.nl', product: 'Handdoek', category: 'Dom' },
  { domain: 'action.com', product: 'Opbergbox', category: 'Dom' },
  { domain: 'kruidvat.nl', product: 'Shampoo', category: 'Drogeria' }
];

async function runTest() {
  console.log('\n🚀 TESTING ULTIMATE NICHE CRAWLER\n');
  console.log('TOP 10 NISZOWYCH SKLEPÓW NL');
  console.log('Expected: 65-75% success (było 30%)\n');
  console.log('Techniques:');
  console.log('  1. Human-like flow (scroll+hover+click+delays ~18s)');
  console.log('  2. Network intercept (XHR/Ajax price extraction)');
  console.log('  3. Dynamic parsers (custom per shop)');
  console.log('  4. Blacklist (skip after 5 failures)\n');
  console.log('='.repeat(80));

  const crawler = new UltimateNicheCrawler({
    proxy: { enabled: false }
  });

  const results = [];

  try {
    for (const shop of TOP_NICHE_SHOPS) {
      const result = await crawler.crawl(shop.domain, shop.product);
      results.push({
        ...shop,
        ...result
      });
      
      // Delay between shops
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESULTS - ULTIMATE vs ADVANCED vs BASIC');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const blacklisted = results.filter(r => r.blacklisted).length;
    const successRate = (successful / results.length * 100).toFixed(1);
    const totalPrices = results.reduce((sum, r) => sum + (r.prices?.length || 0), 0);

    console.log(`\nULTIMATE:  ${successRate}% (${successful}/${results.length})`);
    console.log(`ADVANCED:  30.0% (3/10)`);
    console.log(`BASIC:     15.4% (2/13)`);
    console.log(`\nIMPROVEMENT: ${(parseFloat(successRate) - 30.0).toFixed(1)}% vs ADVANCED`);
    console.log(`IMPROVEMENT: ${(parseFloat(successRate) - 15.4).toFixed(1)}% vs BASIC`);
    console.log(`\nTotal prices: ${totalPrices}`);
    console.log(`Blacklisted: ${blacklisted} shops`);

    // Per category
    const categories = [...new Set(results.map(r => r.category))];
    
    console.log('\n📋 Per Category:');
    categories.forEach(cat => {
      const catResults = results.filter(r => r.category === cat);
      const catSuccess = catResults.filter(r => r.success).length;
      const catRate = (catSuccess / catResults.length * 100).toFixed(1);
      
      console.log(`\n${cat}: ${catRate}% (${catSuccess}/${catResults.length})`);
      catResults.forEach(r => {
        const status = r.success ? '✅' : (r.blacklisted ? '⛔' : '❌');
        const info = r.success 
          ? `${r.prices.length} prices (€${r.avgPrice.toFixed(2)})`
          : (r.blacklisted ? 'Blacklisted' : 'Failed');
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
    const rate = parseFloat(successRate);
    
    if (rate >= 65) {
      console.log(`✅ EXCELLENT! ${successRate}% success - TARGET ACHIEVED!`);
      console.log(`   4 techniques zadziałały!`);
      console.log(`   Human-like flow + Network intercept + Dynamic parsers + Blacklist`);
      console.log(`   Można używać dla TOP 10 niszowych NL`);
    } else if (rate >= 50) {
      console.log(`⚠️  GOOD! ${successRate}% success - blisko celu (65%)`);
      console.log(`   Improvement: ${(rate - 30.0).toFixed(1)}% vs ADVANCED`);
      console.log(`   Wymaga drobnych ulepszeń`);
    } else if (rate >= 35) {
      console.log(`⚠️  MODERATE! ${successRate}% success - niewielka poprawa`);
      console.log(`   Improvement: ${(rate - 30.0).toFixed(1)}% vs ADVANCED`);
      console.log(`   Wymaga więcej pracy`);
    } else {
      console.log(`❌ POOR! ${successRate}% success - brak poprawy`);
      console.log(`   Techniques nie zadziałały jak oczekiwano`);
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTest().catch(console.error);
