/**
 * TEST: Sprawdź HTML Tweakers
 */

require('dotenv').config({ path: '.env.test' });
const http = require('http');
const https = require('https');
const axiosLib = require('axios');
const fs = require('fs');

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

async function test() {
  console.log('\n🔍 Pobieranie HTML z Tweakers...\n');
  
  const url = 'https://tweakers.net/pricewatch/search/';
  
  try {
    const response = await axios.get(url, {
      params: {
        keyword: 'iPhone 15 Pro'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
      },
      timeout: 10000
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Content-Length: ${response.data.length} bytes\n`);
    
    // Zapisz HTML do pliku
    fs.writeFileSync('./tweakers-response.html', response.data);
    console.log('✅ HTML zapisany do: tweakers-response.html\n');
    
    // Pokaż pierwsze 2000 znaków
    console.log('═'.repeat(60));
    console.log('PIERWSZE 2000 ZNAKÓW:');
    console.log('═'.repeat(60));
    console.log(response.data.substring(0, 2000));
    console.log('...\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

test();
