/**
 * Test nowych providerów - Bol.com + TradeTracker
 * Czas: 5 minut ⚡
 */

const BolComAPI = require('./market/providers/bolcom');
const TradeTrackerAPI = require('./market/providers/tradetracker');

const bolComAPI = new BolComAPI();
const tradeTrackerAPI = new TradeTrackerAPI();

async function testNewProviders() {
  console.log('🔍 Testowanie nowych providerów...\n');
  
  // Test Bol.com
  console.log('1️⃣ Test Bol.com API:');
  console.log('   Konfiguracja:', bolComAPI.isConfigured() ? '✅' : '❌');
  
  if (bolComAPI.isConfigured()) {
    try {
      const bolOffers = await bolComAPI.searchProducts('iphone 15', { limit: 5 });
      console.log(`   Znaleziono: ${bolOffers.length} ofert`);
      if (bolOffers.length > 0) {
        console.log('   Przykład:', bolOffers[0].title, '-', bolOffers[0].price, 'EUR');
      }
    } catch (error) {
      console.log('   Błąd:', error.message);
    }
  } else {
    console.log('   ⚠️ Skonfiguruj BOL_COM_PARTNER_ID i BOL_COM_API_KEY');
  }
  
  console.log('\n2️⃣ Test TradeTracker API:');
  console.log('   Konfiguracja:', tradeTrackerAPI.isConfigured() ? '✅' : '❌');
  
  if (tradeTrackerAPI.isConfigured()) {
    try {
      const ttOffers = await tradeTrackerAPI.searchProducts('iphone 15', { limit: 5 });
      console.log(`   Znaleziono: ${ttOffers.length} ofert`);
      if (ttOffers.length > 0) {
        console.log('   Przykład:', ttOffers[0].title, '-', ttOffers[0].price, 'EUR');
      }
    } catch (error) {
      console.log('   Błąd:', error.message);
    }
  } else {
    console.log('   ⚠️ Skonfiguruj TRADETRACKER_CUSTOMER_ID, TRADETRACKER_PASSPHRASE, TRADETRACKER_AFFILIATE_SITE_ID');
  }
  
  console.log('\n🎯 REKOMENDACJA:');
  
  if (bolComAPI.isConfigured() || tradeTrackerAPI.isConfigured()) {
    console.log('✅ NOWE PROVIDERS GOTOWE!');
    console.log('🚀 Można podpiąć PRO + FINANCE konfiguratory');
    console.log('💰 Koszt: €0 (vs $49/miesiąc SearchAPI)');
  } else {
    console.log('⚠️ Potrzebujesz skonfigurować nowe API');
    console.log('📋 KROKI:');
    console.log('   1. Zarejestruj się na https://partner.bol.com/');
    console.log('   2. Zarejestruj się na https://tradetracker.nl/');
    console.log('   3. Dodaj klucze do .env');
    console.log('   4. Uruchom ponownie test');
  }
}

// Uruchom test
testNewProviders();
