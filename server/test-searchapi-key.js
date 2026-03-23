/**
 * TEST: SearchAPI.io API Key - Sprawdzenie dostępnych engines
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║         TEST: SearchAPI.io API Key - Dostępne Engines                        ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'BRAK'}\n`);

async function testEngine(engine, params) {
  try {
    console.log(`\n🔍 Testuję engine: ${engine}`);
    console.log(`   Parametry: ${JSON.stringify(params)}`);
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: engine,
        ...params,
        api_key: API_KEY
      },
      timeout: 10000
    });
    
    console.log(`   ✅ SUCCESS - Status: ${response.status}`);
    console.log(`   📊 Response keys: ${Object.keys(response.data).slice(0, 10).join(', ')}`);
    return true;
    
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ ERROR - Status: ${error.response.status}`);
      console.log(`   📝 Message: ${error.response.data?.error || error.message}`);
    } else {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    return false;
  }
}

(async () => {
  console.log('═'.repeat(80));
  console.log('\n🧪 TESTING ENGINES:\n');
  
  // Test 1: Google Shopping (powinien działać)
  await testEngine('google_shopping', {
    q: 'iPhone 15 Pro',
    location: 'Netherlands',
    gl: 'nl',
    hl: 'nl'
  });
  
  // Test 2: Google Flights (401?)
  await testEngine('google_flights', {
    departure_id: 'AMS',
    arrival_id: 'BCN',
    outbound_date: '2026-07-15',
    return_date: '2026-07-29',
    adults: 2,
    currency: 'EUR',
    hl: 'nl',
    gl: 'nl'
  });
  
  // Test 3: Google Hotels (401?)
  await testEngine('google_hotels', {
    q: 'Barcelona',
    check_in_date: '2026-07-15',
    check_out_date: '2026-07-29',
    adults: 2,
    currency: 'EUR',
    gl: 'nl',
    hl: 'nl'
  });
  
  console.log('\n═'.repeat(80));
  console.log('\n📊 PODSUMOWANIE:\n');
  console.log('Jeśli Google Shopping działa (✅) ale Flights/Hotels nie (❌):');
  console.log('→ Klucz API ma dostęp TYLKO do Google Shopping engine');
  console.log('→ Flights/Hotels wymagają upgrade planu SearchAPI.io\n');
  console.log('Jeśli wszystkie działają (✅):');
  console.log('→ Problem jest gdzie indziej w kodzie\n');
  
  console.log('✅ TEST COMPLETE!');
})();
