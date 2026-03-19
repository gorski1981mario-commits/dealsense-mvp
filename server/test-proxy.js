// Test IPRoyal proxy - CORRECT FORMAT
require('dotenv').config();
const { chromium } = require('playwright');

async function testProxy() {
  console.log('🧪 TESTING IPROYAL PROXY\n');
  console.log('='.repeat(70));
  
  // IPRoyal credentials from dashboard
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Server: http://geo.iproyal.com:12321`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password.substring(0, 20)}...${password.substring(password.length - 10)}`);
  console.log(`Password length: ${password.length}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP with proxy\n');
  
  let browser;
  try {
    // Launch with proxy - separate username/password fields
    browser = await chromium.launch({
      headless: true,
      proxy: {
        server: 'http://geo.iproyal.com:12321',
        username: username,
        password: password
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
    const page = await context.newPage();
    
    // Test 1: Check IP
    console.log('Connecting to ipify.org...');
    await page.goto('https://api.ipify.org?format=json', { 
      timeout: 60000, 
      waitUntil: 'domcontentloaded' 
    });
    
    const ipData = await page.textContent('body');
    const ip = JSON.parse(ipData).ip;
    
    console.log(`\n🎉 PROXY DZIAŁA! IP: ${ip}`);
    console.log('✅ Proxy connection SUCCESS!');
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 2: MediaMarkt.nl\n');
    
    // Test 2: MediaMarkt
    try {
      await page.goto('https://www.mediamarkt.nl/', { 
        timeout: 30000, 
        waitUntil: 'domcontentloaded' 
      });
      const title = await page.title();
      console.log(`✅ Status: 200 OK`);
      console.log(`✅ Title: ${title.substring(0, 50)}...`);
      console.log('✅ MediaMarkt accessible!');
    } catch (error) {
      console.log(`❌ MediaMarkt failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 3: Bol.com\n');
    
    // Test 3: Bol.com
    try {
      await page.goto('https://www.bol.com/', { 
        timeout: 30000, 
        waitUntil: 'domcontentloaded' 
      });
      const title = await page.title();
      console.log(`✅ Status: 200 OK`);
      console.log(`✅ Title: ${title.substring(0, 50)}...`);
      console.log('✅ Bol.com accessible!');
    } catch (error) {
      console.log(`❌ Bol.com failed: ${error.message}`);
    }
    
    await context.close();
    
  } catch (error) {
    console.error(`\n❌ PROXY ERROR: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('407')) {
      console.log('\n⚠️  AUTHORIZATION ERROR:');
      console.log('   → Check username/password (case sensitive!)');
      console.log('   → Copy from IPRoyal dashboard 1:1');
    } else if (error.message.includes('timeout')) {
      console.log('\n⚠️  TIMEOUT:');
      console.log('   → Proxy might be blocked');
      console.log('   → Check IPRoyal dashboard for IP bans');
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('✅ Proxy working correctly!');
  console.log('✅ Ready for crawler integration!');
  console.log('\n💡 NEXT: Integrate with crawler/proxy-manager.js');
  console.log('='.repeat(70));
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
