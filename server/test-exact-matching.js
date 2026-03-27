/**
 * TEST EXACT MATCHING - Kod produktu
 * 
 * Test 1: "Makita DHP484" (ogólny) → wszystkie warianty
 * Test 2: "Makita DHP484Z" (body only) → tylko DHP484Z
 * Test 3: "Makita DHP484RMJ" (set) → tylko DHP484RMJ
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

async function testExactMatching() {
  console.log('\n🧪 TEST EXACT MATCHING - Kod produktu\n');
  
  // TEST 1: Ogólny kod - wszystkie warianty
  console.log('='.repeat(80));
  console.log('TEST 1: "Makita DHP484" (ogólny) → wszystkie warianty');
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
      const title = (o.title || '').toLowerCase();
      const hasZ = title.includes('dhp484z');
      const hasRMJ = title.includes('dhp484rmj');
      const hasRTJ = title.includes('dhp484rtj');
      const variant = hasZ ? 'Z (body)' : hasRMJ ? 'RMJ (set)' : hasRTJ ? 'RTJ (kit)' : 'inne';
      console.log(`${i+1}. [${variant}] €${o.price} - ${(o.title || '').substring(0, 60)}`);
    });
  } else {
    console.log('❌ BRAK OFERT');
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // TEST 2: Dokładny kod - tylko body only
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: "Makita DHP484Z" (body only) → tylko DHP484Z');
  console.log('='.repeat(80));
  
  const result2 = await fetchMarketOffers({
    productName: 'Makita DHP484Z',
    ean: '0088381650892',
    userPrice: 130,
    userId: 'test-exact',
    scanCount: 0,
    maxResults: 30
  });
  
  if (result2 && result2.offers) {
    console.log(`\n✅ ZNALEZIONO ${result2.offers.length} OFERT\n`);
    result2.offers.slice(0, 5).forEach((o, i) => {
      const title = (o.title || '').toLowerCase();
      const hasZ = title.includes('dhp484z');
      const status = hasZ ? '✅ CORRECT (Z)' : '❌ WRONG';
      console.log(`${i+1}. ${status} €${o.price} - ${(o.title || '').substring(0, 60)}`);
    });
  } else {
    console.log('❌ BRAK OFERT');
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // TEST 3: Dokładny kod - tylko set
  console.log('\n' + '='.repeat(80));
  console.log('TEST 3: "Makita DHP484RMJ" (set) → tylko DHP484RMJ');
  console.log('='.repeat(80));
  
  const result3 = await fetchMarketOffers({
    productName: 'Makita DHP484RMJ',
    ean: '0088381650892',
    userPrice: 280,
    userId: 'test-exact',
    scanCount: 0,
    maxResults: 30
  });
  
  if (result3 && result3.offers) {
    console.log(`\n✅ ZNALEZIONO ${result3.offers.length} OFERT\n`);
    result3.offers.slice(0, 5).forEach((o, i) => {
      const title = (o.title || '').toLowerCase();
      const hasRMJ = title.includes('dhp484rmj');
      const status = hasRMJ ? '✅ CORRECT (RMJ)' : '❌ WRONG';
      console.log(`${i+1}. ${status} €${o.price} - ${(o.title || '').substring(0, 60)}`);
    });
  } else {
    console.log('❌ BRAK OFERT');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 PODSUMOWANIE');
  console.log('='.repeat(80));
  console.log(`Test 1 (ogólny): ${result1?.offers?.length || 0} ofert (wszystkie warianty)`);
  console.log(`Test 2 (DHP484Z): ${result2?.offers?.length || 0} ofert (tylko body only)`);
  console.log(`Test 3 (DHP484RMJ): ${result3?.offers?.length || 0} ofert (tylko set)`);
  console.log('\n✅ EXACT MATCHING działa jeśli:');
  console.log('  - Test 1 zwraca różne warianty (Z, RMJ, RTJ)');
  console.log('  - Test 2 zwraca TYLKO DHP484Z');
  console.log('  - Test 3 zwraca TYLKO DHP484RMJ');
}

testExactMatching().catch(console.error);
