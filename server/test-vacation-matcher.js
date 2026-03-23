/**
 * Test Vacation Configuration Matcher
 * 
 * User buduje konfigurację → My matchujemy do ofert → Wyciągamy ceny
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const { searchVacationOffers } = require('./market/vacation-matcher');

// Profil wakacji (z konfiguratora)
const userConfig = {
  destination: 'Turkije',
  departureDate: '2026-07-01',
  duration: 7,
  adults: 2,
  children: 1,
  childrenAges: [5],
  stars: '4',
  board: 'all_inclusive',
  departureAirport: 'Amsterdam'
};

async function testVacationMatcher() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              VACATION CONFIGURATION MATCHER - TEST                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 USER CONFIGURATION:');
  console.log(`   Destination: ${userConfig.destination}`);
  console.log(`   Dates: ${userConfig.departureDate} - ${userConfig.duration} dni`);
  console.log(`   Passengers: ${userConfig.adults} adults, ${userConfig.children} children (${userConfig.childrenAges.join(', ')} lat)`);
  console.log(`   Hotel: ${userConfig.stars} sterren, ${userConfig.board}`);
  console.log(`   Departure: ${userConfig.departureAirport}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  console.log('🔍 SEARCHING & MATCHING OFFERS...');
  console.log('');
  
  const offers = await searchVacationOffers(userConfig);
  
  console.log('═'.repeat(80));
  console.log('');
  console.log('📊 RESULTS:');
  console.log('');
  
  if (offers.length === 0) {
    console.log('❌ No matching offers found');
    return;
  }
  
  console.log(`✅ Found ${offers.length} matching offers`);
  console.log('');
  
  offers.forEach((offer, i) => {
    const totalPersons = userConfig.adults + userConfig.children;
    
    console.log(`${i + 1}. ${offer.title}`);
    console.log(`   💰 Price: €${offer.price} (€${offer.pricePerPerson}/person)`);
    console.log(`   🎯 Match Score: ${offer.matchScore}%`);
    console.log(`   ✓ Matched: ${Object.entries(offer.matchDetails).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
    console.log(`   🏢 Seller: ${offer.seller}`);
    console.log(`   🔗 Link: ${offer.link}`);
    console.log('');
  });
  
  // Best offer
  const best = offers[0];
  console.log('═'.repeat(80));
  console.log('');
  console.log('🏆 BEST MATCH:');
  console.log('');
  console.log(`   ${best.title}`);
  console.log(`   💰 €${best.price} (€${best.pricePerPerson}/person)`);
  console.log(`   🎯 ${best.matchScore}% match`);
  console.log(`   🏢 ${best.seller}`);
  console.log(`   🔗 ${best.link}`);
  console.log('');
  
  // Summary by seller
  const bySeller = {};
  offers.forEach(offer => {
    if (!bySeller[offer.seller]) {
      bySeller[offer.seller] = [];
    }
    bySeller[offer.seller].push(offer);
  });
  
  console.log('═'.repeat(80));
  console.log('');
  console.log('📈 BY TRAVEL AGENCY:');
  console.log('');
  
  Object.entries(bySeller).forEach(([seller, sellerOffers]) => {
    const avgPrice = Math.round(sellerOffers.reduce((sum, o) => sum + o.price, 0) / sellerOffers.length);
    const minPrice = Math.min(...sellerOffers.map(o => o.price));
    const avgMatch = Math.round(sellerOffers.reduce((sum, o) => sum + o.matchScore, 0) / sellerOffers.length);
    
    console.log(`${seller}:`);
    console.log(`   Offers: ${sellerOffers.length}`);
    console.log(`   Price: €${minPrice} - €${avgPrice} avg`);
    console.log(`   Match: ${avgMatch}% avg`);
    console.log('');
  });
}

testVacationMatcher().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
