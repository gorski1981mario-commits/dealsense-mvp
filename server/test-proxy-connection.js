// Test IPRoyal proxy connection
require('dotenv').config();
const axios = require('axios');
const tunnel = require('tunnel-agent');

async function testProxyConnection() {
  console.log('🧪 TESTING IPROYAL PROXY CONNECTION\n');
  console.log('=' .repeat(70));
  
  // Proxy config from .env
  const country = process.env.PROXY_COUNTRY || 'nl';
  const proxyConfig = {
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
    username: `${process.env.PROXY_USERNAME}_country-${country}`,
    password: process.env.PROXY_PASSWORD,
    country: country
  };
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Host: ${proxyConfig.host}`);
  console.log(`Port: ${proxyConfig.port}`);
  console.log(`Username: ${proxyConfig.username.substring(0, 4)}...`);
  console.log(`Password: ${proxyConfig.password.substring(0, 4)}...`);
  console.log(`Country: ${proxyConfig.country}`);
  
  // Build tunneling agent for HTTPS proxy
  const tunnelingAgent = tunnel.httpsOverHttp({
    proxy: {
      host: proxyConfig.host,
      port: parseInt(proxyConfig.port),
      proxyAuth: `${proxyConfig.username}:${proxyConfig.password}`
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP (without proxy)\n');
  
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      timeout: 10000
    });
    console.log(`✅ Your IP: ${response.data.ip}`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 2: Check IP (with proxy)\n');
  
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      httpsAgent: tunnelingAgent,
      timeout: 10000
    });
    console.log(`✅ Proxy IP: ${response.data.ip}`);
    console.log('✅ Proxy connection working!');
  } catch (error) {
    console.log(`❌ Proxy failed: ${error.message}`);
    console.log('\n⚠️  Check your credentials in .env file');
    return false;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 3: MediaMarkt.nl (with proxy)\n');
  
  try {
    const response = await axios.get('https://www.mediamarkt.nl/', {
      httpsAgent: tunnelingAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Content length: ${response.data.length} bytes`);
    
    if (response.status === 200) {
      console.log('✅ MediaMarkt accessible with proxy!');
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      if (error.response.status === 403) {
        console.log('⚠️  403 Forbidden - proxy might be blocked');
      }
    } else {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 4: Bol.com (with proxy)\n');
  
  try {
    const response = await axios.get('https://www.bol.com/', {
      httpsAgent: tunnelingAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Content length: ${response.data.length} bytes`);
    
    if (response.status === 200) {
      console.log('✅ Bol.com accessible with proxy!');
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
    } else {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('✅ Proxy credentials configured');
  console.log('✅ Connection test complete');
  console.log('\n💡 NEXT STEPS:');
  console.log('   1. If all tests passed → Test real product scraping');
  console.log('   2. If MediaMarkt/Bol failed → Try with Playwright (more stealth)');
  console.log('   3. Run: node test-real-scraping.js');
  console.log('\n' + '='.repeat(70));
  
  return true;
}

testProxyConnection()
  .then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });
