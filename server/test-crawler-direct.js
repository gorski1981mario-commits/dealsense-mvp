// Test crawlera bezpośrednio (bez market-api)
require('dotenv').config();

process.env.USE_PROXY = 'true';
process.env.PROXY_PROVIDER = 'iproyal';
process.env.ROTATION_ENABLED = 'false'; // Wyłącz rotation - użyj smart targeting
process.env.USE_SMART_TARGETING = 'true'; // Włącz smart targeting

const crawlerSearch = require('./crawler/search-wrapper');

async function testCrawlerDirect() {
  console.log('🧪 TEST CRAWLERA BEZPOŚREDNIO\n');
  console.log('='.repeat(70));
  
  console.log('\n📋 Konfiguracja:');
  console.log(`Proxy: ${process.env.USE_PROXY === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Provider: ${process.env.PROXY_PROVIDER}`);
  console.log(`Max domains: 3\n`);
  console.log('='.repeat(70));
  
  try {
    console.log('\n🔍 Szukam: iPhone 15\n');
    
    const offers = await crawlerSearch.searchProduct({
      query: 'iPhone 15',
      ean: null,
      maxDomains: 3,
      category: 'products',
      userId: 'test-user',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Crawler zwrócił ${offers.length} ofert\n`);
    
    if (offers.length === 0) {
      console.log('❌ PROBLEM: Crawler nie znalazł ofert');
      console.log('\nMożliwe przyczyny:');
      console.log('1. URL patterns są niepoprawne (404 errors)');
      console.log('2. Parsery nie mogą znaleźć selektorów');
      console.log('3. Strony wymagają JavaScript (Playwright)');
      console.log('4. Proxy blokuje requesty');
      return false;
    }
    
    console.log('📋 OFERTY:\n');
    offers.forEach((o, i) => {
      console.log(`${i + 1}. ${o.seller || o._domain}`);
      console.log(`   Cena: €${o.price || 0}`);
      console.log(`   URL: ${(o.url || '').substring(0, 60)}...`);
      console.log(`   Źródło: ${o._source || 'unknown'}`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

testCrawlerDirect()
  .then((success) => {
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('\n✅ Crawler działa!\n');
    } else {
      console.log('\n❌ Crawler wymaga poprawek\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
