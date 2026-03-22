/**
 * TEST: Bol.com API
 * 
 * Sprawdzamy czy Bol.com ma dostępne API i jak działa
 */

require('dotenv').config({ path: '.env.test' });
const http = require('http');
const https = require('https');
const axiosLib = require('axios');

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

async function testBolAPI() {
  console.log('\n🔍 TEST: Bol.com API\n');
  
  // Bol.com może mieć różne endpointy
  const endpoints = [
    {
      name: 'Bol.com Open API v4',
      url: 'https://api.bol.com/catalog/v4/search',
      params: { q: 'iPhone 15 Pro' }
    },
    {
      name: 'Bol.com Partner API',
      url: 'https://api.bol.com/retailer/offers',
      params: { ean: '0195949038488' }
    },
    {
      name: 'Bol.com Public Search (no auth)',
      url: 'https://www.bol.com/nl/nl/s/',
      params: { searchtext: 'iPhone 15 Pro' }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📦 ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    console.log('─'.repeat(60));
    
    try {
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/html',
          'Accept-Language': 'nl-NL,nl;q=0.9'
        },
        timeout: 8000,
        validateStatus: () => true
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log(`   Content-Length: ${response.data.length || JSON.stringify(response.data).length} bytes`);
      
      // Sprawdź czy wymaga auth
      if (response.status === 401 || response.status === 403) {
        console.log(`   ⚠️  Wymaga autoryzacji (API key)`);
      }
      
      // Sprawdź czy zwraca JSON
      if (response.headers['content-type']?.includes('json')) {
        console.log(`   ✅ Zwraca JSON`);
        
        // Pokaż pierwsze klucze
        if (typeof response.data === 'object') {
          const keys = Object.keys(response.data).slice(0, 10);
          console.log(`   Keys: ${keys.join(', ')}`);
        }
      }
      
      // Sprawdź czy zwraca HTML
      if (response.headers['content-type']?.includes('html')) {
        console.log(`   ℹ️  Zwraca HTML (scraping możliwy)`);
        
        // Sprawdź czy są produkty
        const html = String(response.data);
        if (html.includes('product') || html.includes('price')) {
          console.log(`   ✅ Zawiera produkty/ceny`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                         📊 WNIOSKI                            ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  console.log('Opcje:');
  console.log('1. Bol.com Open API - wymaga API key (darmowe dla affiliates)');
  console.log('2. Bol.com Public Search - scraping HTML (bez API key)');
  console.log('3. Google Shopping - już mamy (zawiera bol.com marketplace)\n');
}

testBolAPI().catch(console.error);
