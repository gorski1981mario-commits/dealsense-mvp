const https = require('https');
const fs = require('fs');

const RENDER_URL = 'https://dealsense-aplikacja.onrender.com';

function makeRequest(path, method = 'GET', data = null) {
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

async function runTests() {
  console.log('='.repeat(70));
  console.log('DEALSENSE PRICING ENGINE - PRODUCTION TEST SUITE');
  console.log('='.repeat(70));
  console.log(`Target: ${RENDER_URL}\n`);
  
  const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
  const selectedTests = testData.testProducts.slice(0, 5);
  
  console.log('TEST 1: Health Check');
  console.log('-'.repeat(70));
  try {
    const health = await makeRequest('/health');
    console.log(`Status: ${health.status}`);
    if (health.status === 200) {
      console.log('Environment:', health.data.env);
      console.log('Config:', JSON.stringify(health.data.config, null, 2));
      console.log('✓ Health check PASSED\n');
    } else {
      console.log('✗ Health check FAILED:', health.data, '\n');
    }
  } catch (error) {
    console.log('✗ Health check ERROR:', error.message, '\n');
  }
  
  console.log('TESTS 2-6: Price Comparison (5 products)');
  console.log('-'.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < selectedTests.length; i++) {
    const product = selectedTests[i];
    console.log(`\nTest ${i + 2}: ${product.product}`);
    console.log(`Base Price: €${product.basePrice}`);
    console.log(`Total Offers: ${product.offers.length}`);
    
    try {
      const response = await makeRequest('/api/compare', 'POST', product);
      
      if (response.status === 200) {
        const result = response.data;
        console.log(`Filtered Offers: ${result.filteredOffers}/${result.totalOffers}`);
        console.log(`Top Offers: ${result.topOffers.length}`);
        
        if (result.topOffers.length > 0) {
          console.log('\nTop 3 Offers:');
          result.topOffers.forEach((offer, idx) => {
            console.log(`  ${idx + 1}. ${offer.store}: €${offer.price} (${offer.rating}★, ${offer.reviews} reviews)`);
          });
          console.log(`\nSavings: €${result.savings.amount.toFixed(2)} (${result.savings.percent}%)`);
        } else {
          console.log('⚠ No offers passed filtering rules');
        }
        
        results.push({
          product: product.product,
          basePrice: product.basePrice,
          bestPrice: result.topOffers[0]?.price || null,
          savings: result.savings.amount,
          filtered: result.filteredOffers,
          total: result.totalOffers
        });
        
        console.log('✓ Test PASSED');
      } else {
        console.log(`✗ Test FAILED: HTTP ${response.status}`);
        console.log('Response:', response.data);
      }
    } catch (error) {
      console.log('✗ Test ERROR:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const avgSavings = results.length > 0 ? totalSavings / results.length : 0;
  const successRate = (results.length / selectedTests.length) * 100;
  
  console.log(`Tests Run: ${selectedTests.length}`);
  console.log(`Tests Passed: ${results.length}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`Total Savings: €${totalSavings.toFixed(2)}`);
  console.log(`Average Savings: €${avgSavings.toFixed(2)}`);
  
  if (results.length > 0) {
    console.log('\nDetailed Results:');
    results.forEach(r => {
      const savingsPercent = r.bestPrice ? ((r.savings / r.basePrice) * 100).toFixed(1) : 0;
      console.log(`\n- ${r.product}`);
      console.log(`  Base: €${r.basePrice} → Best: €${r.bestPrice || 'N/A'}`);
      console.log(`  Savings: €${r.savings.toFixed(2)} (${savingsPercent}%)`);
      console.log(`  Filtered: ${r.filtered}/${r.total} offers`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (successRate === 100) {
    console.log('✓ ALL TESTS PASSED - Production deployment successful!');
  } else if (successRate >= 80) {
    console.log('⚠ MOST TESTS PASSED - Check failed tests above');
  } else {
    console.log('✗ TESTS FAILED - Review errors above');
  }
  console.log('='.repeat(70));
}

runTests().catch(console.error);
