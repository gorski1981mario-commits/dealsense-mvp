/**
 * TEST BOL.COM DIRECT - bez parsera
 * 
 * Sprawdzamy czy Bol.com w ogóle odpowiada poprawnie
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

async function testBolDirect() {
  console.log('\n🧪 TESTING BOL.COM DIRECT (bez parsera)\n');

  let browser = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      locale: 'nl-NL',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    // Test 1: Homepage
    console.log('[Test 1] Opening Bol.com homepage...');
    await page.goto('https://www.bol.com/nl/nl/', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    const title1 = await page.title();
    console.log(`✅ Homepage loaded: ${title1}\n`);

    await page.waitForTimeout(2000);

    // Test 2: Search via homepage
    console.log('[Test 2] Searching via homepage search box...');
    
    // Try to find search input
    const searchInput = await page.$('input[name="searchfor"]');
    if (searchInput) {
      await searchInput.fill('Samsung Galaxy S24');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      const url = page.url();
      const title = await page.title();
      
      console.log(`URL: ${url}`);
      console.log(`Title: ${title}`);
      
      // Check if error page
      const errorText = await page.evaluate(() => {
        return document.body.innerText.includes('Oeps') || 
               document.body.innerText.includes('ging iets mis');
      });
      
      if (errorText) {
        console.log('❌ ERROR PAGE detected!\n');
      } else {
        console.log('✅ Search results loaded!\n');
        
        // Try to find prices
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.slice(0, 10);
        });
        
        console.log(`Prices found: ${prices.length}`);
        if (prices.length > 0) {
          console.log(`Examples: ${prices.slice(0, 5).join(', ')}`);
        }
      }
    } else {
      console.log('❌ Search input not found');
    }

    // Test 3: Direct search URL
    console.log('\n[Test 3] Direct search URL...');
    await page.goto('https://www.bol.com/nl/nl/s/?searchtext=Samsung+Galaxy+S24', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    const url3 = page.url();
    const title3 = await page.title();
    
    console.log(`URL: ${url3}`);
    console.log(`Title: ${title3}`);
    
    const errorText3 = await page.evaluate(() => {
      return document.body.innerText.includes('Oeps') || 
             document.body.innerText.includes('ging iets mis');
    });
    
    if (errorText3) {
      console.log('❌ ERROR PAGE detected!');
      console.log('\nBol.com is blocking the crawler (anti-bot)');
    } else {
      console.log('✅ Search results loaded!');
      
      const prices = await page.evaluate(() => {
        const text = document.body.innerText;
        const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
        return matches.slice(0, 10);
      });
      
      console.log(`\nPrices found: ${prices.length}`);
      if (prices.length > 0) {
        console.log(`Examples: ${prices.slice(0, 5).join(', ')}`);
      }
    }

    await browser.close();

  } catch (error) {
    if (browser) await browser.close();
    console.error('\n❌ Error:', error.message);
  }
}

testBolDirect().catch(console.error);
