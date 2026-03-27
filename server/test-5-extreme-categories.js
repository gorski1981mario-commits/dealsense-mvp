/**
 * 5 TESTÓW - SKRAJNIE RÓŻNE KATEGORIE
 * Sprawdzamy gdzie przynosimy największe efekty
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  // 1. MODA - Buty sportowe
  {
    name: 'Nike Air Max 90',
    basePrice: 149.00,
    baseSeller: 'Zalando',
    category: 'Sportschoenen'
  },
  // 2. DOM & OGRÓD - Narzędzia
  {
    name: 'Bosch PSR 1800',
    basePrice: 159.00,
    baseSeller: 'Gamma',
    category: 'Gereedschap'
  },
  // 3. ZDROWIE & URODA - Elektryczna szczoteczka
  {
    name: 'Oral-B iO Series 9',
    basePrice: 299.00,
    baseSeller: 'Etos',
    category: 'Tandverzorging'
  },
  // 4. DZIECKO & ZABAWKI - Lego
  {
    name: 'Lego Technic Porsche 911',
    basePrice: 169.00,
    baseSeller: 'Intertoys',
    category: 'Speelgoed'
  },
  // 5. SPORT & FITNESS - Rower treningowy
  {
    name: 'Tunturi Cardio Fit E30',
    basePrice: 449.00,
    baseSeller: 'Decathlon',
    category: 'Fitnessapparatuur'
  }
];

const GIANTS = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp', 'zalando', 'decathlon'];

function isGiant(seller) {
  const sellerLower = (seller || '').toLowerCase();
  return GIANTS.some(g => sellerLower.includes(g));
}

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/5: ${product.name.toUpperCase()}`);
  console.log('═'.repeat(100));
  console.log(`Categorie: ${product.category}`);
  console.log(`Waar gescand: ${product.baseSeller}`);
  console.log(`Prijs in winkel: €${product.basePrice.toFixed(2)}`);
  console.log('─'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const result = await fetchMarketOffers(product.name, null, {
      basePrice: product.basePrice,
      baseSeller: product.baseSeller,  // ⭐ NOWY PARAMETR!
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
    
    // Sprawdź czy baseSeller jest w wynikach (nie powinien być!)
    const baseSellerInResults = offers.some(o => {
      const seller = (o.seller || '').toLowerCase();
      const base = product.baseSeller.toLowerCase();
      return seller.includes(base) || base.includes(seller);
    });
    
    if (baseSellerInResults) {
      console.log(`⚠️  UWAGA: ${product.baseSeller} jest w wynikach! (nie powinno być)\n`);
    } else {
      console.log(`✅ BASE SELLER FILTER DZIAŁA: ${product.baseSeller} NIE jest w wynikach\n`);
    }
    
    // Analiza sklepów
    const giantOffers = offers.filter(o => isGiant(o.seller));
    const nicheOffers = offers.filter(o => !isGiant(o.seller));
    
    console.log('💶 PRIJS IN WINKEL (waar je scande):');
    console.log(`   ${product.baseSeller}: €${product.basePrice.toFixed(2)}`);
    console.log('');
    
    console.log('📊 ONZE AANBIEDINGEN:');
    console.log(`   Giganten: ${giantOffers.length}/${offers.length} (${((giantOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${nicheOffers.length}/${offers.length} (${((nicheOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log('');
    
    // TOP 3 oferty
    console.log('💰 TOP 3 GOEDKOPER DAN WINKEL:\n');
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
      console.log('─'.repeat(100));
      console.log(`\n🎁 SMART BUNDLES: ${bundles.length}\n`);
      
      bundles.forEach((bundle, idx) => {
        console.log(`${idx + 1}. ${bundle.name}`);
        console.log(`   Varianten: ${bundle.variants.length}`);
        console.log('');
      });
    }
    
    // Podsumowanie
    console.log('─'.repeat(100));
    console.log('\n📈 SAMENVATTING:');
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    const maxSavings = product.basePrice - offers[0].price;
    const maxSavingsPercent = (maxSavings / product.basePrice) * 100;
    
    console.log(`   Gemiddelde besparing: €${avgSavings.toFixed(2)} (${avgSavingsPercent.toFixed(1)}%)`);
    console.log(`   Grootste besparing: €${maxSavings.toFixed(2)} (${maxSavingsPercent.toFixed(1)}%) bij ${offers[0].seller}`);
    console.log(`   Aantal winkels: ${offers.length} (${giantOffers.length} giganten, ${nicheOffers.length} niche)`);
    console.log(`   Smart Bundles: ${bundles.length}`);
    
    return {
      product: product.name,
      category: product.category,
      baseSeller: product.baseSeller,
      success: true,
      offers: offers.length,
      bundles: bundles.length,
      avgSavings: avgSavingsPercent,
      maxSavings: maxSavingsPercent,
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
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█' + '  5 TESTÓW - SKRAJNIE RÓŻNE KATEGORIE'.padEnd(98) + '█');
  console.log('█' + '  Sprawdzamy gdzie przynosimy największe efekty'.padEnd(98) + '█');
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█'.repeat(100));
  
  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    // Pauza między testami
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Finalne podsumowanie
  console.log('\n\n' + '█'.repeat(100));
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█' + '  FINAAL OVERZICHT - WAAR BRENGEN WE WAARDE?'.padEnd(98) + '█');
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█'.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Geslaagd: ${successful.length}/5`);
  console.log(`❌ Mislukt: ${failed.length}/5`);
  
  if (successful.length > 0) {
    console.log(`\n📊 WAAR BRENGEN WE DE MEESTE WAARDE:\n`);
    
    // Sorteer per gemiddelde besparing
    const sorted = [...successful].sort((a, b) => b.avgSavings - a.avgSavings);
    
    sorted.forEach((r, idx) => {
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
      console.log(`${icon} ${r.category}: ${r.avgSavings.toFixed(1)}% gemiddeld (max ${r.maxSavings.toFixed(1)}%)`);
      console.log(`   ${r.offers} aanbiedingen (${r.giants} giganten, ${r.niche} niche)`);
      console.log(`   Base Seller Filter: ${r.baseSellerFiltered ? '✅ WERKT' : '❌ NIET WERKT'}`);
      console.log('');
    });
    
    // Globale statistieken
    const totalOffers = successful.reduce((sum, r) => sum + r.offers, 0);
    const totalGiants = successful.reduce((sum, r) => sum + r.giants, 0);
    const totalNiche = successful.reduce((sum, r) => sum + r.niche, 0);
    const avgSavings = successful.reduce((sum, r) => sum + r.avgSavings, 0) / successful.length;
    const baseSellerWorking = successful.filter(r => r.baseSellerFiltered).length;
    
    console.log('─'.repeat(100));
    console.log('\n🎯 GLOBALE STATISTIEKEN:');
    console.log(`   Gemiddelde besparing: ${avgSavings.toFixed(1)}%`);
    console.log(`   Totaal aanbiedingen: ${totalOffers}`);
    console.log(`   Giganten vs Niche: ${totalGiants} (${((totalGiants/(totalGiants+totalNiche))*100).toFixed(0)}%) vs ${totalNiche} (${((totalNiche/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Base Seller Filter werkt: ${baseSellerWorking}/${successful.length}`);
  }
  
  if (failed.length > 0) {
    console.log(`\n\n❌ MISLUKTE CATEGORIEËN:\n`);
    failed.forEach(r => {
      console.log(`   ${r.category}: ${r.error || 'Geen aanbiedingen'}`);
    });
  }
  
  console.log('\n' + '█'.repeat(100) + '\n');
}

runAllTests();
