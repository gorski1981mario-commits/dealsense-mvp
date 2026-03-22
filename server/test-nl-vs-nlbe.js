/**
 * TEST: NL-ONLY vs NL+BE
 * 
 * Cel: Sprawdzić czy dodanie Belgii zwiększa coverage i daje lepsze ceny
 */

require('dotenv').config({ path: '.env.test' });
const { fetchMarketOffers } = require('./market-api');

process.env.MARKET_CACHE_BYPASS = 'true';

const TEST_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 256GB',
    basePrice: 1329,
    category: 'Smartphone'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    basePrice: 1299,
    category: 'Smartphone'
  },
  {
    name: 'Dyson V15 Detect',
    basePrice: 649,
    category: 'Odkurzacz'
  },
  {
    name: 'Nike Air Force 1',
    basePrice: 119,
    category: 'Obuwie'
  },
  {
    name: 'PlayStation 5',
    basePrice: 549,
    category: 'Konsola'
  }
];

async function runTest() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                    TEST: NL-ONLY vs NL+BE                     ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const results = [];
  
  for (const product of TEST_PRODUCTS) {
    console.log(`\n📦 ${product.name} (€${product.basePrice})`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      const offers = await fetchMarketOffers(product.name, null, {
        basePrice: product.basePrice,
        userId: 'test-nlbe-user',
        maxResults: 30
      });
      
      const duration = Date.now() - startTime;
      
      if (offers && offers.length > 0) {
        // Policz NL vs BE
        const nlOffers = offers.filter(o => {
          const url = (o.url || '').toLowerCase();
          const seller = (o.seller || '').toLowerCase();
          return url.includes('.nl') || seller.includes('.nl');
        });
        
        const beOffers = offers.filter(o => {
          const url = (o.url || '').toLowerCase();
          const seller = (o.seller || '').toLowerCase();
          return url.includes('.be') || seller.includes('.be');
        });
        
        console.log(`✅ ${offers.length} ofert (${duration}ms)`);
        console.log(`   🇳🇱 NL: ${nlOffers.length} ofert`);
        console.log(`   🇧🇪 BE: ${beOffers.length} ofert`);
        
        // Pokaż top 3
        offers.slice(0, 3).forEach((offer, idx) => {
          const url = (offer.url || '').toLowerCase();
          const seller = (offer.seller || '').toLowerCase();
          const country = url.includes('.be') || seller.includes('.be') ? '🇧🇪' : '🇳🇱';
          const saved = product.basePrice - offer.price;
          const percent = ((saved / product.basePrice) * 100).toFixed(1);
          
          console.log(`   ${idx + 1}. ${country} ${offer.seller} - €${offer.price.toFixed(2)} (${percent}%)`);
        });
        
        results.push({
          product: product.name,
          basePrice: product.basePrice,
          status: 'SUCCESS',
          totalOffers: offers.length,
          nlOffers: nlOffers.length,
          beOffers: beOffers.length,
          topOffer: offers[0],
          topCountry: offers[0].url.includes('.be') ? 'BE' : 'NL'
        });
      } else {
        console.log(`❌ Brak ofert (${duration}ms)`);
        
        results.push({
          product: product.name,
          basePrice: product.basePrice,
          status: 'NO_OFFERS'
        });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      
      results.push({
        product: product.name,
        basePrice: product.basePrice,
        status: 'ERROR',
        error: error.message
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // PODSUMOWANIE
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                         📊 PODSUMOWANIE                       ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const successResults = results.filter(r => r.status === 'SUCCESS');
  
  if (successResults.length > 0) {
    const totalNL = successResults.reduce((sum, r) => sum + r.nlOffers, 0);
    const totalBE = successResults.reduce((sum, r) => sum + r.beOffers, 0);
    const total = totalNL + totalBE;
    
    const nlWins = successResults.filter(r => r.topCountry === 'NL').length;
    const beWins = successResults.filter(r => r.topCountry === 'BE').length;
    
    console.log(`📊 COVERAGE:`);
    console.log(`   Total ofert: ${total}`);
    console.log(`   🇳🇱 NL: ${totalNL} (${((totalNL/total)*100).toFixed(1)}%)`);
    console.log(`   🇧🇪 BE: ${totalBE} (${((totalBE/total)*100).toFixed(1)}%)`);
    console.log();
    console.log(`🏆 NAJTAŃSZE OFERTY:`);
    console.log(`   🇳🇱 NL: ${nlWins}/${successResults.length}`);
    console.log(`   🇧🇪 BE: ${beWins}/${successResults.length}`);
    
    if (totalBE > 0) {
      console.log();
      console.log(`✅ BELGIA DZIAŁA! Dodała ${totalBE} ofert (${((totalBE/total)*100).toFixed(1)}%)`);
    } else {
      console.log();
      console.log(`⚠️  BELGIA: 0 ofert - może Google Shopping nie ma BE sklepów?`);
    }
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('═                       ✅ TEST ZAKOŃCZONY                      ═');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  // Zapisz wyniki
  const fs = require('fs');
  fs.writeFileSync(
    './test-results/test-nl-vs-nlbe-results.json',
    JSON.stringify({
      testName: 'NL-ONLY vs NL+BE Coverage Test',
      date: new Date().toISOString(),
      results
    }, null, 2)
  );
}

runTest().catch(console.error);
