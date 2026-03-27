/**
 * TEST 5 NOWYCH PRODUKTÓW - STANDALONE (bez serwera)
 * Bezpośrednie wywołanie SearchAPI
 */

require('dotenv').config();
const axios = require('axios');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY || '4d4e3f8a8b0c9d2e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e';

const PRODUCTS = [
  {
    name: 'Samsung Galaxy Buds2 Pro',
    query: 'Samsung Galaxy Buds2 Pro',
    category: 'elektronika',
    basePrice: 229.00
  },
  {
    name: 'De\'Longhi Magnifica S ECAM 22.110.B',
    query: 'DeLonghi Magnifica S ECAM 22.110.B koffiezetapparaat',
    category: 'AGD',
    basePrice: 399.00
  },
  {
    name: 'Black+Decker GTC36552PC Heggenschaar',
    query: 'Black Decker GTC36552PC heggenschaar accu',
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
    query: 'Philips Sonicare DiamondClean 9000 elektrische tandenborstel',
    category: 'zdrowie',
    basePrice: 249.00
  }
];

async function searchProduct(query) {
  try {
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google_shopping',
        q: query,
        api_key: SEARCHAPI_KEY,
        gl: 'nl',
        hl: 'nl',
        num: 20
      },
      timeout: 15000
    });

    return response.data.shopping_results || [];
  } catch (error) {
    console.error(`SearchAPI error: ${error.message}`);
    return [];
  }
}

function filterOffers(offers, basePrice, productName) {
  const filtered = offers.filter(offer => {
    // 1. Price range (40%-150%)
    const minPrice = basePrice * 0.40;
    const maxPrice = basePrice * 1.50;
    if (offer.price < minPrice || offer.price > maxPrice) return false;

    // 2. Banned keywords (akcesoria)
    const title = (offer.title || '').toLowerCase();
    const bannedKeywords = [
      'hoes', 'hoesje', 'case', 'cover', 'bandje', 'band', 'strap',
      'filter', 'stofzak', 'tas', 'bag', 'oplader', 'charger', 'kabel', 'cable',
      'screenprotector', 'oordopjes', 'earbuds tips', 'adapter'
    ];
    if (bannedKeywords.some(kw => title.includes(kw))) return false;

    // 3. Banned sellers
    const source = (offer.source || '').toLowerCase();
    const bannedSellers = [
      'marktplaats', 'ebay', '2dehands', 'vinted', 'aliexpress', 'joom', 'wish'
    ];
    if (bannedSellers.some(seller => source.includes(seller))) return false;

    // 4. NL only
    const link = (offer.link || '').toLowerCase();
    const isNL = link.includes('.nl') || 
                 ['bol.com', 'coolblue', 'mediamarkt', 'amazon.nl', 'expert'].some(shop => source.includes(shop));
    if (!isNL) return false;

    return true;
  });

  // Sort by price (cheapest first)
  return filtered.sort((a, b) => a.price - b.price);
}

