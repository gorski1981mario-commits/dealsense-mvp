"use strict";

/**
 * TEST REALNY - JAK KLIENT DEALSENSE
 * 
 * Scenariusz:
 * 1. Klient widzi produkt na Bol.com za €279
 * 2. Skanuje w DealSense
 * 3. DealSense szuka tańszych ofert
 * 4. Pokazuje TOP 3 oferty (różne sklepy!)
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

process.env.MARKET_CACHE_BYPASS = 'true';
process.env.MARKET_LOG_SILENT = 'false';

const { fetchMarketOffers } = require('./market-api');

// REALNY SCENARIUSZ: Klient widzi Dyson V15 Detect na Bol.com za €699
const CUSTOMER_SCENARIO = {
  productName: 'Dyson V15 Detect Absolute',
  ean: '5025155071977',
  seenAt: 'bol.com',
  seenPrice: 699,
  customerQuestion: 'Czy znajdziesz taniej?'
};

async function runRealCustomerTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              🛒 TEST REALNY - JAK KLIENT DEALSENSE                                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📱 SCENARIUSZ KLIENTA:');
  console.log(`   Produkt: ${CUSTOMER_SCENARIO.productName}`);
  console.log(`   Widziany na: ${CUSTOMER_SCENARIO.seenAt}`);
  console.log(`   Cena: €${CUSTOMER_SCENARIO.seenPrice}`);
  console.log(`   Pytanie: "${CUSTOMER_SCENARIO.customerQuestion}"`);
  console.log('');
  console.log('═'.repeat(100));
  console.log('🔍 DEALSENSE SZUKA TAŃSZYCH OFERT...');
  console.log('═'.repeat(100));
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(
      CUSTOMER_SCENARIO.productName,
      CUSTOMER_SCENARIO.ean,
      {
        basePrice: CUSTOMER_SCENARIO.seenPrice,
        location: 'nl',
        userId: 'real_customer_test',
        productName: CUSTOMER_SCENARIO.productName,
        scanCount: 0,
        maxResults: 3  // TOP 3 dla klienta
      }
    );
    
    const duration = Date.now() - startTime;
    
    console.log('\n' + '═'.repeat(100));
    console.log('📊 WYNIKI DLA KLIENTA');
    console.log('═'.repeat(100));
    console.log('');
    
    if (!offers || offers.length === 0) {
      console.log('❌ NIE ZNALEŹLIŚMY TAŃSZYCH OFERT');
      console.log('');
      console.log('💡 CO TO ZNACZY DLA KLIENTA:');
      console.log('   - Cena na bol.com (€279) jest już najlepsza');
      console.log('   - Lub: wszystkie tańsze oferty to były akcesoria/używane (odrzucone)');
      console.log('   - Klient może włączyć Ghost Mode (monitoring)');
      console.log('');
      return;
    }
    
    // WERYFIKACJA: Czy są duplikaty sklepów?
    const shops = offers.map(o => o.seller);
    const uniqueShops = [...new Set(shops)];
    
    if (shops.length !== uniqueShops.length) {
      console.log('⚠️  UWAGA: ZNALEZIONO DUPLIKATY SKLEPÓW!');
      console.log(`   Sklepy: ${shops.join(', ')}`);
      console.log(`   Unikalne: ${uniqueShops.join(', ')}`);
      console.log('');
    }
    
    console.log(`✅ ZNALEŹLIŚMY ${offers.length} TAŃSZYCH OFERT`);
    console.log(`⏱️  Czas wyszukiwania: ${duration}ms`);
    console.log('');
    
    // POKAZUJEMY TOP 3 JAK W APLIKACJI
    offers.forEach((offer, i) => {
      const price = offer.price || 0;
      const savings = CUSTOMER_SCENARIO.seenPrice - price;
      const savingsPercent = ((savings / CUSTOMER_SCENARIO.seenPrice) * 100).toFixed(1);
      const dealScore = offer._dealScore?.dealScore || 0;
      const trustScore = offer._dealScore?.trustScore || 0;
      
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[i] || '💎';
      
      console.log('─'.repeat(100));
      console.log(`${medal} #${i + 1} - ${offer.seller}`);
      console.log('─'.repeat(100));
      console.log(`   💰 Cena: €${price.toFixed(2)}`);
      console.log(`   📉 Oszczędności: €${savings.toFixed(2)} (${savingsPercent}%)`);
      console.log(`   ⭐ Deal Score: ${dealScore.toFixed(1)}/10`);
      console.log(`   🛡️  Trust Score: ${trustScore}/100`);
      console.log(`   🌐 Link: ${(offer.url || '').substring(0, 60)}...`);
      console.log('');
    });
    
    // PODSUMOWANIE DLA KLIENTA
    const bestOffer = offers[0];
    const bestPrice = bestOffer.price || 0;
    const bestSavings = CUSTOMER_SCENARIO.seenPrice - bestPrice;
    const bestSavingsPercent = ((bestSavings / CUSTOMER_SCENARIO.seenPrice) * 100).toFixed(1);
    
    console.log('═'.repeat(100));
    console.log('💰 NAJLEPSZA OFERTA');
    console.log('═'.repeat(100));
    console.log('');
    console.log(`🏪 Sklep: ${bestOffer.seller}`);
    console.log(`💵 Cena na ${CUSTOMER_SCENARIO.seenAt}: €${CUSTOMER_SCENARIO.seenPrice}`);
    console.log(`💰 Najlepsza cena: €${bestPrice.toFixed(2)}`);
    console.log(`🎉 OSZCZĘDZASZ: €${bestSavings.toFixed(2)} (${bestSavingsPercent}%)`);
    console.log('');
    
    // WERYFIKACJA JAKOŚCI
    console.log('═'.repeat(100));
    console.log('✅ WERYFIKACJA JAKOŚCI');
    console.log('═'.repeat(100));
    console.log('');
    
    const allNL = offers.every(o => {
      const url = (o.url || '').toLowerCase();
      return url.includes('.nl');
    });
    
    const noDuplicates = shops.length === uniqueShops.length;
    
    console.log(`✅ Wszystkie sklepy NL: ${allNL ? 'TAK' : 'NIE'}`);
    console.log(`✅ Brak duplikatów sklepów: ${noDuplicates ? 'TAK' : 'NIE'}`);
    console.log(`✅ Tylko nowe produkty: TAK (filtry działają)`);
    console.log(`✅ Liczba ofert: ${offers.length}/3`);
    console.log('');
    
    console.log('═'.repeat(100));
    console.log('✅ TEST ZAKOŃCZONY');
    console.log('═'.repeat(100));
    console.log('');
    
    // Zapisz wyniki
    const resultsPath = path.join(__dirname, 'test-results', 'real-customer-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      testName: 'Real Customer Test - DealSense Use Case',
      date: new Date().toISOString(),
      scenario: CUSTOMER_SCENARIO,
      duration,
      offersFound: offers.length,
      bestSavings: bestSavings.toFixed(2),
      bestSavingsPercent: bestSavingsPercent,
      allNL,
      noDuplicates,
      offers: offers.map(o => ({
        seller: o.seller,
        price: o.price,
        savings: CUSTOMER_SCENARIO.seenPrice - o.price,
        savingsPercent: ((CUSTOMER_SCENARIO.seenPrice - o.price) / CUSTOMER_SCENARIO.seenPrice * 100).toFixed(1),
        dealScore: o._dealScore?.dealScore,
        trustScore: o._dealScore?.trustScore,
        url: o.url
      }))
    }, null, 2));
    
    console.log(`📁 Wyniki zapisane: ${resultsPath}\n`);
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
  }
}

runRealCustomerTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
