// Test 5 prawdziwych produktów - pokazuje TYLKO oferty tańsze niż cena bazowa
require('dotenv').config();

// Konfiguracja
process.env.USE_OWN_CRAWLER = 'true';
process.env.CRAWLER_MAX_DOMAINS = '10';
process.env.USE_PROXY = 'true';
process.env.PROXY_PROVIDER = 'iproyal';
process.env.MARKET_LOG_SILENT = 'false';

const { fetchMarketOffers } = require('./market-api');

async function test5ProductsPrices() {
  console.log('🧪 TEST 5 PRODUKTÓW - CENY Z FILTROWANIEM\n');
  console.log('='.repeat(70));
  console.log('\n📋 ZASADA: Pokazujemy TYLKO oferty < cena bazowa\n');
  console.log('='.repeat(70));
  
  // 5 prawdziwych produktów z cenami bazowymi
  const products = [
    {
      name: 'iPhone 15 Pro 128GB',
      basePrice: 1200,
      category: 'Smartphones'
    },
    {
      name: 'Samsung Galaxy S24',
      basePrice: 900,
      category: 'Smartphones'
    },
    {
      name: 'MacBook Air M3',
      basePrice: 1400,
      category: 'Laptops'
    },
    {
      name: 'Sony WH-1000XM5',
      basePrice: 350,
      category: 'Headphones'
    },
    {
      name: 'iPad Air',
      basePrice: 700,
      category: 'Tablets'
    }
  ];
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n📱 PRODUKT ${i + 1}/5: ${product.name}\n`);
    console.log(`Kategoria: ${product.category}`);
    console.log(`💰 CENA BAZOWA: €${product.basePrice}`);
    console.log(`📊 Szukamy ofert TYLKO < €${product.basePrice}\n`);
    console.log('-'.repeat(70));
    
    try {
      const startTime = Date.now();
      
      // Pobierz oferty przez cały system (crawler + parsery + proxy + rotation)
      const offers = await fetchMarketOffers(product.name, null, {
        userId: 'test-user-123',
        userLocation: 'Amsterdam',
        geoEnabled: true
      });
      
      const duration = Date.now() - startTime;
      
      if (!offers || offers.length === 0) {
        console.log('⚠️  Brak ofert znalezionych');
        console.log(`⏱️  Czas: ${duration}ms\n`);
        
        results.push({
          product: product.name,
          basePrice: product.basePrice,
          found: 0,
          cheaper: 0,
          lowestPrice: null,
          savings: null,
          duration
        });
        continue;
      }
      
      // Filtruj oferty tańsze niż cena bazowa
      const cheaperOffers = offers.filter(o => o.price && o.price < product.basePrice);
      
      console.log(`\n✅ Znaleziono ${offers.length} ofert w ${duration}ms`);
      console.log(`✅ Tańszych niż €${product.basePrice}: ${cheaperOffers.length}\n`);
      
      if (cheaperOffers.length === 0) {
        console.log('❌ Brak ofert tańszych niż cena bazowa');
        
        results.push({
          product: product.name,
          basePrice: product.basePrice,
          found: offers.length,
          cheaper: 0,
          lowestPrice: null,
          savings: null,
          duration
        });
        continue;
      }
      
      // Pokaż top 5 najtańszych ofert
      console.log('🏆 TOP 5 NAJTAŃSZYCH OFERT:\n');
      
      cheaperOffers.slice(0, 5).forEach((offer, idx) => {
        const price = offer.price || 0;
        const seller = offer.seller || offer._domain || 'Unknown';
        const source = offer._source || 'unknown';
        const savings = product.basePrice - price;
        const savingsPercent = ((savings / product.basePrice) * 100).toFixed(1);
        
        console.log(`${idx + 1}. ${seller}`);
        console.log(`   💰 Cena: €${price.toFixed(2)}`);
        console.log(`   💸 Oszczędność: €${savings.toFixed(2)} (${savingsPercent}%)`);
        console.log(`   📦 Źródło: ${source}`);
        console.log('');
      });
      
      // Statystyki
      const lowestPrice = Math.min(...cheaperOffers.map(o => o.price || Infinity));
      const avgPrice = cheaperOffers.reduce((sum, o) => sum + (o.price || 0), 0) / cheaperOffers.length;
      const maxSavings = product.basePrice - lowestPrice;
      const uniqueShops = [...new Set(cheaperOffers.map(o => o.seller || o._domain))];
      
      console.log('-'.repeat(70));
      console.log('\n📊 STATYSTYKI:\n');
      console.log(`Wszystkie oferty: ${offers.length}`);
      console.log(`Tańsze niż bazowa: ${cheaperOffers.length} (${((cheaperOffers.length / offers.length) * 100).toFixed(0)}%)`);
      console.log(`Unikalne sklepy: ${uniqueShops.length}`);
      console.log(`Średnia cena: €${avgPrice.toFixed(2)}`);
      console.log(`Najniższa cena: €${lowestPrice.toFixed(2)}`);
      console.log(`Maksymalna oszczędność: €${maxSavings.toFixed(2)} (${((maxSavings / product.basePrice) * 100).toFixed(1)}%)`);
      
      results.push({
        product: product.name,
        basePrice: product.basePrice,
        found: offers.length,
        cheaper: cheaperOffers.length,
        lowestPrice,
        savings: maxSavings,
        duration,
        shops: uniqueShops.length
      });
      
    } catch (error) {
      console.log(`\n❌ BŁĄD: ${error.message}`);
      
      results.push({
        product: product.name,
        basePrice: product.basePrice,
        found: 0,
        cheaper: 0,
        lowestPrice: null,
        savings: null,
        error: error.message
      });
    }
    
    // Delay między produktami
    if (i < products.length - 1) {
      console.log('\n⏳ Czekam 3s przed następnym produktem...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // PODSUMOWANIE WSZYSTKICH TESTÓW
  console.log('\n' + '='.repeat(70));
  console.log('\n🎯 PODSUMOWANIE - 5 PRODUKTÓW\n');
  console.log('='.repeat(70));
  console.log('\n');
  
  results.forEach((r, i) => {
    const status = r.cheaper > 0 ? '✅' : (r.found > 0 ? '⚠️' : '❌');
    console.log(`${status} ${i + 1}. ${r.product}`);
    console.log(`   Cena bazowa: €${r.basePrice}`);
    console.log(`   Znaleziono: ${r.found} ofert`);
    console.log(`   Tańszych: ${r.cheaper}`);
    
    if (r.lowestPrice) {
      console.log(`   Najniższa: €${r.lowestPrice.toFixed(2)}`);
      console.log(`   Oszczędność: €${r.savings.toFixed(2)} (${((r.savings / r.basePrice) * 100).toFixed(1)}%)`);
    }
    
    if (r.error) {
      console.log(`   Błąd: ${r.error}`);
    }
    
    console.log('');
  });
  
  // Globalne statystyki
  const totalFound = results.reduce((sum, r) => sum + r.found, 0);
  const totalCheaper = results.reduce((sum, r) => sum + r.cheaper, 0);
  const successfulProducts = results.filter(r => r.cheaper > 0).length;
  const totalSavings = results.reduce((sum, r) => sum + (r.savings || 0), 0);
  
  console.log('='.repeat(70));
  console.log('\n📈 GLOBALNE STATYSTYKI:\n');
  console.log(`Produkty przetestowane: ${products.length}`);
  console.log(`Produkty z ofertami: ${results.filter(r => r.found > 0).length}`);
  console.log(`Produkty z tańszymi ofertami: ${successfulProducts}`);
  console.log(`Success rate: ${((successfulProducts / products.length) * 100).toFixed(0)}%`);
  console.log(`\nWszystkie oferty: ${totalFound}`);
  console.log(`Tańsze niż bazowa: ${totalCheaper}`);
  console.log(`Łączne oszczędności: €${totalSavings.toFixed(2)}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ WERYFIKACJA SYSTEMU:\n');
  
  if (totalCheaper > 0) {
    console.log('✅ Filtrowanie działa - znaleziono tańsze oferty');
  } else {
    console.log('⚠️  Brak tańszych ofert - sprawdź ceny bazowe lub crawler');
  }
  
  if (totalFound > 0) {
    console.log('✅ System działa - znaleziono oferty');
  } else {
    console.log('⚠️  Brak ofert - używa mock fallback');
  }
  
  console.log('\n💡 KLUCZOWA ZASADA: Pokazujemy TYLKO price < basePrice');
  console.log('💡 To jest CORE VALUE naszego systemu!');
  
  console.log('\n' + '='.repeat(70));
  
  return successfulProducts > 0;
}

test5ProductsPrices()
  .then((success) => {
    console.log('\n✅ Test zakończony');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
