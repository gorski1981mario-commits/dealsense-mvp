/**
 * TEST ULEPSZONEGO CRAWLERA
 * 
 * Ulepszenia:
 * 1. Playwright fallback (JavaScript rendering)
 * 2. Lepsze headers (Sec-Fetch-*, DNT, AVIF)
 * 3. Automatic retry z różnymi strategiami
 */

require('dotenv').config();
const DirectScraper = require('./crawler/direct-scraper');

// 5 najtrudniejszych sklepów (które blokowały)
const TOUGH_SHOPS = [
  {
    name: 'Paradigit.nl',
    url: 'https://www.paradigit.nl/zoeken?q=Samsung+Galaxy+S24',
    category: 'Computerspecialist'
  },
  {
    name: 'Hobo.nl (418 I\'m a Teapot)',
    url: 'https://www.hobo.nl/zoeken?q=Samsung+Galaxy+S24',
    category: 'HiFi specialist'
  },
  {
    name: 'Cameraland.nl',
    url: 'https://www.cameraland.nl/zoeken?q=Samsung+Galaxy',
    category: 'Camera specialist'
  },
  {
    name: 'YourBuild.nl',
    url: 'https://www.yourbuild.nl/zoeken?q=Samsung+Galaxy',
    category: 'Gaming PC'
  },
  {
    name: 'Informatique.nl (jedyny który działał)',
    url: 'https://www.informatique.nl/zoeken?q=Samsung+Galaxy',
    category: 'IT specialist'
  }
];

async function testShop(shop, scraper) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST: ${shop.name}`);
  console.log(`URL: ${shop.url}`);
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    console.log('\n⏳ Scraping with improved crawler...');
    
    const result = await scraper.scrapeUrl(shop.url, {
      category: 'products',
      searchQuery: 'Samsung Galaxy S24'
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
      return {
        shop: shop.name,
        success: false,
        error: result.error,
        duration: parseFloat(duration)
      };
    }
    
    const offers = result.offers || [];
    console.log(`✅ Scraped in ${duration}s`);
    console.log(`📊 Found ${offers.length} offers`);
    
    if (offers.length > 0) {
      console.log('\nSample offers:');
      offers.slice(0, 3).forEach((offer, i) => {
        console.log(`  ${i+1}. ${offer.title?.substring(0, 50)} - €${offer.price}`);
      });
    }
    
    const success = offers.length > 0;
    console.log(`\n🎯 VERDICT: ${success ? '✅ SUCCESS' : '❌ NO OFFERS'}`);
    
    return {
      shop: shop.name,
      success,
      offers: offers.length,
      duration: parseFloat(duration),
      cached: result.cached
    };
    
  } catch (error) {
    console.log(`\n❌ EXCEPTION: ${error.message}`);
    return {
      shop: shop.name,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🚀 TESTING IMPROVED CRAWLER');
  console.log('Improvements:');
  console.log('  1. ✅ Playwright fallback (JavaScript rendering)');
  console.log('  2. ✅ Better headers (Sec-Fetch-*, DNT, AVIF)');
  console.log('  3. ✅ Automatic retry on 404/418/403\n');

  const scraper = DirectScraper;
  const results = [];

  for (const shop of TOUGH_SHOPS) {
    const result = await testShop(shop, scraper);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL SUMMARY - IMPROVED CRAWLER');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const totalOffers = results.reduce((sum, r) => sum + (r.offers || 0), 0);
  const avgDuration = results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`\nTests Run:           ${results.length}`);
  console.log(`Successful:          ${successful}/${results.length} (${Math.round(successful/results.length*100)}%)`);
  console.log(`Total Offers:        ${totalOffers}`);
  console.log(`Avg Duration:        ${avgDuration.toFixed(2)}s`);

  console.log('\n📊 DETAILED RESULTS:');
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    console.log(`${i+1}. ${status} ${r.shop.padEnd(40)} - ${r.success ? `${r.offers} offers` : r.error || 'Failed'}`);
  });

  console.log('\n🎯 IMPROVEMENT:');
  console.log(`Before improvements: 1/10 success (10%)`);
  console.log(`After improvements:  ${successful}/5 success (${Math.round(successful/5*100)}%)`);
  
  if (successful >= 3) {
    console.log('\n✅ SIGNIFICANT IMPROVEMENT - Crawler now works!');
  } else if (successful >= 2) {
    console.log('\n⚠️  MODERATE IMPROVEMENT - Some progress');
  } else {
    console.log('\n❌ MINIMAL IMPROVEMENT - Still struggling');
  }

  console.log('\n');
}

runTests().catch(console.error);
