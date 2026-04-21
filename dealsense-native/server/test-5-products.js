const https = require('https');

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

async function testProducts() {
  console.log('='.repeat(70));
  console.log('5 NOWYCH TESTÓW - PRAWDZIWE GOOGLE SHOPPING API');
  console.log('='.repeat(70));
  console.log(`Target: ${RENDER_URL}\n`);
  
  const products = [
    { query: 'iPhone 15 Pro 256GB', basePrice: 1329 },
    { query: 'Samsung QLED TV 55 inch', basePrice: 899 },
    { query: 'PlayStation 5 console', basePrice: 549 },
    { query: 'Nespresso Vertuo Next', basePrice: 149 },
    { query: 'AirPods Pro 2nd generation', basePrice: 279 }
  ];
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\nTest ${i + 1}: ${product.query}`);
    console.log('-'.repeat(70));
    
    try {
      const response = await makeRequest('/api/search', 'POST', product);
      
      if (response.status === 200) {
        const result = response.data;
        
        console.log(`Total Offers: ${result.totalOffers}`);
        console.log(`Filtered Offers: ${result.filteredOffers}/${result.totalOffers}`);
        console.log(`From Cache: ${result.fromCache ? 'YES' : 'NO'}`);
        
        if (result.topOffers.length > 0) {
          console.log(`\nTop 3 Offers:`);
          result.topOffers.forEach((offer, idx) => {
            console.log(`  ${idx + 1}. ${offer.store}: €${offer.price} (${offer.rating}★, ${offer.reviews} reviews)`);
          });
          console.log(`\nSavings: €${result.savings.amount.toFixed(2)} (${result.savings.percent}%)`);
          
          results.push({
            product: product.query,
            basePrice: result.basePrice,
            bestPrice: result.topOffers[0].price,
            savings: result.savings.amount,
            savingsPercent: result.savings.percent,
            totalOffers: result.totalOffers,
            filteredOffers: result.filteredOffers,
            eliminated: result.totalOffers - result.filteredOffers
          });
        } else {
          console.log(`\n⚠ No offers passed filters (${result.totalOffers} eliminated)`);
          results.push({
            product: product.query,
            basePrice: result.basePrice,
            bestPrice: null,
            savings: 0,
            savingsPercent: 0,
            totalOffers: result.totalOffers,
            filteredOffers: 0,
            eliminated: result.totalOffers
          });
        }
        
      } else if (response.status === 429) {
        console.log(`⚠ Rate limit exceeded - using cached data or skipping`);
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('PODSUMOWANIE');
  console.log('='.repeat(70));
  
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const avgSavings = results.length > 0 ? totalSavings / results.length : 0;
  const totalOffers = results.reduce((sum, r) => sum + r.totalOffers, 0);
  const totalFiltered = results.reduce((sum, r) => sum + r.filteredOffers, 0);
  const totalEliminated = results.reduce((sum, r) => sum + r.eliminated, 0);
  
  console.log(`\nTotal Offers Found: ${totalOffers}`);
  console.log(`Offers Passed Filters: ${totalFiltered} (${((totalFiltered/totalOffers)*100).toFixed(1)}%)`);
  console.log(`Offers Eliminated: ${totalEliminated} (${((totalEliminated/totalOffers)*100).toFixed(1)}%)`);
  console.log(`\nTotal Savings: €${totalSavings.toFixed(2)}`);
  console.log(`Average Savings: €${avgSavings.toFixed(2)}`);
  
  console.log('\nDetailed Results:');
  results.forEach(r => {
    console.log(`\n- ${r.product}`);
    console.log(`  Base: €${r.basePrice} → Best: €${r.bestPrice || 'N/A'}`);
    console.log(`  Savings: €${r.savings.toFixed(2)} (${r.savingsPercent}%)`);
    console.log(`  Filtered: ${r.filteredOffers}/${r.totalOffers} (${r.eliminated} eliminated)`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('⚠ PROBLEM: Filtry eliminują większość ofert!');
  console.log('Sklepy niszowe (tanie) mają za mało reviews lub za niski rating.');
  console.log('='.repeat(70));
}

testProducts().catch(console.error);
