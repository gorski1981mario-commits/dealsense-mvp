// Test /api/debug-env na Render - sprawdź zmienne środowiskowe
const https = require('https');

const RENDER_URL = 'dealsense-aplikacja.onrender.com';

function testDebugEnv() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: RENDER_URL,
      port: 443,
      path: '/api/debug-env',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
    req.end();
  });
}

async function main() {
  console.log('🧪 TEST RENDER DEBUG ENV\n');
  console.log('='.repeat(70));
  console.log(`\n🌐 Server: ${RENDER_URL}`);
  console.log('📋 Endpoint: GET /api/debug-env\n');
  console.log('='.repeat(70));
  
  try {
    const result = await testDebugEnv();
    
    console.log(`\n✅ Status: ${result.status}\n`);
    
    if (result.status === 200) {
      const env = JSON.parse(result.body);
      
      console.log('📊 ZMIENNE ŚRODOWISKOWE NA RENDER:\n');
      console.log(`USE_OWN_CRAWLER: ${env.USE_OWN_CRAWLER || 'NOT SET'}`);
      console.log(`CRAWLER_MAX_DOMAINS: ${env.CRAWLER_MAX_DOMAINS || 'NOT SET'}`);
      console.log(`USE_PROXY: ${env.USE_PROXY || 'NOT SET'}`);
      console.log(`PROXY_PROVIDER: ${env.PROXY_PROVIDER || 'NOT SET'}`);
      console.log(`PROXY_HOST: ${env.PROXY_HOST || 'NOT SET'}`);
      console.log(`USE_MOCK_FALLBACK: ${env.USE_MOCK_FALLBACK || 'NOT SET'}`);
      console.log(`MARKET_LOG_SILENT: ${env.MARKET_LOG_SILENT || 'NOT SET'}`);
      console.log(`ROTATION_ENABLED: ${env.ROTATION_ENABLED || 'NOT SET'}`);
      console.log(`USE_SMART_TARGETING: ${env.USE_SMART_TARGETING || 'NOT SET'}`);
      console.log(`NODE_ENV: ${env.NODE_ENV || 'NOT SET'}`);
      
      console.log('\n' + '='.repeat(70));
      console.log('\n🔍 DIAGNOZA:\n');
      
      if (!env.USE_OWN_CRAWLER || env.USE_OWN_CRAWLER === 'false') {
        console.log('❌ USE_OWN_CRAWLER nie jest ustawione lub = false');
        console.log('💡 Dodaj USE_OWN_CRAWLER=true w Render dashboard');
      } else {
        console.log('✅ USE_OWN_CRAWLER = true');
      }
      
      if (env.USE_MOCK_FALLBACK === 'true') {
        console.log('❌ USE_MOCK_FALLBACK = true (mock data włączone)');
        console.log('💡 Zmień na false w Render dashboard');
      } else {
        console.log('✅ USE_MOCK_FALLBACK = false');
      }
      
      if (!env.PROXY_HOST || env.PROXY_HOST === 'NOT SET') {
        console.log('❌ PROXY_HOST nie jest ustawiony');
        console.log('💡 Dodaj credentials IPRoyal w Render dashboard');
      } else {
        console.log('✅ PROXY_HOST jest ustawiony');
      }
      
      console.log('\n' + '='.repeat(70));
      
    } else {
      console.log(`❌ Błąd: ${result.status}`);
      console.log(`Body: ${result.body}`);
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

main();
