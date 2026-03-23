/**
 * TEST: TELECOM CONFIGURATOR - Amsterdam Household
 */

const { generateAllOffers } = require('./market/telecom-providers');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: AMSTERDAM HOUSEHOLD - TELECOM (25 PROVIDERS)                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

// Konfiguracja: Mobiel + Internet
const config = {
  serviceType: 'mobiel-internet',
  mobileData: 10,
  internetSpeed: 100,
  tvChannels: false
};

console.log('📱 TELECOM:');
console.log(`   Service: ${config.serviceType}`);
console.log(`   Mobile data: ${config.mobileData} GB/maand`);
console.log(`   Internet speed: ${config.internetSpeed} Mbps`);
console.log(`   TV: ${config.tvChannels ? 'Ja' : 'Nee'}\n`);

console.log('═'.repeat(80) + '\n');

console.log('🔍 ZOEKEN NAAR BESTE DEALS IN 25 PROVIDERS...\n');

// Test rotation for 3 different users
console.log('📊 SMART ROTATION TEST:\n');

const user1 = generateAllOffers(config, 'user-001');
const user2 = generateAllOffers(config, 'user-002');
const user3 = generateAllOffers(config, 'user-003');

console.log(`User 1 TOP 3: ${user1.slice(0, 3).map(o => o.provider).join(', ')}`);
console.log(`User 2 TOP 3: ${user2.slice(0, 3).map(o => o.provider).join(', ')}`);
console.log(`User 3 TOP 3: ${user3.slice(0, 3).map(o => o.provider).join(', ')}\n`);

console.log('═'.repeat(80) + '\n');

const offers = user1;

console.log(`✅ GEVONDEN ${offers.length} AANBIEDINGEN\n`);

// Calculate savings
const prices = offers.map(o => o.monthly);
const maxPrice = Math.max(...prices);
const minPrice = Math.min(...prices);
const savings = (maxPrice - minPrice) * 12; // Yearly

console.log('💰 OSZCZĘDNOŚCI:');
console.log(`   Goedkoopste: €${minPrice}/mnd (€${minPrice * 12}/jaar)`);
console.log(`   Duurste: €${maxPrice}/mnd (€${maxPrice * 12}/jaar)`);
console.log(`   BESPARING: €${savings}/jaar (${Math.round((savings / (maxPrice * 12)) * 100)}%)\n`);

console.log('═'.repeat(80) + '\n');

console.log('🏆 TOP 10 AANBIEDINGEN:\n');

// Show top 10 offers
offers.slice(0, 10).forEach((offer, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  const niche = offer.type === 'niche' ? ' 💎' : '';
  
  console.log(`${medal} ${offer.provider}${niche}`);
  console.log(`   💰 Prijs: €${offer.monthly}/mnd (€${offer.yearly}/jaar)`);
  console.log(`   💸 Besparing: €${offer.savings}/jaar (${Math.round((offer.savings / (maxPrice * 12)) * 100)}% goedkoper)`);
  console.log(`   ⭐ Rating: ${offer.rating}/10 (${offer.reviews.toLocaleString()} reviews)`);
  console.log(`   🛡️  Trust Score: ${offer.trust}/100`);
  console.log('');
});

console.log('═'.repeat(80) + '\n');

// Calculate dual revenue
const bestPrice = minPrice * 12;
const referencePrice = maxPrice * 12;
const userSavings = referencePrice - bestPrice;
const commission = Math.round(userSavings * 0.09); // 9% voor PLUS/PRO/FINANCE
const affiliateCommission = Math.round(bestPrice * 0.05); // 5% affiliate average
const totalRevenue = commission + affiliateCommission;

console.log('💰 DUAL REVENUE MODEL (PLUS package):');
console.log(`   User bespaart: €${userSavings}/jaar`);
console.log(`   User betaalt ons: €${commission} (9% commissie)`);
console.log(`   Provider betaalt ons: €${affiliateCommission} (5% affiliate)`);
console.log(`   TOTAL REVENUE: €${totalRevenue} per transactie\n`);

console.log('═'.repeat(80) + '\n');

console.log('🎯 UNFAIR ADVANTAGES:\n');
console.log(`   ✅ 25 telecom providers (5 giganten + 20 niszowe)`);
console.log(`   ✅ Niszowe = grootste besparingen (€${savings}/jaar!)`);
console.log(`   ✅ AI + KWANT hebben grote keuze voor analyse`);
console.log(`   ✅ Dubbele commissie (user + affiliate)`);
console.log(`   ✅ Onpartijdigheid (tonen goedkoopste volgens Deal Score)`);
console.log(`   ✅ Tijdsbesparing (klaar in < 1 seconde)\n`);

console.log('✅ TEST COMPLETE!');
