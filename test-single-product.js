/**
 * TEST POJEDYNCZEGO PRODUKTU - PROSTY TEST
 */

const BACKEND_URL = 'http://localhost:3000';

async function testSingleProduct() {
  console.log('🧪 TESTING SINGLE PRODUCT\n');
  
  const product = {
    name: 'iPhone 15 Pro',
    ean: '0194253398905',
    expectedPrice: 1000
  };
  
  console.log(`📦 ${product.name}`);
  console.log(`   EAN: ${product.ean}`);
  console.log(`   Expected: €${product.expectedPrice}\n`);
  
  try {
    console.log('Sending request to /scan...\n');
    
    const response = await fetch(`${BACKEND_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ean: product.ean,
        product_name: product.name,
        base_price: product.expectedPrice,
        fingerprint: 'test_' + Date.now(),
        url: '',
        availability: 'in_stock'  // CRITICAL - bez tego backend zwraca "hold"
      })
    });
    
    console.log(`Response status: ${response.status}\n`);
    
    const data = await response.json();
    
    console.log('Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.offers && data.offers.length > 0) {
      console.log(`\n✅ SUCCESS! Found ${data.offers.length} offers`);
      data.offers.slice(0, 3).forEach((offer, i) => {
        console.log(`${i + 1}. €${offer.price} - ${offer.seller || offer.shop}`);
      });
    } else {
      console.log('\n⚠️ No offers found');
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

testSingleProduct().catch(console.error);
