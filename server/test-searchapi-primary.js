/**
 * TEST SEARCHAPI AS PRIMARY SOURCE
 * 
 * Nowe produkty z różnych kategorii (nie testowane wcześniej)
 * Expected: 100% success rate
 */

require('dotenv').config();
const axios = require('axios');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

// NOWE PRODUKTY - różne kategorie (nie testowane wcześniej)
const TEST_PRODUCTS = [
  // Elektronika
  { name: 'Apple AirPods Pro 2', category: 'Elektronika', expectedPrice: 279 },
  { name: 'PlayStation 5', category: 'Gaming', expectedPrice: 549 },
  { name: 'GoPro Hero 12', category: 'Kamery', expectedPrice: 449 },
  
  // Dom & Kuchnia
  { name: 'Philips Airfryer XXL', category: 'Kuchnia', expectedPrice: 199 },
  { name: 'Nespresso Vertuo', category: 'Kuchnia', expectedPrice: 149 },
  { name: 'iRobot Roomba j7', category: 'Dom', expectedPrice: 599 },
  
  // Sport & Outdoor
  { name: 'Fitbit Charge 6', category: 'Sport', expectedPrice: 159 },
  { name: 'Decathlon Mountainbike', category: 'Sport', expectedPrice: 399 },
  
  // Moda
  { name: 'Adidas Ultraboost', category: 'Moda', expectedPrice: 180 },
  { name: 'The North Face Jas', category: 'Moda', expectedPrice: 299 },
  
  // Zabawki & Hobby
  { name: 'LEGO Technic Porsche', category: 'Zabawki', expectedPrice: 169 },
  { name: 'Nintendo Switch OLED', category: 'Gaming', expectedPrice: 349 }
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

    // Extract prices
    const offers = results
      .filter(r => r.extracted_price)
      .map(r => ({
        title: r.title,
        price: r.extracted_price,
        shop: r.seller || 'Unknown',
        link: r.product_link
      }))
      .filter(o => o.price > 10 && o.price < 10000);

    if (offers.length === 0) {
      console.log('  ❌ No valid offers');
      return {
        ...product,
        success: false,
        offers: 0
      };
    }

    // Calculate stats
    const prices = offers.map(o => o.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const savings = product.expectedPrice - minPrice;
    const savingsPercent = (savings / product.expectedPrice * 100).toFixed(1);

    console.log(`  ✅ ${offers.length} offers`);
    console.log(`  Price range: €${minPrice.toFixed(2)} - €${maxPrice.toFixed(2)}`);
    console.log(`  Average: €${avgPrice.toFixed(2)}`);
    console.log(`  Best deal: €${minPrice.toFixed(2)} (${savingsPercent}% savings)`);
    
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
      minPrice,
      maxPrice,
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
  console.log('\n🔍 TESTING SEARCHAPI AS PRIMARY SOURCE\n');
  console.log(`Products: ${TEST_PRODUCTS.length} (nowe, nie testowane wcześniej)`);
  console.log(`Categories: ${[...new Set(TEST_PRODUCTS.map(p => p.category))].join(', ')}`);
  console.log(`Expected: 100% success rate\n`);
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
  console.log('📊 FINAL RESULTS - SEARCHAPI');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const successRate = (successful / results.length * 100).toFixed(1);
  const totalOffers = results.reduce((sum, r) => sum + r.offers, 0);
  const avgOffers = (totalOffers / successful).toFixed(1);

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
      console.log(`  ${status} ${r.name.padEnd(30)} - ${info}`);
    });
  });

  // Top shops
  const allShops = results
    .filter(r => r.success && r.topShops)
    .flatMap(r => r.topShops);
  
  const shopCounts = {};
  allShops.forEach(shop => {
    shopCounts[shop] = (shopCounts[shop] || 0) + 1;
  });
  
  const topShops = Object.entries(shopCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\n🏪 Top 10 Shops (most frequent in top 3):');
  topShops.forEach(([shop, count], i) => {
    console.log(`  ${i+1}. ${shop.padEnd(25)} - ${count} times`);
  });

  console.log('\n🎯 VERDICT:');
  if (parseFloat(successRate) === 100) {
    console.log(`✅ PERFECT! 100% success rate`);
    console.log(`   SearchAPI działa dla WSZYSTKICH produktów`);
    console.log(`   Wszystkie kategorie: elektronika, dom, sport, moda, gaming, zabawki`);
    console.log(`   Average ${avgOffers} offers per product`);
    console.log(`   READY FOR PRODUCTION`);
  } else if (parseFloat(successRate) >= 90) {
    console.log(`✅ EXCELLENT! ${successRate}% success rate`);
    console.log(`   SearchAPI działa dla większości produktów`);
  } else {
    console.log(`⚠️  ${successRate}% success rate - niżej niż oczekiwano`);
  }

  console.log('\n');
}

runTest().catch(console.error);
