// Test bezpośrednio crawlera - ominięcie market-api
require('dotenv').config();

const crawlerSearch = require('./crawler/search-wrapper');

async function testDirectCrawler() {
  console.log('🧪 TEST BEZPOŚREDNIO CRAWLER - BOL.COM\n');
  console.log('='.repeat(70));
  console.log('\n📋 Konfiguracja:');
  console.log('  Direct crawler call (bez market-api)');
  console.log('  GotFetcher + IPRoyal proxy');
  console.log('  Parser: bol.com z regex fallback\n');
  console.log('='.repeat(70));
  
  const query = 'iPhone 15';
  
  console.log(`\n📱 Produkt: ${query}\n`);
  console.log('🕷️  Wywołuję crawler.searchProduct...\n');
  
  try {
    const startTime = Date.now();
    
    const offers = await crawlerSearch.searchProduct({
      query: query,
      ean: null,
      maxDomains: 1, // Tylko bol.com
      category: 'products',
      userId: 'test-123',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas: ${duration}ms\n`);
    console.log('='.repeat(70));
    
    if (!offers || offers.length === 0) {
      console.log('\n❌ Crawler nie zwrócił ofert\n');
      return false;
    }
    
    console.log(`\n✅ Crawler zwrócił ${offers.length} ofert\n`);
    
    console.log('📋 OFERTY:\n');
    offers.forEach((o, i) => {
      console.log(`${i + 1}. ${o.seller || o._domain || 'Unknown'}`);
      console.log(`   Cena: €${(o.price || 0).toFixed(2)}`);
      console.log(`   Regex: ${o._regexParsed ? 'TAK' : 'NIE'}`);
      console.log(`   Domain: ${o._domain || 'N/A'}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('\n📊 STATYSTYKI:\n');
    console.log(`Wszystkie oferty: ${offers.length}`);
    console.log(`Z regex: ${offers.filter(o => o._regexParsed).length}`);
    console.log(`Z bol.com: ${offers.filter(o => o._domain === 'bol.com').length}`);
    
    if (offers.length > 0) {
      const prices = offers.map(o => o.price || 0).filter(p => p > 0);
      if (prices.length > 0) {
        console.log(`\nNajniższa cena: €${Math.min(...prices).toFixed(2)}`);
        console.log(`Najwyższa cena: €${Math.max(...prices).toFixed(2)}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    
    const hasRegex = offers.some(o => o._regexParsed);
    if (hasRegex) {
      console.log('\n🎉 SUKCES! Regex parser działa!');
      console.log('✅ GotFetcher + IPRoyal + regex = CENY BEZ COOKIE BANNER!');
      return true;
    } else if (offers.length > 0) {
      console.log('\n✅ Crawler działa, ale bez regex (CSS selektory zadziałały)');
      return true;
    } else {
      console.log('\n⚠️  Crawler nie zwrócił ofert');
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

testDirectCrawler()
  .then((success) => {
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('\n🎉 CRAWLER DZIAŁA - gotowy do integracji z market-api!\n');
    } else {
      console.log('\n⚠️  Crawler wymaga poprawek\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
