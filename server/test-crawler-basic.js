/**
 * TEST PODSTAWOWEJ FUNKCJONALNOŚCI CRAWLERA
 * 
 * Sprawdza:
 * 1. Czy crawler w ogóle działa (bez proxy)
 * 2. Czy proxy działa (z proxy)
 * 3. Czy może otworzyć stronę i wyciągnąć ceny
 */

require('dotenv').config();
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

async function testBasicCrawler() {
  console.log('\n🧪 TEST 1: CRAWLER BEZ PROXY\n');
  
  let browser = null;
  
  try {
    // Launch browser bez proxy
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      locale: 'nl-NL'
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    
    // Test na prostej stronie - Google
    console.log('[Test] Opening google.nl...');
    await page.goto('https://www.google.nl', { waitUntil: 'domcontentloaded' });
    
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    // Test na sklepie - About You (działał w testach)
    console.log('\n[Test] Opening aboutyou.nl...');
    await page.goto('https://www.aboutyou.nl/zoeken?q=nike', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(2000);
    
    // Extract prices
    const prices = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      return matches.slice(0, 5); // First 5 prices
    });
    
    console.log(`✅ Prices found: ${prices.length}`);
    if (prices.length > 0) {
      console.log(`   Examples: ${prices.join(', ')}`);
    }
    
    await browser.close();
    
    return {
      test: 'Basic Crawler (no proxy)',
      success: true,
      pricesFound: prices.length
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.log(`❌ ERROR: ${error.message}`);
    return {
      test: 'Basic Crawler (no proxy)',
      success: false,
      error: error.message
    };
  }
}

async function testProxyConnectivity() {
  console.log('\n🧪 TEST 2: PROXY CONNECTIVITY\n');
  
  const proxyUrl = 'http://geo.iproyal.com:12321';
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  
  if (!username || !password) {
    console.log('❌ PROXY credentials not found in .env');
    return {
      test: 'Proxy Connectivity',
      success: false,
      error: 'No credentials'
    };
  }
  
  console.log(`[Test] Proxy: ${proxyUrl}`);
  console.log(`[Test] Username: ${username}`);
  
  let browser = null;
  
  try {
    // Launch with proxy
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      proxy: {
        server: proxyUrl,
        username: username,
        password: password
      }
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      locale: 'nl-NL'
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    
    // Test 1: Check IP (should be proxy IP)
    console.log('[Test] Checking IP address...');
    await page.goto('https://api.ipify.org?format=json', { waitUntil: 'domcontentloaded' });
    
    const ipData = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log(`✅ IP Response: ${ipData}`);
    
    // Test 2: Open real shop
    console.log('\n[Test] Opening aboutyou.nl via proxy...');
    await page.goto('https://www.aboutyou.nl/zoeken?q=nike', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(2000);
    
    const prices = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      return matches.slice(0, 5);
    });
    
    console.log(`✅ Prices found via proxy: ${prices.length}`);
    if (prices.length > 0) {
      console.log(`   Examples: ${prices.join(', ')}`);
    }
    
    await browser.close();
    
    return {
      test: 'Proxy Connectivity',
      success: true,
      pricesFound: prices.length,
      ip: ipData
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.log(`❌ ERROR: ${error.message}`);
    return {
      test: 'Proxy Connectivity',
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 TESTING CRAWLER & PROXY FUNCTIONALITY\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  // Test 1: Basic crawler (no proxy)
  const test1 = await testBasicCrawler();
  results.push(test1);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Proxy connectivity
  const test2 = await testProxyConnectivity();
  results.push(test2);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(80));
  
  results.forEach((result, i) => {
    const status = result.success ? '✅' : '❌';
    console.log(`\n${i+1}. ${status} ${result.test}`);
    if (result.success) {
      console.log(`   Prices found: ${result.pricesFound || 0}`);
      if (result.ip) {
        console.log(`   IP: ${result.ip}`);
      }
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 VERDICT:');
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('✅ CRAWLER DZIAŁA - zarówno bez proxy jak i z proxy');
  } else {
    const crawlerWorks = results[0]?.success;
    const proxyWorks = results[1]?.success;
    
    if (crawlerWorks && !proxyWorks) {
      console.log('⚠️  CRAWLER DZIAŁA, ale PROXY NIE DZIAŁA');
      console.log('   Problem: IPRoyal proxy nie odpowiada lub złe credentials');
    } else if (!crawlerWorks && proxyWorks) {
      console.log('⚠️  PROXY DZIAŁA, ale CRAWLER MA PROBLEMY');
    } else {
      console.log('❌ ANI CRAWLER ANI PROXY NIE DZIAŁAJĄ');
    }
  }
  
  console.log('='.repeat(80) + '\n');
}

runTests().catch(console.error);
