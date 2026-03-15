const fs = require('fs');
const https = require('https');

const RENDER_URL = process.env.RENDER_URL || 'https://your-app.onrender.com';

function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, RENDER_URL);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
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
    if (data) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('DEALSENSE PRICING ENGINE - TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Target: ${RENDER_URL}\n`);
  
  console.log('TEST 1: Health Check');
  console.log('-'.repeat(60));
  try {
    const health = await makeRequest('/health');
    console.log(`Status: ${health.status}`);
    console.log('Config:', JSON.stringify(health.data.config, null, 2));
    console.log('✓ Health check passed\n');
  } catch (error) {
    console.log('✗ Health check failed:', error.message, '\n');
  }
  
  const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
  const selectedTests = testData.testProducts.slice(0, 5);
  
  console.log('TEST 2-6: Price Comparison (5 products)');
  console.log('-'.repeat(60));
  
  const results = [];
  
  for (let i = 0; i < selectedTests.length; i++) {
    const product = selectedTests[i];
    console.log(`\nTest ${i + 2}: ${product.product}`);
    console.log(`Base Price: €${product.basePrice}`);
    console.log(`Total Offers: ${product.offers.length}`);
    
    try {
      const response = await makeRequest('/api/compare', product);
      
      if (response.status === 200) {
        const result = response.data;
        console.log(`Filtered Offers: ${result.filteredOffers}`);
        console.log(`Top Offers: ${result.topOffers.length}`);
        
        if (result.topOffers.length > 0) {
          console.log('\nTop 3 Offers:');
          result.topOffers.forEach((offer, idx) => {
            console.log(`  ${idx + 1}. ${offer.store}: €${offer.price} (${offer.rating}★, ${offer.reviews} reviews)`);
          });
          console.log(`\nSavings: €${result.savings.amount.toFixed(2)} (${result.savings.percent}%)`);
        } else {
          console.log('No offers passed filtering rules');
        }
        
        results.push({
          product: product.product,
          basePrice: product.basePrice,
          bestPrice: result.topOffers[0]?.price || null,
          savings: result.savings.amount,
          filtered: result.filteredOffers,
          total: result.totalOffers
        });
        
        console.log('✓ Test passed');
      } else {
        console.log(`✗ Test failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('✗ Test failed:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const avgSavings = results.length > 0 ? totalSavings / results.length : 0;
  const successRate = (results.length / selectedTests.length) * 100;
  
  console.log(`Tests Run: ${selectedTests.length}`);
  console.log(`Tests Passed: ${results.length}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`Total Savings: €${totalSavings.toFixed(2)}`);
  console.log(`Average Savings: €${avgSavings.toFixed(2)}`);
  
  console.log('\nDetailed Results:');
  results.forEach(r => {
    const savingsPercent = r.bestPrice ? ((r.savings / r.basePrice) * 100).toFixed(1) : 0;
    console.log(`- ${r.product}`);
    console.log(`  Base: €${r.basePrice} → Best: €${r.bestPrice || 'N/A'}`);
    console.log(`  Savings: €${r.savings.toFixed(2)} (${savingsPercent}%)`);
    console.log(`  Filtered: ${r.filtered}/${r.total} offers`);
  });
  
  console.log('\n' + '='.repeat(60));
}

runTests().catch(console.error);
