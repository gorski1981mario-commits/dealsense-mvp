/**
 * TEST PROSTEGO PRODUKTU - DYSON
 */

const BACKEND_URL = 'http://localhost:3000';

async function testSimpleProduct() {
  console.log('🧪 TESTING SIMPLE PRODUCT\n');
  
  const product = {
    name: 'Dyson V15',
    expectedPrice: 500
  };
  
  console.log(`📦 ${product.name}`);
  console.log(`   Expected: €${product.expectedPrice}\n`);
  
  try {
    console.log('Sending request to /scan...\n');
    
    const response = await fetch(`${BACKEND_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: product.name,
        base_price: product.expectedPrice,
        fingerprint: 'test_' + Date.now(),
        url: '',
        availability: 'in_stock'
      })
    });
    
    console.log(`Response status: ${response.status}\n`);
    
    const data = await response.json();
    
    if (data.offers && data.offers.length > 0) {
      console.log(`✅ SUCCESS! Found ${data.offers.length} offers\n`);
      data.offers.forEach((offer, i) => {
        const price = offer.price || offer.final_price || 0;
        const savings = product.expectedPrice - price;
        const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);
        
        console.log(`${i + 1}. €${price.toFixed(2)} - ${offer.seller || offer.shop}`);
        console.log(`   Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`   Title: ${(offer.title || 'N/A').substring(0, 60)}...`);
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total offers: ${data.offers.length}`);
      console.log(`   Best price: €${data.offers[0].price || data.offers[0].final_price}`);
      console.log(`   Market fetch: ${data.marketFetchMs}ms`);
      console.log(`   Pending: ${data.pending || false}`);
      
    } else {
      console.log('\n⚠️ No offers found');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

testSimpleProduct().catch(console.error);
