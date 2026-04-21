/**
 * TEST NOWYCH PRODUKTÓW - BEZPOŚREDNIO PRZEZ MARKET-API
 * Omija server.js i testuje bezpośrednio SearchAPI
 */

const { searchProductsViaSearchAPI } = require('./market-api');

const NEW_PRODUCTS = [
  {
    name: 'Sony PlayStation 5',
    query: 'Sony PlayStation 5 console',
    category: 'Gaming',
    expectedPrice: 499
  },
  {
    name: 'Apple AirPods Pro 2',
    query: 'Apple AirPods Pro 2nd generation',
    category: 'Audio',
    expectedPrice: 279
  },
  {
    name: 'Philips Airfryer XXL',
    query: 'Philips Airfryer XXL HD9650',
    category: 'Kitchen',
    expectedPrice: 199
  },
  {
    name: 'Nespresso Vertuo Next',
    query: 'Nespresso Vertuo Next koffiemachine',
    category: 'Coffee',
    expectedPrice: 129
  },
  {
    name: 'Fitbit Charge 6',
    query: 'Fitbit Charge 6 activity tracker',
    category: 'Fitness',
    expectedPrice: 159
  },
  {
    name: 'Nintendo Switch OLED',
    query: 'Nintendo Switch OLED model',
    category: 'Gaming',
    expectedPrice: 349
  },
  {
    name: 'Bose QuietComfort 45',
    query: 'Bose QuietComfort 45 headphones',
    category: 'Audio',
    expectedPrice: 329
  },
  {
    name: 'DeLonghi Magnifica S',
    query: 'DeLonghi Magnifica S koffiemachine',
    category: 'Coffee',
    expectedPrice: 399
  }
];

async function testProduct(product) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n📦 ${product.name}`);
  console.log(`   Query: ${product.query}`);
  console.log(`   Category: ${product.category}`);
  console.log(`   Expected: €${product.expectedPrice}\n`);

  try {
    const result = await searchProductsViaSearchAPI(product.query, {
      maxResults: 10,
      country: 'nl'
    });

    if (result && result.offers && result.offers.length > 0) {
      console.log(`✅ Found ${result.offers.length} offers:\n`);
      
      // Show top 5
      const top5 = result.offers.slice(0, 5);
      
      top5.forEach((offer, i) => {
        const savings = product.expectedPrice - offer.price;
        const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);
        
        console.log(`   ${i + 1}. €${offer.price.toFixed(2)} - ${offer.seller || offer.source}`);
        console.log(`      Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`      Title: ${offer.title?.substring(0, 60) || 'N/A'}...`);
        if (offer.link) {
          const domain = new URL(offer.link).hostname;
          console.log(`      Domain: ${domain}`);
        }
      });

      // Quality check
      const nlShops = result.offers.filter(o => {
        if (!o.link) return false;
        const domain = new URL(o.link).hostname;
        return domain.endsWith('.nl') || 
               ['bol.com', 'coolblue', 'mediamarkt', 'wehkamp'].some(s => domain.includes(s));
      });
      
      const newProducts = result.offers.filter(o => 
        o.title && 
        !o.title.toLowerCase().includes('gebruikt') &&
        !o.title.toLowerCase().includes('refurbished') &&
        !o.title.toLowerCase().includes('tweedehands') &&
        !o.title.toLowerCase().includes('2e hands')
      );

      console.log(`\n   📊 Quality Check:`);
      console.log(`      Total offers: ${result.offers.length}`);
      console.log(`      NL shops: ${nlShops.length}/${result.offers.length} (${((nlShops.length/result.offers.length)*100).toFixed(0)}%)`);
      console.log(`      New products: ${newProducts.length}/${result.offers.length} (${((newProducts.length/result.offers.length)*100).toFixed(0)}%)`);
      console.log(`      Best price: €${result.offers[0].price.toFixed(2)}`);
      console.log(`      Avg savings: ${savingsPercent}%`);

      return {
        success: true,
        offers: result.offers.length,
        nlShops: nlShops.length,
        newProducts: newProducts.length,
        bestPrice: result.offers[0].price,
        avgSavings: ((product.expectedPrice - result.offers[0].price) / product.expectedPrice * 100).toFixed(1)
      };
    } else {
      console.log(`⚠️ No offers found`);
      return { success: false, error: 'No offers' };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 TESTING NEW PRODUCTS - SEARCHAPI (REAL DATA)\n');
  console.log('='.repeat(70));

  const results = [];

  for (const product of NEW_PRODUCTS) {
    const result = await testProduct(product);
    results.push({ product: product.name, ...result });
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('\n📊 FINAL SUMMARY:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total products tested: ${results.length}`);
  console.log(`Successful: ${successful.length} (${((successful.length/results.length)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('✅ SUCCESSFUL PRODUCTS:\n');
    successful.forEach(r => {
      console.log(`   ${r.product}:`);
      console.log(`      ${r.offers} offers, ${r.nlShops} NL shops (${((r.nlShops/r.offers)*100).toFixed(0)}%)`);
      console.log(`      Best: €${r.bestPrice?.toFixed(2)}, Avg savings: ${r.avgSavings}%`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED PRODUCTS:');
    failed.forEach(r => {
      console.log(`   - ${r.product}: ${r.error}`);
    });
  }

  // Overall stats
  if (successful.length > 0) {
    const avgNLShops = successful.reduce((sum, r) => sum + (r.nlShops/r.offers)*100, 0) / successful.length;
    const avgNewProducts = successful.reduce((sum, r) => sum + (r.newProducts/r.offers)*100, 0) / successful.length;
    
    console.log(`\n📈 OVERALL QUALITY:`);
    console.log(`   Avg NL shops: ${avgNLShops.toFixed(1)}%`);
    console.log(`   Avg new products: ${avgNewProducts.toFixed(1)}%`);
  }

  console.log(`\n${'='.repeat(70)}\n`);
}

runTests().catch(console.error);
