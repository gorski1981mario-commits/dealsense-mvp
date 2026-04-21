/**
 * TEST PRODUKTU Z BRANŻY FASHION - NIKE AIR MAX
 */

const BACKEND_URL = 'http://localhost:3000';

async function testFashionProduct() {
  console.log('🧪 TESTING FASHION PRODUCT\n');
  
  const product = {
    name: 'Nike Air Max 90',
    expectedPrice: 150
  };
  
  console.log(`👟 ${product.name}`);
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
      
      // Pokaż wszystkie oferty żeby zobaczyć CO SIĘ POKAZUJE
      data.offers.forEach((offer, i) => {
        const price = offer.price || offer.final_price || 0;
        const savings = product.expectedPrice - price;
        const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);
        
        console.log(`${i + 1}. €${price.toFixed(2)} - ${offer.seller || offer.shop}`);
        console.log(`   Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`   Title: ${(offer.title || 'N/A').substring(0, 80)}...`);
        console.log('');
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total offers: ${data.offers.length}`);
      console.log(`   Best price: €${(data.offers[0].price || data.offers[0].final_price).toFixed(2)}`);
      console.log(`   Worst price: €${(data.offers[data.offers.length - 1].price || data.offers[data.offers.length - 1].final_price).toFixed(2)}`);
      
      // Analiza jakości
      const nlShops = data.offers.filter(o => {
        const seller = (o.seller || o.shop || '').toLowerCase();
        const link = o.link || o.url || '';
        return link.includes('.nl') || 
               ['bol.com', 'coolblue', 'wehkamp', 'zalando'].some(s => seller.includes(s));
      });
      
      console.log(`\n📊 Quality:`);
      console.log(`   NL shops: ${nlShops.length}/${data.offers.length} (${((nlShops.length/data.offers.length)*100).toFixed(0)}%)`);
      
    } else {
      console.log('\n⚠️ No offers found');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

testFashionProduct().catch(console.error);
