/**
 * BOL.COM FINAL ATTEMPT - CZEKAJ DŁUŻEJ NA PRODUKTY
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

async function finalAttempt() {
  console.log('\n🚀 BOL.COM FINAL ATTEMPT - DŁUGIE CZEKANIE NA PRODUKTY\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('[Step 1] Opening search URL...');
    await page.goto('https://www.bol.com/nl/nl/s/?searchtext=Samsung+Galaxy+S24', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    console.log('[Step 2] Waiting 5s for JavaScript...');
    await page.waitForTimeout(5000);
    
    console.log('[Step 3] Scrolling to trigger lazy loading...');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(2000);
    
    console.log('[Step 4] Waiting for products (max 15s)...');
    try {
      await page.waitForSelector('[data-test="product-item"], .product-item, [class*="product"]', {
        timeout: 15000
      });
      console.log('✅ Products found in DOM!');
    } catch (e) {
      console.log('⚠️  Timeout waiting for products');
    }
    
    console.log('[Step 5] Additional 3s wait...');
    await page.waitForTimeout(3000);
    
    // Check results
    const hasProducts = await page.evaluate(() => {
      return document.querySelectorAll('[data-test="product-item"], .product-item, [class*="product"]').length;
    });
    
    console.log(`\nProducts in DOM: ${hasProducts}`);
    
    if (hasProducts > 0) {
      console.log('✅ SUKCES! Produkty się załadowały!');
      
      // Extract prices
      const prices = await page.evaluate(() => {
        const text = document.body.innerText;
        const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
        return matches.slice(0, 10);
      });
      
      console.log(`\nPrices found: ${prices.length}`);
      if (prices.length > 0) {
        console.log(`Examples: ${prices.slice(0, 5).join(', ')}`);
      }
      
      // Try JSON-LD
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
      
      console.log(`\nJSON-LD prices: ${jsonLdPrices.length}`);
      if (jsonLdPrices.length > 0) {
        console.log(`Examples: €${jsonLdPrices.slice(0, 5).join(', €')}`);
      }
      
      console.log('\n🎉 BOL.COM DZIAŁA! Wystarczy czekać 15-20s na produkty!');
      
    } else {
      console.log('❌ Nadal brak produktów po 25s czekania');
      
      // Debug: save HTML
      const html = await page.content();
      require('fs').writeFileSync('bol-debug-final.html', html);
      console.log('HTML saved to bol-debug-final.html');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    await browser.close();
  }
}

finalAttempt().catch(console.error);
