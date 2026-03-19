// Simple test - just check if we can reach any NL shop
const axios = require('axios');

async function testSimple() {
  const sites = [
    'https://www.coolblue.nl/',
    'https://www.bol.com/nl/',
    'https://www.mediamarkt.nl/'
  ];
  
  for (const url of sites) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      console.log(`✅ ${response.status} - ${response.data.length} bytes`);
      
      if (response.data.includes('Cloudflare') || response.data.includes('challenge')) {
        console.log('⚠️  Cloudflare challenge detected');
      } else if (response.data.includes('Access Denied')) {
        console.log('❌ Access Denied');
      } else {
        console.log('✅ Page loaded successfully');
      }
      
    } catch (err) {
      console.log(`❌ ${err.response?.status || err.code} - ${err.message}`);
    }
  }
}

testSimple();
