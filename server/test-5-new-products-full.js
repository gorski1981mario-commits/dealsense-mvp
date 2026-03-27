/**
 * TEST 5 NOWYCH PRODUKTÓW - PEŁNY OUTPUT DLA UŻYTKOWNIKA
 * 
 * Produkty:
 * 1. Samsung Galaxy Buds2 Pro (elektronika)
 * 2. De'Longhi Magnifica S (AGD - kawa)
 * 3. Black+Decker GTC36552PC (ogród)
 * 4. Adidas Ultraboost 22 (sport)
 * 5. Philips Sonicare DiamondClean (zdrowie)
 */

const axios = require('axios');

const PRODUCTS = [
  {
    name: 'Samsung Galaxy Buds2 Pro',
    query: 'Samsung Galaxy Buds2 Pro',
    category: 'elektronika',
    basePrice: 229.00
  },
  {
    name: 'De\'Longhi Magnifica S ECAM 22.110.B',
    query: 'DeLonghi Magnifica S ECAM 22.110.B',
    category: 'AGD',
    basePrice: 399.00
  },
  {
    name: 'Black+Decker GTC36552PC Heggenschaar',
    query: 'Black Decker GTC36552PC heggenschaar',
    category: 'ogród',
    basePrice: 189.00
  },
  {
    name: 'Adidas Ultraboost 22',
    query: 'Adidas Ultraboost 22 hardloopschoenen',
    category: 'sport',
    basePrice: 180.00
  },
  {
    name: 'Philips Sonicare DiamondClean 9000',
    query: 'Philips Sonicare DiamondClean 9000',
    category: 'zdrowie',
    basePrice: 249.00
  }
];

