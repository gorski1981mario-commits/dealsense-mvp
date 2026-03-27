/**
 * TEST 5 PRODUKTÓW - NICHE CRAWLER 2026
 * 
 * Testuje różne kategorie:
 * 1. AGD - Pralka Bosch
 * 2. Meble - Krzesło biurowe
 * 3. DIY - Wiertarka Makita
 * 4. Ogród - Kosiarka elektryczna
 * 5. Elektronika - Samsung Galaxy S24
 */

require('dotenv').config();
const NicheCrawler2026 = require('./crawler/niche-crawler-2026');

const TEST_PRODUCTS = [
  {
    name: 'Pralka Bosch',
    query: 'pralka Bosch',
    expectedCategory: 'AGD/RTV',
    expectedShops: ['BCC', 'Expert', 'Kijkshop']
  },
  {
    name: 'Krzesło biurowe',
    query: 'krzesło biurowe',
    expectedCategory: 'Meble',
    expectedShops: ['Fonq', 'Leen Bakker', 'Kwantum']
  },
  {
    name: 'Wiertarka Makita',
    query: 'wiertarka Makita',
    expectedCategory: 'DIY',
    expectedShops: ['Praxis', 'Gamma', 'Karwei']
  },
  {
    name: 'Kosiarka elektryczna',
    query: 'kosiarka elektryczna',
    expectedCategory: 'Ogród',
    expectedShops: ['Intratuin', 'Tuincentrum', 'GroenRijk']
  },
  {
    name: 'Samsung Galaxy S24',
    query: 'Samsung Galaxy S24',
    expectedCategory: 'Elektronika',
    expectedShops: ['Paradigit', 'Informatique', 'Alternate']
  }
];

async function testProduct(crawler, product, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST ${index + 1}/5: ${product.name}`);
  console.log(`Query: "${product.query}"`);
  console.log(`Expected category: ${product.expectedCategory}`);
  console.log(`Expected shops: ${product.expectedShops.join(', ')}`);
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    const results = await crawler.crawlOnDemand(product.query);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Analyze results
    const successful = results.filter(r => r.success && !r.cached).length;
    const cached = results.filter(r => r.cached).length;
    const failed = results.filter(r => !r.success).length;
    const blacklisted = results.filter(r => r.blacklisted).length;

    const prices = results
      .filter(r => r.success && r.avgPrice)
      .map(r => r.avgPrice);

    const avgPrice = prices.length > 0
      ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
      : 'N/A';

    const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : 'N/A';
    const maxPrice = prices.length > 0 ? Math.max(...prices).toFixed(2) : 'N/A';

    console.log(`\n📊 RESULTS (${duration}s):`);
    console.log(`  Total shops: ${results.length}`);
    console.log(`  Successful: ${successful} (${(successful/results.length*100).toFixed(1)}%)`);
    console.log(`  Cached: ${cached}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Blacklisted: ${blacklisted}`);
    console.log(`  Prices found: ${prices.length}`);
    if (prices.length > 0) {
      console.log(`  Price range: €${minPrice} - €${maxPrice}`);
      console.log(`  Avg price: €${avgPrice}`);
    }

    console.log('\n📋 DETAILED RESULTS:');
    results.forEach((r, i) => {
      const status = r.success ? '✅' : '❌';
      const cached = r.cached ? '💾' : '🌐';
      const blacklisted = r.blacklisted ? '🚫' : '';
      const price = r.avgPrice ? `€${r.avgPrice.toFixed(2)}` : 'N/A';
      const time = r.loadTime ? `${r.loadTime}ms` : '';
      
      console.log(`  ${i+1}. ${status} ${cached} ${blacklisted} ${r.shop.padEnd(25)} - ${price.padEnd(10)} ${time}`);
    });

    return {
      product: product.name,
      query: product.query,
      duration: parseFloat(duration),
      totalShops: results.length,
      successful,
      cached,
      failed,
      blacklisted,
      pricesFound: prices.length,
      avgPrice: prices.length > 0 ? parseFloat(avgPrice) : null,
      minPrice: prices.length > 0 ? parseFloat(minPrice) : null,
      maxPrice: prices.length > 0 ? parseFloat(maxPrice) : null
    };

  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    return {
      product: product.name,
      query: product.query,
      error: error.message,
      duration: ((Date.now() - startTime) / 1000).toFixed(2)
    };
  }
}

async function runTests() {
  console.log('\n🚀 TESTING 5 PRODUCTS - NICHE CRAWLER 2026\n');
  console.log('Products:');
  TEST_PRODUCTS.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.name} (${p.expectedCategory})`);
  });

  const crawler = new NicheCrawler2026({
    proxy: {
      enabled: process.env.USE_PROXY === 'true',
      provider: 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  const allResults = [];

  try {
    for (let i = 0; i < TEST_PRODUCTS.length; i++) {
      const result = await testProduct(crawler, TEST_PRODUCTS[i], i);
      allResults.push(result);

      // Delay between tests
      if (i < TEST_PRODUCTS.length - 1) {
        console.log('\n⏳ Waiting 3s before next test...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY - 5 PRODUCTS TEST');
    console.log('='.repeat(80));

    const totalDuration = allResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    const avgDuration = (totalDuration / allResults.length).toFixed(2);
    const totalSuccessful = allResults.reduce((sum, r) => sum + (r.successful || 0), 0);
    const totalShops = allResults.reduce((sum, r) => sum + (r.totalShops || 0), 0);
    const totalPrices = allResults.reduce((sum, r) => sum + (r.pricesFound || 0), 0);
    const successRate = totalShops > 0 ? (totalSuccessful / totalShops * 100).toFixed(1) : 0;

    console.log(`\nOverall Performance:`);
    console.log(`  Total duration: ${totalDuration.toFixed(2)}s`);
    console.log(`  Avg per product: ${avgDuration}s`);
    console.log(`  Total shops tested: ${totalShops}`);
    console.log(`  Successful: ${totalSuccessful} (${successRate}%)`);
    console.log(`  Total prices found: ${totalPrices}`);

    console.log('\n📋 Per Product Summary:');
    allResults.forEach((r, i) => {
      const status = r.successful > 0 ? '✅' : '❌';
      const successRate = r.totalShops > 0 ? (r.successful / r.totalShops * 100).toFixed(1) : 0;
      
      console.log(`${i+1}. ${status} ${r.product.padEnd(25)} - ${r.duration}s, ${r.successful}/${r.totalShops} shops (${successRate}%), ${r.pricesFound} prices`);
      
      if (r.avgPrice) {
        console.log(`   Price range: €${r.minPrice} - €${r.maxPrice} (avg €${r.avgPrice})`);
      }
    });

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    const stats = crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n🎯 VERDICT:');
    if (successRate >= 80) {
      console.log('✅ EXCELLENT - Crawler działa świetnie!');
    } else if (successRate >= 60) {
      console.log('⚠️  GOOD - Crawler działa dobrze');
    } else if (successRate >= 40) {
      console.log('⚠️  MODERATE - Crawler wymaga poprawek');
    } else {
      console.log('❌ POOR - Crawler ma problemy');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTests().catch(console.error);
