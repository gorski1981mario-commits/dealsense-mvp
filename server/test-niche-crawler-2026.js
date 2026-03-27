/**
 * TEST NICHE CRAWLER 2026
 * 
 * Test on-demand i baseline crawl
 */

require('dotenv').config();
const NicheCrawler2026 = require('./crawler/niche-crawler-2026');

async function testOnDemand() {
  console.log('\n🚀 TEST 1: ON-DEMAND CRAWL\n');
  
  const crawler = new NicheCrawler2026({
    proxy: {
      enabled: process.env.USE_PROXY === 'true',
      provider: 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  try {
    // User searches "pralka Bosch"
    console.log('User query: "pralka Bosch"');
    console.log('Expected: 3-5 AGD/RTV shops\n');
    
    const results = await crawler.crawlOnDemand('pralka Bosch');
    
    console.log('\n📊 RESULTS:');
    results.forEach((r, i) => {
      const status = r.success ? '✅' : '❌';
      const cached = r.cached ? '💾' : '🌐';
      console.log(`${i+1}. ${status} ${cached} ${r.shop} - ${r.avgPrice ? '€' + r.avgPrice.toFixed(2) : 'N/A'} (${r.loadTime || 0}ms)`);
    });
    
    console.log('\n📈 STATS:');
    console.log(JSON.stringify(crawler.getStats(), null, 2));
    
  } finally {
    await crawler.close();
  }
}

async function testBaseline() {
  console.log('\n🚀 TEST 2: BASELINE CRAWL\n');
  
  const crawler = new NicheCrawler2026({
    proxy: {
      enabled: process.env.USE_PROXY === 'true',
      provider: 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  try {
    console.log('Baseline crawl (top priority shops)');
    console.log('Expected: ~50 shops, 4-6h interval\n');
    
    const results = await crawler.crawlBaseline();
    
    console.log('\n📊 RESULTS:');
    const successful = results.filter(r => r.success).length;
    const cached = results.filter(r => r.cached).length;
    
    console.log(`Total: ${results.length}`);
    console.log(`Successful: ${successful} (${(successful/results.length*100).toFixed(1)}%)`);
    console.log(`Cached: ${cached} (${(cached/results.length*100).toFixed(1)}%)`);
    
    console.log('\n📈 STATS:');
    console.log(JSON.stringify(crawler.getStats(), null, 2));
    
  } finally {
    await crawler.close();
  }
}

async function runTests() {
  try {
    // Test 1: On-demand
    await testOnDemand();
    
    // Wait 5s
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 2: Baseline
    await testBaseline();
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

runTests().catch(console.error);
