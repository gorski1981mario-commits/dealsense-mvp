/**
 * Test alternatywnych endpointów API
 * Może SearchAPI działa na innej domenie?
 */

const axios = require('axios');

async function testAlternativeEndpoints() {
  console.log('🔍 Testowanie alternatywnych endpointów...');
  
  const apiKey = 'TxZ91oHM53qcbiMvcWpD8vVQ';
  
  const endpoints = [
    'https://api.searchapi.io/api/search',
    'https://searchapi.io/api/search',
    'https://www.searchapi.io/api/search',
    'https://google.serper.dev/search', // alternatywa
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testuję: ${endpoint}`);
      
      const url = endpoint.includes('serper') 
        ? `${endpoint}?q=iphone&apiKey=${apiKey}`
        : `${endpoint}?engine=google_shopping&q=iphone&api_key=${apiKey}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data && (response.data.shopping_results || response.data.organic)) {
        console.log(`✅ SUKCES: ${endpoint}`);
        console.log(`📊 Wyniki: ${response.data.shopping_results?.length || response.data.organic?.length} ofert`);
        return endpoint;
      }
    } catch (error) {
      console.log(`❌ Błąd: ${endpoint} - ${error.message}`);
    }
  }
  
  console.log('\n⚠️ Żaden endpoint nie działa - potrzebujemy nowych API');
  return null;
}

testAlternativeEndpoints().then(workingEndpoint => {
  if (workingEndpoint) {
    console.log(`\n🚀 ZNALEZIONO DZIAŁAJĄCY ENDPOINT: ${workingEndpoint}`);
    console.log('🔥 MOŻEMY PODPIĄĆ PRO + FINANCE TERAZ!');
  } else {
    console.log('\n💡 REKOMENDACJA: Przejdź na Bol.com + TradeTracker API');
    console.log('🕐 CZAS IMPLEMENTACJI: 1 godzina');
    console.log('💰 KOSZT: €0 (vs $49/miesiąc)');
  }
});
