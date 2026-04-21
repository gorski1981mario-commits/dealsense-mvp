/**
 * TEST NOWYCH PRODUKTÓW - RÓŻNE KATEGORIE
 * Testuje SearchAPI backend z nowymi EAN kodami
 */

const BACKEND_URL = 'http://localhost:3001';

const NEW_PRODUCTS = [
  {
    name: 'Sony PlayStation 5',
    ean: '0711719395003',
    category: 'Gaming',
    expectedPrice: 499
  },
  {
    name: 'Apple AirPods Pro 2',
    ean: '0194253398905',
    category: 'Audio',
    expectedPrice: 279
  },
  {
    name: 'Philips Airfryer XXL',
    ean: '8710103906087',
    category: 'Kitchen',
    expectedPrice: 199
  },
  {
    name: 'Nespresso Vertuo Next',
    ean: '7630047625329',
    category: 'Coffee',
    expectedPrice: 129
  },
  {
    name: 'Fitbit Charge 6',
    ean: '0810038856704',
    category: 'Fitness',
    expectedPrice: 159
  },
  {
    name: 'Nintendo Switch OLED',
    ean: '0045496882747',
    category: 'Gaming',
    expectedPrice: 349
  },
  {
    name: 'Bose QuietComfort 45',
    ean: '0017817831796',
    category: 'Audio',
    expectedPrice: 329
  },
  {
    name: 'DeLonghi Magnifica S',
    ean: '8004399329362',
    category: 'Coffee',
    expectedPrice: 399
  }
];

async function testProduct(product) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📦 ${product.name}`);
  console.log(`   EAN: ${product.ean}`);
  console.log(`   Category: ${product.category}`);
  console.log(`   Expected: €${product.expectedPrice}\n`);

  try {
    const response = await fetch(`${BACKEND_URL}/api/market/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: product.name,
        ean: product.ean,
        maxResults: 5
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.offers && data.offers.length > 0) {
      console.log(`✅ Found ${data.offers.length} offers:\n`);
      
      data.offers.forEach((offer, i) => {
        const savings = product.expectedPrice - offer.price;
        const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);
        
        console.log(`   ${i + 1}. €${offer.price} - ${offer.seller}`);
        console.log(`      Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`      Title: ${offer.title.substring(0, 60)}...`);
        console.log(`      Domain: ${offer.domain || 'N/A'}`);
      });

      // Check quality
      const nlShops = data.offers.filter(o => 
        o.domain?.endsWith('.nl') || 
        ['bol.com', 'coolblue', 'mediamarkt', 'wehkamp'].some(s => o.seller?.toLowerCase().includes(s))
      );
      
      const newProducts = data.offers.filter(o => 
        !o.title?.toLowerCase().includes('gebruikt') &&
        !o.title?.toLowerCase().includes('refurbished') &&
        !o.title?.toLowerCase().includes('tweedehands')
      );

      console.log(`\n   📊 Quality Check:`);
      console.log(`      NL shops: ${nlShops.length}/${data.offers.length}`);
      console.log(`      New products: ${newProducts.length}/${data.offers.length}`);
      console.log(`      Best price: €${data.offers[0].price} (${data.offers[0].seller})`);

      return {
        success: true,
        offers: data.offers.length,
        nlShops: nlShops.length,
        newProducts: newProducts.length,
        bestPrice: data.offers[0].price,
        bestSeller: data.offers[0].seller
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
  console.log('🧪 TESTING NEW PRODUCTS - SEARCHAPI BACKEND\n');
  console.log('='.repeat(60));

  const results = [];

  for (const product of NEW_PRODUCTS) {
    const result = await testProduct(product);
    results.push({ product: product.name, ...result });
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('\n📊 FINAL SUMMARY:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total products tested: ${results.length}`);
  console.log(`Successful: ${successful.length} (${((successful.length/results.length)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('✅ SUCCESSFUL PRODUCTS:');
    successful.forEach(r => {
      console.log(`   - ${r.product}: ${r.offers} offers, ${r.nlShops} NL shops, €${r.bestPrice} (${r.bestSeller})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED PRODUCTS:');
    failed.forEach(r => {
      console.log(`   - ${r.product}: ${r.error}`);
    });
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

runTests().catch(console.error);
