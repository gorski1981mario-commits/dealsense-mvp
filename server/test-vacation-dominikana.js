/**
 * TEST: Rodzina 3-osobowa na Dominikanę
 * 
 * Matka + Ojciec + Syn (10 lat)
 * Wakacje letnie (lipiec 2026)
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const { generateAllLinks } = require('./market/vacation-deeplinks');

// Konfiguracja: Rodzina 3-osobowa na Dominikanę
const familyConfig = {
  destination: 'Dominikana',
  departureDate: '2026-07-15',  // Wakacje letnie
  duration: 14,                  // 2 tygodnie
  adults: 2,                     // Matka + Ojciec
  children: 1,                   // Syn
  childrenAges: [10],            // 10 lat
  stars: '4',                    // 4 gwiazdki
  board: 'all_inclusive',        // All inclusive
  departureAirport: 'Amsterdam'
};

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: RODZINA 3-OSOBOWA NA DOMINIKANĘ (25 BIUR)                   ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

console.log('👨‍👩‍👦 RODZINA:');
console.log(`   Matka + Ojciec + Syn (${familyConfig.childrenAges[0]} lat)`);
console.log(`   Total: ${familyConfig.adults + familyConfig.children} osoby\n`);

console.log('🏖️  WAKACJE:');
console.log(`   Destination: ${familyConfig.destination}`);
console.log(`   Dates: ${familyConfig.departureDate} - ${familyConfig.duration} dni`);
console.log(`   Hotel: ${familyConfig.stars} sterren, ${familyConfig.board}`);
console.log(`   Departure: ${familyConfig.departureAirport}\n`);

console.log('═'.repeat(80) + '\n');

console.log('🔍 SZUKAM OFERT W 25 BIURACH PODRÓŻY...\n');

// Test rotation dla 3 różnych userów
console.log('📊 SMART ROTATION TEST:\n');

const user1 = generateAllLinks(familyConfig, 'user-123');
const user2 = generateAllLinks(familyConfig, 'user-456');
const user3 = generateAllLinks(familyConfig, 'user-789');

console.log('User 1 TOP 3:', user1.slice(0, 3).map(o => o.agency).join(', '));
console.log('User 2 TOP 3:', user2.slice(0, 3).map(o => o.agency).join(', '));
console.log('User 3 TOP 3:', user3.slice(0, 3).map(o => o.agency).join(', '));
console.log('');

// Use user1 offers for rest of test
const offers = user1;

console.log('═'.repeat(80) + '\n');

console.log(`✅ ZNALEZIONO ${offers.length} OFERT\n`);

// Calculate savings
const maxPrice = Math.max(...offers.map(o => o.estimatedPrice.total));
const minPrice = Math.min(...offers.map(o => o.estimatedPrice.total));
const savings = maxPrice - minPrice;
const savingsPercent = Math.round((savings / maxPrice) * 100);

console.log('💰 OSZCZĘDNOŚCI:');
console.log(`   Najtańszy: €${minPrice}`);
console.log(`   Najdroższy: €${maxPrice}`);
console.log(`   OSZCZĘDNOŚCI: €${savings} (${savingsPercent}%)\n`);

console.log('═'.repeat(80) + '\n');

console.log('🏆 TOP 10 OFERT:\n');

offers.slice(0, 10).forEach((offer, i) => {
  const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  const type = offer.type === 'niche' ? '💎' : '🏢';
  const savingsVsMax = maxPrice - offer.estimatedPrice.total;
  const savingsPercent = Math.round((savingsVsMax / maxPrice) * 100);
  
  console.log(`${emoji} ${offer.agency} ${type}`);
  console.log(`   💰 Price: €${offer.estimatedPrice.total} (€${offer.estimatedPrice.perPerson}/person)`);
  console.log(`   💸 Savings: €${savingsVsMax} (${savingsPercent}% cheaper)`);
  console.log(`   ✈️  Flight: €${offer.estimatedPrice.flight}`);
  console.log(`   🏨 Hotel: €${offer.estimatedPrice.hotel}`);
  console.log('');
});

console.log('═'.repeat(80) + '\n');

// Dual Revenue Model
const bestOffer = offers[0];
const userSavings = maxPrice - bestOffer.estimatedPrice.total;
const userCommission = Math.round(userSavings * 0.09); // 9% prowizji (PLUS package)
const affiliateCommission = Math.round(bestOffer.estimatedPrice.total * 0.04); // 4% affiliate
const totalRevenue = userCommission + affiliateCommission;

console.log('💰 DUAL REVENUE MODEL (PLUS package):\n');
console.log(`   User oszczędza: €${userSavings}`);
console.log(`   User płaci nam: €${userCommission} (9% prowizji)`);
console.log(`   Biuro płaci nam: €${affiliateCommission} (4% affiliate)`);
console.log(`   TOTAL REVENUE: €${totalRevenue} per transakcja\n`);

console.log('═'.repeat(80) + '\n');

console.log('🎯 UNFAIR ADVANTAGES:\n');
console.log(`   ✅ ${offers.length} biur podróży (8 gigantów + 17 niszowych)`);
console.log(`   ✅ Niszowe = największe przebicia (€${savings} oszczędności!)`);
console.log(`   ✅ AI + KWANT mają duży wachlarz do analizy`);
console.log(`   ✅ Podwójna prowizja (user + affiliate)`);
console.log(`   ✅ Bezstronność (pokazujemy najtańsze według Deal Score)`);
console.log(`   ✅ Oszczędność czasu (gotowe oferty w < 1 sekundę)\n`);

console.log('✅ TEST COMPLETE!\n');
