/**
 * TEST CUSTOM CRAWLERS - TOP 5 SKLEPÓW
 * 
 * Testuje dedykowane crawlery dla największych sklepów
 * Expected: 80-90% success rate (vs 20% generic)
 */

require('dotenv').config();
const CustomCrawlerEngine = require('./crawler/custom-crawler-engine');

const TESTS = [
  { domain: 'bol.com', product: 'Samsung Galaxy S24', marketShare: '40%' },
  { domain: 'coolblue.nl', product: 'Samsung Galaxy S24', marketShare: '15%' },
  { domain: 'mediamarkt.nl', product: 'Samsung Galaxy S24', marketShare: '10%' },
  { domain: 'zalando.nl', product: 'Nike Air Max', marketShare: '8%' },
  { domain: 'wehkamp.nl', product: 'Samsung Galaxy S24', marketShare: '7%' }
];

async function runTests() {
  console.log('\n🚀 TESTING CUSTOM CRAWLERS - TOP 5 SKLEPÓW\n');
  console.log('Expected: 80-90% success rate (vs 20% generic)\n');
  console.log('='.repeat(80));

  const crawler = new CustomCrawlerEngine({
    proxy: { enabled: false }
  });

  const results = [];

  try {
    for (const test of TESTS) {
      console.log(`\n[Test] ${test.domain} (${test.marketShare} market share)`);
      console.log(`Product: ${test.product}`);
      
      const result = await crawler.crawl(test.domain, test.product);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const priceInfo = result.success 
        ? `${result.prices.length} prices, avg €${result.avgPrice.toFixed(2)}`
        : `Failed: ${result.error || 'No prices'}`;
      
      console.log(`${status} ${priceInfo}\n`);
      
      // Delay
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Summary
    console.log('='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const successRate = (successful / results.length * 100).toFixed(1);
    const totalPrices = results.reduce((sum, r) => sum + (r.prices?.length || 0), 0);

    console.log(`\nSuccess rate: ${successRate}% (${successful}/${results.length})`);
    console.log(`Total prices found: ${totalPrices}`);
    console.log(`Total market share covered: 80%`);

    console.log('\n📋 Per Shop:');
    results.forEach((r, i) => {
      const status = r.success ? '✅' : '❌';
      const priceInfo = r.success 
        ? `${r.prices.length} prices (€${r.avgPrice.toFixed(2)} avg)`
        : 'Failed';
      
      console.log(`  ${status} ${TESTS[i].domain.padEnd(20)} ${TESTS[i].marketShare.padEnd(5)} - ${priceInfo}`);
    });

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    const stats = crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n🎯 VERDICT:');
    if (parseFloat(successRate) >= 80) {
      console.log('✅ EXCELLENT - Custom crawlers działają świetnie!');
      console.log('   Można używać jako primary dla TOP 5 sklepów (80% rynku)');
    } else if (parseFloat(successRate) >= 60) {
      console.log('⚠️  GOOD - Custom crawlers działają dobrze');
      console.log('   Można używać jako backup dla TOP 5 sklepów');
    } else {
      console.log('❌ POOR - Custom crawlers wymagają poprawek');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTests().catch(console.error);
