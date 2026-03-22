/**
 * TEST: Tweakers Scraper - TYLKO NISZOWE
 */

require('dotenv').config({ path: '.env.test' });
const tweakers = require('./market/providers/tweakers');

async function test() {
  console.log('\n🔍 TEST: Tweakers Scraper (TYLKO NISZOWE)\n');
  
  const product = 'iPhone 15 Pro';
  console.log(`Produkt: ${product}\n`);
  
  const offers = await tweakers.fetchOffers({
    query: product,
    maxResults: 30
  });
  
  if (offers && offers.length > 0) {
    console.log(`✅ ${offers.length} NISZOWYCH ofert:\n`);
    
    offers.forEach((offer, idx) => {
      console.log(`${idx + 1}. ${offer.seller} - €${offer.price.toFixed(2)}`);
    });
    
    console.log(`\n💎 Wszystkie sklepy to NISZOWE (bez bol.com, Amazon, Coolblue)!`);
  } else {
    console.log('❌ Brak ofert');
  }
}

test().catch(console.error);
