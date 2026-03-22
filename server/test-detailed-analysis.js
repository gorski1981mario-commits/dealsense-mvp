"use strict";

/**
 * TEST SZCZEGÓŁOWY - 1 PRODUKT Z PEŁNĄ ANALIZĄ
 * 
 * Pokazuje:
 * - Wszystkie oferty z SearchAPI
 * - Co jest odrzucane na każdym etapie
 * - Przebicie cenowe
 * - Skąd produkty (sklepy)
 * - Odpowiedniki
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

process.env.MARKET_CACHE_BYPASS = 'true';
process.env.MARKET_LOG_SILENT = 'false'; // Włącz wszystkie logi

const { fetchMarketOffers } = require('./market-api');

// NOWY PRODUKT - nie testowany wcześniej
const TEST_PRODUCT = {
  name: 'Samsung Galaxy S24 256GB',
  ean: '8806095322568',
  basePrice: 899
};

const USER_ID = 'test_detailed_analysis';

async function runDetailedTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              TEST SZCZEGÓŁOWY - PEŁNA ANALIZA                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 Produkt: ${TEST_PRODUCT.name}`);
  console.log(`🔢 EAN: ${TEST_PRODUCT.ean}`);
  console.log(`💰 Cena bazowa: €${TEST_PRODUCT.basePrice}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log('');
  console.log('═'.repeat(100));
  console.log('🔍 ROZPOCZYNAM SZCZEGÓŁOWĄ ANALIZĘ...');
  console.log('═'.repeat(100));
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const offers = await fetchMarketOffers(TEST_PRODUCT.name, TEST_PRODUCT.ean, {
      basePrice: TEST_PRODUCT.basePrice,
      location: 'nl',
      userId: USER_ID,
      productName: TEST_PRODUCT.name,
      scanCount: 0,
      maxResults: 5
    });
    
    const duration = Date.now() - startTime;
    
    console.log('\n' + '═'.repeat(100));
    console.log('📊 WYNIKI FINALNE');
    console.log('═'.repeat(100));
    console.log('');
    
    if (!offers || offers.length === 0) {
      console.log('❌ BRAK FINALNYCH OFERT');
      console.log('');
      console.log('⚠️  Wszystkie oferty zostały odrzucone przez filtry.');
      console.log('   Sprawdź logi powyżej aby zobaczyć co zostało odrzucone na każdym etapie.');
      console.log('');
    } else {
      console.log(`✅ ZNALEZIONO ${offers.length} FINALNYCH OFERT`);
      console.log(`⏱️  Całkowity czas: ${duration}ms`);
      console.log('');
      
      offers.forEach((offer, i) => {
        const price = offer.price || 0;
        const savings = TEST_PRODUCT.basePrice - price;
        const savingsPercent = ((savings / TEST_PRODUCT.basePrice) * 100).toFixed(1);
        const dealScore = offer._dealScore?.dealScore || 0;
        const trustScore = offer._dealScore?.trustScore || 0;
        const position = offer._position || 'N/A';
        
        console.log('─'.repeat(100));
        console.log(`${i + 1}. ${offer.seller || 'Unknown'}`);
        console.log('─'.repeat(100));
        console.log(`   🏪 Sklep: ${offer.seller}`);
        console.log(`   🌐 URL: ${(offer.url || '').substring(0, 80)}...`);
        console.log(`   💰 Cena: €${price.toFixed(2)}`);
        console.log(`   💵 Cena bazowa: €${TEST_PRODUCT.basePrice}`);
        console.log(`   📉 Oszczędności: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`   ⭐ Deal Score: ${dealScore.toFixed(1)}/10`);
        console.log(`   🛡️  Trust Score: ${trustScore}/100`);
        console.log(`   📍 Position: ${position}`);
        console.log(`   📦 Tytuł: ${(offer.title || '').substring(0, 80)}...`);
        
        if (offer._dealScore) {
          console.log(`   📊 Deal Metadata:`);
          console.log(`      - Confidence: ${offer._dealScore.dealConfidence}`);
          console.log(`      - Niche: ${offer._dealScore.isNiche ? 'Yes' : 'No'}`);
          console.log(`      - Fresh: ${offer._dealScore.isFresh ? 'Yes' : 'No'}`);
          console.log(`      - Trusted: ${offer._dealScore.isTrusted ? 'Yes' : 'No'}`);
        }
        
        if (offer._canonical) {
          console.log(`   🎯 Canonical Match:`);
          console.log(`      - Match Score: ${offer._canonical.matchScore}%`);
          console.log(`      - Match Tier: ${offer._canonical.matchTier}`);
          console.log(`      - Match Reason: ${offer._canonical.matchReason}`);
        }
        
        console.log('');
      });
      
      // ANALIZA PRZEBICIA CENOWEGO
      console.log('═'.repeat(100));
      console.log('💰 ANALIZA PRZEBICIA CENOWEGO');
      console.log('═'.repeat(100));
      console.log('');
      
      const prices = offers.map(o => o.price || 0).filter(p => p > 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      const bestSavings = TEST_PRODUCT.basePrice - minPrice;
      const bestSavingsPercent = ((bestSavings / TEST_PRODUCT.basePrice) * 100).toFixed(1);
      
      console.log(`📊 Statystyki cenowe:`);
      console.log(`   - Cena bazowa: €${TEST_PRODUCT.basePrice}`);
      console.log(`   - Najtańsza oferta: €${minPrice.toFixed(2)}`);
      console.log(`   - Najdroższa oferta: €${maxPrice.toFixed(2)}`);
      console.log(`   - Średnia cena: €${avgPrice.toFixed(2)}`);
      console.log(`   - Rozpiętość: €${(maxPrice - minPrice).toFixed(2)}`);
      console.log('');
      console.log(`🎯 NAJLEPSZE PRZEBICIE:`);
      console.log(`   - Oszczędności: €${bestSavings.toFixed(2)}`);
      console.log(`   - Procent: ${bestSavingsPercent}%`);
      console.log(`   - Sklep: ${offers.find(o => o.price === minPrice)?.seller || 'Unknown'}`);
      console.log('');
      
      // ANALIZA SKLEPÓW
      console.log('═'.repeat(100));
      console.log('🏪 ANALIZA SKLEPÓW');
      console.log('═'.repeat(100));
      console.log('');
      
      const shops = [...new Set(offers.map(o => o.seller))];
      console.log(`📍 Liczba unikalnych sklepów: ${shops.length}`);
      console.log('');
      
      shops.forEach((shop, i) => {
        const shopOffers = offers.filter(o => o.seller === shop);
        const shopPrices = shopOffers.map(o => o.price || 0);
        const shopMinPrice = Math.min(...shopPrices);
        const shopTrust = shopOffers[0]._dealScore?.trustScore || 0;
        
        console.log(`${i + 1}. ${shop}`);
        console.log(`   - Liczba ofert: ${shopOffers.length}`);
        console.log(`   - Najniższa cena: €${shopMinPrice.toFixed(2)}`);
        console.log(`   - Trust Score: ${shopTrust}/100`);
        console.log('');
      });
    }
    
    console.log('═'.repeat(100));
    console.log('✅ TEST ZAKOŃCZONY');
    console.log('═'.repeat(100));
    console.log('');
    
    // Zapisz szczegółowe wyniki
    const resultsPath = path.join(__dirname, 'test-results', 'detailed-analysis-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      testName: 'Detailed Analysis - Single Product',
      date: new Date().toISOString(),
      product: TEST_PRODUCT,
      duration,
      finalOffersCount: offers ? offers.length : 0,
      offers: offers ? offers.map(o => ({
        seller: o.seller,
        price: o.price,
        url: o.url,
        title: o.title,
        dealScore: o._dealScore,
        canonical: o._canonical,
        position: o._position
      })) : []
    }, null, 2));
    
    console.log(`📁 Szczegółowe wyniki zapisane: ${resultsPath}\n`);
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
  }
}

runDetailedTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
