/**
 * TEST: Sprawdź różne URL formaty Beslist
 */

require('dotenv').config({ path: '.env.test' });
const http = require('http');
const https = require('https');
const axiosLib = require('axios');

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

async function testUrl(url, description) {
  console.log(`\n🔍 ${description}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
      },
      timeout: 10000,
      maxRedirects: 5
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`   Content-Length: ${response.data.length} bytes`);
    
    // Sprawdź czy jest privacy gate
    if (response.data.includes('privacy') || response.data.includes('cookie')) {
      console.log(`   ⚠️  Może mieć privacy gate`);
    }
    
    // Sprawdź czy są produkty
    if (response.data.includes('product') || response.data.includes('price')) {
      console.log(`   ✅ Zawiera produkty/ceny`);
    }
    
    return response.data;
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
    return null;
  }
}

async function test() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                  TEST: Beslist URL Formats                    ═');
  console.log('════════════════════════════════════════════════════════════════');
  
  const urls = [
    {
      url: 'https://www.beslist.nl/products/q/iPhone%2015%20Pro',
      desc: 'Format 1: /products/q/...'
    },
    {
      url: 'https://www.beslist.nl/search/?searchterm=iPhone+15+Pro',
      desc: 'Format 2: /search/?searchterm=...'
    },
    {
      url: 'https://www.beslist.nl/iPhone-15-Pro',
      desc: 'Format 3: Direct slug'
    },
    {
      url: 'https://www.beslist.nl/',
      desc: 'Format 4: Homepage (test connection)'
    }
  ];
  
  for (const { url, desc } of urls) {
    await testUrl(url, desc);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                         ✅ TEST DONE                          ═');
  console.log('════════════════════════════════════════════════════════════════\n');
}

test();
