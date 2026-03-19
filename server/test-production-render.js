// Test produkcyjnego serwera Render - 5 produktów
// Wywołuje API endpoint na Render z IPRoyal proxy

const https = require('https');

const RENDER_URL = 'https://dealsense-aplikacja.onrender.com'; // Prawidłowy URL Render

async function callRenderAPI(productName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      product_name: productName,
      ean: null,
      userId: 'test-user-123',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });
    
    const options = {
      hostname: 'dealsense-aplikacja.onrender.com',
      port: 443,
      path: '/api/market',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}. Response: ${data.substring(0, 100)}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testProductionRender() {
  console.log('🧪 TEST PRODUKCYJNEGO SERWERA RENDER\n');
  console.log('='.repeat(70));
  console.log(`\n🌐 URL: ${RENDER_URL}`);
  console.log('🔐 IPRoyal Proxy: ENABLED');
  console.log('🕷️  Crawler: ENABLED');
  console.log('📊 Smart Targeting: ENABLED\n');
  console.log('='.repeat(70));
  
  const products = [
    { name: 'iPhone 15 Pro', basePrice: 1200 },
    { name: 'Samsung Galaxy S24', basePrice: 900 },
    { name: 'MacBook Air M3', basePrice: 1400 },
    { name: 'Sony WH-1000XM5', basePrice: 350 },
    { name: 'iPad Air', basePrice: 700 }
  ];
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n📱 PRODUKT ${i + 1}/5: ${product.name}\n`);
    console.log(`💰 Cena bazowa: €${product.basePrice}`);
    console.log(`📊 Szukamy: price < €${product.basePrice}\n`);
    console.log('-'.repeat(70));
    
    try {
      console.log(`🌐 POST ${RENDER_URL}/api/market`);
      console.log(`📦 Body: { product_name: "${product.name}", userId: "test-user-123" }`);
      console.log('⏳ Czekam na odpowiedź...\n');
      
      const startTime = Date.now();
      const response = await callRenderAPI(product.name);
      const duration = Date.now() - startTime;
      
      const offers = response.offers || [];
      
      if (offers.length === 0) {
        console.log('⚠️  Brak ofert');
        console.log(`⏱️  Czas: ${duration}ms\n`);
        
        results.push({
          product: product.name,
          success: false,
          offers: 0,
          duration
        });
        continue;
      }
      
      console.log(`✅ Otrzymano ${offers.length} ofert w ${duration}ms\n`);
      
      // Filtruj tańsze niż bazowa
      const cheaper = offers.filter(o => o.price && o.price < product.basePrice);
      
      console.log('🏆 TOP 5 OFERT:\n');
      offers.slice(0, 5).forEach((o, idx) => {
        const price = o.price || 0;
        const seller = o.seller || o._domain || 'Unknown';
        const source = o._source || 'unknown';
        const isCheaper = price < product.basePrice ? '✅' : '❌';
        const savings = product.basePrice - price;
        
        console.log(`${idx + 1}. ${isCheaper} ${seller}`);
        console.log(`   Cena: €${price.toFixed(2)}`);
        console.log(`   Oszczędność: €${savings.toFixed(2)} (${((savings/product.basePrice)*100).toFixed(1)}%)`);
        console.log(`   Źródło: ${source}`);
        console.log('');
      });
      
      // Statystyki
      const lowestPrice = Math.min(...offers.map(o => o.price || Infinity));
      const fromCrawler = offers.filter(o => o._source === 'crawler').length;
      const fromMock = offers.filter(o => o._source === 'mock').length;
      const maxSavings = product.basePrice - lowestPrice;
      
      console.log('-'.repeat(70));
      console.log('\n📊 STATYSTYKI:\n');
      console.log(`Wszystkie oferty: ${offers.length}`);
      console.log(`Tańsze niż bazowa: ${cheaper.length} (${((cheaper.length/offers.length)*100).toFixed(0)}%)`);
      console.log(`Z crawlera: ${fromCrawler}`);
      console.log(`Z mock: ${fromMock}`);
      console.log(`Najniższa cena: €${lowestPrice.toFixed(2)}`);
      console.log(`Max oszczędność: €${maxSavings.toFixed(2)} (${((maxSavings/product.basePrice)*100).toFixed(1)}%)`);
      
      results.push({
        product: product.name,
        success: true,
        offers: offers.length,
        cheaper: cheaper.length,
        fromCrawler,
        fromMock,
        lowestPrice,
        savings: maxSavings,
        duration
      });
      
    } catch (error) {
      console.log(`\n❌ BŁĄD: ${error.message}`);
      
      results.push({
        product: product.name,
        success: false,
        error: error.message
      });
    }
    
    // Delay między produktami
    if (i < products.length - 1) {
      console.log('\n⏳ Czekam 5s przed następnym produktem...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // PODSUMOWANIE
  console.log('\n' + '='.repeat(70));
  console.log('\n🎯 PODSUMOWANIE - 5 PRODUKTÓW\n');
  console.log('='.repeat(70));
  console.log('\n');
  
  results.forEach((r, i) => {
    const status = r.success && r.fromCrawler > 0 ? '✅' : (r.success ? '⚠️' : '❌');
    console.log(`${status} ${i + 1}. ${r.product}`);
    
    if (r.success) {
      console.log(`   Oferty: ${r.offers} (${r.cheaper} tańszych)`);
      console.log(`   Crawler: ${r.fromCrawler}, Mock: ${r.fromMock}`);
      if (r.lowestPrice) {
        console.log(`   Najniższa: €${r.lowestPrice.toFixed(2)}`);
        console.log(`   Oszczędność: €${r.savings.toFixed(2)}`);
      }
      console.log(`   Czas: ${r.duration}ms`);
    } else {
      console.log(`   Błąd: ${r.error || 'Brak ofert'}`);
    }
    console.log('');
  });
  
  // Globalne statystyki
  const successful = results.filter(r => r.success).length;
  const withCrawler = results.filter(r => r.fromCrawler > 0).length;
  const totalOffers = results.reduce((sum, r) => sum + (r.offers || 0), 0);
  const totalFromCrawler = results.reduce((sum, r) => sum + (r.fromCrawler || 0), 0);
  const totalSavings = results.reduce((sum, r) => sum + (r.savings || 0), 0);
  
  console.log('='.repeat(70));
  console.log('\n📈 WYNIKI GLOBALNE:\n');
  console.log(`Produkty przetestowane: ${products.length}`);
  console.log(`Produkty z ofertami: ${successful}`);
  console.log(`Produkty z crawlerem: ${withCrawler}`);
  console.log(`Success rate: ${((successful/products.length)*100).toFixed(0)}%`);
  console.log(`\nWszystkie oferty: ${totalOffers}`);
  console.log(`Z crawlera: ${totalFromCrawler}`);
  console.log(`Łączne oszczędności: €${totalSavings.toFixed(2)}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ WERYFIKACJA:\n');
  
  if (withCrawler > 0) {
    console.log(`✅ CRAWLER DZIAŁA! ${withCrawler}/${products.length} produktów używa crawlera`);
    console.log('✅ IPRoyal proxy jest aktywny');
    console.log('✅ System pobiera prawdziwe ceny!');
  } else if (successful > 0) {
    console.log('⚠️  Crawler nie zwraca ofert - używa mock/API fallback');
    console.log('⚠️  Sprawdź logi Render dashboard');
  } else {
    console.log('❌ System nie działa - sprawdź konfigurację');
  }
  
  console.log('\n' + '='.repeat(70));
  
  return withCrawler > 0;
}

testProductionRender()
  .then((success) => {
    console.log('\n✅ Test zakończony');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
