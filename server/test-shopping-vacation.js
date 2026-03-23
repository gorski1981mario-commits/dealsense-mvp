const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");

/**
 * TEST: CZY GOOGLE SHOPPING API ZWRACA PAKIETY WAKACYJNE Z CENAMI?
 * 
 * Testujemy różne queries:
 * 1. "Turkije vakantie pakket all inclusive"
 * 2. "Antalya hotel 7 dagen all inclusive"
 * 3. "Turkije reis 2 personen all inclusive"
 */

async function testShoppingVacation() {
  const apiKey = process.env.GOOGLE_SHOPPING_API_KEY || 'TxZ91oHM53qcbiMvcWpD8vVQ';
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          TEST: GOOGLE SHOPPING API - PAKIETY WAKACYJNE                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const queries = [
    'Turkije vakantie pakket all inclusive',
    'Antalya hotel 7 dagen all inclusive',
    'Turkije reis 2 personen all inclusive',
    'vakantie Turkije all inclusive 7 dagen',
    'Antalya all inclusive vakantie'
  ];
  
  for (const query of queries) {
    console.log('═'.repeat(80));
    console.log(`QUERY: "${query}"`);
    console.log('═'.repeat(80));
    console.log('');
    
    const params = {
      engine: 'google_shopping',
      q: query,
      gl: 'nl',
      hl: 'nl',
      num: 20,
      api_key: apiKey
    };
    
    try {
      const response = await axios.get('https://www.searchapi.io/api/v1/search', {
        params,
        timeout: 30000
      });
      
      const results = response.data.shopping_results || [];
      
      if (results.length === 0) {
        console.log('❌ NO RESULTS');
        console.log('');
        continue;
      }
      
      console.log(`✅ FOUND ${results.length} RESULTS`);
      console.log('');
      
      // Show first 5 results
      results.slice(0, 5).forEach((item, i) => {
        console.log(`${i + 1}. ${item.title || 'N/A'}`);
        console.log('   Price:', item.price || item.extracted_price || 'N/A');
        console.log('   Source:', item.source || 'N/A');
        console.log('   Link:', item.link || 'N/A');
        
        // Check if it's a vacation package
        const title = (item.title || '').toLowerCase();
        const isVacation = title.includes('vakantie') || 
                          title.includes('reis') || 
                          title.includes('all inclusive') ||
                          title.includes('hotel') ||
                          title.includes('vlucht');
        
        if (isVacation) {
          console.log('   ✅ LOOKS LIKE VACATION PACKAGE!');
        }
        
        console.log('');
      });
      
      // Statistics
      const withPrices = results.filter(r => r.price || r.extracted_price);
      const vacationPackages = results.filter(r => {
        const title = (r.title || '').toLowerCase();
        return title.includes('vakantie') || 
               title.includes('reis') || 
               title.includes('all inclusive');
      });
      
      console.log('📊 STATISTICS:');
      console.log('   Total results:', results.length);
      console.log('   With prices:', withPrices.length);
      console.log('   Vacation packages:', vacationPackages.length);
      console.log('');
      
      // Show full first result
      if (results[0]) {
        console.log('🔍 FULL FIRST RESULT:');
        console.log(JSON.stringify(results[0], null, 2));
        console.log('');
      }
      
      // Wait a bit before next query
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      console.log('');
    }
  }
  
  console.log('═'.repeat(80));
  console.log('✅ ALL TESTS COMPLETED!');
  console.log('═'.repeat(80));
}

testShoppingVacation().catch(console.error);
