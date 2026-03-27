/**
 * TEST SEARCHAPI - RÓŻNE KATEGORIE
 * 
 * Testujemy różne produkty z różnych kategorii:
 * - Budowlanka
 * - Moda (kurtki, spodnie, buty)
 * - Narzędzia (szlifierki, wiertarki)
 * - Dom & Ogród
 * - Sport
 * 
 * Expected: 100% success, tylko NOWE produkty, bez abonamentu
 */

require('dotenv').config();
const axios = require('axios');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

// RÓŻNE KATEGORIE - nowe produkty (NIE iPhone!)
const TEST_PRODUCTS = [
  // Budowlanka
  { name: 'Bosch GSR 12V boormachine', category: 'Budowlanka', expectedPrice: 129 },
  { name: 'Makita DHP484Z klopboormachine', category: 'Budowlanka', expectedPrice: 189 },
  
  // Narzędzia
  { name: 'Bosch GWS 7-125 haakse slijper', category: 'Narzędzia', expectedPrice: 79 },
  { name: 'DeWalt DCS355N multitool', category: 'Narzędzia', expectedPrice: 149 },
  
  // Moda - Kurtki
  { name: 'The North Face 1996 Nuptse jas', category: 'Moda', expectedPrice: 329 },
  { name: 'Patagonia Down Sweater jas', category: 'Moda', expectedPrice: 279 },
  
  // Moda - Spodnie
  { name: 'Levi\'s 501 Original jeans', category: 'Moda', expectedPrice: 99 },
  { name: 'Carhartt WIP Regular Cargo broek', category: 'Moda', expectedPrice: 119 },
  
  // Moda - Buty
  { name: 'Nike Air Force 1 sneakers', category: 'Moda', expectedPrice: 119 },
  { name: 'Adidas Samba OG schoenen', category: 'Moda', expectedPrice: 109 },
  
  // Dom & Keuken
  { name: 'Philips Airfryer XXL HD9860', category: 'Dom', expectedPrice: 249 },
  { name: 'Dyson V11 Absolute steelstofzuiger', category: 'Dom', expectedPrice: 549 },
  
  // Ogród
  { name: 'Bosch Rotak 32 grasmaaier', category: 'Ogród', expectedPrice: 129 },
  { name: 'Kärcher K5 hogedrukreiniger', category: 'Ogród', expectedPrice: 399 },
  
  // Sport
  { name: 'Garmin Forerunner 255 sporthorloge', category: 'Sport', expectedPrice: 349 },
  { name: 'Decathlon Rockrider ST100 mountainbike', category: 'Sport', expectedPrice: 299 }
];

async function searchProduct(product) {
  try {
    console.log(`\n[Search] ${product.name} (${product.category})`);
    console.log(`  Expected: €${product.expectedPrice}`);
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google_shopping',
        q: product.name,
        api_key: SEARCHAPI_KEY,
        gl: 'nl',
        hl: 'nl',
        num: 20
      },
      timeout: 10000
    });

    const results = response.data.shopping_results || [];
    
    if (results.length === 0) {
      console.log('  ❌ No results');
      return {
        ...product,
        success: false,
        offers: 0
      };
    }

    // Extract and filter offers
    let offers = results
      .filter(r => r.extracted_price)
      .map(r => ({
        title: r.title,
        price: r.extracted_price,
        shop: r.seller || 'Unknown',
        condition: r.condition,
        link: r.product_link
      }))
      .filter(o => o.price > 10 && o.price < 10000);

    // FILTR 1: Price range (40%-150%)
    const minPrice = product.expectedPrice * 0.4;
    const maxPrice = product.expectedPrice * 1.5;
    const beforePrice = offers.length;
    offers = offers.filter(o => o.price >= minPrice && o.price <= maxPrice);
    
    // FILTR 2: Banned sellers
    const bannedSellers = ['marktplaats', 'back market', 'backmarket', '2dehands', 'vinted', 'ebay', 'swappie'];
    const beforeSeller = offers.length;
    offers = offers.filter(o => {
      const seller = o.shop.toLowerCase();
      return !bannedSellers.some(banned => seller.includes(banned));
    });
    
    // FILTR 3: Banned keywords (tweedehands, refurbished, abonament)
    const bannedKeywords = [
      'tweedehands', 'gebruikt', 'refurbished', 'refurb', 'renewed',
      'second hand', 'pre-owned', 'demo', 'showmodel', 'open box',
      'abonnement', 'met abonnement', 'subscription', 'contract'
    ];
    const beforeKeyword = offers.length;
    offers = offers.filter(o => {
      const title = o.title.toLowerCase();
      return !bannedKeywords.some(keyword => title.includes(keyword));
    });
    
    // FILTR 4: Condition check
    const beforeCondition = offers.length;
    offers = offers.filter(o => {
      if (!o.condition) return true;
      const cond = o.condition.toLowerCase();
      return !cond.includes('tweedehands') && !cond.includes('refurbished');
    });

    if (offers.length === 0) {
      console.log('  ❌ No valid offers after filtering');
      console.log(`    Filters: price(${beforePrice}→${beforePrice}) seller(${beforeSeller}) keywords(${beforeKeyword}) condition(${beforeCondition})`);
      return {
        ...product,
        success: false,
        offers: 0
      };
    }

    // Calculate stats
    const prices = offers.map(o => o.price);
    const minOfferPrice = Math.min(...prices);
    const maxOfferPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const savings = product.expectedPrice - minOfferPrice;
    const savingsPercent = (savings / product.expectedPrice * 100).toFixed(1);

    console.log(`  ✅ ${offers.length} valid offers`);
    console.log(`  Price range: €${minOfferPrice.toFixed(2)} - €${maxOfferPrice.toFixed(2)}`);
    console.log(`  Average: €${avgPrice.toFixed(2)}`);
    console.log(`  Best deal: €${minOfferPrice.toFixed(2)} (${savingsPercent}% savings)`);
    
    // Show top 3 shops
    const topOffers = offers.sort((a, b) => a.price - b.price).slice(0, 3);
    console.log(`  Top 3:`);
    topOffers.forEach((o, i) => {
      console.log(`    ${i+1}. ${o.shop.padEnd(20)} - €${o.price.toFixed(2)}`);
    });

    return {
      ...product,
      success: true,
      offers: offers.length,
      minPrice: minOfferPrice,
      maxPrice: maxOfferPrice,
      avgPrice,
      savings,
      savingsPercent: parseFloat(savingsPercent),
      topShops: topOffers.map(o => o.shop)
    };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return {
      ...product,
      success: false,
      error: error.message,
      offers: 0
    };
  }
}

