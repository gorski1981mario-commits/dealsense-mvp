// Test bol.com z GotFetcher - BEZ JavaScript, BEZ cookie banner
require('dotenv').config();

const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');
const fs = require('fs');

async function testBolGotFetcher() {
  console.log('🧪 TEST BOL.COM - GOTFETCHER (BEZ JS, BEZ COOKIE BANNER)\n');
  console.log('='.repeat(70));
  console.log('\n📋 Konfiguracja:');
  console.log('  Method: GotFetcher (HTTP only, no JavaScript)');
  console.log('  Proxy: IPRoyal Residential NL');
  console.log('  Timeout: 30s');
  console.log('  Cookie banner: OMIJANY (brak JS)\n');
  console.log('='.repeat(70));
  
  try {
    // Inicjalizuj GotFetcher z IPRoyal proxy
    const fetcher = new GotFetcher({
      enabled: true,
      provider: 'iproyal',
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
    });
    
    const testUrl = 'https://www.bol.com/nl/nl/s/?searchtext=iPhone+15';
    
    console.log(`\n1️⃣  Pobieram stronę: ${testUrl}`);
    console.log('   ⏳ Przez IPRoyal proxy...\n');
    
    const startTime = Date.now();
    const html = await fetcher.fetch(testUrl);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Pobrano HTML w ${duration}ms`);
    console.log(`   📦 Rozmiar: ${(html.length / 1024).toFixed(2)} KB\n`);
    
    // Zapisz HTML
    const htmlPath = './bol-com-gotfetcher.html';
    fs.writeFileSync(htmlPath, html);
    console.log(`   💾 HTML zapisany: ${htmlPath}\n`);
    
    console.log('='.repeat(70));
    console.log('\n2️⃣  Parsowanie HTML - szukam cen...\n');
    
    const $ = cheerio.load(html);
    
    // Wszystkie możliwe selektory ceny
    const priceSelectors = [
      '.js-price-amount',
      '[data-test="price-amount"]',
      '[data-testid="price-amount"]',
      '.promo-price',
      '.price-block__highlight',
      'span[class*="price"]',
      'div[class*="price"]',
      '[class*="current-price"]'
    ];
    
    const foundPrices = [];
    
    for (const selector of priceSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`   ✅ Selektor: ${selector} - znaleziono ${elements.length} elementów`);
        
        elements.each((i, el) => {
          if (i < 5) { // Max 5 per selector
            const text = $(el).text().trim();
            if (text && text.length > 0) {
              foundPrices.push({
                selector,
                text,
                html: $(el).html()
              });
            }
          }
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 ZNALEZIONE CENY:\n');
    
    if (foundPrices.length === 0) {
      console.log('❌ Nie znaleziono cen!');
      console.log('\n💡 Możliwe przyczyny:');
      console.log('   - Bol.com wymaga JavaScript do renderowania cen');
      console.log('   - Selektory są niepoprawne');
      console.log('   - Strona zwróciła inną treść (captcha, error)\n');
      console.log('📁 Sprawdź HTML: bol-com-gotfetcher.html');
    } else {
      foundPrices.slice(0, 10).forEach((price, i) => {
        console.log(`${i + 1}. Selektor: ${price.selector}`);
        console.log(`   Tekst: "${price.text}"`);
        console.log('');
      });
      
      console.log(`\n✅ Znaleziono ${foundPrices.length} cen!`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n3️⃣  Sprawdzam zawartość HTML...\n');
    
    // REGEX PARSING - wyciągnij wszystkie ceny
    const euroMatches = html.match(/€\s*\d+[,.]?\d*/g);
    if (euroMatches) {
      console.log(`   ✅ Znaleziono ${euroMatches.length} fragmentów z "€" w HTML`);
      console.log('   Pierwsze 10:');
      euroMatches.slice(0, 10).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match}`);
      });
      
      // Konwertuj na liczby
      console.log('\n   💰 CENY (skonwertowane):');
      const prices = euroMatches
        .map(match => {
          const numStr = match.replace('€', '').replace(',', '.').trim();
          return parseFloat(numStr);
        })
        .filter(price => price > 10) // Tylko ceny > €10 (filtruj shipping, etc.)
        .sort((a, b) => a - b); // Sortuj od najtańszej
      
      prices.slice(0, 10).forEach((price, i) => {
        console.log(`   ${i + 1}. €${price.toFixed(2)}`);
      });
      
      if (prices.length > 0) {
        console.log(`\n   🏆 Najniższa cena: €${prices[0].toFixed(2)}`);
        console.log(`   📊 Średnia cena: €${(prices.reduce((a,b) => a+b, 0) / prices.length).toFixed(2)}`);
        console.log(`   💎 Najwyższa cena: €${prices[prices.length-1].toFixed(2)}`);
      }
    } else {
      console.log('   ❌ Brak "€" w HTML - strona może wymagać JavaScript');
    }
    
    // Sprawdź czy jest cookie consent
    if (html.includes('cookie') || html.includes('consent')) {
      console.log('\n   ⚠️  HTML zawiera "cookie"/"consent" - może być banner');
    } else {
      console.log('\n   ✅ Brak cookie bannera w HTML');
    }
    
    // Sprawdź czy jest captcha
    if (html.includes('captcha') || html.includes('Cloudflare')) {
      console.log('   ⚠️  HTML zawiera "captcha"/"Cloudflare" - może być blokada');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TEST ZAKOŃCZONY\n');
    console.log('📁 Pliki:');
    console.log(`   - HTML: ${htmlPath}`);
    console.log('\n💡 Sprawdź HTML żeby zobaczyć co GotFetcher otrzymał\n');
    console.log('='.repeat(70));
    
    return foundPrices.length > 0;
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
    return false;
  }
}

testBolGotFetcher()
  .then((success) => {
    if (success) {
      console.log('\n🎉 SUKCES - znaleziono ceny przez GotFetcher!');
    } else {
      console.log('\n⚠️  Brak cen - bol.com prawdopodobnie wymaga JavaScript');
      console.log('💡 Rozwiązanie: Użyć Playwright z automatycznym klikaniem cookie');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
