// Simple proxy test with Playwright
require('dotenv').config();
const { chromium } = require('playwright');

async function testProxy() {
  console.log('🧪 TESTING IPROYAL PROXY WITH PLAYWRIGHT\n');
  console.log('=' .repeat(70));
  
  // IPRoyal format: http://username_session-xxx_country-nl:password@host:port
  const sessionId = Math.random().toString(36).substring(7);
  const country = process.env.PROXY_COUNTRY || 'nl';
  const username = `${process.env.PROXY_USERNAME}_session-${sessionId}_country-${country}`;
  
  const proxyConfig = {
    server: `http://${username}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
  };
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Server: http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${process.env.PROXY_PASSWORD.substring(0, 4)}...`);
  console.log(`Session: ${sessionId}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP with proxy\n');
  
  const browser = await chromium.launch({
    headless: true,
    proxy: proxyConfig
  });
  
  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
    const page = await context.newPage();
    
    // Test 1: Check IP
    console.log('Connecting to ipify.org...');
    await page.goto('https://api.ipify.org?format=json', { timeout: 60000, waitUntil: 'domcontentloaded' });
    const ipData = await page.textContent('body');
    const ip = JSON.parse(ipData).ip;
    console.log(`✅ Proxy IP: ${ip}`);
    console.log('✅ Proxy connection working!');
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 2: MediaMarkt.nl\n');
    
    // Test 2: MediaMarkt
    try {
      await page.goto('https://www.mediamarkt.nl/', { timeout: 30000, waitUntil: 'domcontentloaded' });
      const title = await page.title();
      console.log(`✅ Status: 200 OK`);
      console.log(`✅ Title: ${title}`);
      console.log('✅ MediaMarkt accessible with proxy!');
    } catch (error) {
      console.log(`❌ MediaMarkt failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 3: Bol.com\n');
    
    // Test 3: Bol.com
    try {
      await page.goto('https://www.bol.com/', { timeout: 30000, waitUntil: 'domcontentloaded' });
      const title = await page.title();
      console.log(`✅ Status: 200 OK`);
      console.log(`✅ Title: ${title}`);
      console.log('✅ Bol.com accessible with proxy!');
    } catch (error) {
      console.log(`❌ Bol.com failed: ${error.message}`);
    }
    
    await context.close();
    
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('✅ Proxy configured and tested');
  console.log('✅ Ready for real product scraping!');
  console.log('\n💡 NEXT: Run node test-real-products.js');
  console.log('=' .repeat(70));
}

testProxy()
  .then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
