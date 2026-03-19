// Test IPRoyal with got library (better proxy support)
require('dotenv').config();
const got = require('got');

async function testProxyGot() {
  console.log('🧪 TESTING IPROYAL WITH GOT LIBRARY\n');
  console.log('='.repeat(70));
  
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  
  const proxyUrl = `http://${username}:${password}@geo.iproyal.com:12321`;
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password.substring(0, 20)}...${password.substring(password.length - 15)}`);
  console.log(`Proxy: http://geo.iproyal.com:12321`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP without proxy\n');
  
  try {
    const response = await got('https://api.ipify.org?format=json').json();
    console.log(`✅ Your IP: ${response.ip}`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 2: Check IP with proxy\n');
  
  try {
    console.log('Connecting through proxy...');
    const response = await got('https://api.ipify.org?format=json', {
      proxy: proxyUrl,
      timeout: {
        request: 30000
      }
    }).json();
    
    console.log(`\n🎉 PROXY DZIAŁA! IP: ${response.ip}`);
    console.log('✅ Proxy connection SUCCESS!');
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 3: MediaMarkt.nl\n');
    
    try {
      const mmResponse = await got('https://www.mediamarkt.nl/', {
        proxy: proxyUrl,
        timeout: { request: 30000 }
      });
      console.log(`✅ Status: ${mmResponse.statusCode}`);
      console.log(`✅ Content length: ${mmResponse.body.length} bytes`);
      console.log('✅ MediaMarkt accessible!');
    } catch (error) {
      console.log(`❌ MediaMarkt failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 4: Bol.com\n');
    
    try {
      const bolResponse = await got('https://www.bol.com/', {
        proxy: proxyUrl,
        timeout: { request: 30000 }
      });
      console.log(`✅ Status: ${bolResponse.statusCode}`);
      console.log(`✅ Content length: ${bolResponse.body.length} bytes`);
      console.log('✅ Bol.com accessible!');
    } catch (error) {
      console.log(`❌ Bol.com failed: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.log(`\n❌ PROXY ERROR: ${error.message}`);
    return false;
  }
}

testProxyGot()
  .then((success) => {
    if (success) {
      console.log('\n' + '='.repeat(70));
      console.log('\n📊 SUMMARY\n');
      console.log('✅ IPRoyal proxy working with got library!');
      console.log('✅ Ready for crawler integration!');
      console.log('\n💡 NEXT: Integrate proxy with crawler/proxy-manager.js');
      console.log('='.repeat(70));
    } else {
      console.log('\n❌ Proxy test FAILED');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
