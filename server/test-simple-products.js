// Test simple product pages (non-JS) with IPRoyal
require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

async function testSimpleProducts() {
  console.log('🧪 TESTING SIMPLE PRODUCT PAGES (NON-JS)\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  console.log('\n📋 PROXY: IPRoyal Residential\n');
  
  // Test with simple product pages (server-side rendered)
  const products = [
    {
      name: 'Bol.com Product Page',
      url: 'https://www.bol.com/nl/nl/p/apple-iphone-15-128-gb-zwart/9300000133538106/',
      priceSelector: '.promo-price, .price, [data-test="price"]',
      titleSelector: 'h1, .product-title, [data-test="title"]'
    },
    {
      name: 'Amazon.nl Product',
      url: 'https://www.amazon.nl/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY',
      priceSelector: '.a-price-whole, #priceblock_ourprice',
      titleSelector: '#productTitle, h1'
    }
  ];
  
  let successCount = 0;
  
  for (const product of products) {
    try {
      console.log('='.repeat(70));
      console.log(`\n🔍 ${product.name}\n`);
      console.log(`URL: ${product.url}`);
      console.log('Fetching...');
      
      const startTime = Date.now();
      const html = await fetcher.fetch(product.url);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Fetched in ${duration}ms`);
      console.log(`HTML size: ${(html.length / 1024).toFixed(2)} KB`);
      
      const $ = cheerio.load(html);
      
      // Try to find title
      const title = $(product.titleSelector).first().text().trim();
      if (title) {
        console.log(`✅ Title: ${title.substring(0, 60)}...`);
      } else {
        console.log('⚠️  Title not found');
      }
      
      // Try to find price
      const price = $(product.priceSelector).first().text().trim();
      if (price) {
        console.log(`✅ Price: ${price}`);
      } else {
        console.log('⚠️  Price not found');
      }
      
      if (title || price) {
        console.log('✅ Product data extracted!');
        successCount++;
      } else {
        console.log('❌ No product data found');
        
        // Show what we got
        const bodyText = $('body').text().trim().substring(0, 200);
        console.log(`\nPage preview: ${bodyText}...`);
      }
      
      const needsJS = fetcher.needsJavaScript(html);
      console.log(`Needs JavaScript: ${needsJS ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESULTS\n');
  console.log(`Success: ${successCount}/${products.length}`);
  console.log(`Success rate: ${((successCount / products.length) * 100).toFixed(0)}%`);
  
  if (successCount > 0) {
    console.log('\n✅ IPRoyal PROXY WORKING FOR PRODUCT SCRAPING!');
    console.log('✅ Can extract product data through proxy');
    console.log('✅ Ready for crawler integration');
  }
  
  console.log('='.repeat(70));
  
  return successCount > 0;
}

testSimpleProducts()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
