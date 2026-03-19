// Test crawler na NISZOWYCH sklepach (nie bol.com, coolblue, mediamarkt)
require('dotenv').config();

const crawlerSearch = require('./crawler/search-wrapper');

async function testNicheShops() {
  console.log('🧪 TEST CRAWLER - NISZOWE SKLEPY\n');
  console.log('='.repeat(70));
  console.log('\n📋 Strategia:');
  console.log('  1. Testuj NISZOWE sklepy (małe, bez cookie bannerów)');
  console.log('  2. Jeśli działają → użyj ich zamiast gigantów');
  console.log('  3. Niszowe często mają prostsze strony (bez JS)\n');
  console.log('='.repeat(70));
  
  const query = 'iPhone 15';
  
  console.log(`\n📱 Produkt: ${query}`);
  console.log('🎯 Targeting: NISZOWE sklepy (nie bol.com)\n');
  
  // Wyłącz smart targeting żeby wybrać losowe niszowe
  process.env.USE_SMART_TARGETING = 'false';
  process.env.ROTATION_ENABLED = 'false';
  
  try {
    const startTime = Date.now();
    
    const offers = await crawlerSearch.searchProduct({
      query: query,
      ean: null,
      maxDomains: 5, // Tylko 5 niszowych
      category: 'products',
      userId: 'test-niche-123',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas: ${duration}ms\n`);
    console.log('='.repeat(70));
    
    if (!offers || offers.length === 0) {
      console.log('\n❌ Niszowe sklepy nie zwróciły ofert\n');
      console.log('💡 Możliwe przyczyny:');
      console.log('   - Proxy timeout');
      console.log('   - Brak parsera dla tych domen');
      console.log('   - Sklepy wymagają JavaScript\n');
      return false;
    }
    
    console.log(`\n✅ Niszowe zwróciły ${offers.length} ofert!\n`);
    
    console.log('📋 OFERTY Z NISZOWYCH:\n');
    offers.forEach((o, i) => {
      console.log(`${i + 1}. ${o._domain || 'Unknown'}`);
      console.log(`   Seller: ${o.seller || 'N/A'}`);
      console.log(`   Cena: €${(o.price || 0).toFixed(2)}`);
      console.log(`   Regex: ${o._regexParsed ? 'TAK' : 'NIE'}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('\n📊 ANALIZA:\n');
    
    const domains = [...new Set(offers.map(o => o._domain))];
    const withRegex = offers.filter(o => o._regexParsed).length;
    const withPrice = offers.filter(o => o.price > 0).length;
    
    console.log(`Unikalne domeny: ${domains.length}`);
    console.log(`Z regex: ${withRegex}`);
    console.log(`Z ceną: ${withPrice}`);
    
    if (withPrice > 0) {
      const prices = offers.filter(o => o.price > 0).map(o => o.price);
      console.log(`\nNajniższa: €${Math.min(...prices).toFixed(2)}`);
      console.log(`Najwyższa: €${Math.max(...prices).toFixed(2)}`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (withPrice > 0) {
      console.log('\n🎉 SUKCES! Niszowe sklepy DZIAŁAJĄ!');
      console.log('\n💡 STRATEGIA:');
      console.log('   1. Użyj NISZOWYCH zamiast gigantów (bol.com, coolblue)');
      console.log('   2. Niszowe mają prostsze strony (mniej cookie bannerów)');
      console.log('   3. GotFetcher + regex działa na niszowych!');
      return true;
    } else {
      console.log('\n⚠️  Niszowe zwróciły oferty ale bez cen');
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ BŁĄD: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

testNicheShops()
  .then((success) => {
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('\n🎉 NISZOWE SKLEPY = ROZWIĄZANIE!');
      console.log('✅ Używaj niszowych zamiast gigantów\n');
    } else {
      console.log('\n⚠️  Niszowe też nie działają - trzeba innej strategii\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
