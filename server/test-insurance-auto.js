/**
 * TEST: INSURANCE CONFIGURATOR - Auto Insurance
 */

const { generateAllOffers } = require('./market/insurance-providers');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: AUTO INSURANCE - ALLRISK (25 PROVIDERS)                        ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

// Konfiguracja: Auto Allrisk, 35 jaar, €25,000 auto
const config = {
  insuranceType: 'auto',
  coverage: 'allrisk',
  age: 35,
  vehicleValue: 25000
};

console.log('🚗 AUTO VERZEKERING:');
console.log(`   Type: ${config.insuranceType}`);
console.log(`   Dekking: ${config.coverage} (Allrisk)`);
console.log(`   Leeftijd: ${config.age} jaar`);
console.log(`   Waarde auto: €${config.vehicleValue.toLocaleString()}\n`);

console.log('═'.repeat(80) + '\n');

const offers = generateAllOffers(config, 'test-user-001');

console.log(`✅ GEVONDEN ${offers.length} AANBIEDINGEN\n`);

const prices = offers.map(o => o.yearly);
const maxPrice = Math.max(...prices);
const minPrice = Math.min(...prices);
const savings = maxPrice - minPrice;

console.log('💰 OSZCZĘDNOŚCI:');
console.log(`   Goedkoopste: €${minPrice}/jaar (€${Math.round(minPrice/12)}/mnd)`);
console.log(`   Duurste: €${maxPrice}/jaar (€${Math.round(maxPrice/12)}/mnd)`);
console.log(`   BESPARING: €${savings}/jaar (${Math.round((savings / maxPrice) * 100)}%)\n`);

console.log('═'.repeat(80) + '\n');

console.log('🏆 TOP 10 AANBIEDINGEN:\n');

offers.slice(0, 10).forEach((offer, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  const niche = offer.type === 'niche' ? ' 💎' : '';
  
  console.log(`${medal} ${offer.provider}${niche}`);
  console.log(`   💰 Prijs: €${offer.yearly}/jaar (€${offer.monthly}/mnd)`);
  console.log(`   💸 Besparing: €${offer.savings}/jaar (${Math.round((offer.savings / maxPrice) * 100)}% goedkoper)`);
  console.log(`   ⭐ Rating: ${offer.rating}/10 (${offer.reviews.toLocaleString()} reviews)`);
  console.log(`   🛡️  Trust Score: ${offer.trust}/100`);
  console.log('');
});

console.log('═'.repeat(80) + '\n');

const bestPrice = minPrice;
const referencePrice = maxPrice;
const userSavings = referencePrice - bestPrice;
const commission = Math.round(userSavings * 0.09);
const affiliateCommission = Math.round(bestPrice * 0.05);
const totalRevenue = commission + affiliateCommission;

console.log('💰 DUAL REVENUE MODEL (PLUS package):');
console.log(`   User bespaart: €${userSavings}/jaar`);
console.log(`   User betaalt ons: €${commission} (9% commissie)`);
console.log(`   Verzekeraar betaalt ons: €${affiliateCommission} (5% affiliate)`);
console.log(`   TOTAL REVENUE: €${totalRevenue} per transactie\n`);

console.log('✅ TEST COMPLETE!');
