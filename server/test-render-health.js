// Prosty test - sprawdź czy serwer Render w ogóle odpowiada
const https = require('https');

const RENDER_URL = 'dealsense-aplikacja.onrender.com';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: RENDER_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      const postData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testRenderHealth() {
  console.log('🧪 TEST RENDER SERVER HEALTH\n');
  console.log('='.repeat(70));
  console.log(`\n🌐 Server: ${RENDER_URL}\n`);
  console.log('='.repeat(70));
  
  // Test 1: Health check
  console.log('\n1️⃣  Testing /health endpoint...');
  try {
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Body: ${health.body.substring(0, 100)}`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  // Test 2: Root endpoint
  console.log('\n2️⃣  Testing / (root) endpoint...');
  try {
    const root = await testEndpoint('/');
    console.log(`   Status: ${root.status}`);
    console.log(`   Body: ${root.body.substring(0, 100)}`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  // Test 3: /api/status
  console.log('\n3️⃣  Testing /api/status endpoint...');
  try {
    const status = await testEndpoint('/api/status');
    console.log(`   Status: ${status.status}`);
    console.log(`   Body: ${status.body.substring(0, 200)}`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  // Test 4: POST /api/market (prawdziwy test - czy crawler działa)
  console.log('\n4️⃣  Testing POST /api/market endpoint...');
  try {
    const market = await testEndpoint('/api/market', 'POST', {
      product_name: 'iPhone 15',
      ean: null,
      userId: 'test-123'
    });
    console.log(`   Status: ${market.status}`);
    
    if (market.status === 200) {
      console.log('\n   ✅ SUCCESS! Endpoint działa!');
      try {
        const json = JSON.parse(market.body);
        const offers = json.offers || [];
        console.log(`   Offers: ${offers.length}`);
        
        if (offers.length > 0) {
          console.log('\n   📋 Pierwsze 3 oferty:');
          offers.slice(0, 3).forEach((o, i) => {
            console.log(`   ${i+1}. ${o.seller || 'Unknown'} - €${o.price || 0}`);
            console.log(`      Źródło: ${o._source || 'unknown'}`);
          });
          
          const fromCrawler = offers.filter(o => o._source === 'crawler').length;
          const fromMock = offers.filter(o => o._source === 'mock').length;
          const fromRegex = offers.filter(o => o._regexParsed).length;
          
          console.log(`\n   📊 Źródła:`);
          console.log(`      Crawler: ${fromCrawler}`);
          console.log(`      Mock: ${fromMock}`);
          console.log(`      Regex: ${fromRegex}`);
          
          if (fromCrawler > 0) {
            console.log('\n   🎉 CRAWLER DZIAŁA NA SERWERZE!');
          } else if (fromMock > 0) {
            console.log('\n   ⚠️  Serwer używa MOCK data (crawler nie działa)');
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Response is not JSON: ${e.message}`);
        console.log(`   Body: ${market.body.substring(0, 200)}`);
      }
    } else {
      console.log(`\n   ❌ FAILED! Status: ${market.status}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Health check complete\n');
}

testRenderHealth()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
