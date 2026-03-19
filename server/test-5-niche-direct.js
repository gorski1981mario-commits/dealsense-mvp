// Test 5 NISZOWYCH sklepów bezpośrednio - pokaż ceny
require('dotenv').config();

const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

// 5 SPRAWDZONYCH niszowych sklepów NL (małe, proste strony)
const nicheShops = [
  { domain: 'alternate.nl', searchUrl: 'https://www.alternate.nl/html/search.html?query=iPhone+15' },
  { domain: 'azerty.nl', searchUrl: 'https://azerty.nl/zoeken?q=iPhone+15' },
  { domain: 'centralpoint.nl', searchUrl: 'https://www.centralpoint.nl/zoeken/?searchtext=iPhone+15' },
  { domain: 'mycom.nl', searchUrl: 'https://www.mycom.nl/zoeken?q=iPhone+15' },
  { domain: 'belsimpel.nl', searchUrl: 'https://www.belsimpel.nl/zoeken?q=iPhone+15' }
];

async function test5NicheShops() {
  console.log('🧪 TEST 5 NISZOWYCH SKLEPÓW - BEZPOŚREDNIO\n');
  console.log('='.repeat(70));
  console.log('\n📋 Strategia:');
  console.log('  1. Testuj 5 małych NL sklepów');
  console.log('  2. GotFetcher + IPRoyal proxy');
  console.log('  3. Regex extraction (bez CSS selektorów)');
  console.log('  4. Pokaż KONKRETNE ceny\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  const results = [];
  
  for (let i = 0; i < nicheShops.length; i++) {
    const shop = nicheShops[i];
    console.log(`\n${i + 1}️⃣  Testuję: ${shop.domain}`);
    console.log(`   URL: ${shop.searchUrl}`);
    
    try {
      const startTime = Date.now();
      const html = await fetcher.fetch(shop.searchUrl);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Pobrano w ${duration}ms (${(html.length / 1024).toFixed(1)} KB)`);
      
      // REGEX - wyciągnij wszystkie ceny
      const priceMatches = html.match(/€\s*\d+[,.]?\d*/g);
      
      if (priceMatches && priceMatches.length > 0) {
        const prices = priceMatches
          .map(m => parseFloat(m.replace('€', '').replace(',', '.').trim()))
          .filter(p => p > 100 && p < 2000) // iPhone 15 range
          .sort((a, b) => a - b);
        
        if (prices.length > 0) {
          console.log(`   💰 Znaleziono ${prices.length} cen:`);
          prices.slice(0, 5).forEach((price, idx) => {
            console.log(`      ${idx + 1}. €${price.toFixed(2)}`);
          });
          
          results.push({
            domain: shop.domain,
            url: shop.searchUrl,
            pricesFound: prices.length,
            lowestPrice: prices[0],
            prices: prices.slice(0, 5),
            success: true
          });
        } else {
          console.log(`   ⚠️  Znaleziono ceny ale poza zakresem iPhone 15`);
          results.push({ domain: shop.domain, success: false, reason: 'Ceny poza zakresem' });
        }
      } else {
        console.log(`   ❌ Brak cen w HTML`);
        results.push({ domain: shop.domain, success: false, reason: 'Brak cen' });
      }
      
    } catch (error) {
      console.log(`   ❌ Błąd: ${error.message}`);
      results.push({ domain: shop.domain, success: false, reason: error.message });
    }
    
    // Delay między requestami
    if (i < nicheShops.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 PODSUMOWANIE - 5 NISZOWYCH SKLEPÓW:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log(`✅ DZIAŁAJĄCE (${successful.length}/5):\n`);
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.domain}`);
      console.log(`   Najniższa cena: €${r.lowestPrice.toFixed(2)}`);
      console.log(`   Znalezionych cen: ${r.pricesFound}`);
      console.log(`   Top 3: ${r.prices.slice(0, 3).map(p => '€' + p.toFixed(2)).join(', ')}`);
      console.log('');
    });
    
    // Znajdź najtańszy sklep
    const cheapest = successful.sort((a, b) => a.lowestPrice - b.lowestPrice)[0];
    console.log(`🏆 NAJTAŃSZY SKLEP: ${cheapest.domain}`);
    console.log(`   Cena: €${cheapest.lowestPrice.toFixed(2)}\n`);
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ NIE DZIAŁAJĄCE (${failed.length}/5):\n`);
    failed.forEach((r, i) => {
      console.log(`${i + 1}. ${r.domain} - ${r.reason}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (successful.length >= 3) {
    console.log('\n🎉 SUKCES! Mamy działające niszowe sklepy!');
    console.log(`✅ ${successful.length}/5 sklepów zwraca ceny`);
    console.log('💡 Możemy używać niszowych zamiast gigantów!\n');
    return true;
  } else {
    console.log('\n⚠️  Za mało działających sklepów');
    console.log(`❌ Tylko ${successful.length}/5 działa\n`);
    return false;
  }
}

test5NicheShops()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
