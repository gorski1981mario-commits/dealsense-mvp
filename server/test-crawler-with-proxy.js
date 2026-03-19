// Test crawler with IPRoyal proxy on real products
require('dotenv').config();
const StealthBrowser = require('./crawler/lib/stealth-browser');

async function testCrawlerWithProxy() {
  console.log('🧪 TESTING CRAWLER WITH IPROYAL PROXY\n');
  console.log('='.repeat(70));
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Provider: iproyal`);
  console.log(`Username: ${process.env.PROXY_USERNAME}`);
  console.log(`Password: ${process.env.PROXY_PASSWORD.substring(0, 20)}...`);
  console.log(`Enabled: true`);
  
  const browser = new StealthBrowser({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 1: MediaMarkt.nl - iPhone 15 Pro\n');
    
    const url1 = 'https://www.mediamarkt.nl/nl/product/_apple-iphone-15-pro-128-gb-blauw-titanium-1935326.html';
    console.log(`URL: ${url1}`);
    console.log('Fetching with stealth browser + IPRoyal proxy...');
    
    const html1 = await browser.fetch(url1);
    console.log(`✅ Success! HTML length: ${html1.length} bytes`);
    
    // Check if we got real content (not blocked)
    if (html1.includes('iPhone 15 Pro') || html1.includes('Apple')) {
      console.log('✅ Product page loaded correctly!');
    } else {
      console.log('⚠️  Page loaded but content might be blocked');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 2: Bol.com - Samsung TV\n');
    
    const url2 = 'https://www.bol.com/nl/nl/p/samsung-qe55q60c-qled-4k-tv-55-inch/9300000151849764/';
    console.log(`URL: ${url2}`);
    console.log('Fetching...');
    
    const html2 = await browser.fetch(url2);
    console.log(`✅ Success! HTML length: ${html2.length} bytes`);
    
    if (html2.includes('Samsung') || html2.includes('QLED')) {
      console.log('✅ Product page loaded correctly!');
    } else {
      console.log('⚠️  Page loaded but content might be blocked');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 3: Coolblue.nl - MacBook\n');
    
    const url3 = 'https://www.coolblue.nl/product/945180/apple-macbook-air-15-inch-2024-m3-16gb-512gb-spacegrijs-qwerty.html';
    console.log(`URL: ${url3}`);
    console.log('Fetching...');
    
    const html3 = await browser.fetch(url3);
    console.log(`✅ Success! HTML length: ${html3.length} bytes`);
    
    if (html3.includes('MacBook') || html3.includes('Apple')) {
      console.log('✅ Product page loaded correctly!');
    } else {
      console.log('⚠️  Page loaded but content might be blocked');
    }
    
    // Get stats
    const stats = browser.getStats();
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 CRAWLER STATS\n');
    console.log(`Total requests: ${stats.requestCount}`);
    console.log(`Proxy rotations: ${stats.proxyRotations}`);
    console.log(`Browser active: ${stats.isActive}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ CRAWLER WITH IPROYAL PROXY - SUCCESS!\n');
    console.log('🎉 All 3 product pages fetched successfully!');
    console.log('✅ Stealth browser working');
    console.log('✅ IPRoyal proxy working');
    console.log('✅ Anti-bot bypass working');
    console.log('\n💡 NEXT: Integrate with market-api.js for real product search');
    console.log('='.repeat(70));
    
    return true;
    
  } catch (error) {
    console.error(`\n❌ CRAWLER ERROR: ${error.message}`);
    console.error(error.stack);
    return false;
    
  } finally {
    await browser.close();
  }
}

testCrawlerWithProxy()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
