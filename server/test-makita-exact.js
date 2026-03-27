/**
 * TEST EXACT MATCH - Makita DHP484
 * 
 * Test 1: "Makita DHP484" (bez set) → body only
 * Test 2: "Makita DHP484 set" → zestawy
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

async function testExactMatch() {
  console.log('\n🧪 TEST EXACT MATCH - Makita DHP484\n');
  
  // TEST 1: Bez "set" - powinno dać body only
  console.log('='.repeat(80));
  console.log('TEST 1: "Makita DHP484" (bez set) → oczekiwane: body only');
  console.log('='.repeat(80));
  
  const result1 = await fetchMarketOffers({
    productName: 'Makita DHP484',
    ean: '0088381650892',
    userPrice: 150,
    userId: 'test-exact',
    scanCount: 0,
    maxResults: 30
  });
  
  if (result1 && result1.offers) {
    console.log(`\n✅ ZNALEZIONO ${result1.offers.length} OFERT\n`);
    result1.offers.slice(0, 5).forEach((o, i) => {
      const hasSet = (o.title || '').toLowerCase().includes('set') || (o.title || '').toLowerCase().includes('kit');
      const status = hasSet ? '❌ SET/KIT' : '✅ BODY ONLY';
      console.log(`${i+1}. ${status} - €${o.price} - ${(o.title || '').substring(0, 60)}`);
    });
  } else {
    console.log('❌ BRAK OFERT');
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // TEST 2: Z "set" - powinno dać zestawy
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: "Makita DHP484 set" → oczekiwane: zestawy');
  console.log('='.repeat(80));
  
  const result2 = await fetchMarketOffers({
    productName: 'Makita DHP484 set',
    ean: '0088381650892',
    userPrice: 280,
    userId: 'test-exact',
    scanCount: 0,
    maxResults: 30
  });
  
  if (result2 && result2.offers) {
    console.log(`\n✅ ZNALEZIONO ${result2.offers.length} OFERT\n`);
    result2.offers.slice(0, 5).forEach((o, i) => {
      const hasSet = (o.title || '').toLowerCase().includes('set') || (o.title || '').toLowerCase().includes('kit');
      const status = hasSet ? '✅ SET/KIT' : '❌ BODY ONLY';
      console.log(`${i+1}. ${status} - €${o.price} - ${(o.title || '').substring(0, 60)}`);
    });
  } else {
    console.log('❌ BRAK OFERT');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 PODSUMOWANIE');
  console.log('='.repeat(80));
  console.log(`Test 1 (bez set): ${result1?.offers?.length || 0} ofert`);
  console.log(`Test 2 (z set): ${result2?.offers?.length || 0} ofert`);
  console.log('\n✅ EXACT MATCH działa jeśli:');
  console.log('  - Test 1 zwraca body only (bez set/kit w tytule)');
  console.log('  - Test 2 zwraca zestawy (z set/kit w tytule)');
}

testExactMatch().catch(console.error);
