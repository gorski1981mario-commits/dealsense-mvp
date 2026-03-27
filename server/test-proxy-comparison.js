/**
 * TEST PROXY - CZY PROXY PRZECHODZI?
 * 
 * Porównujemy:
 * 1. Crawler BEZ proxy
 * 2. Crawler Z proxy (IPRoyal Skip ISP Static)
 * 
 * Sprawdzamy czy proxy pomaga, szkodzi, czy nie robi różnicy
 */

require('dotenv').config();
const SmartCrawler2026 = require('./crawler/smart-crawler-2026');

const TEST_SHOPS = [
  { domain: 'coolblue.nl', product: 'Samsung Galaxy S24', expected: 'DZIAŁA' },
  { domain: 'mediamarkt.nl', product: 'Samsung Galaxy S24', expected: 'DZIAŁA' },
  { domain: 'bol.com', product: 'Samsung Galaxy S24', expected: 'NIE DZIAŁA' },
  { domain: 'zalando.nl', product: 'Nike Air Max', expected: 'NIE DZIAŁA' }
];

async function testWithProxy(useProxy) {
  const proxyLabel = useProxy ? 'Z PROXY (IPRoyal Skip ISP Static)' : 'BEZ PROXY';
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST ${proxyLabel}`);
  console.log('='.repeat(80));

  const crawler = new SmartCrawler2026({
    proxy: {
      enabled: useProxy,
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    }
  });

  const results = [];

  try {
    for (const test of TEST_SHOPS) {
      console.log(`\n[Test] ${test.domain} - ${test.product}`);
      
      const startTime = Date.now();
      const result = await crawler.crawlShop(test.domain, test.product);
      const duration = Date.now() - startTime;
      
      const status = result.success ? '✅' : '❌';
      const priceInfo = result.success 
        ? `${result.prices.length} prices, avg €${result.avgPrice.toFixed(2)}`
        : 'Failed';
      
      console.log(`${status} ${priceInfo} (${duration}ms)`);
      
      results.push({
        shop: test.domain,
        product: test.product,
        success: result.success,
        pricesCount: result.prices?.length || 0,
        avgPrice: result.avgPrice || null,
        duration,
        expected: test.expected
      });
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await crawler.close();
    return results;

  } catch (error) {
    await crawler.close();
    console.error(`\n❌ Error: ${error.message}`);
    return results;
  }
}

async function runComparison() {
  console.log('\n🔍 PROXY COMPARISON TEST\n');
  console.log('Testujemy czy proxy pomaga, szkodzi, czy nie robi różnicy\n');

  // Test 1: BEZ proxy
  const resultsWithoutProxy = await testWithProxy(false);

  console.log('\n⏳ Waiting 5s before next test...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test 2: Z proxy
  const resultsWithProxy = await testWithProxy(true);

  // Comparison
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PORÓWNANIE: BEZ PROXY vs Z PROXY');
  console.log('='.repeat(80));

  console.log('\n| Sklep | Bez Proxy | Z Proxy | Różnica |');
  console.log('|-------|-----------|---------|---------|');

  for (let i = 0; i < TEST_SHOPS.length; i++) {
    const without = resultsWithoutProxy[i];
    const withP = resultsWithProxy[i];
    
    const withoutStatus = without?.success ? `✅ ${without.pricesCount} cen` : '❌ Failed';
    const withStatus = withP?.success ? `✅ ${withP.pricesCount} cen` : '❌ Failed';
    
    let difference = '';
    if (without?.success === withP?.success) {
      difference = '🟰 Identyczne';
    } else if (withP?.success && !without?.success) {
      difference = '✅ Proxy pomógł!';
    } else if (!withP?.success && without?.success) {
      difference = '❌ Proxy zepsuł!';
    }
    
    console.log(`| ${TEST_SHOPS[i].domain.padEnd(15)} | ${withoutStatus.padEnd(15)} | ${withStatus.padEnd(15)} | ${difference} |`);
  }

  // Summary
  const successWithout = resultsWithoutProxy.filter(r => r?.success).length;
  const successWith = resultsWithProxy.filter(r => r?.success).length;

  console.log('\n📊 SUMMARY:');
  console.log(`  BEZ PROXY: ${successWithout}/${TEST_SHOPS.length} success (${(successWithout/TEST_SHOPS.length*100).toFixed(1)}%)`);
  console.log(`  Z PROXY:   ${successWith}/${TEST_SHOPS.length} success (${(successWith/TEST_SHOPS.length*100).toFixed(1)}%)`);

  console.log('\n🎯 VERDICT:');
  if (successWith > successWithout) {
    console.log('✅ PROXY POMAGA - używaj proxy');
  } else if (successWith < successWithout) {
    console.log('❌ PROXY SZKODZI - NIE używaj proxy');
  } else {
    console.log('🟰 PROXY NIE ROBI RÓŻNICY - problem nie w proxy');
    console.log('\nProblem leży gdzie indziej:');
    console.log('  - Struktura stron (JavaScript, React)');
    console.log('  - Brak JSON-LD structured data');
    console.log('  - Wymagane dedykowane parsery');
  }

  // Speed comparison
  const avgSpeedWithout = resultsWithoutProxy.reduce((sum, r) => sum + (r?.duration || 0), 0) / resultsWithoutProxy.length;
  const avgSpeedWith = resultsWithProxy.reduce((sum, r) => sum + (r?.duration || 0), 0) / resultsWithProxy.length;

  console.log('\n⚡ SPEED:');
  console.log(`  BEZ PROXY: ${avgSpeedWithout.toFixed(0)}ms avg`);
  console.log(`  Z PROXY:   ${avgSpeedWith.toFixed(0)}ms avg`);
  
  if (avgSpeedWith > avgSpeedWithout * 1.5) {
    console.log('  ⚠️  Proxy spowalnia crawler o >50%');
  }

  console.log('\n');
}

runComparison().catch(console.error);
