// DEBUG - dokładnie sprawdzam jakie parametry są wysyłane do SearchAPI
require('dotenv').config();

const axios = require('axios');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function testSearchAPIDirectly() {
  console.log('🔍 DEBUG - BEZPOŚREDNIE WYWOŁANIE SearchAPI\n');
  console.log('='.repeat(70));
  console.log('\n📋 Parametry:');
  console.log(`   API Key: ${SEARCHAPI_KEY ? 'SET (***' + SEARCHAPI_KEY.slice(-4) + ')' : 'NOT SET'}`);
  console.log(`   Engine: google_shopping`);
  console.log(`   Query: iPhone 15`);
  console.log(`   Location: Netherlands`);
  console.log(`   gl: nl`);
  console.log(`   hl: nl`);
  
  console.log('\n='.repeat(70));
  console.log('\n🧪 TEST 1: num=100, page=1 (default)\n');
  
  try {
    const response1 = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: SEARCHAPI_KEY,
        engine: 'google_shopping',
        q: 'iPhone 15',
        gl: 'nl',
        hl: 'nl',
        location: 'Netherlands',
        num: 100,
        page: 1
      }
    });
    
    const data1 = response1.data;
    const results1 = data1.shopping_results || [];
    const ads1 = data1.shopping_ads || [];
    const total1 = results1.length + ads1.length;
    
    console.log(`   ✅ Status: ${response1.status}`);
    console.log(`   📊 shopping_results: ${results1.length}`);
    console.log(`   📊 shopping_ads: ${ads1.length}`);
    console.log(`   📊 TOTAL: ${total1}`);
    
    if (results1.length > 0) {
      console.log(`\n   🏪 Pierwsze 5 sklepów:`);
      results1.slice(0, 5).forEach((r, i) => {
        console.log(`      ${i+1}. ${r.seller || r.source || 'Unknown'} - €${r.price || r.extracted_price || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Błąd: ${error.message}`);
  }
  
  console.log('\n='.repeat(70));
  console.log('\n🧪 TEST 2: num=100, page=2\n');
  
  try {
    const response2 = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: SEARCHAPI_KEY,
        engine: 'google_shopping',
        q: 'iPhone 15',
        gl: 'nl',
        hl: 'nl',
        location: 'Netherlands',
        num: 100,
        page: 2
      }
    });
    
    const data2 = response2.data;
    const results2 = data2.shopping_results || [];
    const ads2 = data2.shopping_ads || [];
    const total2 = results2.length + ads2.length;
    
    console.log(`   ✅ Status: ${response2.status}`);
    console.log(`   📊 shopping_results: ${results2.length}`);
    console.log(`   📊 shopping_ads: ${ads2.length}`);
    console.log(`   📊 TOTAL: ${total2}`);
    
  } catch (error) {
    console.log(`   ❌ Błąd: ${error.message}`);
  }
  
  console.log('\n='.repeat(70));
  console.log('\n🧪 TEST 3: Bez num parametru (default)\n');
  
  try {
    const response3 = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: SEARCHAPI_KEY,
        engine: 'google_shopping',
        q: 'iPhone 15',
        gl: 'nl',
        hl: 'nl',
        location: 'Netherlands'
      }
    });
    
    const data3 = response3.data;
    const results3 = data3.shopping_results || [];
    const ads3 = data3.shopping_ads || [];
    const total3 = results3.length + ads3.length;
    
    console.log(`   ✅ Status: ${response3.status}`);
    console.log(`   📊 shopping_results: ${results3.length}`);
    console.log(`   📊 shopping_ads: ${ads3.length}`);
    console.log(`   📊 TOTAL: ${total3}`);
    
  } catch (error) {
    console.log(`   ❌ Błąd: ${error.message}`);
  }
  
  console.log('\n='.repeat(70));
  console.log('\n💡 WNIOSKI:\n');
  console.log('Jeśli wszystkie testy zwracają ~8-10 wyników:');
  console.log('  → To ograniczenie Google Shopping dla NL market');
  console.log('  → Parametr num nie zwiększa wyników (Google zwraca ile ma)');
  console.log('  → pages=2 może dać kolejne 8-10 (total ~16-20)');
  console.log('\nJeśli TEST 1 zwraca 40-80 wyników:');
  console.log('  → Problem jest w kodzie market-api.js');
  console.log('  → Parametry nie są przekazywane poprawnie');
  console.log('\n' + '='.repeat(70));
}

testSearchAPIDirectly()
  .then(() => {
    console.log('\n✅ Debug zakończony\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
