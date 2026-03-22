/**
 * TEST: Google Shopping RAW Response
 * 
 * Cel: Sprawdzić co dokładnie zwraca API
 */

require('dotenv').config({ path: '.env.test' });
const http = require('http');
const https = require('https');
const axiosLib = require('axios');

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function testRawResponse() {
  const query = 'Samsung Galaxy S24';
  
  console.log('\n🔍 Testing Google Shopping API...');
  console.log(`Query: ${query}\n`);
  
  try {
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: SEARCHAPI_KEY,
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        location: 'Netherlands',
        num: 10,
        page: 1
      },
      timeout: 8000,
      validateStatus: () => true
    });
    
    const data = response.data;
    
    console.log('═'.repeat(60));
    console.log('RAW RESPONSE:');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n' + '═'.repeat(60));
    console.log('SHOPPING RESULTS:');
    console.log('═'.repeat(60));
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      console.log(`\nZnaleziono: ${data.shopping_results.length} ofert\n`);
      
      data.shopping_results.slice(0, 5).forEach((item, idx) => {
        console.log(`\n${idx + 1}. OFERTA:`);
        console.log(`   title: ${item.title || 'BRAK'}`);
        console.log(`   source: ${item.source || 'BRAK'}`);
        console.log(`   price: ${item.price || 'BRAK'}`);
        console.log(`   extracted_price: ${item.extracted_price || 'BRAK'}`);
        console.log(`   link: ${item.link || 'BRAK'}`);
        console.log(`   rating: ${item.rating || 'BRAK'}`);
        console.log(`   reviews: ${item.reviews || 'BRAK'}`);
      });
    } else {
      console.log('\n❌ Brak shopping_results w response!');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

testRawResponse();
