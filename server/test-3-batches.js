const https = require('https');
const fs = require('fs');

const RENDER_URL = 'https://dealsense-aplikacja.onrender.com';

function makeRequest(path, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RENDER_URL);
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) req.write(postData);
    req.end();
  });
}

const allProducts = [
  // BATCH 1 (już przetestowane)
  { query: 'iPhone 15 Pro 256GB', basePrice: 1329 },
  { query: 'Samsung QLED TV 55 inch', basePrice: 899 },
  { query: 'PlayStation 5 console', basePrice: 549 },
  { query: 'Nespresso Vertuo Next', basePrice: 149 },
  { query: 'AirPods Pro 2nd generation', basePrice: 279 },
  
  // BATCH 2 (nowe produkty)
  { query: 'DeLonghi Magnifica S espresso machine', basePrice: 399 },
  { query: 'Philips Hue White and Color starter kit', basePrice: 199 },
  { query: 'GoPro Hero 12 Black', basePrice: 449 },
  { query: 'Bose QuietComfort 45 headphones', basePrice: 329 },
  { query: 'Nintendo Switch OLED', basePrice: 349 },
  
  // BATCH 3 (nowe produkty)
  { query: 'Samsung Galaxy Watch 6 Classic', basePrice: 429 },
  { query: 'Kindle Paperwhite Signature Edition', basePrice: 189 },
  { query: 'Xbox Series X console', basePrice: 499 },
  { query: 'Fitbit Charge 6', basePrice: 159 },
  { query: 'Apple iPad Air 11 inch 256GB', basePrice: 899 }
];

async function testBatch(batchName, products, delay = 2000) {
  console.log('\n' + '='.repeat(70));
  console.log(`${batchName}`);
  console.log('='.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.query}`);
    console.log('-'.repeat(70));
    
    try {
      const response = await makeRequest('/api/search', 'POST', product);
      
      if (response.status === 200) {
        const result = response.data;
        
        console.log(`Total: ${result.totalOffers} | Filtered: ${result.filteredOffers} | Cache: ${result.fromCache ? 'YES' : 'NO'}`);
        
        if (result.topOffers.length > 0) {
          const best = result.topOffers[0];
          console.log(`Best: €${best.price} (${best.store}) - Savings: €${result.savings.amount.toFixed(2)} (${result.savings.percent}%)`);
          
          results.push({
            product: product.query,
            basePrice: result.basePrice,
            bestPrice: best.price,
            savings: result.savings.amount,
            savingsPercent: parseFloat(result.savings.percent),
            totalOffers: result.totalOffers,
            filteredOffers: result.filteredOffers,
            eliminated: result.totalOffers - result.filteredOffers,
            fromCache: result.fromCache
          });
        } else {
          console.log(`⚠ No offers passed filters (${result.totalOffers} eliminated)`);
          results.push({
            product: product.query,
            basePrice: result.basePrice,
            bestPrice: null,
            savings: 0,
            savingsPercent: 0,
            totalOffers: result.totalOffers,
            filteredOffers: 0,
            eliminated: result.totalOffers,
            fromCache: result.fromCache
          });
        }
        
      } else if (response.status === 429) {
        console.log(`⚠ Rate limit - skipping`);
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
      
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  return results;
}

function printSummary(batchName, results) {
  console.log('\n' + '='.repeat(70));
  console.log(`PODSUMOWANIE: ${batchName}`);
  console.log('='.repeat(70));
  
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const avgSavings = results.length > 0 ? totalSavings / results.length : 0;
  const totalOffers = results.reduce((sum, r) => sum + r.totalOffers, 0);
  const totalFiltered = results.reduce((sum, r) => sum + r.filteredOffers, 0);
  const totalEliminated = results.reduce((sum, r) => sum + r.eliminated, 0);
  const avgSavingsPercent = results.reduce((sum, r) => sum + r.savingsPercent, 0) / results.length;
  
  console.log(`\nOferty:`);
  console.log(`  Total znalezionych: ${totalOffers}`);
  console.log(`  Przeszło filtry: ${totalFiltered} (${((totalFiltered/totalOffers)*100).toFixed(1)}%)`);
  console.log(`  Odrzuconych: ${totalEliminated} (${((totalEliminated/totalOffers)*100).toFixed(1)}%)`);
  
  console.log(`\nOszczędności:`);
  console.log(`  Total: €${totalSavings.toFixed(2)}`);
  console.log(`  Średnia: €${avgSavings.toFixed(2)}`);
  console.log(`  Średni %: ${avgSavingsPercent.toFixed(1)}%`);
  
  console.log(`\nTop 5 oszczędności:`);
  const sorted = [...results].sort((a, b) => b.savings - a.savings).slice(0, 5);
  sorted.forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.product}: €${r.savings.toFixed(2)} (${r.savingsPercent}%)`);
  });
}

