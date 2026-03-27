/**
 * 10 TESTÓW - NOWE BRANŻE
 * Kategorie których jeszcze nie testowaliśmy
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  // 1. KEUKENAPPARATUUR - AGD Kuchenne
  {
    name: 'KitchenAid Artisan Mixer',
    basePrice: 549.00,
    baseSeller: 'Coolblue',
    category: 'Keukenapparatuur'
  },
  
  // 2. TUINGEREEDSCHAP - Ogród
  {
    name: 'Karcher K5 Premium Hogedrukreiniger',
    basePrice: 399.00,
    baseSeller: 'Gamma',
    category: 'Tuingereedschap'
  },
  
  // 3. BABYVERZORGING - Dziecko
  {
    name: 'Bugaboo Fox 5 Kinderwagen',
    basePrice: 1299.00,
    baseSeller: 'Prenatal',
    category: 'Babyverzorging'
  },
  
  // 4. HUISHOUDELIJKE APPARATEN - AGD Domowe
  {
    name: 'iRobot Roomba j7+',
    basePrice: 899.00,
    baseSeller: 'MediaMarkt',
    category: 'Huishoudelijke apparaten'
  },
  
  // 5. FIETSEN - Rowery
  {
    name: 'Gazelle Orange C7 HMB',
    basePrice: 2499.00,
    baseSeller: 'Fietsenwinkel.nl',
    category: 'Fietsen'
  },
  
  // 6. BOEKEN - Książki
  {
    name: 'Harry Potter Complete Collection',
    basePrice: 89.00,
    baseSeller: 'Bol.com',
    category: 'Boeken'
  },
  
  // 7. DIERENBENODIGDHEDEN - Zwierzęta
  {
    name: 'Royal Canin Medium Adult 15kg',
    basePrice: 69.00,
    baseSeller: 'Pets Place',
    category: 'Dierenbenodigdheden'
  },
  
  // 8. MEUBELS - Meble
  {
    name: 'IKEA Kallax Kast 4x4',
    basePrice: 99.00,
    baseSeller: 'IKEA',
    category: 'Meubels'
  },
  
  // 9. COSMETICA - Kosmetyki
  {
    name: 'Estee Lauder Advanced Night Repair',
    basePrice: 89.00,
    baseSeller: 'Douglas',
    category: 'Cosmetica'
  },
  
  // 10. KANTOORARTIKELEN - Biuro
  {
    name: 'HP OfficeJet Pro 9010',
    basePrice: 249.00,
    baseSeller: 'Staples',
    category: 'Kantoorartikelen'
  }
];

const GIANTS = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp', 'zalando', 'ikea', 'decathlon'];

function isGiant(seller) {
  const sellerLower = (seller || '').toLowerCase();
  return GIANTS.some(g => sellerLower.includes(g));
}

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/10: ${product.name.toUpperCase()}`);
  console.log('═'.repeat(100));
  console.log(`Categorie: ${product.category}`);
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
      console.log(`\n❌ BRAK OFERT (czas: ${duration}ms)`);
      console.log(`   Możliwe przyczyny:`);
      console.log(`   - Produkt niszowy (mało dostępny online)`);
      console.log(`   - Wszystkie oferty droższe niż €${product.basePrice}`);
      console.log(`   - Wszystkie oferty z ${product.baseSeller} (odfiltrowane)`);
      return {
        product: product.name,
        category: product.category,
        success: false,
        offers: 0,
        duration
      };
    }
    
    const offers = result.offers;
    const bundles = result.smartBundles || [];
    
    console.log(`\n✅ ZNALEZIONO ${offers.length} OFERT (czas: ${duration}ms)\n`);
    
    // Sprawdź czy baseSeller jest w wynikach
    const baseSellerInResults = offers.some(o => {
      const seller = (o.seller || '').toLowerCase();
      const base = product.baseSeller.toLowerCase();
      return seller.includes(base) || base.includes(seller);
    });
    
    if (baseSellerInResults) {
      console.log(`⚠️  UWAGA: ${product.baseSeller} jest w wynikach!\n`);
    } else {
      console.log(`✅ BASE SELLER FILTER: ${product.baseSeller} NIE jest w wynikach\n`);
    }
    
    // Analiza sklepów
    const giantOffers = offers.filter(o => isGiant(o.seller));
    const nicheOffers = offers.filter(o => !isGiant(o.seller));
    
    console.log('💶 PRIJS IN WINKEL:');
    console.log(`   ${product.baseSeller}: €${product.basePrice.toFixed(2)}`);
    console.log('');
    
    console.log('📊 ONZE AANBIEDINGEN:');
    console.log(`   Giganten: ${giantOffers.length}/${offers.length} (${((giantOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${nicheOffers.length}/${offers.length} (${((nicheOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log('');
    
    // TOP 3 oferty
    console.log('💰 TOP 3 GOEDKOPER:\n');
    offers.slice(0, 3).forEach((offer, idx) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      const isGiantShop = isGiant(offer.seller);
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      const shopType = isGiantShop ? '🏢' : '🏪';
      
      console.log(`${icon} ${offer.seller} ${shopType}`);
      console.log(`   Prijs: €${offer.price.toFixed(2)}`);
      console.log(`   Besparing: €${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%)`);
      if (offer.dealScore) {
        console.log(`   DealScore: ${offer.dealScore.toFixed(1)}/10`);
      }
      console.log('');
    });
    
    // Smart Bundles
    if (bundles.length > 0) {
      console.log('🎁 SMART BUNDLES: ' + bundles.length);
      console.log('');
    }
    
    // Podsumowanie
    console.log('─'.repeat(100));
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    const maxSavings = product.basePrice - offers[0].price;
    const maxSavingsPercent = (maxSavings / product.basePrice) * 100;
    
    console.log(`Gemiddelde besparing: ${avgSavingsPercent.toFixed(1)}%`);
    console.log(`Grootste besparing: ${maxSavingsPercent.toFixed(1)}% (${offers[0].seller})`);
    
    return {
      product: product.name,
      category: product.category,
      baseSeller: product.baseSeller,
      success: true,
      offers: offers.length,
      bundles: bundles.length,
      avgSavings: avgSavingsPercent,
      maxSavings: maxSavingsPercent,
      bestOffer: offers[0].seller,
      bestPrice: offers[0].price,
      giants: giantOffers.length,
      niche: nicheOffers.length,
      duration,
      baseSellerFiltered: !baseSellerInResults
    };
    
  } catch (error) {
    console.error(`\n❌ BŁĄD: ${error.message}`);
    return {
      product: product.name,
      category: product.category,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(100));
  console.log('█  10 TESTÓW - NOWE BRANŻE'.padEnd(99) + '█');
  console.log('█  (AGD, Ogród, Dziecko, Rowery, Książki, Zwierzęta, Meble, Kosmetyki, Biuro)'.padEnd(99) + '█');
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
  
  // Finalne podsumowanie
  console.log('\n\n' + '█'.repeat(100));
  console.log('█  FINAAL OVERZICHT'.padEnd(99) + '█');
  console.log('█'.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Geslaagd: ${successful.length}/10`);
  console.log(`❌ Mislukt: ${failed.length}/10`);
  
  if (successful.length > 0) {
    console.log(`\n📊 RANKING PER CATEGORIE:\n`);
    
    const sorted = [...successful].sort((a, b) => b.avgSavings - a.avgSavings);
    
    sorted.forEach((r, idx) => {
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
      console.log(`${icon} ${r.category}: ${r.avgSavings.toFixed(1)}% avg (max ${r.maxSavings.toFixed(1)}%)`);
      console.log(`   ${r.offers} aanbiedingen | ${r.giants} giganten, ${r.niche} niche`);
      console.log(`   Beste: ${r.bestOffer} €${r.bestPrice.toFixed(2)}`);
      console.log('');
    });
    
    const totalOffers = successful.reduce((sum, r) => sum + r.offers, 0);
    const totalGiants = successful.reduce((sum, r) => sum + r.giants, 0);
    const totalNiche = successful.reduce((sum, r) => sum + r.niche, 0);
    const avgSavings = successful.reduce((sum, r) => sum + r.avgSavings, 0) / successful.length;
    const baseSellerWorking = successful.filter(r => r.baseSellerFiltered).length;
    
    console.log('─'.repeat(100));
    console.log('\n🎯 GLOBALE STATISTIEKEN:');
    console.log(`   Gemiddelde besparing: ${avgSavings.toFixed(1)}%`);
    console.log(`   Totaal aanbiedingen: ${totalOffers} (${(totalOffers/successful.length).toFixed(1)} per product)`);
    console.log(`   Giganten: ${totalGiants} (${((totalGiants/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${totalNiche} (${((totalNiche/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Base Seller Filter: ${baseSellerWorking}/${successful.length} werkt`);
  }
  
  if (failed.length > 0) {
    console.log(`\n\n❌ MISLUKTE CATEGORIEËN:\n`);
    failed.forEach(r => {
      console.log(`   ${r.category} - ${r.product}`);
    });
  }
  
  console.log('\n' + '█'.repeat(100) + '\n');
}

runAllTests();
