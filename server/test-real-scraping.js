// Test real product scraping with IPRoyal proxy
require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

async function testRealScraping() {
  console.log('🧪 TESTING REAL PRODUCT SCRAPING WITH IPROYAL\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  console.log('\n📋 PROXY: IPRoyal Residential (High-end Pool, NL)\n');
  
  const products = [
    {
      name: 'iPhone 15 Pro',
      url: 'https://www.bol.com/nl/nl/s/?searchtext=iphone+15+pro',
      shop: 'Bol.com',
      selector: '.product-item__title'
    },
    {
      name: 'Samsung TV',
      url: 'https://www.coolblue.nl/zoeken?query=samsung+tv',
      shop: 'Coolblue',
      selector: '.product-card__title'
    },
    {
      name: 'MacBook Air',
      url: 'https://www.mediamarkt.nl/nl/search.html?query=macbook+air',
      shop: 'MediaMarkt',
      selector: '.product-wrapper'
    }
  ];
  
  let successCount = 0;
  let totalProducts = 0;
  
  for (const product of products) {
    try {
      console.log('='.repeat(70));
      console.log(`\n🔍 SCRAPING: ${product.name} from ${product.shop}\n`);
      console.log(`URL: ${product.url}`);
      console.log('Fetching...');
      
      const startTime = Date.now();
      const html = await fetcher.fetch(product.url);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Fetched in ${duration}ms`);
      console.log(`HTML size: ${(html.length / 1024).toFixed(2)} KB`);
      
      // Parse with cheerio
      const $ = cheerio.load(html);
      
      // Try to find products
      const productElements = $(product.selector);
      const foundProducts = productElements.length;
      
      if (foundProducts > 0) {
        console.log(`✅ Found ${foundProducts} products!`);
        
        // Show first 3 products
        console.log('\nFirst 3 products:');
        productElements.slice(0, 3).each((i, el) => {
          const title = $(el).text().trim().substring(0, 60);
          console.log(`  ${i + 1}. ${title}...`);
        });
        
        successCount++;
        totalProducts += foundProducts;
      } else {
        console.log('⚠️  No products found with selector');
        console.log('Checking page content...');
        
        // Check if page loaded
        const bodyText = $('body').text().trim();
        if (bodyText.length > 1000) {
          console.log(`✅ Page loaded (${bodyText.length} chars)`);
          console.log('⚠️  Selector might need adjustment');
        } else {
          console.log('❌ Page might be blocked or empty');
        }
      }
      
      // Check if needs JavaScript
      const needsJS = fetcher.needsJavaScript(html);
      if (needsJS) {
        console.log('⚠️  Page needs JavaScript - would use Playwright fallback');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      
      if (error.message === 'NEEDS_PLAYWRIGHT') {
        console.log('⚠️  Cloudflare detected - would use Playwright fallback');
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SCRAPING SUMMARY\n');
  console.log(`Shops tested: ${products.length}`);
  console.log(`Successful: ${successCount}/${products.length}`);
  console.log(`Total products found: ${totalProducts}`);
  console.log(`Success rate: ${((successCount / products.length) * 100).toFixed(0)}%`);
  
  const stats = fetcher.getStats();
  console.log(`\nTotal requests: ${stats.requestCount}`);
  console.log(`Proxy: ${stats.provider} (${stats.enabled ? 'enabled' : 'disabled'})`);
  
  console.log('\n' + '='.repeat(70));
  
  if (successCount === products.length) {
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('🎉 IPRoyal proxy working perfectly!');
    console.log('✅ Real product scraping successful');
    console.log('✅ Ready for production use');
  } else if (successCount > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS\n');
    console.log(`${successCount}/${products.length} shops working`);
    console.log('Some selectors might need adjustment');
  } else {
    console.log('\n❌ ALL TESTS FAILED\n');
    console.log('Check proxy configuration and selectors');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Adjust selectors for failed shops');
  console.log('   2. Add Playwright fallback for JS-heavy sites');
  console.log('   3. Integrate with market-api.js');
  console.log('   4. Enable proxy in production (USE_PROXY=true)');
  console.log('='.repeat(70));
  
  return successCount > 0;
}

testRealScraping()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
