/**
 * TEST BOL.COM - znajdź gdzie są ceny
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(StealthPlugin);

async function testBolPrices() {
  console.log('\n🧪 TESTING BOL.COM - szukam cen\n');

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL'
  })).newPage();

  try {
    await page.goto('https://www.bol.com/nl/nl/s/?searchtext=Samsung+Galaxy+S24', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    console.log('Page loaded, waiting for content...\n');
    await page.waitForTimeout(3000);

    // Method 1: JSON-LD
    console.log('[Method 1] Checking JSON-LD...');
    const jsonLdPrices = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const prices = [];
      
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type'] === 'ItemList' && data.itemListElement) {
            data.itemListElement.forEach(item => {
              if (item.offers && item.offers.price) {
                prices.push(parseFloat(item.offers.price));
              }
            });
          }
        } catch (e) {}
      });
      
      return prices;
    });
    console.log(`  Found: ${jsonLdPrices.length} prices`);
    if (jsonLdPrices.length > 0) {
      console.log(`  Examples: €${jsonLdPrices.slice(0, 3).join(', €')}`);
    }

    // Method 2: Regex on innerText
    console.log('\n[Method 2] Regex on innerText...');
    const regexPrices = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      return matches.slice(0, 10);
    });
    console.log(`  Found: ${regexPrices.length} matches`);
    if (regexPrices.length > 0) {
      console.log(`  Examples: ${regexPrices.slice(0, 5).join(', ')}`);
    }

    // Method 3: CSS Selectors
    console.log('\n[Method 3] CSS Selectors...');
    const selectorPrices = await page.evaluate(() => {
      const selectors = [
        '[data-test="price"]',
        '.promo-price',
        '.product-price',
        '[class*="price"]',
        '[data-price]'
      ];
      
      const found = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          found.push(`${selector}: ${elements.length} elements`);
        }
      });
      
      return found;
    });
    console.log(`  Selectors found:`);
    selectorPrices.forEach(s => console.log(`    ${s}`));

    // Method 4: Check page structure
    console.log('\n[Method 4] Page structure...');
    const structure = await page.evaluate(() => {
      return {
        hasProducts: !!document.querySelector('[data-test="product-item"]'),
        hasProductCards: !!document.querySelector('.product-item'),
        hasSearchResults: !!document.querySelector('[class*="search-result"]'),
        bodyTextLength: document.body.innerText.length,
        hasReactData: !!document.querySelector('[data-reactroot]')
      };
    });
    console.log(`  Structure:`, structure);

    // Save HTML for analysis
    const html = await page.content();
    fs.writeFileSync('c:/DEALSENSE AI/server/bol-debug.html', html);
    console.log('\n✅ HTML saved to bol-debug.html');

    await browser.close();

  } catch (error) {
    await browser.close();
    console.error('\n❌ Error:', error.message);
  }
}

testBolPrices().catch(console.error);
