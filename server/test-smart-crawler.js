/**
 * TEST SMART CRAWLER - Z PARSERAMI
 * 
 * Testuje top 10 sklepów z dedykowanymi parserami
 */

require('dotenv').config();
const SmartCrawler2026 = require('./crawler/smart-crawler-2026');

const TOP_10_SHOPS = [
  'bol.com',
  'coolblue.nl',
  'mediamarkt.nl',
  'bcc.nl',
  'fonq.nl',
  'blokker.nl',
  'praxis.nl',
  'intratuin.nl',
  'wehkamp.nl',
  'zalando.nl'
];

async function runTest() {
  console.log('\n🚀 TESTING SMART CRAWLER - TOP 10 SHOPS\n');
  console.log('Product: Samsung Galaxy S24');
  console.log(`Shops: ${TOP_10_SHOPS.length}\n`);
  
  const crawler = new SmartCrawler2026({
    proxy: {
      enabled: false
    }
  });

  const results = [];

  try {
    for (const domain of TOP_10_SHOPS) {
      console.log(`\n[Test] ${domain}...`);
      
      const result = await crawler.crawlShop(domain, 'Samsung Galaxy S24');
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const price = result.avgPrice ? `€${result.avgPrice.toFixed(2)}` : 'N/A';
      console.log(`${status} ${domain} - ${price}`);
      
      // Delay between shops
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTS');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const successRate = (successful / results.length * 100).toFixed(1);

    console.log(`\nSuccess rate: ${successRate}% (${successful}/${results.length})`);
    console.log(`\nSuccessful shops:`);
    results.filter(r => r.success).forEach(r => {
      console.log(`  ✅ ${r.domain} - €${r.avgPrice.toFixed(2)} (${r.prices.length} prices)`);
    });

    console.log(`\nFailed shops:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.domain} - ${r.error || 'No prices'}`);
    });

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    console.log(JSON.stringify(crawler.getStats(), null, 2));

    // Manual review queue
    console.log('\n📋 Manual Review Queue:');
    const queue = await crawler.getReviewQueue();
    if (queue.length > 0) {
      queue.forEach(item => {
        console.log(`  - ${item.domain} (${item.attempts} attempts) - ${item.logFile}`);
      });
    } else {
      console.log('  (empty)');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTest().catch(console.error);