async function runTest() {
  console.log('\n🔍 TESTING SEARCHAPI - RÓŻNE KATEGORIE\n');
  console.log(`Products: ${TEST_PRODUCTS.length} (budowlanka, moda, narzędzia, dom, ogród, sport)`);
  console.log(`Categories: ${[...new Set(TEST_PRODUCTS.map(p => p.category))].join(', ')}`);
  console.log(`Expected: 100% success, tylko NOWE produkty, bez abonamentu\n`);
  console.log('='.repeat(80));

  const results = [];

  for (const product of TEST_PRODUCTS) {
    const result = await searchProduct(product);
    results.push(result);
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS - RÓŻNE KATEGORIE');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const successRate = (successful / results.length * 100).toFixed(1);
  const totalOffers = results.reduce((sum, r) => sum + r.offers, 0);
  const avgOffers = successful > 0 ? (totalOffers / successful).toFixed(1) : 0;

  console.log(`\nSuccess rate: ${successRate}% (${successful}/${results.length})`);
  console.log(`Total offers: ${totalOffers}`);
  console.log(`Avg offers per product: ${avgOffers}`);

  // Savings analysis
  const withSavings = results.filter(r => r.success && r.savings > 0);
  if (withSavings.length > 0) {
    const avgSavings = withSavings.reduce((sum, r) => sum + r.savings, 0) / withSavings.length;
    const avgSavingsPercent = withSavings.reduce((sum, r) => sum + r.savingsPercent, 0) / withSavings.length;
    
    console.log(`\nAverage savings: €${avgSavings.toFixed(2)} (${avgSavingsPercent.toFixed(1)}%)`);
  }

  // Per category
  const categories = [...new Set(results.map(r => r.category))];
  
  console.log('\n📋 Per Category:');
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat);
    const catSuccess = catResults.filter(r => r.success).length;
    const catRate = (catSuccess / catResults.length * 100).toFixed(1);
    const catOffers = catResults.reduce((sum, r) => sum + r.offers, 0);
    
    console.log(`\n${cat}: ${catRate}% (${catSuccess}/${catResults.length}) - ${catOffers} offers`);
    catResults.forEach(r => {
      const status = r.success ? '✅' : '❌';
      const info = r.success 
        ? `${r.offers} offers, best €${r.minPrice.toFixed(2)} (${r.savingsPercent.toFixed(1)}% savings)`
        : 'Failed';
      console.log(`  ${status} ${r.name.substring(0, 40).padEnd(42)} - ${info}`);
    });
  });

  console.log('\n🎯 VERDICT:');
  if (parseFloat(successRate) === 100) {
    console.log(`✅ PERFECT! 100% success rate`);
    console.log(`   SearchAPI działa dla WSZYSTKICH kategorii`);
    console.log(`   Filtry wykluczają: tweedehands, refurbished, abonament`);
    console.log(`   Average ${avgOffers} offers per product`);
    console.log(`   READY FOR PRODUCTION`);
  } else if (parseFloat(successRate) >= 80) {
    console.log(`✅ EXCELLENT! ${successRate}% success rate`);
    console.log(`   SearchAPI działa dla większości kategorii`);
  } else {
    console.log(`⚠️  ${successRate}% success rate - niektóre kategorie wymagają poprawek`);
  }

  console.log('\n');
}

runTest().catch(console.error);
