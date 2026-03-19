// Test 20 NISZOWYCH z ulepszonymi technikami
require('dotenv').config();

const GotFetcher = require('./crawler/lib/got-fetcher');

// 20 NISZOWYCH NL sklepów (sprawdzone domeny)
const nicheShops = [
  'belsimpel.nl',
  'mobiel.nl',
  'alternate.nl',
  'azerty.nl',
  'centralpoint.nl',
  'mycom.nl',
  'paradigit.nl',
  'informatique.nl',
  'cdromland.nl',
  'allekabels.nl',
  'kabelshop.nl',
  'kabeldirect.nl',
  'nedgame.nl',
  'consolewinkel.nl',
  'gamestore.nl',
  'spellenwinkel.nl',
  'phonehouse.nl',
  'gsmpunt.nl',
  'smartphonehoesjes.nl',
  'telefoonleader.nl'
];

// Multi-pattern URL generator
function generateUrls(domain, query) {
  const encoded = encodeURIComponent(query);
  return [
    `https://www.${domain}/zoeken?q=${encoded}`,
    `https://www.${domain}/search?q=${encoded}`,
    `https://www.${domain}/nl/search?query=${encoded}`,
    `https://${domain}/zoeken?q=${encoded}`,
    `https://www.${domain}/catalogsearch/result/?q=${encoded}`
  ];
}

// Contextual regex - tylko ceny blisko słowa kluczowego
function extractContextualPrices(html, keywords) {
  const keywordList = keywords.toLowerCase().split(' ').filter(k => k.length > 3);
  const contextualPrices = [];
  
  const chunks = html.split(/€\s*\d+[,.]?\d*/);
  const priceMatches = html.match(/€\s*\d+[,.]?\d*/g) || [];
  
  for (let i = 0; i < priceMatches.length; i++) {
    const price = priceMatches[i];
    const contextBefore = chunks[i] ? chunks[i].slice(-100) : '';
    const contextAfter = chunks[i + 1] ? chunks[i + 1].slice(0, 100) : '';
    const context = (contextBefore + contextAfter).toLowerCase();
    
    const hasKeyword = keywordList.some(kw => context.includes(kw));
    
    if (hasKeyword) {
      const priceNum = parseFloat(price.replace('€', '').replace(',', '.').trim());
      if (priceNum > 100 && priceNum < 2000) {
        contextualPrices.push(priceNum);
      }
    }
  }
  
  return [...new Set(contextualPrices)].sort((a, b) => a - b);
}

async function test20NicheImproved() {
  console.log('🧪 TEST 20 NISZOWYCH - ULEPSZONE TECHNIKI\n');
  console.log('='.repeat(70));
  console.log('\n📋 Ulepszenia:');
  console.log('  1. Multi-fallback URL (5 patterns per shop)');
  console.log('  2. HEAD check przed crawlowaniem');
  console.log('  3. Contextual regex (ceny blisko "iPhone")');
  console.log('  4. 20 sklepów zamiast 5\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  const results = [];
  const query = 'iPhone 15';
  
  for (let i = 0; i < nicheShops.length; i++) {
    const domain = nicheShops[i];
    console.log(`\n${i + 1}/${nicheShops.length} Testuję: ${domain}`);
    
    const urlPatterns = generateUrls(domain, query);
    let workingUrl = null;
    
    // Próbuj każdy URL pattern
    for (const url of urlPatterns) {
      try {
        // HEAD check - czy URL istnieje
        const headCheck = await fetcher.checkUrl(url);
        if (headCheck.ok) {
          workingUrl = url;
          console.log(`   ✅ Znaleziono działający URL: ${url.split('?')[0]}...`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!workingUrl) {
      console.log(`   ❌ Żaden URL pattern nie działa`);
      results.push({ domain, success: false, reason: 'No working URL' });
      continue;
    }
    
    // Pobierz HTML
    try {
      const startTime = Date.now();
      const html = await fetcher.fetch(workingUrl);
      const duration = Date.now() - startTime;
      
      console.log(`   📦 Pobrano w ${duration}ms (${(html.length / 1024).toFixed(1)} KB)`);
      
      // Contextual regex
      const prices = extractContextualPrices(html, query);
      
      if (prices.length > 0) {
        console.log(`   💰 Znaleziono ${prices.length} kontekstowych cen:`);
        prices.slice(0, 3).forEach((p, idx) => {
          console.log(`      ${idx + 1}. €${p.toFixed(2)}`);
        });
        
        results.push({
          domain,
          url: workingUrl,
          pricesFound: prices.length,
          lowestPrice: prices[0],
          prices: prices.slice(0, 5),
          success: true
        });
      } else {
        console.log(`   ⚠️  Brak kontekstowych cen`);
        results.push({ domain, success: false, reason: 'No contextual prices' });
      }
      
    } catch (error) {
      console.log(`   ❌ Błąd: ${error.message}`);
      results.push({ domain, success: false, reason: error.message });
    }
    
    // Delay
    if (i < nicheShops.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 WYNIKI - 20 NISZOWYCH SKLEPÓW:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ DZIAŁAJĄCE: ${successful.length}/20`);
  console.log(`❌ NIE DZIAŁAJĄCE: ${failed.length}/20`);
  console.log(`📈 Success rate: ${((successful.length / 20) * 100).toFixed(1)}%\n`);
  
  if (successful.length > 0) {
    console.log('🏆 TOP 5 NAJTAŃSZYCH:\n');
    successful
      .sort((a, b) => a.lowestPrice - b.lowestPrice)
      .slice(0, 5)
      .forEach((r, i) => {
        console.log(`${i + 1}. ${r.domain} - €${r.lowestPrice.toFixed(2)}`);
      });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🎯 DECYZJA - ARCHITEKTURA:\n');
  
  if (successful.length >= 5) {
    console.log('✅ HYBRYDA (Crawler + API):');
    console.log(`   - Crawler → ${successful.length} niszowych sklepów`);
    console.log('   - API → giganci (bol.com, coolblue, mediamarkt)');
    console.log('   - Łącznie: ~' + (successful.length + 3) + ' ofert');
    console.log('\n💡 Crawler działa wystarczająco dobrze!');
    return 'HYBRID';
  } else {
    console.log('⚠️ PEŁNE API (Google Shopping):');
    console.log(`   - Crawler działa tylko na ${successful.length} sklepach (za mało)`);
    console.log('   - Przełącz na Google Shopping API');
    console.log('   - Szybsze, droższe, bardziej niezawodne');
    console.log('\n💡 Crawler nie działa wystarczająco - użyj API');
    return 'FULL_API';
  }
}

test20NicheImproved()
  .then((decision) => {
    console.log(`\n\n🏁 FINALNA DECYZJA: ${decision}\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
