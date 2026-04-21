/**
 * Test połączenia z API - szybka weryfikacja
 * Czas: 5 sekund ⚡
 */

const axios = require('axios');

async function testAPIConnection() {
  console.log('🔍 Testowanie połączenia z API...');
  
  const apiKey = 'TxZ91oHM53qcbiMvcWpD8vVQ';
  const url = `https://api.searchapi.io/api/search?engine=google_shopping&q=iphone&api_key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    
    if (response.data && response.data.shopping_results) {
      console.log('✅ API DZIAŁA!');
      console.log(`📊 Znaleziono ${response.data.shopping_results.length} ofert`);
      console.log('🎯 Google Shopping API jest PODŁĄCZONE!');
      
      // Przykładowa oferta
      if (response.data.shopping_results.length > 0) {
        const offer = response.data.shopping_results[0];
        console.log('💡 Przykładowa oferta:');
        console.log(`   - Tytuł: ${offer.title}`);
        console.log(`   - Cena: ${offer.price}`);
        console.log(`   - Sklep: ${offer.source}`);
      }
      
      return true;
    } else {
      console.log('❌ API zwróciło puste wyniki');
      return false;
    }
  } catch (error) {
    console.log('❌ Błąd połączenia z API:', error.message);
    return false;
  }
}

// Uruchom test
testAPIConnection().then(success => {
  if (success) {
    console.log('\n🚀 MOŻEMY PODPIĄĆ PRO + FINANCE!');
    console.log('🔥 CZAS REAKTYWACJI KONFIGURATORÓW: 30 minut!');
  } else {
    console.log('\n⚠️ PROBLEM Z API - potrzebujemy nowych kluczy');
  }
});
