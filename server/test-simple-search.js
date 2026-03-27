/**
 * PROSTY TEST - bez filtrów, sprawdź co zwraca SearchAPI
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

async function simpleTest() {
  console.log('🧪 SIMPLE TEST - Samsung Galaxy S24 Ultra\n');
  
  const result = await fetchMarketOffers({
    productName: 'Samsung Galaxy S24 Ultra 256GB',
    ean: '8806095334790',
    userPrice: 1449,
    userId: 'test-simple',
    scanCount: 0,
    maxResults: 30
  });

  console.log('\n📊 RESULT:', result ? 'exists' : 'null');
  
  if (!result) {
    console.log('❌ NO RESULT - result is null');
    return;
  }
  
  if (!result.offers) {
    console.log('❌ NO OFFERS - result.offers is null/undefined');
    console.log('Result keys:', Object.keys(result));
    return;
  }

  console.log(`\n✅ GOT ${result.offers.length} OFFERS\n`);
  
  // Pokaż pierwsze 10
  result.offers.slice(0, 10).forEach((offer, i) => {
    console.log(`${i+1}. ${offer.seller.padEnd(30)} €${offer.price.toString().padStart(6)} - ${offer.title.substring(0, 60)}`);
  });
}

simpleTest().catch(console.error);
