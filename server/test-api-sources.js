/**
 * TEST: API Sources Quality Check - MODA + NARZĘDZIA
 * Testuje SearchAPI na 10 produktach (5 MODA drogie + 5 NARZĘDZIA drogie)
 * Cel: Sprawdzić jakość źródeł dla kategorii FASHION i TOOLS
 * PARAMETRY:
 * - isNicheShop: reviews < 50, rating >= 4.0 (niszowe sklepy)
 * - MIN_REVIEWS: 20 (isScam filter - ZMIENIONE z 30 na 20)
 * GOOGLE SHOPPING: ADAPTIVE PAGES (page 1 zawsze, page 2 tylko jeśli page 1 >= 40 ofert)
 */

require('dotenv').config({ path: '.env.test' });
const { fetchMarketOffers } = require('./market-api');

const TEST_PRODUCTS = [
  // MODA - DROGIE (5 produktów)
  {
    name: 'Canada Goose Expedition Parka',
    category: 'Fashion - Jackets',
    expectedPrice: 1595
  },
  {
    name: 'Moncler Maya Down Jacket',
    category: 'Fashion - Jackets',
    expectedPrice: 1450
  },
  {
    name: 'Nike Air Jordan 1 Retro High',
    category: 'Fashion - Sneakers',
    expectedPrice: 189
  },
  {
    name: 'Adidas Yeezy Boost 350 V2',
    category: 'Fashion - Sneakers',
    expectedPrice: 250
  },
  {
    name: 'The North Face Nuptse Jacket',
    category: 'Fashion - Jackets',
    expectedPrice: 349
  },
  // NARZĘDZIA - DROGIE (5 produktów)
  {
    name: 'Bosch GSR 18V-85 C Boormachine',
    category: 'Tools - Drills',
    expectedPrice: 299
  },
  {
    name: 'Kärcher K7 Premium Hogedrukreiniger',
    category: 'Tools - Pressure Washers',
    expectedPrice: 699
  },
  {
    name: 'Makita DHP484Z Klopboormachine',
    category: 'Tools - Drills',
    expectedPrice: 249
  },
  {
    name: 'DeWalt DCS577T2 Cirkelzaag',
    category: 'Tools - Saws',
    expectedPrice: 799
  },
  {
    name: 'Festool TS 55 REBQ Invalzaag',
    category: 'Tools - Saws',
    expectedPrice: 649
  }
];

