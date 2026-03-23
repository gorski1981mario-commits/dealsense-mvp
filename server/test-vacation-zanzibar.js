/**
 * TEST: ZANZIBAR VACATION - 35 BIUR PODRÓŻY
 * Live test z prawdziwymi parametrami
 */

const { generateAllLinks } = require('./market/vacation-deeplinks');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: PARA NA ZANZIBAR (35 BIUR)                                     ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

// Konfiguracja: Para (2 dorosłych) na Zanzibar, 10 dni, 5*, All Inclusive
const zanzibarConfig = {
  adults: 2,
  children: 0,
  destination: 'Tanzania', // Zanzibar = Tanzania
  departureDate: '2026-08-01',
  duration: 10,
  stars: 5,
  board: 'all_inclusive',
  departureAirport: 'AMS',
  transport: 'flight'
};

console.log('👫 PARA:');
console.log(`   2 dorosłych (bez dzieci)`);
console.log(`   Total: 2 osoby\n`);

console.log('🏝️  WAKACJE:');
console.log(`   Destination: Zanzibar (Tanzania)`);
console.log(`   Dates: ${zanzibarConfig.departureDate} - ${zanzibarConfig.duration} dni`);
console.log(`   Hotel: ${zanzibarConfig.stars} sterren, ${zanzibarConfig.board}`);
console.log(`   Departure: ${zanzibarConfig.departureAirport}\n`);

console.log('═'.repeat(80) + '\n');

console.log('🔍 SZUKAM OFERT W 35 BIURACH PODRÓŻY...\n');

// Test rotation dla 3 różnych userów
console.log('📊 SMART ROTATION TEST:\n');

const user1 = generateAllLinks(zanzibarConfig, 'user-abc');
const user2 = generateAllLinks(zanzibarConfig, 'user-def');
const user3 = generateAllLinks(zanzibarConfig, 'user-ghi');

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

// Show top 10 offers
offers.slice(0, 10).forEach((offer, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  const niche = offer.type === 'niche' ? ' 💎' : '';
  
  console.log(`${medal} ${offer.agency}${niche}`);
  console.log(`   💰 Price: €${offer.estimatedPrice.total} (€${offer.estimatedPrice.perPerson}/person)`);
  console.log(`   💸 Savings: €${maxPrice - offer.estimatedPrice.total} (${Math.round(((maxPrice - offer.estimatedPrice.total) / maxPrice) * 100)}% cheaper)`);
  console.log(`   ✈️  Flight: €${offer.estimatedPrice.flight}`);
  console.log(`   🏨 Hotel: €${offer.estimatedPrice.hotel}\n`);
});

console.log('═'.repeat(80) + '\n');

// Calculate dual revenue
const bestPrice = minPrice;
const referencePrice = maxPrice;
const userSavings = referencePrice - bestPrice;
const commission = Math.round(userSavings * 0.09); // 9% dla PLUS/PRO/FINANCE
const affiliateCommission = Math.round(bestPrice * 0.04); // 4% affiliate average
const totalRevenue = commission + affiliateCommission;

console.log('💰 DUAL REVENUE MODEL (PLUS package):');
console.log(`   User oszczędza: €${userSavings}`);
console.log(`   User płaci nam: €${commission} (9% prowizji)`);
console.log(`   Biuro płaci nam: €${affiliateCommission} (4% affiliate)`);
console.log(`   TOTAL REVENUE: €${totalRevenue} per transakcja\n`);

console.log('═'.repeat(80) + '\n');

console.log('🎯 UNFAIR ADVANTAGES:\n');
console.log(`   ✅ 35 biur podróży (8 gigantów + 27 niszowych)`);
console.log(`   ✅ Niszowe = największe przebicia (€${savings} oszczędności!)`);
console.log(`   ✅ AI + KWANT mają duży wachlarz do analizy`);
console.log(`   ✅ Podwójna prowizja (user + affiliate)`);
console.log(`   ✅ Bezstronność (pokazujemy najtańsze według Deal Score)`);
console.log(`   ✅ Oszczędność czasu (gotowe oferty w < 1 sekundę)\n`);

console.log('✅ TEST COMPLETE!');
