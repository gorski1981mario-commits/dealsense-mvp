// Test easier shops without heavy anti-bot
const { chromium } = require('playwright');

async function testEasyShops() {
  console.log('🧪 Testing easier NL shops (no Cloudflare)...\n');
  
  const shopsToTest = [
    { name: 'Beslist.nl', url: 'https://www.beslist.nl/products/search?searchfor=iPhone+15' },
    { name: 'Kieskeurig.nl', url: 'https://www.kieskeurig.nl/zoeken/?q=iPhone+15' },
    { name: 'Tweakers Pricewatch', url: 'https://tweakers.net/pricewatch/zoeken/?keyword=iPhone+15' }
  ];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'nl-NL'
  });
  
  const results = [];
  
  for (const shop of shopsToTest) {
    try {
      console.log(`\n📡 Testing ${shop.name}...`);
      const page = await context.newPage();
      
      await page.goto(shop.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const content = await page.content();
      
      if (content.includes('403') || content.includes('Access Denied')) {
        console.log(`❌ ${shop.name}: 403 Forbidden`);
        results.push({ shop: shop.name, status: 'blocked' });
      } else if (content.includes('Cloudflare')) {
        console.log(`❌ ${shop.name}: Cloudflare detected`);
        results.push({ shop: shop.name, status: 'cloudflare' });
      } else {
        // Try to find prices
        const prices = await page.evaluate(() => {
          const priceElements = document.querySelectorAll('[class*="price"], [class*="prijs"]');
          const found = [];
          priceElements.forEach((el, i) => {
            if (i < 3) {
              const text = el.textContent.trim();
              if (text.match(/€?\s*\d+[.,]\d+/)) {
                found.push(text);
              }
            }
          });
          return found;
        });
        
        if (prices.length > 0) {
          console.log(`✅ ${shop.name}: SUCCESS! Found ${prices.length} prices`);
          console.log(`   Prices: ${prices.join(', ')}`);
          results.push({ shop: shop.name, status: 'success', prices });
        } else {
          console.log(`⚠️  ${shop.name}: Loaded but no prices found`);
          results.push({ shop: shop.name, status: 'no_prices' });
        }
      }
      
      await page.close();
      
    } catch (error) {
      console.log(`❌ ${shop.name}: ${error.message}`);
      results.push({ shop: shop.name, status: 'error', error: error.message });
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const blocked = results.filter(r => r.status === 'blocked' || r.status === 'cloudflare');
  
  console.log(`✅ Working shops: ${successful.length}/${results.length}`);
  console.log(`❌ Blocked shops: ${blocked.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 CRAWLER CAN WORK WITH:');
    successful.forEach(r => console.log(`   - ${r.shop}`));
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('Use these shops for FREE scraping (no proxy needed)');
    console.log('For MediaMarkt/Bol/Coolblue: need residential proxy OR Bright Data');
    return true;
  } else {
    console.log('\n⚠️  All shops blocked - need residential proxy');
    return false;
  }
}

testEasyShops().then(success => {
  process.exit(success ? 0 : 1);
});
