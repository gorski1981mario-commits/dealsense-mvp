/**
 * TEST SCAN ENDPOINT - NOWE PRODUKTY
 */

const BACKEND_URL = 'http://localhost:3000';

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
  }
];

async function testProduct(product) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n📦 ${product.name}`);
  console.log(`   EAN: ${product.ean}`);
  console.log(`   Expected: €${product.expectedPrice}\n`);

  try {
    const response = await fetch(`${BACKEND_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ean: product.ean,
        product_name: product.name,
        base_price: product.expectedPrice,
        fingerprint: 'test_user_123',
        url: ''
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.offers && data.offers.length > 0) {
      console.log(`✅ Found ${data.offers.length} offers:\n`);
      
      const top5 = data.offers.slice(0, 5);
      
      top5.forEach((offer, i) => {
        const price = offer.price || offer.final_price || 0;
        const savings = product.expectedPrice - price;
        const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);
        
        console.log(`   ${i + 1}. €${price.toFixed(2)} - ${offer.seller || offer.shop || 'Unknown'}`);
        console.log(`      Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`      Title: ${(offer.title || offer.product_name || 'N/A').substring(0, 60)}...`);
      });

      // Quality check
      const nlShops = data.offers.filter(o => {
        const seller = (o.seller || o.shop || '').toLowerCase();
        const link = o.link || o.url || '';
        return link.includes('.nl') || 
               ['bol.com', 'coolblue', 'mediamarkt', 'wehkamp'].some(s => seller.includes(s));
      });
      
      const newProducts = data.offers.filter(o => {
        const title = (o.title || o.product_name || '').toLowerCase();
        return !title.includes('gebruikt') &&
               !title.includes('refurbished') &&
               !title.includes('tweedehands');
      });

      console.log(`\n   📊 Quality:`);
      console.log(`      Total: ${data.offers.length}`);
      console.log(`      NL shops: ${nlShops.length} (${((nlShops.length/data.offers.length)*100).toFixed(0)}%)`);
      console.log(`      New: ${newProducts.length} (${((newProducts.length/data.offers.length)*100).toFixed(0)}%)`);
      console.log(`      Best: €${data.offers[0].price || data.offers[0].final_price}`);

      return {
        success: true,
        offers: data.offers.length,
        nlShops: nlShops.length,
        newProducts: newProducts.length,
        bestPrice: data.offers[0].price || data.offers[0].final_price
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
  console.log('🧪 TESTING NEW PRODUCTS - /scan ENDPOINT\n');
  console.log('='.repeat(70));

  const results = [];

  for (const product of NEW_PRODUCTS) {
    const result = await testProduct(product);
    results.push({ product: product.name, ...result });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n\n${'='.repeat(70)}`);
  console.log('\n📊 FINAL SUMMARY:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total: ${results.length}`);
  console.log(`Success: ${successful.length} (${((successful.length/results.length)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('✅ SUCCESSFUL:\n');
    successful.forEach(r => {
      console.log(`   ${r.product}:`);
      console.log(`      ${r.offers} offers, ${r.nlShops} NL (${((r.nlShops/r.offers)*100).toFixed(0)}%)`);
      console.log(`      Best: €${r.bestPrice?.toFixed(2)}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED:');
    failed.forEach(r => {
      console.log(`   - ${r.product}: ${r.error}`);
    });
  }

  console.log(`\n${'='.repeat(70)}\n`);
}

runTests().catch(console.error);
