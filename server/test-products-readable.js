"use strict";

/**
 * TEST PRODUKTÓW - CZYTELNY FORMAT
 * Pokazuje nazwy sklepów, ceny bazowe, znalezione i różnice
 */

const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath, override: true });
}

const { fetchMarketOffers } = require('./market-api');

const TEST_PRODUCTS = [
  {
    name: 'Dyson V15 Detect',
    ean: '5025155049464',
    basePrice: 649,
  },
  {
    name: 'Nike Air Max 90',
    ean: '0195866171657',
    basePrice: 139,
  },
  {
    name: 'LEGO Technic Lamborghini',
    ean: '5702017153209',
    basePrice: 379,
  },
];

async function testProduct(product) {
  console.log('\n' + '═'.repeat(100));
  console.log(`📦 PRODUKT: ${product.name}`);
  console.log(`💰 CENA BAZOWA: €${product.basePrice.toFixed(2)}`);
  console.log('═'.repeat(100));
  
  try {
    const offers = await fetchMarketOffers(product.name, product.ean, {
      basePrice: product.basePrice,
      location: 'nl'
    });
    
    if (!offers || offers.length === 0) {
      console.log('❌ Brak ofert');
      return;
    }
    
    // Sortuj po cenie
    const sorted = offers
      .filter(o => o.price && o.price > 0)
      .sort((a, b) => a.price - b.price);
    
    console.log(`\n✅ ZNALEZIONO ${sorted.length} OFERT:\n`);
    
    // TOP 10
    sorted.slice(0, 10).forEach((offer, i) => {
      const shop = offer.seller || 'Unknown';
      const price = offer.price;
      const savings = product.basePrice - price;
      const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
      const dealScore = offer._dealScore?.dealScore || 0;
      const trustScore = offer._dealScore?.trustScore || 0;
      
      const status = savings > 0 ? '✅ TANIEJ' : '❌ DROŻEJ';
      const savingsText = savings > 0 
        ? `€${savings.toFixed(2)} (${savingsPercent}%)`
        : `€${Math.abs(savings).toFixed(2)} (${Math.abs(savingsPercent)}%)`;
      
      console.log(`${i + 1}. ${status}`);
      console.log(`   🏪 SKLEP: ${shop}`);
      console.log(`   💵 CENA BAZOWA: €${product.basePrice.toFixed(2)}`);
      console.log(`   💰 CENA ZNALEZIONA: €${price.toFixed(2)}`);
      console.log(`   💸 RÓŻNICA: ${savingsText}`);
      console.log(`   ⭐ DEAL SCORE: ${dealScore.toFixed(1)}/10`);
      console.log(`   🛡️  TRUST SCORE: ${trustScore}/100`);
      console.log('');
    });
    
    // Podsumowanie
    const cheapest = sorted[0];
    const maxSavings = product.basePrice - cheapest.price;
    const maxSavingsPercent = ((maxSavings / product.basePrice) * 100).toFixed(1);
    
    console.log('─'.repeat(100));
    console.log('📊 PODSUMOWANIE:');
    console.log(`   🏆 NAJLEPSZA OFERTA: ${cheapest.seller}`);
    console.log(`   💰 CENA: €${cheapest.price.toFixed(2)}`);
    console.log(`   💸 OSZCZĘDNOŚĆ: €${maxSavings.toFixed(2)} (${maxSavingsPercent}%)`);
    console.log('─'.repeat(100));
    
  } catch (error) {
    console.error(`❌ Błąd: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           TEST PRODUKTÓW - PRAWDZIWE DANE Z SEARCHAPI                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n🔑 API Key:', process.env.GOOGLE_SHOPPING_API_KEY?.substring(0, 10) + '...');
  console.log('');
  
  for (const product of TEST_PRODUCTS) {
    await testProduct(product);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('✅ TESTY ZAKOŃCZONE!');
  console.log('═'.repeat(100));
  console.log('\n');
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
