/**
 * TEST PRODUKTÓW FASHION - 3 PRODUKTY
 * 
 * Testuje 3 produkty z mody:
 * 1. Nike Air Max 90 - €140 (sneakers)
 * 2. Levi's 501 Jeans - €100 (jeans)
 * 3. The North Face Nuptse Jacket - €300 (kurtka)
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  {
    name: 'Nike Air Max 90',
    ean: '0195866137790',
    basePrice: 140,
    category: 'Sneakers'
  },
  {
    name: "Levi's 501 Original Jeans",
    ean: '5400970016509',
    basePrice: 100,
    category: 'Jeans'
  },
  {
    name: 'The North Face Nuptse Jacket',
    ean: '0001888161831',
    basePrice: 300,
    category: 'Jacket'
  }
];

async function testProduct(product) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 TESTING: ${product.name}`);
  console.log(`📊 EAN: ${product.ean}`);
  console.log(`💰 Base Price: €${product.basePrice}`);
  console.log(`📦 Category: ${product.category}`);
  console.log('='.repeat(80));

  try {
    const result = await fetchMarketOffers({
      productName: product.name,
      ean: product.ean,
      userPrice: product.basePrice,
      userId: 'test-fashion',
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
      correctProduct: 0,
      wrongProduct: 0,
      newProducts: 0,
      usedProducts: 0,
      priceRange: {
        min: Infinity,
        max: -Infinity,
        avg: 0
      },
      shops: new Set(),
      titles: []
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
                   ['bol', 'coolblue', 'zalando', 'aboutyou', 'omoda', 'wehkamp', 'bijenkorf'].some(s => seller.includes(s));
      if (isNl) {
        analysis.nlShops++;
      }

      // Sprawdź czy to właściwy produkt
      const title = (offer.title || '').toLowerCase();
      const productKeywords = product.name.toLowerCase().split(' ').filter(w => w.length > 3);
      const matchCount = productKeywords.filter(kw => title.includes(kw)).length;
      const isCorrect = matchCount >= 2; // Przynajmniej 2 słowa kluczowe
      
      if (isCorrect) {
        analysis.correctProduct++;
      } else {
        analysis.wrongProduct++;
      }

      // Sprawdź czy używany
      const isUsed = title.includes('gebruikt') || 
                     title.includes('tweedehands') || 
                     title.includes('used') ||
                     title.includes('vintage') ||
                     title.includes('pre-owned');
      if (isUsed) {
        analysis.usedProducts++;
      } else {
        analysis.newProducts++;
      }

      // Cena
      const price = offer.price || 0;
      if (price > 0) {
        analysis.priceRange.min = Math.min(analysis.priceRange.min, price);
        analysis.priceRange.max = Math.max(analysis.priceRange.max, price);
        analysis.priceRange.avg += price;
      }

      // Zapisz tytuły pierwszych 10 ofert
      if (idx < 10) {
        analysis.titles.push({
          seller,
          price,
          title: title.substring(0, 60),
          correct: isCorrect,
          mock: isMock,
          used: isUsed
        });
      }
    });

    analysis.priceRange.avg = analysis.priceRange.avg / offers.length;

    // Wyświetl pierwsze 10 ofert
    console.log('TOP 10 OFFERS:');
    analysis.titles.forEach((t, i) => {
      const status = t.correct ? '✅' : '❌';
      const type = t.mock ? 'MOCK' : 'REAL';
      const condition = t.used ? 'USED' : 'NEW';
      console.log(`${i+1}. ${status} ${t.seller.padEnd(25)} €${t.price.toString().padStart(6)} (${type}/${condition}) - ${t.title}`);
    });

    // Raport
    console.log('\n📊 ANALYSIS:');
    console.log('─'.repeat(80));
    console.log(`Total Offers:        ${analysis.total}`);
    console.log(`Real Prices:         ${analysis.realPrices} (${Math.round(analysis.realPrices/analysis.total*100)}%)`);
    console.log(`Mock Prices:         ${analysis.mockPrices} (${Math.round(analysis.mockPrices/analysis.total*100)}%)`);
    console.log(`NL Shops:            ${analysis.nlShops} (${Math.round(analysis.nlShops/analysis.total*100)}%)`);
    console.log(`Correct Product:     ${analysis.correctProduct} (${Math.round(analysis.correctProduct/analysis.total*100)}%)`);
    console.log(`Wrong Product:       ${analysis.wrongProduct} (${Math.round(analysis.wrongProduct/analysis.total*100)}%)`);
    console.log(`New Products:        ${analysis.newProducts} (${Math.round(analysis.newProducts/analysis.total*100)}%)`);
    console.log(`Used Products:       ${analysis.usedProducts} (${Math.round(analysis.usedProducts/analysis.total*100)}%)`);
    console.log(`Price Range:         €${Math.round(analysis.priceRange.min)} - €${Math.round(analysis.priceRange.max)}`);
    console.log(`Average Price:       €${Math.round(analysis.priceRange.avg)}`);
    console.log(`Unique Shops:        ${analysis.shops.size}`);

    // Verdict
    console.log('\n🎯 VERDICT:');
    if (analysis.mockPrices > analysis.realPrices) {
      console.log('❌ MOSTLY MOCK DATA');
    } else if (analysis.realPrices > 0) {
      console.log('✅ REAL PRICES WORKING');
    }

    if (analysis.correctProduct / analysis.total >= 0.7) {
      console.log('✅ CORRECT PRODUCTS (70%+)');
    } else if (analysis.correctProduct / analysis.total >= 0.3) {
      console.log('⚠️  MIXED RESULTS (30-70% correct)');
    } else {
      console.log('❌ WRONG PRODUCTS (<30% correct)');
    }

    if (analysis.usedProducts > 0) {
      console.log(`⚠️  USED PRODUCTS DETECTED (${analysis.usedProducts}) - filters may need adjustment`);
    } else {
      console.log('✅ NO USED PRODUCTS - filters working');
    }

    return {
      product: product.name,
      success: true,
      ...analysis,
      shops: Array.from(analysis.shops)
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
  console.log('\n🚀 TESTING 3 FASHION PRODUCTS');
  console.log('Categories: Sneakers, Jeans, Jacket');
  console.log('Checking: Real prices, Correct products, NL shops, New vs Used\n');

  const results = [];

  for (const product of PRODUCTS) {
    const result = await testProduct(product);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
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
    totalCorrect: results.reduce((sum, r) => sum + (r.correctProduct || 0), 0),
    totalWrong: results.reduce((sum, r) => sum + (r.wrongProduct || 0), 0),
    totalUsed: results.reduce((sum, r) => sum + (r.usedProducts || 0), 0)
  };

  console.log(`Tests Run:           ${summary.totalTests}`);
  console.log(`Successful:          ${summary.successful}`);
  console.log(`Failed:              ${summary.failed}`);
  console.log(`Total Offers:        ${summary.totalOffers}`);
  console.log(`Real Prices:         ${summary.totalRealPrices} (${Math.round(summary.totalRealPrices/summary.totalOffers*100)}%)`);
  console.log(`Mock Prices:         ${summary.totalMockPrices} (${Math.round(summary.totalMockPrices/summary.totalOffers*100)}%)`);
  console.log(`Correct Products:    ${summary.totalCorrect} (${Math.round(summary.totalCorrect/summary.totalOffers*100)}%)`);
  console.log(`Wrong Products:      ${summary.totalWrong} (${Math.round(summary.totalWrong/summary.totalOffers*100)}%)`);
  console.log(`Used Products:       ${summary.totalUsed} (${Math.round(summary.totalUsed/summary.totalOffers*100)}%)`);

  console.log('\n🎯 OVERALL VERDICT:');
  if (summary.totalRealPrices > summary.totalMockPrices) {
    console.log('✅ REAL PRICES WORKING');
  } else {
    console.log('❌ MOSTLY MOCK DATA');
  }

  if (summary.totalCorrect / summary.totalOffers >= 0.5) {
    console.log('✅ PRODUCTS MATCHING (50%+)');
  } else {
    console.log('❌ PRODUCTS NOT MATCHING (<50%)');
  }

  if (summary.totalUsed === 0) {
    console.log('✅ NO USED PRODUCTS - filters perfect');
  } else {
    console.log(`⚠️  USED PRODUCTS FOUND (${summary.totalUsed}) - check filters`);
  }

  console.log('\n');
}

// Run tests
runTests().catch(console.error);
