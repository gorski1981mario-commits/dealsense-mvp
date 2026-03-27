/**
 * TEST CRAWLER - RÓŻNE KATEGORIE
 * 
 * Sprawdzamy:
 * 1. Ile cen wyciąga z Coolblue i MediaMarkt
 * 2. Czy działa na modzie (Zalando, H&M, About You)
 * 3. Czy działa na narzędziach (Praxis, Gamma)
 * 4. Czy działa na innych kategoriach (meble, AGD, ogród)
 */

require('dotenv').config();
const SmartCrawler2026 = require('./crawler/smart-crawler-2026');

const TESTS = [
  {
    category: 'ELEKTRONIKA',
    shops: ['coolblue.nl', 'mediamarkt.nl'],
    products: [
      'Samsung Galaxy S24',
      'iPhone 15 Pro',
      'Sony WH-1000XM5'
    ]
  },
  {
    category: 'MODA',
    shops: ['zalando.nl', 'aboutyou.nl'],
    products: [
      'Nike Air Max',
      'Levi\'s jeans',
      'Adidas sneakers'
    ]
  },
  {
    category: 'NARZĘDZIA',
    shops: ['praxis.nl', 'gamma.nl'],
    products: [
      'Bosch wiertarka',
      'Makita akumulatorowa',
      'DeWalt młotek'
    ]
  },
  {
    category: 'MEBLE',
    shops: ['fonq.nl'],
    products: [
      'Krzesło biurowe',
      'Stół drewniany',
      'Szafa IKEA'
    ]
  }
];

async function testShopCategory(crawler, shop, product) {
  try {
    const result = await crawler.crawlShop(shop, product);
    
    return {
      shop,
      product,
      success: result.success,
      pricesCount: result.prices?.length || 0,
      avgPrice: result.avgPrice || null,
      prices: result.prices || []
    };
  } catch (error) {
    return {
      shop,
      product,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🧪 TESTING CRAWLER - RÓŻNE KATEGORIE\n');
  console.log('='.repeat(80));

  const crawler = new SmartCrawler2026({
    proxy: { enabled: false }
  });

  const allResults = [];

  try {
    for (const test of TESTS) {
      console.log(`\n\n📦 KATEGORIA: ${test.category}`);
      console.log('='.repeat(80));

      const categoryResults = [];

      for (const shop of test.shops) {
        for (const product of test.products) {
          console.log(`\n[Test] ${shop} - ${product}`);
          
          const result = await testShopCategory(crawler, shop, product);
          categoryResults.push(result);
          
          const status = result.success ? '✅' : '❌';
          const priceInfo = result.success 
            ? `${result.pricesCount} prices, avg €${result.avgPrice?.toFixed(2)}`
            : 'Failed';
          
          console.log(`${status} ${priceInfo}`);
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Category summary
      const successful = categoryResults.filter(r => r.success).length;
      const totalPrices = categoryResults.reduce((sum, r) => sum + r.pricesCount, 0);
      
      console.log(`\n📊 ${test.category} Summary:`);
      console.log(`  Success: ${successful}/${categoryResults.length} tests`);
      console.log(`  Total prices found: ${totalPrices}`);
      
      allResults.push({
        category: test.category,
        results: categoryResults,
        successRate: (successful / categoryResults.length * 100).toFixed(1)
      });
    }

    // Final summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY - ALL CATEGORIES');
    console.log('='.repeat(80));

    allResults.forEach(cat => {
      console.log(`\n${cat.category}:`);
      console.log(`  Success rate: ${cat.successRate}%`);
      
      const workingShops = [...new Set(
        cat.results.filter(r => r.success).map(r => r.shop)
      )];
      
      if (workingShops.length > 0) {
        console.log(`  Working shops: ${workingShops.join(', ')}`);
      }
      
      const totalPrices = cat.results.reduce((sum, r) => sum + r.pricesCount, 0);
      console.log(`  Total prices: ${totalPrices}`);
    });

    // Best category
    const bestCategory = allResults.reduce((best, cat) => 
      parseFloat(cat.successRate) > parseFloat(best.successRate) ? cat : best
    );

    console.log(`\n🏆 BEST CATEGORY: ${bestCategory.category} (${bestCategory.successRate}% success)`);

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