async function testProduct(product, index) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST ${index + 1}/5: ${product.name}`);
  console.log('='.repeat(80));
  console.log(`Kategoria: ${product.category}`);
  console.log(`Cena bazowa: €${product.basePrice}`);
  console.log(`Query: "${product.query}"`);
  console.log('-'.repeat(80));

  console.log('\n📦 SZUKAM OFERT (SearchAPI)...\n');
  
  const startTime = Date.now();
  const rawOffers = await searchProduct(product.query);
  const responseTime = Date.now() - startTime;

  console.log(`⏱️  Czas: ${responseTime}ms`);
  console.log(`📥 Raw oferty: ${rawOffers.length}`);

  if (rawOffers.length === 0) {
    console.log('\n❌ BRAK OFERT Z SEARCHAPI\n');
    return {
      product: product.name,
      success: false,
      offers: 0
    };
  }

  // Filter oferty
  const filteredOffers = filterOffers(rawOffers, product.basePrice, product.name);
  console.log(`✅ Po filtrach: ${filteredOffers.length} ofert`);

  if (filteredOffers.length === 0) {
    console.log('\n⚠️  WSZYSTKIE OFERTY ODRZUCONE PRZEZ FILTRY');
    console.log('   Ghost Mode dostępny dla PLUS users\n');
    return {
      product: product.name,
      success: false,
      offers: 0,
      rawOffers: rawOffers.length
    };
  }

  // TOP 3 oferty
  const topOffers = filteredOffers.slice(0, 3);
  
  console.log('\n💰 TOP OFERTY DLA UŻYTKOWNIKA:\n');
  
  topOffers.forEach((offer, i) => {
    const savings = product.basePrice - offer.price;
    const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
    
    console.log(`${i + 1}. ${offer.source || 'Unknown'}`);
    console.log(`   💶 Cena: €${offer.price.toFixed(2)}`);
    console.log(`   💰 Oszczędności: €${savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`   🚚 Dostawa: ${offer.delivery || 'N/A'}`);
    console.log(`   🔗 Link: ${(offer.link || '').substring(0, 60)}...`);
    console.log('');
  });

  // Prowizja
  const bestOffer = topOffers[0];
  const totalSavings = product.basePrice - bestOffer.price;
  const commissionFree = totalSavings * 0.10;
  const commissionPlus = totalSavings * 0.09;

  console.log('💸 PROWIZJA:');
  console.log(`   FREE (10%): €${commissionFree.toFixed(2)}`);
  console.log(`   PLUS (9%): €${commissionPlus.toFixed(2)}`);
  console.log(`   Netto oszczędności (PLUS): €${(totalSavings - commissionPlus).toFixed(2)}`);

  // Reviews Analysis
  console.log('\n💡 DEALSCORE™ KWALITEIT (Reviews Analysis):');
  console.log('   [Komponent pokazywałby:]');
  console.log('   - Sentiment analysis z 6 źródeł');
  console.log('   - Top 3 zalety produktu');
  console.log('   - Top 3 wady produktu');
  console.log('   - DealScore verdict: X/10');

  // Dodatkowe features
  console.log('\n🎁 DODATKOWE FEATURES:');
  console.log('   ✅ Social Share (WhatsApp, Facebook, Twitter, LinkedIn)');
  console.log('   ✅ Wishlist (PLUS) - zapisz produkt');
  console.log('   ✅ Savings Timeline (PLUS) - historia cen');

  // Podsumowanie
  console.log('\n' + '='.repeat(80));
  console.log('📊 PODSUMOWANIE:');
  console.log('='.repeat(80));
  console.log(`Produkt: ${product.name}`);
  console.log(`Oferty: ${filteredOffers.length} (z ${rawOffers.length} raw)`);
  console.log(`Najlepsza cena: €${bestOffer.price.toFixed(2)} (${bestOffer.source})`);
  console.log(`Oszczędności: €${totalSavings.toFixed(2)} (${((totalSavings/product.basePrice)*100).toFixed(1)}%)`);
  console.log(`Prowizja PLUS: €${commissionPlus.toFixed(2)}`);
  console.log(`Wartość dla usera: €${(totalSavings - commissionPlus).toFixed(2)} netto`);
  console.log('='.repeat(80));

  return {
    product: product.name,
    success: true,
    offers: filteredOffers.length,
    rawOffers: rawOffers.length,
    bestPrice: bestOffer.price,
    bestShop: bestOffer.source,
    savings: totalSavings,
    savingsPercent: ((totalSavings/product.basePrice)*100).toFixed(1),
    commission: commissionPlus,
    netValue: totalSavings - commissionPlus
  };
}

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST 5 NOWYCH PRODUKTÓW - CO WIDZI UŻYTKOWNIK?                  ║');
  console.log('║                    (Bezpośrednie wywołanie SearchAPI)                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  if (!SEARCHAPI_KEY) {
    console.error('❌ BRAK GOOGLE_SHOPPING_API_KEY w .env!');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Czekam 3s przed następnym testem...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
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
      console.log(`   ${r.offers} ofert (z ${r.rawOffers} raw), €${r.bestPrice.toFixed(2)} @ ${r.bestShop}`);
      console.log(`   Oszczędności: ${r.savingsPercent}%, prowizja: €${r.commission.toFixed(2)}`);
    } else {
      console.log(`${i+1}. ❌ ${r.product}`);
      if (r.rawOffers) {
        console.log(`   ${r.rawOffers} raw ofert, ale wszystkie odrzucone przez filtry`);
      } else {
        console.log(`   Brak ofert z SearchAPI`);
      }
    }
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log('TEST ZAKOŃCZONY');
  console.log('='.repeat(80));
  console.log('\n');
}

runTests().catch(console.error);
