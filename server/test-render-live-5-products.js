// Test 5 produktów na live Render - sprawdź sklepy
const https = require('https');

const RENDER_URL = 'https://dealsense-aplikacja.onrender.com';

const products = [
  'iPhone 15 Pro',
  'Samsung Galaxy S24',
  'Sony WH-1000XM5',
  'MacBook Air M3',
  'Nintendo Switch OLED'
];

function testProduct(productName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ product_name: productName });
    
    const options = {
      hostname: 'dealsense-aplikacja.onrender.com',
      port: 443,
      path: '/api/market',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 TEST 5 PRODUKTÓW NA LIVE RENDER\n');
  console.log('='.repeat(80));
  console.log(`URL: ${RENDER_URL}/api/market\n`);

  for (let i = 0; i < products.length; i++) {
    const productName = products[i];
    console.log(`\n📦 TEST ${i + 1}/5: ${productName}`);
    console.log('-'.repeat(80));

    try {
      const startTime = Date.now();
      const result = await testProduct(productName);
      const duration = Date.now() - startTime;

      if (result.success && result.offers) {
        const shops = result.offers.map(o => o.seller).filter(Boolean);
        const uniqueShops = [...new Set(shops)];
        
        console.log(`✅ Status: SUCCESS`);
        console.log(`⏱️  Czas: ${duration}ms`);
        console.log(`📊 Oferty: ${result.offers.length}`);
        console.log(`🏪 Sklepy (${uniqueShops.length}): ${uniqueShops.join(', ')}`);
        
        if (result.meta) {
          console.log(`📈 Meta:`);
          console.log(`   - Raw count: ${result.meta.rawCount || 0}`);
          console.log(`   - Filtered count: ${result.meta.filteredCount || 0}`);
          console.log(`   - Scam removed: ${result.meta.scamRemoved || 0}`);
        }

        // Pokaż pierwsze 3 oferty
        console.log(`\n🔝 TOP 3 oferty:`);
        result.offers.slice(0, 3).forEach((offer, idx) => {
          console.log(`   ${idx + 1}. ${offer.seller} - €${offer.price} (${offer._source || 'unknown'})`);
        });

      } else {
        console.log(`❌ Status: FAILED`);
        console.log(`⏱️  Czas: ${duration}ms`);
        console.log(`❌ Error: ${result.error || 'No offers returned'}`);
      }

    } catch (error) {
      console.log(`❌ Status: ERROR`);
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TESTY ZAKOŃCZONE\n');
}

runTests().catch(console.error);
