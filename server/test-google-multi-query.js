/**
 * TEST: Google Shopping Multi-Query Strategy
 * 
 * Cel: Sprawdzić czy multi-query zwiększa % niszowych sklepów
 */

require('dotenv').config({ path: '.env.test' });

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function fetchGoogleShopping(query, location = 'Netherlands') {
  const url = 'https://www.searchapi.io/api/v1/search';
  
  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: query,
    location: location,
    api_key: SEARCHAPI_KEY,
    num: 40
  });
  
  try {
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    const offers = (data.shopping_results || []).map(item => ({
      seller: item.source || 'Unknown',
      price: item.extracted_price || item.price || 0,
      url: item.link || '',
      title: item.title || ''
    }));
    
    return offers;
  } catch (error) {
    console.error('Google Shopping error:', error.message);
    return [];
  }
}

async function fetchMultiQuery(productName, basePrice) {
  console.log(`\n🔍 Multi-Query dla: ${productName} (€${basePrice})`);
  console.log('─'.repeat(60));
  
  const queries = [
    { name: 'Standard', query: productName },
    { name: 'On Sale', query: `${productName} on sale` },
    { name: 'Price Range', query: `${productName} under €${Math.round(basePrice * 0.9)}` },
    { name: 'Discount', query: `${productName} discount` },
    { name: 'New', query: `${productName} new` }
  ];
  
  const allOffers = [];
  const stats = {};
  
  for (const { name, query } of queries) {
    console.log(`\n📦 Query: ${name} ("${query}")`);
    
    const offers = await fetchGoogleShopping(query);
    console.log(`   Znaleziono: ${offers.length} ofert`);
    
    // Policz gigantów vs niszowych
    const giants = ['bol.com', 'bol', 'amazon.nl', 'amazon', 'coolblue'];
    const giantCount = offers.filter(o => 
      giants.some(g => o.seller.toLowerCase().includes(g))
    ).length;
    const niszowe = offers.length - giantCount;
    
    console.log(`   Giganci: ${giantCount} (${((giantCount/offers.length)*100).toFixed(0)}%)`);
    console.log(`   Niszowe: ${niszowe} (${((niszowe/offers.length)*100).toFixed(0)}%)`);
    
    stats[name] = { total: offers.length, giants: giantCount, niszowe };
    allOffers.push(...offers);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Deduplikacja
  const uniqueOffers = deduplicateOffers(allOffers);
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PODSUMOWANIE:');
  console.log('═'.repeat(60));
  
  console.log(`\nTotal ofert (przed deduplikacją): ${allOffers.length}`);
  console.log(`Total ofert (po deduplikacji): ${uniqueOffers.length}`);
  
  // Policz gigantów vs niszowych w unique
  const giants = ['bol.com', 'bol', 'amazon.nl', 'amazon', 'coolblue'];
  const giantCount = uniqueOffers.filter(o => 
    giants.some(g => o.seller.toLowerCase().includes(g))
  ).length;
  const niszowe = uniqueOffers.length - giantCount;
  
  console.log(`\nGiganci: ${giantCount} (${((giantCount/uniqueOffers.length)*100).toFixed(1)}%)`);
  console.log(`Niszowe: ${niszowe} (${((niszowe/uniqueOffers.length)*100).toFixed(1)}%)`);
  
  // Top 10 niszowych
  const niszoweSklepy = uniqueOffers
    .filter(o => !giants.some(g => o.seller.toLowerCase().includes(g)))
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);
  
  if (niszoweSklepy.length > 0) {
    console.log('\n🏆 TOP 10 NISZOWYCH SKLEPÓW:');
    niszoweSklepy.forEach((offer, idx) => {
      console.log(`   ${idx + 1}. ${offer.seller} - €${offer.price.toFixed(2)}`);
    });
  }
  
  return { uniqueOffers, stats, giantCount, niszowe };
}

function deduplicateOffers(offers) {
  const seen = new Map();
  
  return offers.filter(offer => {
    const key = `${offer.seller.toLowerCase()}_${offer.price}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.set(key, true);
    return true;
  });
}

async function runTest() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═           TEST: Google Shopping Multi-Query Strategy         ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const products = [
    { name: 'iPhone 15 Pro 256GB', basePrice: 1329 },
    { name: 'Samsung Galaxy S24', basePrice: 899 },
    { name: 'Dyson V15 Detect', basePrice: 649 }
  ];
  
  const results = [];
  
  for (const product of products) {
    const result = await fetchMultiQuery(product.name, product.basePrice);
    
    results.push({
      product: product.name,
      basePrice: product.basePrice,
      totalOffers: result.uniqueOffers.length,
      giants: result.giantCount,
      niszowe: result.niszowe,
      niszoweProcent: ((result.niszowe / result.uniqueOffers.length) * 100).toFixed(1)
    });
    
    console.log('\n' + '─'.repeat(60));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Final summary
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                    📊 FINAL SUMMARY                          ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const avgNiszowe = results.reduce((sum, r) => sum + parseFloat(r.niszoweProcent), 0) / results.length;
  
  console.log('Per produkt:');
  results.forEach(r => {
    console.log(`\n${r.product}:`);
    console.log(`  Total: ${r.totalOffers} ofert`);
    console.log(`  Giganci: ${r.giants} (${((r.giants/r.totalOffers)*100).toFixed(1)}%)`);
    console.log(`  Niszowe: ${r.niszowe} (${r.niszoweProcent}%)`);
  });
  
  console.log(`\n🎯 ŚREDNI % NISZOWYCH: ${avgNiszowe.toFixed(1)}%`);
  
  if (avgNiszowe >= 50) {
    console.log('\n✅ SUKCES! Multi-query daje 50%+ niszowych sklepów!');
  } else if (avgNiszowe >= 40) {
    console.log('\n⚠️  OK. Multi-query daje 40-50% niszowych - można poprawić.');
  } else {
    console.log('\n❌ FAIL. Multi-query daje <40% niszowych - potrzeba Tweakers backup.');
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                       ✅ TEST ZAKOŃCZONY                      ═');
  console.log('════════════════════════════════════════════════════════════════\n');
}

runTest().catch(console.error);
