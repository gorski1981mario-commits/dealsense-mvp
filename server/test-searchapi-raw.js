/**
 * DEBUG SEARCHAPI - RAW RESPONSE
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function debugSearch() {
  try {
    console.log('\n🔍 DEBUG SEARCHAPI - RAW RESPONSE\n');
    console.log(`API Key: ${SEARCHAPI_KEY ? SEARCHAPI_KEY.substring(0, 10) + '...' : 'MISSING'}\n`);
    
    const product = 'iPhone 15';
    console.log(`Testing: ${product}\n`);
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google_shopping',
        q: product,
        api_key: SEARCHAPI_KEY,
        gl: 'nl',
        hl: 'nl',
        num: 10
      },
      timeout: 10000
    });

    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('\nFull Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Save to file
    fs.writeFileSync('searchapi-debug-response.json', JSON.stringify(response.data, null, 2));
    console.log('\nSaved to searchapi-debug-response.json');
    
    // Check structure
    console.log('\n='.repeat(80));
    console.log('STRUCTURE ANALYSIS:');
    console.log('='.repeat(80));
    console.log(`Has shopping_results: ${!!response.data.shopping_results}`);
    console.log(`Shopping results count: ${response.data.shopping_results?.length || 0}`);
    
    if (response.data.shopping_results && response.data.shopping_results.length > 0) {
      console.log('\nFirst result:');
      console.log(JSON.stringify(response.data.shopping_results[0], null, 2));
    }
    
    if (response.data.error) {
      console.log('\n❌ API ERROR:');
      console.log(response.data.error);
    }
    
  } catch (error) {
    console.error('\n❌ REQUEST ERROR:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugSearch().catch(console.error);
