/**
 * TEST PRODUKTÓW FIZYCZNYCH - PRAWDZIWE CENY VS MOCK
 * 
 * Testuje 3 produkty:
 * 1. iPhone 15 Pro 128GB - €1,329 (flagship)
 * 2. Dyson V12 Detect Slim - €599 (premium appliance)
 * 3. Garmin Forerunner 255 - €349 (sports watch)
 * 
 * Sprawdza:
 * - Czy są prawdziwe ceny (nie mock)
 * - Czy są tylko sklepy NL
 * - Czy są tylko nowe produkty (nie używane/refurbished)
 * - Czy banned keywords działają (nie akcesoria)
 * - Jakość ofert (trust score, price range)
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  {
    name: 'iPhone 15 Pro 128GB',
    ean: '0195949038488',
    basePrice: 1329,
    category: 'Electronics'
  },
  {
    name: 'Dyson V12 Detect Slim',
    ean: '5025155088203',
    basePrice: 599,
    category: 'Home Appliances'
  },
  {
    name: 'Garmin Forerunner 255',
    ean: '0753759298920',
    basePrice: 349,
    category: 'Sports & Outdoors'
  }
];

async function testProduct(product) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 TESTING: ${product.name}`);
  console.log(`📊 EAN: ${product.ean}`);
  console.log(`💰 Base Price: €${product.basePrice}`);
  console.log('='.repeat(80));

  try {
    const result = await fetchMarketOffers({
      productName: product.name,
      ean: product.ean,
      userPrice: product.basePrice,
      userId: 'test-user',
      scanCount: 0,
      maxResults: 30
    });

    if (!result || !result.offers || result.offers.length === 0) {
      console.log('❌ NO OFFERS FOUND');
      return {
        product: product.name,
        success: false,
        offers: 0,
        error: 'No offers'
      };
    }

    const offers = result.offers;
    console.log(`\n✅ FOUND ${offers.length} OFFERS\n`);

    // Analiza ofert
    const analysis = {
      total: offers.length,
      realPrices: 0,
      mockPrices: 0,
      nlShops: 0,
      nonNlShops: 0,
      newProducts: 0,
      usedProducts: 0,
      accessories: 0,
      validOffers: 0,
      priceRange: {
        min: Infinity,
        max: -Infinity,
        avg: 0
      },
      shops: new Set(),
      sources: new Set()
    };

    offers.forEach((offer, idx) => {
      // Sprawdź czy mock
      const isMock = offer._source === 'mock' || offer.source === 'mock';
      if (isMock) {
        analysis.mockPrices++;
      } else {
        analysis.realPrices++;
      }

      // Sprawdź sklep
      const seller = (offer.seller || '').toLowerCase();
      analysis.shops.add(seller);
      
      // Sprawdź czy NL
      const isNl = seller.includes('.nl') || 
                   ['bol', 'coolblue', 'mediamarkt', 'alternate', 'belsimpel'].some(s => seller.includes(s));
      if (isNl) {
        analysis.nlShops++;
      } else {
        analysis.nonNlShops++;
      }

      // Sprawdź czy używany/refurbished
      const title = (offer.title || '').toLowerCase();
      const isUsed = title.includes('gebruikt') || 
                     title.includes('tweedehands') || 
                     title.includes('refurbished') ||
                     title.includes('gereviseerd');
      if (isUsed) {
        analysis.usedProducts++;
      } else {
        analysis.newProducts++;
      }

      // Sprawdź czy akcesoria
      const isAccessory = title.includes('hoes') || 
                          title.includes('hoesje') ||
                          title.includes('case') ||
                          title.includes('cover') ||
                          title.includes('band') ||
                          title.includes('filter') ||
                          title.includes('stofzak');
      if (isAccessory) {
        analysis.accessories++;
      }

      // Cena
      const price = offer.price || 0;
      if (price > 0) {
        analysis.priceRange.min = Math.min(analysis.priceRange.min, price);
        analysis.priceRange.max = Math.max(analysis.priceRange.max, price);
        analysis.priceRange.avg += price;
      }

      // Source
      if (offer._source) {
        analysis.sources.add(offer._source);
      }

      // Valid offer (NL, new, not accessory, real price)
      if (isNl && !isUsed && !isAccessory && !isMock && price > 0) {
        analysis.validOffers++;
      }

      // Print top 5 offers
      if (idx < 5) {
        console.log(`${idx + 1}. ${seller.padEnd(25)} €${price.toString().padStart(6)} ${isMock ? '(MOCK)' : '(REAL)'} - ${title.substring(0, 50)}`);
      }
    });

    analysis.priceRange.avg = analysis.priceRange.avg / offers.length;

    // Raport
    console.log('\n📊 ANALYSIS:');
    console.log('─'.repeat(80));
    console.log(`Total Offers:        ${analysis.total}`);
    console.log(`Real Prices:         ${analysis.realPrices} (${Math.round(analysis.realPrices/analysis.total*100)}%)`);
    console.log(`Mock Prices:         ${analysis.mockPrices} (${Math.round(analysis.mockPrices/analysis.total*100)}%)`);
    console.log(`NL Shops:            ${analysis.nlShops} (${Math.round(analysis.nlShops/analysis.total*100)}%)`);
    console.log(`Non-NL Shops:        ${analysis.nonNlShops} (${Math.round(analysis.nonNlShops/analysis.total*100)}%)`);
    console.log(`New Products:        ${analysis.newProducts} (${Math.round(analysis.newProducts/analysis.total*100)}%)`);
    console.log(`Used/Refurbished:    ${analysis.usedProducts} (${Math.round(analysis.usedProducts/analysis.total*100)}%)`);
    console.log(`Accessories:         ${analysis.accessories} (${Math.round(analysis.accessories/analysis.total*100)}%)`);
    console.log(`Valid Offers:        ${analysis.validOffers} (${Math.round(analysis.validOffers/analysis.total*100)}%)`);
    console.log(`Price Range:         €${Math.round(analysis.priceRange.min)} - €${Math.round(analysis.priceRange.max)}`);
    console.log(`Average Price:       €${Math.round(analysis.priceRange.avg)}`);
    console.log(`Unique Shops:        ${analysis.shops.size}`);
    console.log(`Sources:             ${Array.from(analysis.sources).join(', ')}`);

    // Verdict
    console.log('\n🎯 VERDICT:');
    if (analysis.mockPrices > analysis.realPrices) {
      console.log('❌ MOSTLY MOCK DATA - need real API integration');
    } else if (analysis.realPrices > 0) {
      console.log('✅ REAL PRICES WORKING');
    }

    if (analysis.validOffers / analysis.total >= 0.8) {
      console.log('✅ HIGH QUALITY OFFERS (80%+ valid)');
    } else if (analysis.validOffers / analysis.total >= 0.5) {
      console.log('⚠️  MEDIUM QUALITY OFFERS (50-80% valid)');
    } else {
      console.log('❌ LOW QUALITY OFFERS (<50% valid)');
    }

    if (analysis.accessories > 0) {
      console.log(`⚠️  ACCESSORIES DETECTED (${analysis.accessories}) - banned keywords not working`);
    } else {
      console.log('✅ NO ACCESSORIES - banned keywords working');
    }

    return {
      product: product.name,
      success: true,
      ...analysis,
      shops: Array.from(analysis.shops),
      sources: Array.from(analysis.sources)
    };

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return {
      product: product.name,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🚀 STARTING PRODUCT TESTS - REAL PRICES CHECK');
  console.log('Testing 3 products with increased pagination (3 pages)');
  console.log('Checking: Real prices, NL shops, New products, No accessories\n');

  const results = [];

  for (const product of PRODUCTS) {
    const result = await testProduct(product);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between tests
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL SUMMARY');
  console.log('='.repeat(80));

  const summary = {
    totalTests: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    totalOffers: results.reduce((sum, r) => sum + (r.total || 0), 0),
    totalRealPrices: results.reduce((sum, r) => sum + (r.realPrices || 0), 0),
    totalMockPrices: results.reduce((sum, r) => sum + (r.mockPrices || 0), 0),
    totalValidOffers: results.reduce((sum, r) => sum + (r.validOffers || 0), 0)
  };

  console.log(`Tests Run:           ${summary.totalTests}`);
  console.log(`Successful:          ${summary.successful}`);
  console.log(`Failed:              ${summary.failed}`);
  console.log(`Total Offers:        ${summary.totalOffers}`);
  console.log(`Real Prices:         ${summary.totalRealPrices} (${Math.round(summary.totalRealPrices/summary.totalOffers*100)}%)`);
  console.log(`Mock Prices:         ${summary.totalMockPrices} (${Math.round(summary.totalMockPrices/summary.totalOffers*100)}%)`);
  console.log(`Valid Offers:        ${summary.totalValidOffers} (${Math.round(summary.totalValidOffers/summary.totalOffers*100)}%)`);

  console.log('\n🎯 OVERALL VERDICT:');
  if (summary.totalRealPrices > summary.totalMockPrices) {
    console.log('✅ REAL PRICES WORKING - API integration successful');
  } else {
    console.log('❌ MOSTLY MOCK DATA - API integration needed');
  }

  if (summary.totalValidOffers / summary.totalOffers >= 0.7) {
    console.log('✅ HIGH QUALITY RESULTS - filters working well');
  } else {
    console.log('⚠️  QUALITY NEEDS IMPROVEMENT - check filters');
  }

  console.log('\n');
}

// Run tests
runTests().catch(console.error);
