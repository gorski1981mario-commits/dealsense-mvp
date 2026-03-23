/**
 * TEST: VACATION CONFIGURATOR - REAL API PRICES
 * Test z PRAWDZIWYMI cenami z Travelpayouts API
 */

const { generateAllLinks } = require('./market/vacation-deeplinks');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: VACATION - PRAWDZIWE CENY (Travelpayouts API)                  ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

// Konfiguracja: Dominikana (Punta Cana)
const config = {
  adults: 2,
  children: 1,
  destination: 'Dominikana',
  departureDate: '2026-07-15',
  departureAirport: 'AMS',
  duration: 14,
  stars: '4',
  board: 'all_inclusive'
};

console.log('🏖️  WAKACJE:');
console.log(`   Destynacja: ${config.destination}`);
console.log(`   Data wyjazdu: ${config.departureDate}`);
console.log(`   Osoby: ${config.adults} dorośli + ${config.children} dzieci`);
console.log(`   Czas trwania: ${config.duration} dni`);
console.log(`   Hotel: ${config.stars} gwiazdki, ${config.board}`);
console.log(`   Lotnisko: ${config.departureAirport}\n`);

console.log('═'.repeat(80) + '\n');

console.log('🔍 POBIERANIE PRAWDZIWYCH CEN Z TRAVELPAYOUTS API...\n');

(async () => {
  try {
    const offers = await generateAllLinks(config, 'test-user-123');
    
    console.log('═'.repeat(80) + '\n');
    
    if (!offers || offers.length === 0) {
      console.log('❌ BRAK OFERT - API może być niedostępne lub brak połączenia\n');
      return;
    }
    
    console.log(`✅ ZNALEZIONO ${offers.length} OFERT Z PRAWDZIWYMI CENAMI\n`);
    
    // Calculate savings
    const prices = offers.map(o => o.estimatedPrice.total);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const savings = maxPrice - minPrice;
    const savingsPercent = Math.round((savings / maxPrice) * 100);
    
    console.log('💰 OSZCZĘDNOŚCI:');
    console.log(`   Najtańsza oferta: €${minPrice} (${offers[0].agency})`);
    console.log(`   Najdroższa oferta: €${maxPrice}`);
    console.log(`   BESPARING: €${savings} (${savingsPercent}%)\n`);
    
    console.log('═'.repeat(80) + '\n');
    
    console.log('🏆 TOP 10 BIUR PODRÓŻY:\n');
    
    // Show top 10 offers
    offers.slice(0, 10).forEach((offer, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const niche = offer.type === 'niche' ? ' 💎' : '';
      const isReal = !offer.estimatedPrice.isEstimated ? ' ✅ REAL' : ' ⚠️ ESTIMATE';
      
      console.log(`${medal} ${offer.agency}${niche}${isReal}`);
      console.log(`   💰 Prijs: €${offer.estimatedPrice.total} (€${offer.estimatedPrice.perPerson}/persoon)`);
      console.log(`   💸 Besparing: €${maxPrice - offer.estimatedPrice.total} (${Math.round(((maxPrice - offer.estimatedPrice.total) / maxPrice) * 100)}% goedkoper)`);
      console.log(`   ✈️  Vlucht: €${offer.estimatedPrice.flight}`);
      console.log(`   🏨 Hotel: €${offer.estimatedPrice.hotel}`);
      if (offer.estimatedPrice.source) {
        console.log(`   📊 Bron: ${offer.estimatedPrice.source}`);
      }
      console.log('');
    });
    
    console.log('═'.repeat(80) + '\n');
    
    // Calculate dual revenue
    const bestPrice = minPrice;
    const referencePrice = maxPrice;
    const userSavings = referencePrice - bestPrice;
    const commission = Math.round(userSavings * 0.09); // 9% voor PLUS/PRO/FINANCE
    const affiliateCommission = Math.round(bestPrice * 0.04); // 4% affiliate average
    const totalRevenue = commission + affiliateCommission;
    
    console.log('💰 DUAL REVENUE MODEL (PLUS package):');
    console.log(`   User bespaart: €${userSavings}`);
    console.log(`   User betaalt ons: €${commission} (9% commissie)`);
    console.log(`   Biuro betaalt ons: €${affiliateCommission} (4% affiliate)`);
    console.log(`   TOTAL REVENUE: €${totalRevenue} per transactie\n`);
    
    console.log('═'.repeat(80) + '\n');
    
    console.log('🎯 REAL DATA STATUS:\n');
    const realCount = offers.filter(o => !o.estimatedPrice.isEstimated).length;
    const estimateCount = offers.filter(o => o.estimatedPrice.isEstimated).length;
    console.log(`   ✅ REAL prices: ${realCount} biur`);
    console.log(`   ⚠️  ESTIMATED prices: ${estimateCount} biur (fallback)\n`);
    
    if (realCount > 0) {
      console.log('✅ SUCCESS - Vacation Configurator używa PRAWDZIWYCH CEN!\n');
    } else {
      console.log('⚠️  WARNING - API nie zwróciło prawdziwych cen, używamy fallback\n');
    }
    
    console.log('✅ TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  }
})();
