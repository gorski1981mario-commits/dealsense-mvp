/**
 * TEST PRODUCTION CRAWLER
 * 
 * Test all 7 modules working together:
 * 1. Redis Priority Queue
 * 2. Batch Concurrent (30 parallel)
 * 3. Cache Delta (60-70% savings)
 * 4. Smart Proxy Rotation
 * 5. Quality Control
 * 6. Ultra-light Playwright
 * 7. Fallback & Blacklist
 */

require('dotenv').config();
const ProductionCrawler = require('./crawler/production-crawler');

// Test domains (mix of giants and niche)
const TEST_DOMAINS = [
  'bol.com',
  'coolblue.nl',
  'mediamarkt.nl',
  'informatique.nl',
  'paradigit.nl',
  'alternate.nl',
  'azerty.nl',
  'megekko.nl',
  'yourbuild.nl',
  'hobo.nl'
];

async function runTest() {
  console.log('\n🚀 TESTING PRODUCTION CRAWLER\n');
  
  const crawler = new ProductionCrawler({
    concurrency: 20, // MAX 20-25 (chroni proxy przed spaleniem)
    timeout: 5000, // 5s max per domain (ultra-fast)
    proxy: {
      enabled: process.env.USE_PROXY === 'true',
      provider: process.env.PROXY_PROVIDER || 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  try {
    // Test product
    const product = 'Samsung Galaxy S24 Ultra';
    
    console.log(`Product: ${product}`);
    console.log(`Domains: ${TEST_DOMAINS.length}`);
    console.log(`Concurrency: 20 (MAX 20-25 chroni proxy)`);
    console.log(`Proxy: ${process.env.USE_PROXY === 'true' ? 'ENABLED' : 'DISABLED'}\n`);
    
    // Track live scan (increases priority)
    await crawler.trackLiveScan(product);
    
    // Run crawl
    const results = await crawler.crawl(product, TEST_DOMAINS);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:\n');
    results.forEach((result, i) => {
      const status = result.success ? '✅' : '❌';
      const cached = result.cached ? '💾' : '🌐';
      const offers = result.offers?.length || 0;
      
      console.log(`${i+1}. ${status} ${cached} ${result.domain.padEnd(25)} - ${offers} offers`);
    });
    
    // Final stats
    console.log('\n📊 FINAL STATISTICS:\n');
    const stats = await crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTest().catch(console.error);
