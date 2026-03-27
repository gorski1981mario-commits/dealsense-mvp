/**
 * TEST BOL.COM ONLY
 * 
 * Skupiamy się tylko na Bol.com - sprawdzamy dlaczego nie działa
 */

require('dotenv').config();
const SmartCrawler2026 = require('./crawler/smart-crawler-2026');

async function testBolOnly() {
  console.log('\n🧪 TESTING BOL.COM ONLY\n');
  console.log('Product: Samsung Galaxy S24');
  console.log('URL: https://www.bol.com/nl/nl/s/?searchtext=Samsung%20Galaxy%20S24\n');

  const crawler = new SmartCrawler2026({
    proxy: {
      enabled: false
    }
  });

  try {
    console.log('[Test] Opening Bol.com...\n');
    
    const result = await crawler.crawlShop('bol.com', 'Samsung Galaxy S24');
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULT');
    console.log('='.repeat(80));
    
    if (result.success) {
      console.log(`\n✅ SUCCESS!`);
      console.log(`Prices found: ${result.prices.length}`);
      console.log(`Average price: €${result.avgPrice.toFixed(2)}`);
      console.log(`\nAll prices:`);
      result.prices.forEach((price, i) => {
        console.log(`  ${i+1}. €${price.toFixed(2)}`);
      });
    } else {
      console.log(`\n❌ FAILED`);
      console.log(`Error: ${result.error || 'No prices found'}`);
      
      // Check if HTML was logged
      const queue = await crawler.getReviewQueue();
      if (queue.length > 0) {
        console.log(`\n📝 HTML logged to: ${queue[0].logFile}`);
        console.log(`\nAnalyze the HTML to see why prices weren't found.`);
      }
    }

    // Crawler stats
    console.log('\n📈 Crawler Statistics:');
    console.log(JSON.stringify(crawler.getStats(), null, 2));

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

testBolOnly().catch(console.error);
