/**
 * TEST MAŁYCH NISZOWYCH SKLEPÓW
 * 
 * Skupiamy się na małych sklepach bez zaawansowanego anti-bot
 * Różne branże: elektronika, moda, dom, ogród, narzędzia, sport
 */

require('dotenv').config();
const SmartCrawler2026 = require('./crawler/smart-crawler-2026');

// MAŁE NISZOWE SKLEPY - różne branże
const NICHE_SHOPS = [
  // Elektronika niszowa
  { domain: 'alternate.nl', product: 'Samsung Galaxy S24', category: 'Elektronika' },
  { domain: 'azerty.nl', product: 'iPhone 15', category: 'Elektronika' },
  { domain: 'megekko.nl', product: 'Sony WH-1000XM5', category: 'Elektronika' },
  
  // Moda niszowa
  { domain: 'aboutyou.nl', product: 'Nike Air Max', category: 'Moda' },
  { domain: 'omoda.nl', product: 'Sneakers', category: 'Moda' },
  { domain: 'vanharen.nl', product: 'Schoenen', category: 'Moda' },
  
  // Dom & Ogród
  { domain: 'karwei.nl', product: 'Verfroller', category: 'Dom' },
  { domain: 'hornbach.nl', product: 'Boormachine', category: 'Dom' },
  { domain: 'tuincentrum.nl', product: 'Bloempot', category: 'Ogród' },
  
  // Sport
  { domain: 'decathlon.nl', product: 'Fiets', category: 'Sport' },
  { domain: 'bever.nl', product: 'Rugzak', category: 'Sport' },
  
  // Książki & Media
  { domain: 'bruna.nl', product: 'Harry Potter', category: 'Książki' },
  
  // Zabawki
  { domain: 'intertoys.nl', product: 'LEGO', category: 'Zabawki' }
];

async function testNicheShop(crawler, shop) {
  console.log(`\n[Test] ${shop.domain} (${shop.category})`);
  console.log(`Product: ${shop.product}`);
  
  try {
    const result = await crawler.crawlShop(shop.domain, shop.product);
    
    const status = result.success ? '✅' : '❌';
    const priceInfo = result.success 
      ? `${result.prices.length} prices, avg €${result.avgPrice.toFixed(2)}`
      : 'Failed';
    
    console.log(`${status} ${priceInfo}`);
    
    return {
      ...shop,
      success: result.success,
      pricesCount: result.prices?.length || 0,
      avgPrice: result.avgPrice || null
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      ...shop,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🧪 TESTING MAŁYCH NISZOWYCH SKLEPÓW\n');
  console.log('Focus: Małe sklepy BEZ zaawansowanego anti-bot');
  console.log(`Total shops: ${NICHE_SHOPS.length}`);
  console.log(`Categories: ${[...new Set(NICHE_SHOPS.map(s => s.category))].join(', ')}\n`);
  console.log('='.repeat(80));

  const crawler = new SmartCrawler2026({
    proxy: { enabled: false }
  });

  const results = [];

  try {
    for (const shop of NICHE_SHOPS) {
      const result = await testNicheShop(crawler, shop);
      results.push(result);
      
      // Delay between shops
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS - NISZOWE SKLEPY');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const successRate = (successful / results.length * 100).toFixed(1);
    const totalPrices = results.reduce((sum, r) => sum + r.pricesCount, 0);

    console.log(`\nSuccess rate: ${successRate}% (${successful}/${results.length})`);
    console.log(`Total prices found: ${totalPrices}`);

    // Per category
    const categories = [...new Set(results.map(r => r.category))];
    
    console.log('\n📋 Per Category:');
    categories.forEach(cat => {
      const catResults = results.filter(r => r.category === cat);
      const catSuccess = catResults.filter(r => r.success).length;
      const catRate = (catSuccess / catResults.length * 100).toFixed(1);
      
      console.log(`\n${cat}:`);
      console.log(`  Success: ${catRate}% (${catSuccess}/${catResults.length})`);
      
      catResults.forEach(r => {
        const status = r.success ? '✅' : '❌';
        const info = r.success ? `${r.pricesCount} prices (€${r.avgPrice.toFixed(2)})` : 'Failed';
        console.log(`    ${status} ${r.domain.padEnd(20)} - ${info}`);
      });
    });

    // Working shops list
    const workingShops = results.filter(r => r.success);
    
    if (workingShops.length > 0) {
      console.log('\n✅ WORKING NICHE SHOPS:');
      workingShops.forEach(s => {
        console.log(`  - ${s.domain} (${s.category}) - ${s.pricesCount} prices`);
      });
    }

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    const stats = crawler.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n🎯 VERDICT:');
    if (parseFloat(successRate) >= 60) {
      console.log(`✅ EXCELLENT! ${successRate}% niszowych sklepów działa!`);
      console.log(`   Małe sklepy BEZ anti-bot są łatwiejsze do crawlowania`);
      console.log(`   Można używać jako primary dla niszowych produktów`);
    } else if (parseFloat(successRate) >= 40) {
      console.log(`⚠️  GOOD! ${successRate}% niszowych sklepów działa`);
      console.log(`   Lepiej niż duże sklepy (40% vs 20%)`);
      console.log(`   Można używać jako backup dla niszowych produktów`);
    } else {
      console.log(`❌ POOR! Tylko ${successRate}% działa`);
      console.log(`   Nawet małe sklepy mają problemy`);
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

runTests().catch(console.error);
