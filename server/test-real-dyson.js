/**
 * PRAWDZIWY TEST - DYSON V15 DETECT
 * Sprawdzamy co faktycznie zwraca SearchAPI i nasze filtry
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

async function testDyson() {
  console.log('\n' + '═'.repeat(80));
  console.log('PRAWDZIWY TEST: DYSON V15 DETECT');
  console.log('═'.repeat(80));
  
  const product = {
    name: 'Dyson V15 Detect',
    basePrice: 649.00,
    ean: null
  };
  
  console.log(`Produkt: ${product.name}`);
  console.log(`Basisprijs: €${product.basePrice.toFixed(2)}`);
  console.log('─'.repeat(80));
  
  try {
    const startTime = Date.now();
    
    const result = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      userId: 'test-user',
      maxResults: 30
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Czas wykonania: ${duration}ms`);
    console.log('─'.repeat(80));
    
    if (!result || !result.offers || result.offers.length === 0) {
      console.log('❌ BRAK OFERT!');
      return;
    }
    
    const offers = result.offers;
    const bundles = result.smartBundles || [];
    
    console.log(`\n✅ ZNALEZIONO ${offers.length} OFERT\n`);
    
    // Analiza sklepów
    const giants = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp', 'zalando'];
    const giantOffers = offers.filter(o => {
      const seller = (o.seller || '').toLowerCase();
      return giants.some(g => seller.includes(g));
    });
    const nicheOffers = offers.filter(o => {
      const seller = (o.seller || '').toLowerCase();
      return !giants.some(g => seller.includes(g));
    });
    
    console.log('📊 SKLEPY:');
    console.log(`   Giganci: ${giantOffers.length}/${offers.length}`);
    console.log(`   Niszowe: ${nicheOffers.length}/${offers.length}`);
    console.log('');
    
    // Pokaż wszystkie oferty
    offers.forEach((offer, index) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      const isGiant = giants.some(g => (offer.seller || '').toLowerCase().includes(g));
      
      console.log(`${index + 1}. ${offer.seller} ${isGiant ? '🏢' : '🏪'}`);
      console.log(`   Prijs: €${offer.price.toFixed(2)}`);
      console.log(`   Besparing: €${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%)`);
      if (offer.dealScore) {
        console.log(`   DealScore: ${offer.dealScore.toFixed(1)}/10`);
      }
      if (offer.trust) {
        console.log(`   Trust: ${offer.trust}/100`);
      }
      console.log('');
    });
    
    // Smart Bundles
    if (bundles.length > 0) {
      console.log('─'.repeat(80));
      console.log(`\n🎁 SMART BUNDLES: ${bundles.length}\n`);
      
      bundles.forEach((bundle, index) => {
        console.log(`${index + 1}. ${bundle.name} (${bundle.type})`);
        console.log(`   Variants: ${bundle.variants.length}`);
        bundle.variants.slice(0, 3).forEach(v => {
          const variant = v.variant.color || v.variant.type || v.variant.power || 'Default';
          console.log(`   - ${variant}: €${v.price.toFixed(2)} (${v.seller})`);
        });
        console.log('');
      });
    }
    
    // Podsumowanie
    console.log('─'.repeat(80));
    console.log('\n📈 PODSUMOWANIE:');
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    
    console.log(`   Średnia cena: €${avgPrice.toFixed(2)}`);
    console.log(`   Średnie oszczędności: €${avgSavings.toFixed(2)} (${avgSavingsPercent.toFixed(1)}%)`);
    console.log(`   Najniższa: €${offers[0].price.toFixed(2)} (${offers[0].seller})`);
    console.log(`   Najwyższa: €${offers[offers.length - 1].price.toFixed(2)} (${offers[offers.length - 1].seller})`);
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
  }
}

testDyson();
