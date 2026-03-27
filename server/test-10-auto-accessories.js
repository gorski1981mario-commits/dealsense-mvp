/**
 * 10 TESTÓW - AUTO AKCESORIA
 * Sprawdzamy czy akcesoria samochodowe działają
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  // 1. OPONY
  {
    name: 'Michelin Pilot Sport 4 225/45 R17',
    basePrice: 159.00,
    baseSeller: 'Kwik Fit',
    category: 'Auto akcesoria'
  },
  
  // 2. WYCIERACZKI
  {
    name: 'Bosch Aerotwin A979S',
    basePrice: 39.00,
    baseSeller: 'Halfords',
    category: 'Auto akcesoria'
  },
  
  // 3. KLOCKI HAMULCOWE
  {
    name: 'Bosch Brake Pads Front 0986494396',
    basePrice: 89.00,
    baseSeller: 'ATU',
    category: 'Auto akcesoria'
  },
  
  // 4. OLEJ SILNIKOWY
  {
    name: 'Castrol Edge 5W-30 5L',
    basePrice: 49.00,
    baseSeller: 'Bol.com',
    category: 'Auto akcesoria'
  },
  
  // 5. AKUMULATOR
  {
    name: 'Varta Blue Dynamic E11 74Ah',
    basePrice: 129.00,
    baseSeller: 'Halfords',
    category: 'Auto akcesoria'
  },
  
  // 6. FILTR POWIETRZA
  {
    name: 'Mann Filter C27009',
    basePrice: 29.00,
    baseSeller: 'ATU',
    category: 'Auto akcesoria'
  },
  
  // 7. ŚWIECE ZAPŁONOWE
  {
    name: 'NGK Laser Platinum PFR6N-11',
    basePrice: 39.00,
    baseSeller: 'Kwik Fit',
    category: 'Auto akcesoria'
  },
  
  // 8. DYWANIKI
  {
    name: 'WeatherTech FloorLiner BMW 3 Series',
    basePrice: 189.00,
    baseSeller: 'Amazon.nl',
    category: 'Auto akcesoria'
  },
  
  // 9. BAGAŻNIK DACHOWY
  {
    name: 'Thule WingBar Evo 127cm',
    basePrice: 299.00,
    baseSeller: 'Bol.com',
    category: 'Auto akcesoria'
  },
  
  // 10. FOTELIKI DZIECIĘCE
  {
    name: 'Maxi-Cosi Pebble 360',
    basePrice: 349.00,
    baseSeller: 'Baby-Dump',
    category: 'Auto akcesoria'
  }
];

const GIANTS = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp'];

function isGiant(seller) {
  const sellerLower = (seller || '').toLowerCase();
  return GIANTS.some(g => sellerLower.includes(g));
}

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/10: ${product.name.toUpperCase()}`);
  console.log('═'.repeat(100));
  console.log(`Waar gescand: ${product.baseSeller}`);
  console.log(`Prijs in winkel: €${product.basePrice.toFixed(2)}`);
  console.log('─'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const result = await fetchMarketOffers(product.name, null, {
      basePrice: product.basePrice,
      baseSeller: product.baseSeller,
      userId: 'test-user',
      maxResults: 30
    });
    
    const duration = Date.now() - startTime;
    
    if (!result || !result.offers || result.offers.length === 0) {
      console.log(`\n❌ BRAK OFERT (${duration}ms)`);
      return {
        product: product.name,
        success: false,
        offers: 0,
        duration
      };
    }
    
    const offers = result.offers;
    const bundles = result.smartBundles || [];
    
    console.log(`\n✅ ${offers.length} OFERT (${duration}ms)\n`);
    
    const giantOffers = offers.filter(o => isGiant(o.seller));
    const nicheOffers = offers.filter(o => !isGiant(o.seller));
    
    console.log('💶 PRIJS IN WINKEL:');
    console.log(`   ${product.baseSeller}: €${product.basePrice.toFixed(2)}`);
    console.log('');
    
    console.log('📊 ONZE AANBIEDINGEN:');
    console.log(`   Giganten: ${giantOffers.length}/${offers.length}`);
    console.log(`   Niszowe: ${nicheOffers.length}/${offers.length}`);
    console.log('');
    
    // TOP 3
    console.log('💰 TOP 3:\n');
    offers.slice(0, 3).forEach((offer, idx) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      const shopType = isGiant(offer.seller) ? '🏢' : '🏪';
      
      console.log(`${icon} ${offer.seller} ${shopType}`);
      console.log(`   €${offer.price.toFixed(2)} (besparing: €${savings.toFixed(2)} / ${savingsPercent.toFixed(1)}%)`);
      console.log('');
    });
    
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    const maxSavings = product.basePrice - offers[0].price;
    const maxSavingsPercent = (maxSavings / product.basePrice) * 100;
    
    console.log('─'.repeat(100));
    console.log(`Gemiddeld: ${avgSavingsPercent.toFixed(1)}% | Max: ${maxSavingsPercent.toFixed(1)}%`);
    
    return {
      product: product.name,
      success: true,
      offers: offers.length,
      avgSavings: avgSavingsPercent,
      maxSavings: maxSavingsPercent,
      bestOffer: offers[0].seller,
      bestPrice: offers[0].price,
      giants: giantOffers.length,
      niche: nicheOffers.length,
      duration
    };
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    return {
      product: product.name,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(100));
  console.log('█  10 TESTÓW - AUTO AKCESORIA'.padEnd(99) + '█');
  console.log('█'.repeat(100));
  
  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Podsumowanie
  console.log('\n\n' + '█'.repeat(100));
  console.log('█  FINAAL OVERZICHT'.padEnd(99) + '█');
  console.log('█'.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Geslaagd: ${successful.length}/10`);
  console.log(`❌ Mislukt: ${failed.length}/10`);
  
  if (successful.length > 0) {
    console.log(`\n📊 RANKING:\n`);
    
    const sorted = [...successful].sort((a, b) => b.avgSavings - a.avgSavings);
    
    sorted.forEach((r, idx) => {
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
      const productShort = r.product.substring(0, 50);
      console.log(`${icon} ${productShort}`);
      console.log(`   ${r.avgSavings.toFixed(1)}% avg (max ${r.maxSavings.toFixed(1)}%) | ${r.offers} ofert | ${r.niche} niche`);
      console.log(`   Beste: ${r.bestOffer} €${r.bestPrice.toFixed(2)}`);
      console.log('');
    });
    
    const totalOffers = successful.reduce((sum, r) => sum + r.offers, 0);
    const totalGiants = successful.reduce((sum, r) => sum + r.giants, 0);
    const totalNiche = successful.reduce((sum, r) => sum + r.niche, 0);
    const avgSavings = successful.reduce((sum, r) => sum + r.avgSavings, 0) / successful.length;
    
    console.log('─'.repeat(100));
    console.log('\n🎯 GLOBALE STATISTIEKEN:');
    console.log(`   Gemiddelde besparing: ${avgSavings.toFixed(1)}%`);
    console.log(`   Totaal aanbiedingen: ${totalOffers} (${(totalOffers/successful.length).toFixed(1)} per product)`);
    console.log(`   Giganten: ${totalGiants} (${((totalGiants/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${totalNiche} (${((totalNiche/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
  }
  
  if (failed.length > 0) {
    console.log(`\n\n❌ MISLUKTE PRODUCTEN:\n`);
    failed.forEach(r => {
      console.log(`   ${r.product}`);
    });
  }
  
  console.log('\n' + '█'.repeat(100) + '\n');
}

runAllTests();
