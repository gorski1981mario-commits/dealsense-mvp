// Test IPRoyal with axios + tunnel-agent
require('dotenv').config();
const axios = require('axios');
const tunnel = require('tunnel-agent');

async function testProxyAxios() {
  console.log('🧪 TESTING IPROYAL WITH AXIOS\n');
  console.log('='.repeat(70));
  
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password.substring(0, 4)}...`);
  console.log(`Proxy: http://geo.iproyal.com:12321`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP without proxy\n');
  
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      timeout: 10000
    });
    console.log(`✅ Your IP: ${response.data.ip}`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 2: Check IP with proxy\n');
  
  try {
    const agent = tunnel.httpsOverHttp({
      proxy: {
        host: 'geo.iproyal.com',
        port: 12321,
        proxyAuth: `${username}:${password}`
      }
    });
    
    console.log('Connecting through proxy...');
    const response = await axios.get('https://api.ipify.org?format=json', {
      httpsAgent: agent,
      timeout: 30000
    });
    
    console.log(`\n🎉 PROXY DZIAŁA! IP: ${response.data.ip}`);
    console.log('✅ Proxy connection SUCCESS!');
    
    return true;
  } catch (error) {
    console.log(`\n❌ PROXY ERROR: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Connection refused:');
      console.log('   → Proxy server not responding');
      console.log('   → Check if proxy is active in IPRoyal dashboard');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n⚠️  Timeout:');
      console.log('   → Proxy not responding');
      console.log('   → Firewall might be blocking connection');
    } else if (error.response?.status === 407) {
      console.log('\n⚠️  407 Proxy Authentication Required:');
      console.log('   → Check username/password');
    }
    
    return false;
  }
}

testProxyAxios()
  .then((success) => {
    if (success) {
      console.log('\n✅ Proxy test PASSED!');
      console.log('\n💡 NEXT: Integrate with crawler');
    } else {
      console.log('\n❌ Proxy test FAILED');
      console.log('\n🔧 Check IPRoyal dashboard:');
      console.log('   1. Is proxy active/enabled?');
      console.log('   2. Are credentials correct?');
      console.log('   3. Is there traffic/bandwidth left?');
    }
    console.log('\n' + '='.repeat(70));
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test error:', err.message);
    process.exit(1);
  });
