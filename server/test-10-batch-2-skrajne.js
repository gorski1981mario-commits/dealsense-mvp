/**
 * BATCH 2 - 10 TESTÓW SKRAJNYCH PRODUKTÓW
 * 
 * Cel: Porównanie z Batch 1
 * - Zupełnie inne produkty
 * - Skrajne kategorie (drogie, tanie, niszowe)
 * - Różne branże
 */

require('dotenv').config({ path: '.env.test' });
const { fetchMarketOffers } = require('./market-api');

process.env.MARKET_CACHE_BYPASS = 'true';

const TEST_PRODUCTS = [
  // BARDZO DROGIE (2 produkty)
  {
    name: 'iPhone 15 Pro Max 1TB',
    ean: null,
    basePrice: 1849,
    category: 'Smartphone (premium)'
  },
  {
    name: 'DJI Mavic 3 Pro',
    ean: null,
    basePrice: 2199,
    category: 'Dron (profesjonalny)'
  },
  
  // BARDZO TANIE (2 produkty)
  {
    name: 'IKEA Billy Boekenkast',
    ean: null,
    basePrice: 49,
    category: 'Meble (budget)'
  },
  {
    name: 'Xiaomi Mi Band 8',
    ean: null,
    basePrice: 39,
    category: 'Fitness tracker (budget)'
  },
  
  // NISZOWE (3 produkty)
  {
    name: 'Vitamix A3500 Blender',
    ean: null,
    basePrice: 649,
    category: 'Kuchnia (niszowy)'
  },
  {
    name: 'Brompton M6L Folding Bike',
    ean: null,
    basePrice: 1595,
    category: 'Rower (niszowy)'
  },
  {
    name: 'Weber Genesis E-335',
    ean: null,
    basePrice: 1299,
    category: 'Grill (premium)'
  },
  
  // INNE BRANŻE (3 produkty)
  {
    name: 'LEGO Technic Liebherr R 9800',
    ean: null,
    basePrice: 449,
    category: 'Zabawki (kolekcjonerskie)'
  },
  {
    name: 'Kindle Paperwhite Signature',
    ean: null,
    basePrice: 189,
    category: 'E-reader'
  },
  {
    name: 'Bose QuietComfort Earbuds II',
    ean: null,
    basePrice: 299,
    category: 'Słuchawki TWS'
  }
];

