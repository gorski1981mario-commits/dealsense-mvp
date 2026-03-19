// Prosty test - 1 produkt, prawdziwe ceny
require('dotenv').config();

process.env.USE_OWN_CRAWLER = 'true';
process.env.CRAWLER_MAX_DOMAINS = '3'; // Tylko 3 sklepy dla szybkiego testu
process.env.USE_PROXY = 'true';
process.env.PROXY_PROVIDER = 'iproyal';
process.env.MARKET_LOG_SILENT = 'false';

const { fetchMarketOffers } = require('./market-api');

async function testRealPrices() {
  console.log('🧪 TEST PRAWDZIWYCH CEN - 1 PRODUKT\n');
  console.log('='.repeat(70));
  
  const product = {
    name: 'iPhone 15',
    basePrice: 900
  };
  
  console.log(`\n📱 Produkt: ${product.name}`);
  console.log(`💰 Cena bazowa: €${product.basePrice}`);
  console.log(`📊 Szukamy ofert < €${product.basePrice}\n`);
  console.log('='.repeat(70));
  
  try {
    console.log('\n🕷️  Uruchamiam crawler...\n');
    
    const startTime = Date.now();
    const offers = await fetchMarketOffers(product.name, null, {
      userId: 'test-user',
      userLocation: 'Amsterdam'
    });
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas: ${duration}ms\n`);
    console.log('='.repeat(70));
    
    if (!offers || offers.length === 0) {
      console.log('\n❌ Brak ofert');
      console.log('⚠️  Crawler nie znalazł ofert - sprawdź URL patterns\n');
      return false;
    }
    
    console.log(`\n✅ Znaleziono ${offers.length} ofert\n`);
    
    // Filtruj tańsze niż bazowa
    const cheaper = offers.filter(o => o.price && o.price < product.basePrice);
    
    console.log('📋 WSZYSTKIE OFERTY:\n');
    offers.slice(0, 10).forEach((o, i) => {
      const price = o.price || 0;
      const seller = o.seller || o._domain || 'Unknown';
      const source = o._source || 'unknown';
      const isCheaper = price < product.basePrice ? '✅' : '❌';
      
      console.log(`${i + 1}. ${isCheaper} ${seller}`);
      console.log(`   Cena: €${price.toFixed(2)}`);
      console.log(`   Źródło: ${source}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('\n📊 STATYSTYKI:\n');
    console.log(`Wszystkie oferty: ${offers.length}`);
    console.log(`Tańsze niż €${product.basePrice}: ${cheaper.length}`);
    console.log(`Źródło crawler: ${offers.filter(o => o._source === 'crawler').length}`);
    console.log(`Źródło mock: ${offers.filter(o => o._source === 'mock').length}`);
    
    if (cheaper.length > 0) {
      const lowest = Math.min(...cheaper.map(o => o.price));
      const savings = product.basePrice - lowest;
      console.log(`\nNajniższa cena: €${lowest.toFixed(2)}`);
      console.log(`Oszczędność: €${savings.toFixed(2)} (${((savings/product.basePrice)*100).toFixed(1)}%)`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    // Weryfikacja
    const fromCrawler = offers.filter(o => o._source === 'crawler').length;
    
    if (fromCrawler > 0) {
      console.log('\n✅ SUKCES! Crawler pobiera prawdziwe dane!');
      console.log(`✅ ${fromCrawler} ofert z crawlera`);
      return true;
    } else {
      console.log('\n⚠️  Crawler nie zwrócił ofert - używa mock fallback');
      console.log('⚠️  Sprawdź URL patterns i parsery');
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

testRealPrices()
  .then((success) => {
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('\n🎉 System działa - pobiera prawdziwe ceny!\n');
    } else {
      console.log('\n⚠️  System wymaga dalszych poprawek\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
