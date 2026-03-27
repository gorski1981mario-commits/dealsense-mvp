/**
 * TEST 10 ZWERYFIKOWANYCH NISZOWYCH SKLEPÓW NL
 * 
 * Sklepy z Trusted Shops - prawdziwe, działające domeny
 * Test: czy crawler znajduje produkty Samsung Galaxy i ceny
 */

require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

// 10 ZWERYFIKOWANYCH niszowych sklepów z Trusted Shops
const VERIFIED_NICHE_SHOPS = [
  {
    name: 'Paradigit.nl',
    domain: 'paradigit.nl',
    url: 'https://www.paradigit.nl/zoeken?q=Samsung+Galaxy+S24',
    category: 'Computerspecialist - 13.338 reviews (4.51/5)'
  },
  {
    name: 'YourBuild.nl',
    domain: 'yourbuild.nl',
    url: 'https://www.yourbuild.nl/zoeken?q=Samsung+Galaxy',
    category: 'Gaming PC specialist - 1.034 reviews (4.97/5)'
  },
  {
    name: 'Hobo.nl',
    domain: 'hobo.nl',
    url: 'https://www.hobo.nl/zoeken?q=Samsung+Galaxy+S24',
    category: 'HiFi & Audio specialist - 3.363 reviews (4.80/5)'
  },
  {
    name: 'Cameraland.nl',
    domain: 'cameraland.nl',
    url: 'https://www.cameraland.nl/zoeken?q=Samsung+Galaxy',
    category: 'Camera specialist - 8.964 reviews (4.51/5)'
  },
  {
    name: 'Maxiaxi.com',
    domain: 'maxiaxi.com',
    url: 'https://www.maxiaxi.com/zoeken?q=Samsung+Galaxy+S24',
    category: 'Licht & Geluid - 20.189 reviews (4.88/5)'
  },
  {
    name: 'Printabout.nl',
    domain: 'printabout.nl',
    url: 'https://www.printabout.nl/zoeken?q=Samsung',
    category: 'Printer specialist - 61.304 reviews (4.53/5)'
  },
  {
    name: 'FixPart.nl',
    domain: 'fixpart.nl',
    url: 'https://www.fixpart.nl/nl/zoeken?q=Samsung+Galaxy',
    category: 'Onderdelen specialist'
  },
  {
    name: 'Ergowerken.nl',
    domain: 'ergowerken.nl',
    url: 'https://www.ergowerken.nl/zoeken?q=Samsung',
    category: 'Ergonomische werkplek - 6.331 reviews (4.59/5)'
  },
  {
    name: 'Variakeys.nl',
    domain: 'variakeys.nl',
    url: 'https://www.variakeys.nl/zoeken?q=Samsung',
    category: 'Software keys - 7.415 reviews (4.34/5)'
  },
  {
    name: '123watches.nl',
    domain: '123watches.nl',
    url: 'https://www.123watches.nl/zoeken?q=Samsung+Galaxy',
    category: 'Accessoires - 15.812 reviews (4.23/5)'
  }
];