async function analyzeProduct(product, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${index + 1}/10: ${product.name}`);
  console.log(`Kategoria: ${product.category} | Cena referencyjna: €${product.expectedPrice}`);
  console.log('='.repeat(80));

  try {
    const offers = await fetchMarketOffers(product.name, null, {
      userId: 'test-user-api-sources',
      basePrice: product.expectedPrice
    });

    if (!offers || offers.length === 0) {
      console.log('❌ BRAK OFERT!\n');
      return {
        product: product.name,
        totalOffers: 0,
        finalOffers: 0,
        shops: [],
        savings: 0,
        savingsPercent: 0,
        cheapestPrice: 0,
        sources: []
      };
    }

    // Analiza ofert
    const totalOffers = offers.length;
    const finalOffers = offers.length;
    
    // Analiza źródeł API
    const searchAPIOffers = offers.filter(o => {
      const src = o._source || '';
      return src.includes('searchapi') || src.includes('google_searchapi') || src === 'google';
    });
    const serpAPIOffers = offers.filter(o => {
      const src = o._source || '';
      return src.includes('serpapi') || src.includes('google_serpapi');
    });
    
    // Unikalne sklepy
    const shops = [...new Set(offers.map(o => o.seller))];
    const searchAPIShops = [...new Set(searchAPIOffers.map(o => o.seller))];
    const serpAPIShops = [...new Set(serpAPIOffers.map(o => o.seller))];
    
    // Źródła danych
    const sources = [...new Set(offers.map(o => o._source || 'unknown'))];
    
    // Najniższa cena
    const cheapestOffer = offers[0];
    const cheapestPrice = cheapestOffer.price;
    const savings = product.expectedPrice - cheapestPrice;
    const savingsPercent = ((savings / product.expectedPrice) * 100).toFixed(1);

    // Wyświetl wyniki
    console.log(`\n📊 STATYSTYKI:`);
    console.log(`   Ofert znalezionych: ${totalOffers}`);
    console.log(`   🔵 SearchAPI: ${searchAPIOffers.length} ofert, ${searchAPIShops.length} sklepów`);
    console.log(`   🟢 SerpAPI: ${serpAPIOffers.length} ofert, ${serpAPIShops.length} sklepów`);
    console.log(`   Źródła: ${sources.join(', ')}`);
    
    console.log(`\n💰 NAJLEPSZA OFERTA:`);
    console.log(`   Sklep: ${cheapestOffer.seller}`);
    console.log(`   Cena: €${cheapestPrice.toFixed(2)}`);
    console.log(`   Oszczędność: €${savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`   Źródło: ${cheapestOffer._source || 'unknown'}`);
    
    console.log(`\n🏪 TOP 5 SKLEPY:`);
    offers.slice(0, 5).forEach((offer, idx) => {
      const saving = product.expectedPrice - offer.price;
      const savingPct = ((saving / product.expectedPrice) * 100).toFixed(1);
      const apiIcon = (offer._source || '').includes('searchapi') ? '🔵' : (offer._source || '').includes('serpapi') ? '🟢' : '⚪';
      console.log(`   ${apiIcon} ${idx + 1}. ${offer.seller.padEnd(25)} €${offer.price.toFixed(2).padStart(8)} (${savingPct}% taniej)`);
    });

    // Unikalne sklepy per API
    const searchOnlyShops = searchAPIShops.filter(s => !serpAPIShops.includes(s));
    const serpOnlyShops = serpAPIShops.filter(s => !searchAPIShops.includes(s));
    const commonShops = searchAPIShops.filter(s => serpAPIShops.includes(s));

    console.log(`\n� SKLEPY PER API:`);
    if (searchOnlyShops.length > 0) {
      console.log(`   🔵 Tylko SearchAPI (${searchOnlyShops.length}): ${searchOnlyShops.slice(0, 3).join(', ')}${searchOnlyShops.length > 3 ? '...' : ''}`);
    }
    if (serpOnlyShops.length > 0) {
      console.log(`   🟢 Tylko SerpAPI (${serpOnlyShops.length}): ${serpOnlyShops.slice(0, 3).join(', ')}${serpOnlyShops.length > 3 ? '...' : ''}`);
    }
    if (commonShops.length > 0) {
      console.log(`   🤝 Wspólne (${commonShops.length}): ${commonShops.slice(0, 3).join(', ')}${commonShops.length > 3 ? '...' : ''}`);
    }

    return {
      product: product.name,
      totalOffers,
      finalOffers,
      searchAPIOffers: searchAPIOffers.length,
      serpAPIOffers: serpAPIOffers.length,
      searchAPIShops: searchAPIShops.length,
      serpAPIShops: serpAPIShops.length,
      shops: shops.length,
      shopNames: shops,
      savings: parseFloat(savings.toFixed(2)),
      savingsPercent: parseFloat(savingsPercent),
      cheapestPrice,
      cheapestSource: cheapestOffer._source || 'unknown',
      sources,
      topOffers: offers.slice(0, 5).map(o => ({
        seller: o.seller,
        price: o.price,
        source: o._source || 'unknown',
        savings: parseFloat((product.expectedPrice - o.price).toFixed(2)),
        savingsPercent: parseFloat((((product.expectedPrice - o.price) / product.expectedPrice) * 100).toFixed(1))
      }))
    };

  } catch (error) {
    console.log(`❌ BŁĄD: ${error.message}\n`);
    return {
      product: product.name,
      error: error.message,
      totalOffers: 0,
      finalOffers: 0,
      shops: 0,
      savings: 0,
      savingsPercent: 0
    };
  }
}

