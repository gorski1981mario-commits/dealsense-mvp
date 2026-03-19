// Wywołaj /api/market żeby wygenerować logi na Render
const https = require('https');

const RENDER_URL = 'dealsense-aplikacja.onrender.com';

function callMarketApi() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      product_name: 'iPhone 15',
      ean: null,
      userId: 'test-logs-123',
      userLocation: 'Amsterdam',
      geoEnabled: true
    });

    const options = {
      hostname: RENDER_URL,
      port: 443,
      path: '/api/market',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🧪 WYWOŁUJĘ /api/market NA RENDER\n');
  console.log('='.repeat(70));
  console.log('\n📋 To wygeneruje logi na Render');
  console.log('💡 Otwórz Render Dashboard → Logs i sprawdź co się dzieje\n');
  console.log('='.repeat(70));
  
  console.log('\n🚀 Wysyłam request...\n');
  
  try {
    const startTime = Date.now();
    const result = await callMarketApi();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Czas: ${duration}ms\n`);
    
    if (result.status === 200) {
      const json = JSON.parse(result.body);
      console.log(`📊 Oferty: ${json.offers ? json.offers.length : 0}\n`);
      
      if (json.offers && json.offers.length > 0) {
        console.log('Pierwsze 3:');
        json.offers.slice(0, 3).forEach((o, i) => {
          console.log(`${i+1}. ${o.seller} - €${o.price} (${o._source})`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 TERAZ SPRAWDŹ LOGI W RENDER DASHBOARD!');
    console.log('   Szukaj:');
    console.log('   - "[Crawler Search]"');
    console.log('   - "[Direct Scraper]"');
    console.log('   - "Error" lub "failed"');
    console.log('   - "proxy" lub "timeout"\n');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

main();