async function testShop(shop, fetcher) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST: ${shop.name}`);
  console.log(`Domain: ${shop.domain}`);
  console.log(`Category: ${shop.category}`);
  console.log(`URL: ${shop.url}`);
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    console.log('\n⏳ Fetching HTML...');
    
    const html = await fetcher.fetch(shop.url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ HTML fetched in ${duration}s (${(html.length / 1024).toFixed(1)} KB)`);
    
    // Parse HTML
    const $ = cheerio.load(html);
    
    // Szukaj cen (różne formaty)
    const pricePatterns = [
      /€\s*(\d+)[.,](\d{2})/g,
      /(\d+)[.,](\d{2})\s*€/g,
      /(\d{1,4}),(\d{2})/g
    ];
    
    const prices = [];
    let match;
    
    for (const pattern of pricePatterns) {
      while ((match = pattern.exec(html)) !== null) {
        const price = parseFloat(`${match[1]}.${match[2]}`);
        if (price > 10 && price < 5000) {
          prices.push(price);
        }
      }
    }
    
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);
    
    // Szukaj produktów Samsung Galaxy
    const productKeywords = ['samsung', 'galaxy', 's24', 's23', 'ultra'];
    const productMatches = productKeywords.filter(keyword => 
      html.toLowerCase().includes(keyword)
    );
    
    // Szukaj tytułów produktów w HTML
    const titles = [];
    $('h1, h2, h3, h4, .product-title, .title, [class*="product"]').each((i, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('samsung') || text.includes('galaxy')) {
        titles.push($(el).text().trim().substring(0, 50));
      }
    });
    
    console.log('\n📊 RESULTS:');
    console.log(`  Prices found: ${uniquePrices.length}`);
    if (uniquePrices.length > 0) {
      console.log(`  Price range: €${uniquePrices[0]} - €${uniquePrices[uniquePrices.length - 1]}`);
      console.log(`  Sample prices: ${uniquePrices.slice(0, 5).map(p => `€${p}`).join(', ')}`);
    }
    console.log(`  Product keywords: ${productMatches.join(', ')}`);
    console.log(`  Product titles: ${titles.length}`);
    if (titles.length > 0) {
      console.log(`  Sample: "${titles[0]}"`);
    }
    console.log(`  HTML size: ${(html.length / 1024).toFixed(1)} KB`);
    
    const success = uniquePrices.length > 0 && productMatches.length >= 2;
    
    console.log(`\n🎯 VERDICT: ${success ? '✅ SUCCESS - Found products & prices' : '❌ FAILED - No products/prices'}`);
    
    return {
      shop: shop.name,
      domain: shop.domain,
      success,
      prices: uniquePrices.length,
      priceRange: uniquePrices.length > 0 ? `€${uniquePrices[0]}-€${uniquePrices[uniquePrices.length-1]}` : 'N/A',
      productKeywords: productMatches.length,
      productTitles: titles.length,
      duration: parseFloat(duration),
      htmlSize: (html.length / 1024).toFixed(1)
    };
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    return {
      shop: shop.name,
      domain: shop.domain,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🚀 TESTING 10 VERIFIED NICHE SHOPS - NL (Trusted Shops)');
  console.log('Testing: Product detection, Price extraction, Crawler compatibility\n');

  const fetcher = new GotFetcher({
    enabled: process.env.USE_PROXY === 'true',
    provider: process.env.PROXY_PROVIDER || 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });

  console.log(`📡 Proxy: ${process.env.USE_PROXY === 'true' ? 'ENABLED (IPRoyal)' : 'DISABLED'}\n`);

  const results = [];

  for (const shop of VERIFIED_NICHE_SHOPS) {
    const result = await testShop(shop, fetcher);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL SUMMARY - VERIFIED NICHE SHOPS');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const totalPrices = results.reduce((sum, r) => sum + (r.prices || 0), 0);
  const avgDuration = results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;

  console.log(`\nTests Run:           ${results.length}`);
  console.log(`Successful:          ${successful}/${results.length} (${Math.round(successful/results.length*100)}%)`);
  console.log(`Total Prices Found:  ${totalPrices}`);
  console.log(`Avg Duration:        ${avgDuration.toFixed(2)}s`);

  console.log('\n📊 DETAILED RESULTS:');
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    console.log(`${i+1}. ${status} ${r.shop.padEnd(25)} - ${r.success ? `${r.prices} prices, ${r.priceRange}, ${r.productTitles} titles` : r.error || 'No data'}`);
  });

  console.log('\n🎯 VERDICT:');
  if (successful >= 7) {
    console.log('✅ EXCELLENT - Crawler works great with verified niche shops');
  } else if (successful >= 5) {
    console.log('⚠️  GOOD - Crawler works with most verified shops');
  } else if (successful >= 3) {
    console.log('⚠️  MODERATE - Crawler works with some shops');
  } else {
    console.log('❌ POOR - Crawler struggles even with verified shops');
  }

  console.log('\n💡 WORKING SHOPS FOR CRAWLER:');
  const workingShops = results.filter(r => r.success);
  if (workingShops.length > 0) {
    workingShops.forEach(shop => {
      console.log(`  ✅ ${shop.domain} - ${shop.prices} prices, ${shop.productTitles} product titles`);
    });
  } else {
    console.log('  ❌ No working shops found');
  }

  console.log('\n');
}

runTests().catch(console.error);
