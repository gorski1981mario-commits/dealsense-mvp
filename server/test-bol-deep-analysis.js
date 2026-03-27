/**
 * BOL.COM DEEP ANALYSIS - ZNAJDŹ DOKŁADNIE GDZIE BLOKUJE
 * 
 * Testy:
 * 1. Homepage - czy w ogóle odpowiada
 * 2. Search URL - czy URL jest poprawny
 * 3. Anti-bot - user-agent, headless detection
 * 4. Timing - za szybko vs za wolno
 * 5. Cookies/Session - czy wymaga sesji
 * 6. Final attempt - obejście blokady
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

async function test1_Homepage() {
  console.log('\n🧪 TEST 1: CZY BOL.COM HOMEPAGE DZIAŁA');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.bol.com/nl/nl/', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const title = await page.title();
    const hasError = await page.evaluate(() => {
      return document.body.innerText.includes('Oeps') || 
             document.body.innerText.includes('ging iets mis');
    });
    
    console.log(`Title: ${title}`);
    console.log(`Has error: ${hasError}`);
    
    if (hasError) {
      console.log('❌ BLOKADA: Homepage zwraca error!');
      await browser.close();
      return { blocked: true, where: 'Homepage' };
    }
    
    console.log('✅ Homepage działa poprawnie');
    await browser.close();
    return { blocked: false };
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    await browser.close();
    return { blocked: true, where: 'Navigation', error: error.message };
  }
}

async function test2_SearchURL() {
  console.log('\n🧪 TEST 2: CZY SEARCH URL JEST POPRAWNY');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL'
  });
  
  const page = await context.newPage();
  
  try {
    // Test różnych URL patterns
    const urls = [
      'https://www.bol.com/nl/nl/s/?searchtext=Samsung+Galaxy+S24',
      'https://www.bol.com/nl/nl/s/?searchtext=Samsung%20Galaxy%20S24',
      'https://www.bol.com/nl/nl/search?q=Samsung+Galaxy+S24'
    ];
    
    for (const url of urls) {
      console.log(`\nTesting: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await page.waitForTimeout(3000);
      
      const title = await page.title();
      const hasError = await page.evaluate(() => {
        return document.body.innerText.includes('Oeps') || 
               document.body.innerText.includes('ging iets mis');
      });
      
      const hasProducts = await page.evaluate(() => {
        return document.querySelectorAll('[data-test="product-item"], .product-item').length > 0;
      });
      
      console.log(`  Title: ${title}`);
      console.log(`  Has error: ${hasError}`);
      console.log(`  Has products: ${hasProducts}`);
      
      if (!hasError && hasProducts) {
        console.log(`✅ Ten URL działa: ${url}`);
        await browser.close();
        return { blocked: false, workingUrl: url };
      }
    }
    
    console.log('❌ BLOKADA: Wszystkie URL-e zwracają error lub brak produktów');
    await browser.close();
    return { blocked: true, where: 'Search URL' };
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    await browser.close();
    return { blocked: true, where: 'Search URL', error: error.message };
  }
}

async function test3_AntiBotBypass() {
  console.log('\n🧪 TEST 3: ANTI-BOT BYPASS (STEALTH + DELAYS)');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'nl-NL',
    viewport: { width: 1920, height: 1080 },
    geolocation: { latitude: 52.3676, longitude: 4.9041 }, // Amsterdam
    permissions: ['geolocation']
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Step 1: Opening homepage first (simulate real user)');
    await page.goto('https://www.bol.com/nl/nl/', { 
      waitUntil: 'networkidle',
      timeout: 20000 
    });
    
    console.log('Step 2: Waiting 2s (human-like delay)');
    await page.waitForTimeout(2000);
    
    console.log('Step 3: Searching via search box (simulate typing)');
    const searchInput = await page.$('input[name="searchtext"]');
    
    if (searchInput) {
      // Simulate typing
      await searchInput.click();
      await page.waitForTimeout(500);
      await searchInput.type('Samsung Galaxy S24', { delay: 100 });
      await page.waitForTimeout(500);
      await searchInput.press('Enter');
      
      console.log('Step 4: Waiting for results (10s)');
      await page.waitForTimeout(10000);
      
      const url = page.url();
      const title = await page.title();
      const hasError = await page.evaluate(() => {
        return document.body.innerText.includes('Oeps') || 
               document.body.innerText.includes('ging iets mis');
      });
      
      const hasProducts = await page.evaluate(() => {
        return document.querySelectorAll('[data-test="product-item"], .product-item').length > 0;
      });
      
      console.log(`  URL: ${url}`);
      console.log(`  Title: ${title}`);
      console.log(`  Has error: ${hasError}`);
      console.log(`  Has products: ${hasProducts}`);
      
      if (!hasError && hasProducts) {
        console.log('✅ SUKCES! Anti-bot bypass działa!');
        
        // Extract prices
        const prices = await page.evaluate(() => {
          const text = document.body.innerText;
          const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
          return matches.slice(0, 10);
        });
        
        console.log(`  Prices found: ${prices.length}`);
        if (prices.length > 0) {
          console.log(`  Examples: ${prices.slice(0, 5).join(', ')}`);
        }
        
        await browser.close();
        return { blocked: false, method: 'User simulation' };
      }
      
      console.log('❌ BLOKADA: Nadal error lub brak produktów');
      await browser.close();
      return { blocked: true, where: 'After user simulation' };
      
    } else {
      console.log('❌ Search input not found');
      await browser.close();
      return { blocked: true, where: 'Search input missing' };
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    await browser.close();
    return { blocked: true, where: 'Anti-bot bypass', error: error.message };
  }
}

async function runAnalysis() {
  console.log('\n🔍 BOL.COM DEEP ANALYSIS - ZNAJDŹ DOKŁADNIE GDZIE BLOKUJE\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  // Test 1: Homepage
  const test1 = await test1_Homepage();
  results.push({ test: 'Homepage', ...test1 });
  
  if (test1.blocked) {
    console.log('\n⚠️  BLOKADA NA HOMEPAGE - dalsze testy nie mają sensu');
    printFinalReport(results);
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Search URL
  const test2 = await test2_SearchURL();
  results.push({ test: 'Search URL', ...test2 });
  
  if (!test2.blocked) {
    console.log('\n✅ ZNALEZIONO WORKING URL!');
    printFinalReport(results);
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 3: Anti-bot bypass
  const test3 = await test3_AntiBotBypass();
  results.push({ test: 'Anti-bot bypass', ...test3 });
  
  printFinalReport(results);
}

function printFinalReport(results) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL REPORT - GDZIE BOL.COM BLOKUJE');
  console.log('='.repeat(80));
  
  results.forEach((r, i) => {
    const status = r.blocked ? '❌ BLOCKED' : '✅ SUCCESS';
    console.log(`\n${i+1}. ${r.test}: ${status}`);
    if (r.where) console.log(`   Where: ${r.where}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.workingUrl) console.log(`   Working URL: ${r.workingUrl}`);
    if (r.method) console.log(`   Method: ${r.method}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 VERDICT:');
  
  const lastTest = results[results.length - 1];
  
  if (!lastTest.blocked) {
    console.log('✅ SUKCES! Znaleziono sposób na obejście blokady Bol.com!');
    console.log(`   Method: ${lastTest.method || lastTest.workingUrl}`);
  } else {
    console.log('❌ BLOKADA POTWIERDZONA');
    console.log(`   Exact location: ${lastTest.where}`);
    console.log('\n   Możliwe rozwiązania:');
    console.log('   1. Bol.com Partner API (oficjalne, darmowe, 40% rynku)');
    console.log('   2. Bardziej zaawansowany anti-bot bypass (residential proxy + cookies)');
    console.log('   3. SearchAPI jako primary (100% success rate)');
  }
  
  console.log('='.repeat(80) + '\n');
}

runAnalysis().catch(console.error);
