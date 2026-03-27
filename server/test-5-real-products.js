/**
 * 5 PRAWDZIWYCH TESTÓW - 100% AUTENTYCZNE DANE Z API
 * Różne kategorie, prawdziwe ceny, prawdziwe sklepy
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  {
    name: 'iPhone 15 Pro',
    basePrice: 1229.00,
    category: 'Smartphone'
  },
  {
    name: 'Dyson V15 Detect',
    basePrice: 649.00,
    category: 'Odkurzacz'
  },
  {
    name: 'Samsung Galaxy S24',
    basePrice: 899.00,
    category: 'Smartphone'
  },
  {
    name: 'Philips Airfryer XXL',
    basePrice: 249.00,
    category: 'Keukenapparaat'
  },
  {
    name: 'Apple AirPods Pro 2',
    basePrice: 279.00,
    category: 'Audio'
  }
];

const GIANTS = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp', 'zalando'];

function isGiant(seller) {
  const sellerLower = (seller || '').toLowerCase();
  return GIANTS.some(g => sellerLower.includes(g));
}

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/5: ${product.name.toUpperCase()}`);
  console.log('═'.repeat(100));
  console.log(`Categorie: ${product.category}`);
  console.log(`Basisprijs: €${product.basePrice.toFixed(2)}`);
  console.log('─'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const result = await fetchMarketOffers(product.name, null, {
      basePrice: product.basePrice,
      userId: 'test-user',
      maxResults: 30
    });
    
    const duration = Date.now() - startTime;
    
    if (!result || !result.offers || result.offers.length === 0) {
      console.log(`\n❌ BRAK OFERT (czas: ${duration}ms)`);
      return {
        product: product.name,
        success: false,
        offers: 0,
        duration
      };
    }
    
    const offers = result.offers;
    const bundles = result.smartBundles || [];
    
    console.log(`\n✅ ZNALEZIONO ${offers.length} OFERT (czas: ${duration}ms)\n`);
    
    // Analiza sklepów
    const giantOffers = offers.filter(o => isGiant(o.seller));
    const nicheOffers = offers.filter(o => !isGiant(o.seller));
    
    console.log('� PRIJS IN WINKEL (waar je scande):');
    console.log(`   €${product.basePrice.toFixed(2)}`);
    console.log('');
    
    console.log('�📊 SKLEPY:');
    console.log(`   Giganci: ${giantOffers.length}/${offers.length} (${((giantOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${nicheOffers.length}/${offers.length} (${((nicheOffers.length/offers.length)*100).toFixed(0)}%)`);
    console.log('');
    
    // TOP 3 oferty
    console.log('💰 ONZE AANBIEDINGEN (goedkoper dan winkel!):\n');
    offers.slice(0, 3).forEach((offer, idx) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      const isGiantShop = isGiant(offer.seller);
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      const shopType = isGiantShop ? '🏢 GIGANT' : '🏪 NISZOWY';
      
      console.log(`${icon} ${offer.seller} ${shopType}`);
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
      console.log('─'.repeat(100));
      console.log(`\n🎁 SMART BUNDLES: ${bundles.length}\n`);
      
      bundles.forEach((bundle, idx) => {
        console.log(`${idx + 1}. ${bundle.name} (${bundle.type})`);
        console.log(`   Varianten: ${bundle.variants.length}`);
        bundle.variants.slice(0, 3).forEach(v => {
          const variant = v.variant.color || v.variant.type || v.variant.power || 'Standaard';
          console.log(`   - ${variant}: €${v.price.toFixed(2)} (${v.seller})`);
        });
        console.log('');
      });
    }
    
    // Podsumowanie
    console.log('─'.repeat(100));
    console.log('\n📈 SAMENVATTING:');
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    
    console.log(`   Gemiddelde prijs: €${avgPrice.toFixed(2)}`);
    console.log(`   Gemiddelde besparing: €${avgSavings.toFixed(2)} (${avgSavingsPercent.toFixed(1)}%)`);
    console.log(`   Laagste: €${offers[0].price.toFixed(2)} (${offers[0].seller})`);
    console.log(`   Hoogste: €${offers[offers.length - 1].price.toFixed(2)} (${offers[offers.length - 1].seller})`);
    console.log(`   Giganten: ${giantOffers.length}, Niche: ${nicheOffers.length}`);
    console.log(`   Smart Bundles: ${bundles.length}`);
    
    return {
      product: product.name,
      success: true,
      offers: offers.length,
      bundles: bundles.length,
      avgSavings: avgSavingsPercent,
      giants: giantOffers.length,
      niche: nicheOffers.length,
      duration
    };
    
  } catch (error) {
    console.error(`\n❌ BŁĄD: ${error.message}`);
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
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█' + '  5 PRAWDZIWYCH TESTÓW - 100% AUTENTYCZNE DANE Z SEARCHAPI.IO'.padEnd(98) + '█');
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█'.repeat(100));
  
  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    // Pauza między testami żeby nie przekroczyć rate limit
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 2s przed następnym testem...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Finalne podsumowanie
  console.log('\n\n' + '█'.repeat(100));
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█' + '  FINAAL OVERZICHT - ALLE 5 TESTEN'.padEnd(98) + '█');
  console.log('█' + ' '.repeat(98) + '█');
  console.log('█'.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Geslaagd: ${successful.length}/5`);
  console.log(`❌ Mislukt: ${failed.length}/5`);
  
  if (successful.length > 0) {
    const totalOffers = successful.reduce((sum, r) => sum + r.offers, 0);
    const totalBundles = successful.reduce((sum, r) => sum + r.bundles, 0);
    const totalGiants = successful.reduce((sum, r) => sum + r.giants, 0);
    const totalNiche = successful.reduce((sum, r) => sum + r.niche, 0);
    const avgSavings = successful.reduce((sum, r) => sum + r.avgSavings, 0) / successful.length;
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    
    console.log(`\n📊 STATISTIEKEN:`);
    console.log(`   Totaal aanbiedingen: ${totalOffers}`);
    console.log(`   Gemiddeld per product: ${(totalOffers / successful.length).toFixed(1)}`);
    console.log(`   Smart Bundles: ${totalBundles}`);
    console.log(`   Giganten: ${totalGiants} (${((totalGiants/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Niche winkels: ${totalNiche} (${((totalNiche/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
    console.log(`   Gemiddelde besparing: ${avgSavings.toFixed(1)}%`);
    console.log(`   Gemiddelde tijd: ${(avgDuration/1000).toFixed(1)}s`);
  }
  
  console.log('\n' + '█'.repeat(100) + '\n');
}

runAllTests();