async function testProduct(product, index) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST ${index + 1}/5: ${product.name}`);
  console.log('='.repeat(80));
  console.log(`Kategoria: ${product.category}`);
  console.log(`Cena bazowa: €${product.basePrice}`);
  console.log(`Query: "${product.query}"`);
  console.log('-'.repeat(80));

  try {
    // 1. SEARCH API - oferty
    console.log('\n📦 SZUKAM OFERT...\n');
    
    const searchResponse = await axios.post('http://localhost:3001/api/search', {
      query: product.query,
      basePrice: product.basePrice
    }, {
      timeout: 30000
    });

    const offers = searchResponse.data.offers || [];
    const stats = searchResponse.data.stats || {};

    console.log(`✅ Znaleziono: ${offers.length} ofert`);
    console.log(`⏱️  Czas: ${stats.responseTime || 'N/A'}ms`);
    console.log(`🔍 Źródło: ${stats.source || 'SearchAPI'}`);

    if (offers.length === 0) {
      console.log('\n❌ BRAK OFERT - Ghost Mode dostępny dla PLUS users\n');
      return {
        product: product.name,
        success: false,
        offers: 0,
        savings: 0,
        reviews: null
      };
    }

    // 2. POKAZUJĘ OFERTY (TOP 3)
    console.log('\n💰 TOP OFERTY DLA UŻYTKOWNIKA:\n');
    
    const topOffers = offers.slice(0, 3);
    topOffers.forEach((offer, i) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
      
      console.log(`${i + 1}. ${offer.shop || offer.seller || 'Unknown'}`);
      console.log(`   💶 Cena: €${offer.price.toFixed(2)}`);
      console.log(`   💰 Oszczędności: €${savings.toFixed(2)} (${savingsPercent}%)`);
      console.log(`   ⭐ DealScore: ${offer._dealScore || 'N/A'}/10`);
      console.log(`   🔒 Trust: ${offer._trustScore || 'N/A'}/100`);
      console.log(`   🚚 Dostawa: ${offer.delivery || 'N/A'}`);
      console.log('');
    });

    // 3. PROWIZJA
    const bestOffer = offers[0];
    const totalSavings = product.basePrice - bestOffer.price;
    const commissionFree = totalSavings * 0.10;
    const commissionPlus = totalSavings * 0.09;

    console.log('💸 PROWIZJA:');
    console.log(`   FREE (10%): €${commissionFree.toFixed(2)}`);
    console.log(`   PLUS (9%): €${commissionPlus.toFixed(2)}`);
    console.log(`   Netto oszczędności (PLUS): €${(totalSavings - commissionPlus).toFixed(2)}`);

    // 4. REVIEWS ANALYSIS (jeśli dostępne)
    console.log('\n💡 DEALSCORE™ KWALITEIT (Reviews Analysis):\n');
    console.log('   [Komponent pokazywałby tutaj:]');
    console.log('   - Sentiment analysis (pozytywne/negatywne %)');
    console.log('   - Top 3 zalety');
    console.log('   - Top 3 wady');
    console.log('   - Krytyczne problemy (jeśli są)');
    console.log('   - DealScore verdict: X/10');
    console.log('   - Źródła: Bol, Coolblue, MediaMarkt, Tweakers, Reddit');

    // 5. DODATKOWE FEATURES
    console.log('\n🎁 DODATKOWE FEATURES:\n');
    console.log('   ✅ Social Share (WhatsApp, Facebook, Twitter, LinkedIn)');
    console.log('   ✅ Wishlist (PLUS) - zapisz produkt');
    console.log('   ✅ Savings Timeline (PLUS) - historia cen');
    if (offers.length === 0) {
      console.log('   ✅ Ghost Mode (PLUS) - monitoring cen 24h');
    }

    // PODSUMOWANIE
    console.log('\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE:');
    console.log('='.repeat(80));
    console.log(`Produkt: ${product.name}`);
    console.log(`Oferty: ${offers.length}`);
    console.log(`Najlepsza cena: €${bestOffer.price.toFixed(2)} (${bestOffer.shop || bestOffer.seller})`);
    console.log(`Oszczędności: €${totalSavings.toFixed(2)} (${((totalSavings/product.basePrice)*100).toFixed(1)}%)`);
    console.log(`Prowizja PLUS: €${commissionPlus.toFixed(2)}`);
    console.log(`Wartość dla usera: €${(totalSavings - commissionPlus).toFixed(2)} netto`);
    console.log('='.repeat(80));

    return {
      product: product.name,
      success: true,
      offers: offers.length,
      bestPrice: bestOffer.price,
      savings: totalSavings,
      savingsPercent: ((totalSavings/product.basePrice)*100).toFixed(1),
      commission: commissionPlus,
      netValue: totalSavings - commissionPlus
    };

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    return {
      product: product.name,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   TEST 5 NOWYCH PRODUKTÓW - PEŁNY OUTPUT                      ║');
  console.log('║                         Co widzi użytkownik?                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    // Pauza między testami
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Czekam 2s przed następnym testem...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // FINALNE PODSUMOWANIE
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         FINALNE PODSUMOWANIE TESTÓW                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Sukces: ${successful.length}/${PRODUCTS.length} (${((successful.length/PRODUCTS.length)*100).toFixed(0)}%)`);
  console.log(`❌ Brak ofert: ${failed.length}/${PRODUCTS.length}`);
  
  if (successful.length > 0) {
    const avgSavings = successful.reduce((sum, r) => sum + parseFloat(r.savingsPercent), 0) / successful.length;
    const avgOffers = successful.reduce((sum, r) => sum + r.offers, 0) / successful.length;
    const totalCommission = successful.reduce((sum, r) => sum + r.commission, 0);
    const totalNetValue = successful.reduce((sum, r) => sum + r.netValue, 0);

    console.log(`\n📊 ŚREDNIE WYNIKI:`);
    console.log(`   Oszczędności: ${avgSavings.toFixed(1)}%`);
    console.log(`   Oferty per produkt: ${avgOffers.toFixed(1)}`);
    console.log(`   Prowizja total: €${totalCommission.toFixed(2)}`);
    console.log(`   Wartość dla userów: €${totalNetValue.toFixed(2)}`);
  }

  console.log('\n📋 SZCZEGÓŁY:\n');
  results.forEach((r, i) => {
    if (r.success) {
      console.log(`${i+1}. ✅ ${r.product}`);
      console.log(`   ${r.offers} ofert, €${r.bestPrice.toFixed(2)}, oszczędności ${r.savingsPercent}%`);
    } else {
      console.log(`${i+1}. ❌ ${r.product} - ${r.error || 'Brak ofert'}`);
    }
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log('TEST ZAKOŃCZONY');
  console.log('='.repeat(80));
  console.log('\n');
}

// RUN
runTests().catch(console.error);