async function runAllTests() {
  console.log('='.repeat(70));
  console.log('TEST 3 BATCHY × 5 PRODUKTÓW - OBECNE FILTRY (4.0/30)');
  console.log('='.repeat(70));
  
  const batch1 = allProducts.slice(0, 5);
  const batch2 = allProducts.slice(5, 10);
  const batch3 = allProducts.slice(10, 15);
  
  console.log('\n📦 BATCH 1: 5 produktów (iPhone, Samsung TV, PS5, Nespresso, AirPods)');
  const results1 = await testBatch('BATCH 1', batch1);
  printSummary('BATCH 1', results1);
  
  console.log('\n\n📦 BATCH 2: 5 nowych produktów (DeLonghi, Philips Hue, GoPro, Bose, Switch)');
  const results2 = await testBatch('BATCH 2', batch2);
  printSummary('BATCH 2', results2);
  
  console.log('\n\n📦 BATCH 3: 5 nowych produktów (Galaxy Watch, Kindle, Xbox, Fitbit, iPad)');
  const results3 = await testBatch('BATCH 3', batch3);
  printSummary('BATCH 3', results3);
  
  const allResults = [...results1, ...results2, ...results3];
  
  console.log('\n\n' + '='.repeat(70));
  console.log('PODSUMOWANIE WSZYSTKICH 3 BATCHY (15 PRODUKTÓW)');
  console.log('='.repeat(70));
  
  const totalSavings = allResults.reduce((sum, r) => sum + r.savings, 0);
  const avgSavings = totalSavings / allResults.length;
  const totalOffers = allResults.reduce((sum, r) => sum + r.totalOffers, 0);
  const totalFiltered = allResults.reduce((sum, r) => sum + r.filteredOffers, 0);
  const totalEliminated = allResults.reduce((sum, r) => sum + r.eliminated, 0);
  const avgSavingsPercent = allResults.reduce((sum, r) => sum + r.savingsPercent, 0) / allResults.length;
  
  console.log(`\n📊 STATYSTYKI:`);
  console.log(`  Produktów przetestowanych: ${allResults.length}`);
  console.log(`  Total ofert znalezionych: ${totalOffers}`);
  console.log(`  Przeszło filtry: ${totalFiltered} (${((totalFiltered/totalOffers)*100).toFixed(1)}%)`);
  console.log(`  Odrzuconych: ${totalEliminated} (${((totalEliminated/totalOffers)*100).toFixed(1)}%)`);
  console.log(`\n💰 OSZCZĘDNOŚCI:`);
  console.log(`  Total: €${totalSavings.toFixed(2)}`);
  console.log(`  Średnia na produkt: €${avgSavings.toFixed(2)}`);
  console.log(`  Średni procent: ${avgSavingsPercent.toFixed(1)}%`);
  
  fs.writeFileSync('test-results-old-filters.json', JSON.stringify({
    filters: { rating: 4.0, reviews: 30 },
    products: allProducts,
    results: allResults,
    summary: {
      totalProducts: allResults.length,
      totalOffers,
      totalFiltered,
      totalEliminated,
      filterPassRate: ((totalFiltered/totalOffers)*100).toFixed(1),
      totalSavings: totalSavings.toFixed(2),
      avgSavings: avgSavings.toFixed(2),
      avgSavingsPercent: avgSavingsPercent.toFixed(1)
    }
  }, null, 2));
  
  console.log('\n✅ Wyniki zapisane do: test-results-old-filters.json');
  console.log('\n' + '='.repeat(70));
  console.log('GOTOWE - Teraz zmień filtry i uruchom ponownie te same produkty');
  console.log('='.repeat(70));
}

runAllTests().catch(console.error);
