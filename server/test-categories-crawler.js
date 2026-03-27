/**
 * TEST RÓŻNYCH KATEGORII - NICHE CRAWLER 2026
 * 
 * Testuje 3 kategorie:
 * 1. MODA - Zalando, About You, H&M, Zara, C&A
 * 2. ELEKTRONIKA - MediaMarkt, Saturn, EP, Vobis, Dixons
 * 3. NARZĘDZIA - Praxis, Gamma, Toolstation, Hornbach, Hubo
 */

require('dotenv').config();
const NicheCrawler2026 = require('./crawler/niche-crawler-2026');

const TEST_CATEGORIES = {
  moda: {
    name: 'MODA',
    product: 'Nike Air Max',
    shops: [
      { domain: 'zalando.nl', name: 'Zalando' },
      { domain: 'aboutyou.nl', name: 'About You' },
      { domain: 'hm.com/nl', name: 'H&M' },
      { domain: 'zara.com/nl', name: 'Zara' },
      { domain: 'c-and-a.com/nl', name: 'C&A' }
    ]
  },
  elektronika: {
    name: 'ELEKTRONIKA',
    product: 'Samsung TV 55 inch',
    shops: [
      { domain: 'mediamarkt.nl', name: 'MediaMarkt' },
      { domain: 'saturn.nl', name: 'Saturn' },
      { domain: 'ep.nl', name: 'EP Online' },
      { domain: 'vobis.nl', name: 'Vobis' },
      { domain: 'dixons.nl', name: 'Dixons' }
    ]
  },
  narzedzia: {
    name: 'NARZĘDZIA',
    product: 'Bosch wiertarka',
    shops: [
      { domain: 'praxis.nl', name: 'Praxis' },
      { domain: 'gamma.nl', name: 'Gamma' },
      { domain: 'toolstation.nl', name: 'Toolstation' },
      { domain: 'hornbach.nl', name: 'Hornbach' },
      { domain: 'hubo.nl', name: 'Hubo' }
    ]
  }
};

async function testCategory(crawler, category, categoryData) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST KATEGORIA: ${categoryData.name}`);
  console.log(`Product: "${categoryData.product}"`);
  console.log(`Shops: ${categoryData.shops.map(s => s.name).join(', ')}`);
  console.log('='.repeat(80));

  const startTime = Date.now();
  const results = [];

  // Test each shop
  for (const shop of categoryData.shops) {
    console.log(`\n[${category}] Testing ${shop.name}...`);
    
    try {
      const shopStartTime = Date.now();
      
      const result = await crawler.crawlShop(shop, categoryData.product);
      const duration = Date.now() - shopStartTime;
      
      results.push({
        shop: shop.name,
        domain: shop.domain,
        success: result.success,
        prices: result.prices || [],
        avgPrice: result.avgPrice || null,
        loadTime: duration,
        cached: result.cached || false,
        error: result.error || null
      });
      
      const status = result.success ? '✅' : '❌';
      const priceInfo = result.avgPrice ? `€${result.avgPrice.toFixed(2)}` : 'N/A';
      console.log(`${status} ${shop.name} - ${priceInfo} (${duration}ms)`);
      
    } catch (error) {
      results.push({
        shop: shop.name,
        domain: shop.domain,
        success: false,
        error: error.message
      });
      console.log(`❌ ${shop.name} - ERROR: ${error.message}`);
    }
    
    // Small delay between shops
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const successful = results.filter(r => r.success).length;
  const totalPrices = results.reduce((sum, r) => sum + (r.prices?.length || 0), 0);

  console.log(`\n📊 RESULTS FOR ${categoryData.name} (${duration}s):`);
  console.log(`  Total shops: ${results.length}`);
  console.log(`  Successful: ${successful}/${results.length} (${(successful/results.length*100).toFixed(1)}%)`);
  console.log(`  Total prices found: ${totalPrices}`);

  return {
    category: categoryData.name,
    product: categoryData.product,
    duration: parseFloat(duration),
    totalShops: results.length,
    successful,
    successRate: (successful/results.length*100).toFixed(1),
    totalPrices,
    results
  };
}

async function runTests() {
  console.log('\n🚀 TESTING CRAWLER - 3 CATEGORIES\n');
  console.log('Categories:');
  console.log('  1. MODA - Nike Air Max');
  console.log('  2. ELEKTRONIKA - Samsung TV 55 inch');
  console.log('  3. NARZĘDZIA - Bosch wiertarka\n');

  const crawler = new NicheCrawler2026({
    proxy: {
      enabled: process.env.USE_PROXY === 'true',
      provider: 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  const categoryResults = [];

  try {
    // Test 1: MODA
    const modaResults = await testCategory(crawler, 'moda', TEST_CATEGORIES.moda);
    categoryResults.push(modaResults);
    
    console.log('\n⏳ Waiting 5s before next category...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 2: ELEKTRONIKA
    const elektronikaResults = await testCategory(crawler, 'elektronika', TEST_CATEGORIES.elektronika);
    categoryResults.push(elektronikaResults);
    
    console.log('\n⏳ Waiting 5s before next category...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 3: NARZĘDZIA
    const narzedziaResults = await testCategory(crawler, 'narzedzia', TEST_CATEGORIES.narzedzia);
    categoryResults.push(narzedziaResults);

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY - 3 CATEGORIES');
    console.log('='.repeat(80));

    console.log('\n📋 Per Category Results:');
    categoryResults.forEach((cat, i) => {
      console.log(`\n${i+1}. ${cat.category}:`);
      console.log(`   Product: ${cat.product}`);
      console.log(`   Success rate: ${cat.successRate}% (${cat.successful}/${cat.totalShops})`);
      console.log(`   Total prices: ${cat.totalPrices}`);
      console.log(`   Duration: ${cat.duration}s`);
      
      console.log(`   Shops:`);
      cat.results.forEach(r => {
        const status = r.success ? '✅' : '❌';
        const price = r.avgPrice ? `€${r.avgPrice.toFixed(2)}` : 'N/A';
        console.log(`     ${status} ${r.shop.padEnd(20)} - ${price}`);
      });
    });

    // Best category
    const bestCategory = categoryResults.reduce((best, cat) => 
      parseFloat(cat.successRate) > parseFloat(best.successRate) ? cat : best
    );

    console.log(`\n🏆 BEST CATEGORY: ${bestCategory.category} (${bestCategory.successRate}% success rate)`);

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    const stats = crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTests().catch(console.error);
