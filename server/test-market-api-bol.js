// Test market-api end-to-end - bol.com przez GotFetcher + IPRoyal + regex
require('dotenv').config();

process.env.USE_OWN_CRAWLER = 'true';
process.env.USE_MOCK_FALLBACK = 'false'; // WYŁĄCZ MOCK!
process.env.CRAWLER_MAX_DOMAINS = '1'; // Tylko bol.com
process.env.USE_PROXY = 'true';
process.env.PROXY_PROVIDER = 'iproyal';
process.env.ROTATION_ENABLED = 'false';
process.env.USE_SMART_TARGETING = 'false';
process.env.MARKET_LOG_SILENT = '0'; // Włącz logi

const { fetchMarketOffers } = require('./market-api');

async function testMarketApiBol() {
  console.log('🧪 TEST MARKET-API END-TO-END - BOL.COM\n');
  console.log('='.repeat(70));
  console.log('\n📋 Konfiguracja:');
  console.log('  USE_OWN_CRAWLER: true');
  console.log('  Crawler: GotFetcher + IPRoyal proxy');
  console.log('  Parser: bol.com (CSS + regex fallback)');
  console.log('  Domains: 1 (tylko bol.com)\n');
  console.log('='.repeat(70));
  
  const product = 'iPhone 15';
  const basePrice = 900;
  
  console.log(`\n📱 Produkt: ${product}`);
  console.log(`💰 Cena bazowa: €${basePrice}`);
  console.log(`📊 Szukamy: price < €${basePrice}\n`);
  console.log('='.repeat(70));
  
  try {
    console.log('\n🕷️  Wywołuję market-api...\n');
    
    const startTime = Date.now();
    const offers = await fetchMarketOffers(product, null, {
      userId: 'test-user-123',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas: ${duration}ms\n`);
    console.log('='.repeat(70));
    
    if (!offers || offers.length === 0) {
      console.log('\n❌ Brak ofert');
      console.log('⚠️  Crawler nie zwrócił ofert\n');
      return false;
    }
    
    console.log(`\n✅ Znaleziono ${offers.length} ofert\n`);
    
    // Filtruj tańsze niż bazowa
    const cheaper = offers.filter(o => o.price && o.price < basePrice);
    
    console.log('📋 WSZYSTKIE OFERTY:\n');
    offers.slice(0, 10).forEach((o, i) => {
      const price = o.price || 0;
      const seller = o.seller || o._domain || 'Unknown';
      const source = o._source || 'unknown';
      const isCheaper = price < basePrice ? '✅' : '❌';
      const regexParsed = o._regexParsed ? '(REGEX)' : '';
      
      console.log(`${i + 1}. ${isCheaper} ${seller} ${regexParsed}`);
      console.log(`   Cena: €${price.toFixed(2)}`);
      console.log(`   Źródło: ${source}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('\n📊 STATYSTYKI:\n');
    console.log(`Wszystkie oferty: ${offers.length}`);
    console.log(`Tańsze niż €${basePrice}: ${cheaper.length}`);
    console.log(`Z crawlera: ${offers.filter(o => o._source === 'crawler').length}`);
    console.log(`Z regex: ${offers.filter(o => o._regexParsed).length}`);
    
    if (cheaper.length > 0) {
      const lowest = Math.min(...cheaper.map(o => o.price));
      const savings = basePrice - lowest;
      console.log(`\nNajniższa cena: €${lowest.toFixed(2)}`);
      console.log(`Oszczędność: €${savings.toFixed(2)} (${((savings/basePrice)*100).toFixed(1)}%)`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    const fromCrawler = offers.filter(o => o._source === 'crawler').length;
    const fromRegex = offers.filter(o => o._regexParsed).length;
    
    if (fromCrawler > 0) {
      console.log('\n✅ SUKCES! Crawler działa!');
      console.log(`✅ ${fromCrawler} ofert z crawlera`);
      if (fromRegex > 0) {
        console.log(`✅ ${fromRegex} ofert przez REGEX (omija cookie banner)`);
      }
      return true;
    } else {
      console.log('\n⚠️  Crawler nie zwrócił ofert - używa fallback');
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

testMarketApiBol()
  .then((success) => {
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('\n🎉 SYSTEM DZIAŁA - pobiera ceny przez GotFetcher + IPRoyal + regex!\n');
    } else {
      console.log('\n⚠️  System wymaga dalszych poprawek\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
