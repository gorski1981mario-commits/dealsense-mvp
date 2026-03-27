/**
 * BOL.COM TEST - 30 SEKUND CZEKANIA
 * 
 * Sprawdzamy czy po 30s faktycznie pojawiają się ceny
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

async function testBol30s() {
  console.log('\n🧪 BOL.COM TEST - 30 SEKUND CZEKANIA NA CENY\n');
  console.log('Product: Samsung Galaxy S24');
  console.log('Wait time: 30 sekund\n');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    const startTime = Date.now();
    
    console.log('\n[0s] Opening Bol.com search...');
    await page.goto('https://www.bol.com/nl/nl/s/?searchtext=Samsung+Galaxy+S24', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Page loaded`);
    
    // Wait 5s
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Waiting 5s...`);
    await page.waitForTimeout(5000);
    
    // Check after 5s
    let products = await page.evaluate(() => {
      return document.querySelectorAll('[data-test="product-item"], .product-item, [class*="product"]').length;
    });
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Products in DOM: ${products}`);
    
    // Wait 10s more
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Waiting 10s more...`);
    await page.waitForTimeout(10000);
    
    // Check after 15s total
    products = await page.evaluate(() => {
      return document.querySelectorAll('[data-test="product-item"], .product-item, [class*="product"]').length;
    });
    
    let prices = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      return matches.slice(0, 10);
    });
    
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Products: ${products}, Prices: ${prices.length}`);
    if (prices.length > 0) {
      console.log(`      Examples: ${prices.slice(0, 3).join(', ')}`);
    }
    
    // Wait 15s more (30s total)
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Waiting 15s more (do 30s total)...`);
    await page.waitForTimeout(15000);
    
    // Final check after 30s
    products = await page.evaluate(() => {
      return document.querySelectorAll('[data-test="product-item"], .product-item, [class*="product"]').length;
    });
    
    prices = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      return matches;
    });
    
    const jsonLdPrices = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const foundPrices = [];
      
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type'] === 'ItemList' && data.itemListElement) {
            data.itemListElement.forEach(item => {
              if (item.offers && item.offers.price) {
                foundPrices.push(parseFloat(item.offers.price));
              }
            });
          }
        } catch (e) {}
      });
      
      return foundPrices;
    });
    
    console.log(`\n[${Math.round((Date.now() - startTime) / 1000)}s] FINAL RESULTS AFTER 30s:`);
    console.log('='.repeat(80));
    console.log(`Products in DOM: ${products}`);
    console.log(`Prices (regex): ${prices.length}`);
    console.log(`Prices (JSON-LD): ${jsonLdPrices.length}`);
    
    if (prices.length > 0) {
      console.log(`\n✅ SUKCES! Znaleziono ${prices.length} cen po 30s czekania!`);
      console.log(`\nPrzykłady cen (regex):`);
      prices.slice(0, 10).forEach((p, i) => {
        console.log(`  ${i+1}. ${p}`);
      });
    }
    
    if (jsonLdPrices.length > 0) {
      console.log(`\n✅ SUKCES! Znaleziono ${jsonLdPrices.length} cen w JSON-LD!`);
      console.log(`\nPrzykłady cen (JSON-LD):`);
      jsonLdPrices.slice(0, 10).forEach((p, i) => {
        console.log(`  ${i+1}. €${p.toFixed(2)}`);
      });
    }
    
    if (prices.length === 0 && jsonLdPrices.length === 0) {
      console.log(`\n❌ BRAK CEN nawet po 30s czekania`);
      console.log(`\nMożliwe przyczyny:`);
      console.log(`  1. Ceny ładują się jeszcze dłużej (>30s)`);
      console.log(`  2. Ceny w osobnym iframe/shadow DOM`);
      console.log(`  3. Ceny wymagają interakcji (scroll, click)`);
      console.log(`  4. Anti-bot wykrył crawler mimo stealth`);
      
      // Save HTML for debug
      const html = await page.content();
      require('fs').writeFileSync('c:/DEALSENSE AI/server/bol-30s-debug.html', html);
      console.log(`\nHTML saved to bol-30s-debug.html for analysis`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`Total time: ${Math.round((Date.now() - startTime) / 1000)}s\n`);
    
    await browser.close();
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    await browser.close();
  }
}

testBol30s().catch(console.error);
