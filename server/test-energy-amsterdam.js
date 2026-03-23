/**
 * TEST: ENERGY CONFIGURATOR - AMSTERDAM HOUSEHOLD
 * Test 25 energy providers with smart rotation
 */

const { generateAllOffers } = require('./market/energy-providers');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: AMSTERDAM HOUSEHOLD - ENERGIE (25 LEVERANCIERS)                ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

// Konfiguracja: Typowy Amsterdam household
const amsterdamConfig = {
  electricityUsage: 3500,  // kWh/jaar (gemiddeld)
  gasUsage: 1200,          // m³/jaar (gemiddeld)
  greenEnergy: true,       // Groene energie
  solarPanels: false,      // Geen zonnepanelen
  solarReturn: 0,          // Geen teruglevering
  postcode: '1012AB',
  contractType: '1 jaar vast'
};

console.log('🏠 HUISHOUDEN:');
console.log(`   Postcode: ${amsterdamConfig.postcode}`);
console.log(`   Elektriciteit: ${amsterdamConfig.electricityUsage} kWh/jaar`);
console.log(`   Gas: ${amsterdamConfig.gasUsage} m³/jaar`);
console.log(`   Groene energie: ${amsterdamConfig.greenEnergy ? 'Ja' : 'Nee'}`);
console.log(`   Contract: ${amsterdamConfig.contractType}\n`);

console.log('═'.repeat(80) + '\n');

console.log('🔍 ZOEKEN NAAR BESTE DEALS IN 25 LEVERANCIERS...\n');

// Test rotation voor 3 verschillende users
console.log('📊 SMART ROTATION TEST:\n');

const user1 = generateAllOffers(amsterdamConfig, 'user-abc');
const user2 = generateAllOffers(amsterdamConfig, 'user-def');
const user3 = generateAllOffers(amsterdamConfig, 'user-ghi');

console.log('User 1 TOP 3:', user1.slice(0, 3).map(o => o.provider).join(', '));
console.log('User 2 TOP 3:', user2.slice(0, 3).map(o => o.provider).join(', '));
console.log('User 3 TOP 3:', user3.slice(0, 3).map(o => o.provider).join(', '));
console.log('');

// Use user1 offers for rest of test
const offers = user1;

console.log('═'.repeat(80) + '\n');

console.log(`✅ GEVONDEN ${offers.length} AANBIEDINGEN\n`);

// Calculate savings
const maxPrice = Math.max(...offers.map(o => o.estimatedCost.yearly));
const minPrice = Math.min(...offers.map(o => o.estimatedCost.yearly));
const savings = maxPrice - minPrice;
const savingsPercent = Math.round((savings / maxPrice) * 100);

console.log('💰 OSZCZĘDNOŚCI:');
console.log(`   Goedkoopste: €${minPrice}/jaar (€${Math.round(minPrice/12)}/mnd)`);
console.log(`   Duurste: €${maxPrice}/jaar (€${Math.round(maxPrice/12)}/mnd)`);
console.log(`   BESPARING: €${savings}/jaar (${savingsPercent}%)\n`);

console.log('═'.repeat(80) + '\n');

console.log('🏆 TOP 10 AANBIEDINGEN:\n');

// Show top 10 offers
offers.slice(0, 10).forEach((offer, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  const niche = offer.type === 'niche' ? ' 💎' : '';
  const green = offer.greenEnergy ? ' 🌱' : '';
  
  console.log(`${medal} ${offer.provider}${niche}${green}`);
  console.log(`   💰 Prijs: €${offer.estimatedCost.yearly}/jaar (€${offer.estimatedCost.monthly}/mnd)`);
  console.log(`   💸 Besparing: €${offer.estimatedCost.savings}/jaar (${Math.round((offer.estimatedCost.savings / maxPrice) * 100)}% goedkoper)`);
  console.log(`   ⭐ Rating: ${offer.rating}/10 (${offer.reviews.toLocaleString()} reviews)`);
  console.log(`   🛡️  Trust Score: ${offer.trustScore}/100`);
  console.log(`   📋 Contract: ${offer.contract}\n`);
});

console.log('═'.repeat(80) + '\n');

// Calculate dual revenue
const bestPrice = minPrice;
const referencePrice = maxPrice;
const userSavings = referencePrice - bestPrice;
const commission = Math.round(userSavings * 0.09); // 9% voor PLUS/PRO/FINANCE
const affiliateCommission = Math.round(bestPrice * 0.09); // 9% affiliate average
const totalRevenue = commission + affiliateCommission;

console.log('💰 DUAL REVENUE MODEL (PLUS package):');
console.log(`   User bespaart: €${userSavings}/jaar`);
console.log(`   User betaalt ons: €${commission} (9% commissie)`);
console.log(`   Leverancier betaalt ons: €${affiliateCommission} (9% affiliate)`);
console.log(`   TOTAL REVENUE: €${totalRevenue} per transactie\n`);

console.log('═'.repeat(80) + '\n');

console.log('🎯 UNFAIR ADVANTAGES:\n');
console.log(`   ✅ 25 energieleveranciers (5 giganten + 20 niszowe)`);
console.log(`   ✅ Niszowe = grootste besparingen (€${savings}/jaar!)`);
console.log(`   ✅ AI + KWANT hebben grote keuze voor analyse`);
console.log(`   ✅ Dubbele commissie (user + affiliate)`);
console.log(`   ✅ Onpartijdigheid (tonen goedkoopste volgens Deal Score)`);
console.log(`   ✅ Tijdsbesparing (klaar in < 1 seconde)\n`);

console.log('✅ TEST COMPLETE!');
