/**
 * TEST PRAWDZIWYCH NISZOWYCH SKLEPÓW NL
 * 
 * 10 prawdziwych małych/średnich sklepów elektronicznych w NL
 * Test: czy crawler znajduje produkty i ceny
 */

require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

// 10 PRAWDZIWYCH niszowych sklepów NL (zweryfikowane w sieci)
const REAL_NICHE_SHOPS = [
  {
    name: 'Electroworld.nl',
    domain: 'electroworld.nl',
    url: 'https://www.electroworld.nl/s/?searchtext=Samsung+Galaxy+S24',
    category: 'Elektronika - średni sklep (150 lokalizacji)'
  },
  {
    name: 'Elektronica-Online.nl',
    domain: 'elektronica-online.nl',
    url: 'https://www.elektronica-online.nl/zoeken?q=Samsung+Galaxy',
    category: 'Elektronika - mały sklep online'
  },
  {
    name: 'Conrad.nl',
    domain: 'conrad.nl',
    url: 'https://www.conrad.nl/nl/search.html?search=Samsung+Galaxy+S24',
    category: 'Elektronika - tech specialist'
  },
  {
    name: 'Informatique.nl',
    domain: 'informatique.nl',
    url: 'https://www.informatique.nl/zoeken?q=Samsung+Galaxy',
    category: 'Komputery - niszowy'
  },
  {
    name: 'Centralpoint.nl',
    domain: 'centralpoint.nl',
    url: 'https://www.centralpoint.nl/zoeken/?q=Samsung+Galaxy+S24',
    category: 'IT - B2B i B2C'
  },
  {
    name: 'Mycom.nl',
    domain: 'mycom.nl',
    url: 'https://www.mycom.nl/zoeken?q=Samsung+Galaxy',
    category: 'Komputery - niszowy'
  },
  {
    name: 'Paradigit.nl',
    domain: 'paradigit.nl',
    url: 'https://www.paradigit.nl/zoeken?q=Samsung+Galaxy+S24',
    category: 'IT - średni sklep'
  },
  {
    name: 'Allekabels.nl',
    domain: 'allekabels.nl',
    url: 'https://www.allekabels.nl/zoeken/Samsung+Galaxy+S24',
    category: 'Kable i akcesoria'
  },
  {
    name: 'Kabelshop.nl',
    domain: 'kabelshop.nl',
    url: 'https://www.kabelshop.nl/zoeken?q=Samsung+Galaxy',
    category: 'Kable - niszowy'
  },
  {
    name: 'Reichelt.nl',
    domain: 'reichelt.nl',
    url: 'https://www.reichelt.nl/nl/nl/search?search=Samsung+Galaxy',
    category: 'Elektronika - niemiecki sklep w NL'
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
      /(\d+),(\d{2})/g
    ];
    
    const prices = [];
    let match;
    
    for (const pattern of pricePatterns) {
      while ((match = pattern.exec(html)) !== null) {
        const price = parseFloat(`${match[1]}.${match[2]}`);
        if (price > 10 && price < 5000) { // Sensowny zakres dla elektroniki
          prices.push(price);
        }
      }
    }
    
    // Deduplikuj ceny
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);
    
    // Szukaj produktów (Samsung, Galaxy, S24)
    const productKeywords = ['samsung', 'galaxy', 's24', 'ultra'];
    const productMatches = productKeywords.filter(keyword => 
      html.toLowerCase().includes(keyword)
    );
    
    console.log('\n📊 RESULTS:');
    console.log(`  Prices found: ${uniquePrices.length}`);
    if (uniquePrices.length > 0) {
      console.log(`  Price range: €${uniquePrices[0]} - €${uniquePrices[uniquePrices.length - 1]}`);
      console.log(`  Sample prices: ${uniquePrices.slice(0, 5).map(p => `€${p}`).join(', ')}`);
    }
    console.log(`  Product keywords: ${productMatches.join(', ')}`);
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
  console.log('\n🚀 TESTING 10 REAL NICHE SHOPS - NL');
  console.log('Testing: Product detection, Price extraction, Crawler compatibility\n');

  // Initialize fetcher with IPRoyal proxy
  const fetcher = new GotFetcher({
    enabled: process.env.USE_PROXY === 'true',
    provider: process.env.PROXY_PROVIDER || 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });

  console.log(`📡 Proxy: ${process.env.USE_PROXY === 'true' ? 'ENABLED (IPRoyal)' : 'DISABLED'}\n`);

  const results = [];

  for (const shop of REAL_NICHE_SHOPS) {
    const result = await testShop(shop, fetcher);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between shops
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL SUMMARY');
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
    console.log(`${i+1}. ${status} ${r.shop.padEnd(25)} - ${r.success ? `${r.prices} prices, ${r.priceRange}` : r.error || 'No data'}`);
  });

  console.log('\n🎯 VERDICT:');
  if (successful >= 7) {
    console.log('✅ EXCELLENT - Crawler works with most niche shops');
  } else if (successful >= 5) {
    console.log('⚠️  GOOD - Crawler works with some niche shops');
  } else {
    console.log('❌ POOR - Crawler struggles with niche shops');
  }

  console.log('\n💡 RECOMMENDATION:');
  const workingShops = results.filter(r => r.success).map(r => r.domain);
  if (workingShops.length > 0) {
    console.log('Use these working shops in crawler:');
    workingShops.forEach(domain => console.log(`  - ${domain}`));
  }

  console.log('\n');
}

runTests().catch(console.error);
