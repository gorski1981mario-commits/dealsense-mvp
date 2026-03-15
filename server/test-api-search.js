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

async function testAPISearch() {
  console.log('='.repeat(70));
  console.log('GOOGLE SHOPPING API SEARCH TEST');
  console.log('='.repeat(70));
  console.log(`Target: ${RENDER_URL}\n`);
  
  const testQuery = 'Sony WH-1000XM5';
  
  console.log(`Test: Searching for "${testQuery}"`);
  console.log('-'.repeat(70));
  
  try {
    const response = await makeRequest('/api/search', 'POST', {
      query: testQuery,
      basePrice: 399.99
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      const result = response.data;
      
      console.log(`\n✅ API Search SUCCESS`);
      console.log(`Query: ${result.query}`);
      console.log(`Base Price: €${result.basePrice}`);
      console.log(`Total Offers: ${result.totalOffers}`);
      console.log(`Filtered Offers: ${result.filteredOffers}`);
      console.log(`Top Offers: ${result.topOffers.length}`);
      console.log(`From Cache: ${result.fromCache ? 'YES' : 'NO'}`);
      console.log(`API Called: ${result.apiCalled ? 'YES' : 'NO'}`);
      
      if (result.apiCallsRemaining !== undefined) {
        console.log(`API Calls Remaining Today: ${result.apiCallsRemaining}`);
      }
      
      if (result.topOffers.length > 0) {
        console.log(`\nTop 3 Offers:`);
        result.topOffers.forEach((offer, idx) => {
          console.log(`  ${idx + 1}. ${offer.store}: €${offer.price} (${offer.rating}★, ${offer.reviews} reviews)`);
        });
        console.log(`\nSavings: €${result.savings.amount.toFixed(2)} (${result.savings.percent}%)`);
      } else {
        console.log(`\n⚠ No offers passed filtering rules`);
      }
      
      console.log(`\nUsed Dynamic Pricing: ${result.usedDynamicPricing ? 'YES' : 'NO'}`);
      
    } else if (response.status === 503) {
      console.log(`\n❌ Google Shopping API not configured`);
      console.log(`Error: ${response.data.error}`);
      console.log(`Message: ${response.data.message}`);
    } else if (response.status === 429) {
      console.log(`\n⚠ Rate limit exceeded`);
      console.log(`Message: ${response.data.message}`);
      console.log(`Retry after: ${response.data.retryAfter}`);
    } else {
      console.log(`\n❌ Test FAILED`);
      console.log(`Response:`, response.data);
    }
    
  } catch (error) {
    console.log(`\n❌ Test ERROR: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
}

testAPISearch().catch(console.error);