async function runTests() {
  console.log('\n🔍 TEST API SOURCES - JAKOŚĆ ŹRÓDEŁ DANYCH');
  console.log('SearchAPI.io + SerpAPI fallback');
  console.log(`Konfiguracja: USE_OWN_CRAWLER=${process.env.USE_OWN_CRAWLER}, USE_PROXY=${process.env.USE_PROXY}`);
  
  const results = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const result = await analyzeProduct(TEST_PRODUCTS[i], i);
    results.push(result);
    
    // Delay między testami (rate limiting)
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('\n⏳ Czekam 2s przed następnym testem...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // PODSUMOWANIE
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('📈 PODSUMOWANIE TESTÓW');
  console.log('='.repeat(80));

  const successCount = results.filter(r => r.finalOffers > 0).length;
  const avgOffers = (results.reduce((sum, r) => sum + r.finalOffers, 0) / results.length).toFixed(1);
  const avgShops = (results.reduce((sum, r) => sum + r.shops, 0) / results.length).toFixed(1);
  const avgSavings = (results.reduce((sum, r) => sum + r.savingsPercent, 0) / results.length).toFixed(1);
  
  const avgSearchAPIOffers = (results.reduce((sum, r) => sum + (r.searchAPIOffers || 0), 0) / results.length).toFixed(1);
  const avgSerpAPIOffers = (results.reduce((sum, r) => sum + (r.serpAPIOffers || 0), 0) / results.length).toFixed(1);
  const avgSearchAPIShops = (results.reduce((sum, r) => sum + (r.searchAPIShops || 0), 0) / results.length).toFixed(1);
  const avgSerpAPIShops = (results.reduce((sum, r) => sum + (r.serpAPIShops || 0), 0) / results.length).toFixed(1);
  
  console.log(`\n✅ Success Rate: ${successCount}/${results.length} (${((successCount/results.length)*100).toFixed(0)}%)`);
  console.log(`📦 Średnia ofert po filtrach: ${avgOffers}`);
  console.log(`   🔵 SearchAPI: ${avgSearchAPIOffers} ofert, ${avgSearchAPIShops} sklepów`);
  console.log(`   🟢 SerpAPI: ${avgSerpAPIOffers} ofert, ${avgSerpAPIShops} sklepów`);
  console.log(`🏪 Średnia unikalnych sklepów: ${avgShops}`);
  console.log(`💰 Średnie oszczędności: ${avgSavings}%`);

  console.log(`\n📊 SZCZEGÓŁY:`);
  results.forEach((r, idx) => {
    const status = r.finalOffers > 0 ? '✅' : '❌';
    const searchAPI = r.searchAPIOffers || 0;
    const serpAPI = r.serpAPIOffers || 0;
    console.log(`${status} ${(idx + 1)}. ${r.product.padEnd(30)} | Ofert: ${String(r.finalOffers).padStart(2)} (🔵${searchAPI} 🟢${serpAPI}) | Sklepy: ${String(r.shops).padStart(2)} | ${String(r.savingsPercent).padStart(5)}%`);
  });

  // Wszystkie unikalne sklepy
  const allShops = new Set();
  results.forEach(r => {
    if (r.shopNames) {
      r.shopNames.forEach(shop => allShops.add(shop));
    }
  });

  console.log(`\n🌍 WSZYSTKIE UNIKALNE SKLEPY (${allShops.size}):`);
  const shopsList = Array.from(allShops).sort();
  shopsList.forEach(shop => {
    console.log(`   • ${shop}`);
  });

  // Źródła danych
  const allSources = new Set();
  results.forEach(r => {
    if (r.sources) {
      r.sources.forEach(source => allSources.add(source));
    }
  });

  console.log(`\n📡 ŹRÓDŁA DANYCH:`);
  Array.from(allSources).forEach(source => {
    console.log(`   • ${source}`);
  });

  console.log(`\n${'='.repeat(80)}\n`);
}

runTests().catch(console.error);
