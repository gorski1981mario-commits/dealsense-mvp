/**
 * Simple test - just search for vacation packages
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const axios = require("axios");

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function testSimpleVacation() {
  console.log('🧪 SIMPLE VACATION SEARCH TEST\n');
  
  const queries = [
    'vakantie Turkije all inclusive',
    'TUI Turkije',
    'Corendon Turkije',
    'Sunweb Spanje',
    'vakantie Spanje all inclusive',
    'all inclusive vakantie'
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 Query: "${query}"`);
    
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        num: 10,
        api_key: API_KEY
      };
      
      const response = await axios.get('https://www.searchapi.io/api/v1/search', {
        params,
        timeout: 30000
      });
      
      const results = response.data.shopping_results || [];
      
      console.log(`   Results: ${results.length}`);
      
      if (results.length > 0) {
        results.slice(0, 3).forEach((item, i) => {
          console.log(`   ${i + 1}. ${item.title}`);
          console.log(`      Price: €${item.extracted_price || 'N/A'}`);
          console.log(`      Seller: ${item.source}`);
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

testSimpleVacation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
