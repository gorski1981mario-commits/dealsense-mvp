// TEST z ZUPEŁNIE NOWYMI produktami - bez cache
const https = require('https');

const RENDER_URL = 'dealsense-aplikacja.onrender.com';

// ZUPEŁNIE NOWE produkty (nigdy nie testowane)
const testProducts = [
  { name: 'Samsung Galaxy Tab S9', basePrice: 600 },
  { name: 'Bose QuietComfort 45', basePrice: 350 },
  { name: 'DJI Mini 3 Pro', basePrice: 800 },
  { name: 'Garmin Fenix 7', basePrice: 700 },
  { name: 'Canon EOS R6', basePrice: 2500 }
];

function callMarketApi(productName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      product_name: productName,
      ean: null,
      userId: 'test-fresh-' + Date.now(),
      userLocation: 'Amsterdam',
      geoEnabled: true
    });

    const options = {
      hostname: RENDER_URL,
      port: 443,
      path: '/api/market',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testFreshProducts() {
  console.log('🧪 TEST - ZUPEŁNIE NOWE PRODUKTY (bez cache)\n');
  console.log('='.repeat(70));
  console.log('\n🎯 CEL: Sprawdzić ile SearchAPI zwraca vs ile zostaje po filtrach\n');
  console.log('='.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    console.log(`\n${i + 1}/5 TEST: ${product.name}`);
    console.log(`   Cena bazowa: €${product.basePrice}\n`);
    
    try {
      const startTime = Date.now();
      const response = await callMarketApi(product.name);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        const json = JSON.parse(response.body);
        const offers = json.offers || [];
        
        const uniqueShops = [...new Set(offers.map(o => o.seller))];
        const prices = offers.map(o => o.price).filter(p => p > 0);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ⏱️  Czas: ${duration}ms`);
        console.log(`   📊 Oferty: ${offers.length}`);
        console.log(`   🏪 Sklepy: ${uniqueShops.length}`);
        if (lowestPrice > 0) {
          console.log(`   💰 Najniższa: €${lowestPrice.toFixed(2)}`);
        }
        
        results.push({
          product: product.name,
          offers: offers.length,
          shops: uniqueShops.length,
          lowestPrice,
          duration
        });
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        results.push({ product: product.name, offers: 0, shops: 0 });
      }
      
    } catch (error) {
      console.log(`   ❌ Błąd: ${error.message}`);
      results.push({ product: product.name, offers: 0, shops: 0 });
    }
    
    if (i < testProducts.length - 1) {
      console.log('\n   ⏳ Czekam 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 PODSUMOWANIE:\n');
  
  const avgOffers = results.reduce((sum, r) => sum + r.offers, 0) / results.length;
  const avgShops = results.reduce((sum, r) => sum + r.shops, 0) / results.length;
  
  console.log(`Średnio ofert: ${avgOffers.toFixed(1)}`);
  console.log(`Średnio sklepów: ${avgShops.toFixed(1)}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 TERAZ SPRAWDŹ LOGI RENDER:\n');
  console.log('Szukaj linii:');
  console.log('  [SearchAPI] Page X: shopping_results=...');
  console.log('  [MARKET] Filtering: X → blocked: Y → NL retail: Z');
  console.log('\nTo pokaże gdzie są wycinane oferty!\n');
  console.log('='.repeat(70));
}

testFreshProducts()
  .then(() => {
    console.log('\n✅ Test zakończony\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