async function runBatchTest() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═              BATCH 2 - 10 TESTÓW SKRAJNYCH PRODUKTÓW          ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const results = [];
  let successCount = 0;
  let totalSavings = 0;
  let totalOffers = 0;
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const product = TEST_PRODUCTS[i];
    
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`═                 PRODUKT ${i + 1}/${TEST_PRODUCTS.length}: ${product.name.padEnd(40)} ═`);
    console.log(`═                 📦 Kategoria: ${product.category.padEnd(35)} ═`);
    console.log(`═                 💰 Cena bazowa: €${product.basePrice.toString().padEnd(33)} ═`);
    console.log('════════════════════════════════════════════════════════════════\n');
    
    const startTime = Date.now();
    
    try {
      const offers = await fetchMarketOffers(product.name, product.ean, {
        basePrice: product.basePrice,
        userId: 'test-batch-2-user',
        maxResults: 30
      });
      
      const duration = Date.now() - startTime;
      
      if (offers && offers.length > 0) {
        successCount++;
        
        const savings = offers.map(o => {
          const saved = product.basePrice - o.price;
          const percent = (saved / product.basePrice) * 100;
          return percent;
        });
        
        const avgSavings = savings.reduce((a, b) => a + b, 0) / savings.length;
        totalSavings += avgSavings;
        totalOffers += offers.length;
        
        console.log(`\n✅ ${offers.length} OFERT (${duration}ms)\n`);
        
        offers.slice(0, 3).forEach((offer, idx) => {
          const saved = product.basePrice - offer.price;
          const percent = ((saved / product.basePrice) * 100).toFixed(1);
          
          console.log(`${idx + 1}. ${offer.seller}`);
          console.log(`   €${offer.price.toFixed(2)} (${percent}% oszczędności)`);
          console.log(`   Score: ${offer._dealScore?.dealScore || 0}, Trust: ${offer._dealScore?.trustScore || 0}\n`);
        });
        
        results.push({
          product: product.name,
          category: product.category,
          basePrice: product.basePrice,
          status: 'SUCCESS',
          offersCount: offers.length,
          duration,
          avgSavings: avgSavings.toFixed(1),
          topOffers: offers.slice(0, 3).map(o => ({
            seller: o.seller,
            price: o.price,
            savings: product.basePrice - o.price,
            savingsPercent: ((product.basePrice - o.price) / product.basePrice * 100).toFixed(1),
            dealScore: o._dealScore?.dealScore || 0,
            trustScore: o._dealScore?.trustScore || 0
          }))
        });
      } else {
        console.log(`\n❌ BRAK OFERT (${duration}ms)\n`);
        
        results.push({
          product: product.name,
          category: product.category,
          basePrice: product.basePrice,
          status: 'NO_OFFERS',
          duration
        });
      }
    } catch (error) {
      console.log(`\n❌ BŁĄD: ${error.message}\n`);
      
      results.push({
        product: product.name,
        category: product.category,
        basePrice: product.basePrice,
        status: 'ERROR',
        error: error.message
      });
    }
    
    if (i < TEST_PRODUCTS.length - 1) {
      console.log('⏳ Pauza 2 sekundy...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // PODSUMOWANIE
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                         📊 PODSUMOWANIE                       ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const successRate = ((successCount / TEST_PRODUCTS.length) * 100).toFixed(0);
  const avgSavingsTotal = successCount > 0 ? (totalSavings / successCount).toFixed(1) : '0';
  const avgOffersPerProduct = successCount > 0 ? (totalOffers / successCount).toFixed(1) : '0';
  
  console.log(`✅ Success Rate: ${successCount}/${TEST_PRODUCTS.length} (${successRate}%)\n`);
  
  if (successCount > 0) {
    console.log(`💰 Średnie oszczędności: ${avgSavingsTotal}%`);
    console.log(`📦 Średnia liczba ofert: ${avgOffersPerProduct}\n`);
  }
  
  console.log('PER KATEGORIA:');
  const successResults = results.filter(r => r.status === 'SUCCESS');
  successResults.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.product}`);
    console.log(`   ${r.category}: ${r.offersCount} ofert, ${r.avgSavings}% avg savings`);
  });
  
  const failedResults = results.filter(r => r.status !== 'SUCCESS');
  if (failedResults.length > 0) {
    console.log('\n❌ PROBLEMY:');
    failedResults.forEach(r => {
      console.log(`   - ${r.product}: ${r.status}`);
    });
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                       ✅ TEST ZAKOŃCZONY                      ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  // Zapisz wyniki
  const fs = require('fs');
  const resultsPath = './test-results/test-10-batch-2-skrajne-results.json';
  
  const finalResults = {
    testName: 'Batch 2 - 10 Testów Skrajnych Produktów',
    date: new Date().toISOString(),
    configuration: {
      priceRange: '30%-200%',
      bannedSellers: '10 krytycznych',
      bannedKeywords: true,
      nlOnlyFilter: '.nl + 100 znanych sklepów',
      trustThreshold: 0,
      trustLogic: 'Sklep > Produkt (trusted sellers = 85-100 trust)'
    },
    successRate: `${successRate}%`,
    avgSavings: `${avgSavingsTotal}%`,
    avgOffersPerProduct: avgOffersPerProduct,
    results
  };
  
  fs.writeFileSync(resultsPath, JSON.stringify(finalResults, null, 2));
  console.log(`📁 Wyniki zapisane: ${require('path').resolve(resultsPath)}`);
}

runBatchTest().catch(console.error);
