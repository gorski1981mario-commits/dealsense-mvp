// 5 NOWYCH PRODUKTÓW - bez cache
// Test czy pages=3 zwiększa liczbę sklepów

const https = require('https');

const RENDER_URL = 'dealsense-aplikacja.onrender.com';

// 5 NOWYCH produktów (nie testowane wcześniej)
const testProducts = [
  { name: 'Nintendo Switch OLED', basePrice: 350 },
  { name: 'Sony WH-1000XM5', basePrice: 400 },
  { name: 'iPad Air 2024', basePrice: 700 },
  { name: 'Dyson V15 Detect', basePrice: 600 },
  { name: 'GoPro Hero 12', basePrice: 450 }
];

function callMarketApi(productName, basePrice) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      product_name: productName,
      ean: null,
      userId: 'test-new-' + Date.now(),
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

async function run5NewTests() {
  console.log('🧪 5 NOWYCH PRODUKTÓW - TEST SearchAPI pages=3\n');
  console.log('='.repeat(70));
  console.log('\n🎯 CEL:');
  console.log('  - Nowe produkty (bez cache)');
  console.log('  - Sprawdzić czy pages=3 działa');
  console.log('  - Oczekiwane: 30-40 sklepów per request\n');
  console.log('='.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    console.log(`\n${i + 1}/5 TEST: ${product.name}`);
    console.log(`   Cena bazowa: €${product.basePrice}`);
    console.log(`   Szukam: price < €${product.basePrice}\n`);
    
    try {
      const startTime = Date.now();
      const response = await callMarketApi(product.name, product.basePrice);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        const json = JSON.parse(response.body);
        const offers = json.offers || [];
        
        // Analiza źródeł
        const sources = {};
        offers.forEach(o => {
          const src = o._source || 'unknown';
          sources[src] = (sources[src] || 0) + 1;
        });
        
        // Analiza cen
        const prices = offers.map(o => o.price).filter(p => p > 0);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const savings = lowestPrice > 0 ? product.basePrice - lowestPrice : 0;
        
        // Unikalne sklepy
        const uniqueShops = [...new Set(offers.map(o => o.seller))];
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   ⏱️  Czas: ${duration}ms`);
        console.log(`   📊 Oferty: ${offers.length}`);
        console.log(`   🏪 Unikalne sklepy: ${uniqueShops.length}`);
        console.log(`   💰 Najniższa cena: €${lowestPrice.toFixed(2)}`);
        console.log(`   💸 Oszczędność: €${savings.toFixed(2)} (${((savings/product.basePrice)*100).toFixed(1)}%)`);
        console.log(`\n   📋 Źródła:`);
        Object.entries(sources).forEach(([src, count]) => {
          console.log(`      ${src}: ${count}`);
        });
        
        results.push({
          product: product.name,
          success: true,
          offers: offers.length,
          uniqueShops: uniqueShops.length,
          lowestPrice,
          savings,
          duration,
          sources
        });
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        console.log(`   Body: ${response.body.substring(0, 200)}`);
        
        results.push({
          product: product.name,
          success: false,
          error: `HTTP ${response.status}`
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Błąd: ${error.message}`);
      
      results.push({
        product: product.name,
        success: false,
        error: error.message
      });
    }
    
    // Delay między testami
    if (i < testProducts.length - 1) {
      console.log('\n   ⏳ Czekam 3s przed następnym testem...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 PODSUMOWANIE - 5 NOWYCH PRODUKTÓW:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Udane: ${successful.length}/5`);
  console.log(`❌ Nieudane: ${failed.length}/5\n`);
  
  if (successful.length > 0) {
    console.log('🏆 WYNIKI:\n');
    
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.product}`);
      console.log(`   Oferty: ${r.offers}`);
      console.log(`   Sklepy: ${r.uniqueShops}`);
      console.log(`   Najniższa: €${r.lowestPrice.toFixed(2)}`);
      console.log(`   Oszczędność: €${r.savings.toFixed(2)}`);
      console.log(`   Czas: ${r.duration}ms`);
      console.log('');
    });
    
    // Statystyki
    const avgOffers = successful.reduce((sum, r) => sum + r.offers, 0) / successful.length;
    const avgShops = successful.reduce((sum, r) => sum + r.uniqueShops, 0) / successful.length;
    const avgTime = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const totalSavings = successful.reduce((sum, r) => sum + r.savings, 0);
    
    console.log('📈 ŚREDNIE:\n');
    console.log(`   Oferty per request: ${avgOffers.toFixed(1)}`);
    console.log(`   Sklepy per request: ${avgShops.toFixed(1)}`);
    console.log(`   Czas per request: ${avgTime.toFixed(0)}ms`);
    console.log(`   Łączne oszczędności: €${totalSavings.toFixed(2)}\n`);
    
    // Analiza źródeł
    const allSources = {};
    successful.forEach(r => {
      Object.entries(r.sources).forEach(([src, count]) => {
        allSources[src] = (allSources[src] || 0) + count;
      });
    });
    
    console.log('📊 ŹRÓDŁA (łącznie):\n');
    Object.entries(allSources)
      .sort((a, b) => b[1] - a[1])
      .forEach(([src, count]) => {
        console.log(`   ${src}: ${count} ofert`);
      });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 WNIOSKI:\n');
    
    if (avgShops >= 30) {
      console.log(`✅ SUKCES! Średnio ${avgShops.toFixed(0)} sklepów per request`);
      console.log('✅ pages=3 DZIAŁA! (30-40 sklepów)');
      console.log('✅ Koszt: ~$0.015 per search (3 pages)');
      console.log(`✅ Dla 10,000 searches/miesiąc = ~$150`);
    } else if (avgShops >= 15) {
      console.log(`⚠️  Średnio ${avgShops.toFixed(0)} sklepów per request`);
      console.log('⚠️  pages=3 pomogło, ale wciąż poniżej 30');
      console.log('💡 Rozważ pages=5 dla 40-50 sklepów');
    } else {
      console.log(`❌ Tylko ${avgShops.toFixed(0)} sklepów per request`);
      console.log('❌ pages=3 NIE DZIAŁA lub crawler wciąż włączony');
      console.log('💡 Sprawdź USE_OWN_CRAWLER=false w Render');
    }
    
  }
  
  console.log('\n' + '='.repeat(70));
}

run5NewTests()
  .then(() => {
    console.log('\n✅ Testy zakończone\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
