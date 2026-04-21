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

async function debugGoPro() {
  console.log('DEBUG: GoPro Hero 12 Black - dlaczego 0 ofert?');
  console.log('='.repeat(70));
  
  const response = await makeRequest('/api/search', 'POST', {
    query: 'GoPro Hero 12 Black',
    basePrice: 449
  });
  
  if (response.status === 200) {
    const result = response.data;
    
    console.log(`\nTotal Offers: ${result.totalOffers}`);
    console.log(`Filtered Offers: ${result.filteredOffers}`);
    console.log(`Eliminated: ${result.totalOffers - result.filteredOffers}`);
    
    console.log('\n⚠️ PROBLEM: Wszystkie oferty odrzucone przez filtry');
    console.log('\nPrawdopodobne przyczyny:');
    console.log('1. Za mało ofert w Google Shopping (tylko 8-9)');
    console.log('2. Wszystkie oferty mają rating < 3.8 lub reviews < 15');
    console.log('3. Wszystkie oferty mają rating > 4.8 (PRICING_V2_MAX_RAT)');
    console.log('4. Ceny są poza zakresem PRICING_NICHE_EXCL (< 30% base price)');
    
    console.log('\n💡 ROZWIĄZANIE:');
    console.log('Musimy JESZCZE BARDZIEJ obniżyć filtry:');
    console.log('- PRICING_V2_MIN_RAT: 3.8 → 3.5');
    console.log('- PRICING_V2_MIN_REV: 15 → 5');
    console.log('- PRICING_NICHE_MIN_RATING: 3.8 → 3.5');
    console.log('- PRICING_NICHE_MIN_REVIEWS: 15 → 5');
    
  } else {
    console.log(`Error: ${response.status}`);
  }
}

debugGoPro().catch(console.error);
