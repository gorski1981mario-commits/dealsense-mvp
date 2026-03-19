// Test bol.com z Playwright - headless false, screenshot, ekstrakcja ceny
require('dotenv').config();

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBolLive() {
  console.log('🧪 TEST BOL.COM - LIVE BROWSER\n');
  console.log('='.repeat(70));
  console.log('\n📋 Konfiguracja:');
  console.log('  Headless: false (widoczna przeglądarka)');
  console.log('  Timeout: 70s');
  console.log('  Wait: networkidle + 8s');
  console.log('  Proxy: BEZ PROXY (Playwright ma problem z IPRoyal auth)\n');
  console.log('='.repeat(70));
  
  let browser;
  let context;
  let page;
  
  try {
    console.log('\n1️⃣  Uruchamiam przeglądarkę...');
    browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ]
    });
    
    console.log('2️⃣  Tworzę kontekst...');
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'nl-NL',
      timezoneId: 'Europe/Amsterdam'
    });
    
    page = await context.newPage();
    
    const testUrl = 'https://www.bol.com/nl/nl/s/?searchtext=iPhone+15';
    
    console.log(`3️⃣  Ładuję stronę: ${testUrl}`);
    console.log('   ⏳ Czekam na networkidle (max 70s)...\n');
    
    const startTime = Date.now();
    await page.goto(testUrl, { 
      waitUntil: 'networkidle', 
      timeout: 70000 
    });
    
    console.log(`   ✅ Strona załadowana w ${Date.now() - startTime}ms`);
    
    // AUTOMATYCZNE ZAMYKANIE COOKIE CONSENT - wszystkie NL sklepy
    console.log('   🍪 Zamykam cookie consent popup...');
    
    // Lista selektorów dla różnych NL sklepów
    const cookieSelectors = [
      'button:has-text("Accepteer alles")',
      'button:has-text("Accepteren")',
      'button:has-text("Accept")',
      'button[id*="accept"]',
      'button[class*="accept"]',
      'button[data-test*="accept"]',
      '#accept-cookies',
      '.cookie-accept',
      '[data-testid="consent-accept-all"]'
    ];
    
    let cookieClosed = false;
    for (const selector of cookieSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`   ✅ Klikam cookie button: ${selector}`);
          await button.click();
          await page.waitForTimeout(3000); // Czekaj 3s na zamknięcie
          cookieClosed = true;
          break;
        }
      } catch (e) {
        // Próbuj następny selektor
      }
    }
    
    if (!cookieClosed) {
      console.log('   ℹ️  Cookie popup nie znaleziony (OK)');
    }
    
    console.log('   ⏳ Czekam dodatkowe 8s na pełne załadowanie...\n');
    await page.waitForTimeout(8000);
    
    console.log('4️⃣  Robię screenshot...');
    const screenshotPath = path.join(__dirname, 'bol-com-screenshot.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`   ✅ Screenshot: ${screenshotPath}\n`);
    
    console.log('5️⃣  Szukam cen na stronie...\n');
    
    // Wszystkie możliwe selektory ceny dla bol.com
    const selectors = [
      '.js-price-amount',
      '[data-test="price-amount"]',
      '[data-testid="price-amount"]',
      '.promo-price',
      '.price-block__highlight',
      '[class*="price-current"]',
      '[class*="current-price"]',
      'span[class*="price"]',
      'div[class*="price"]',
      '[data-test*="price"]',
      '[aria-label*="price"]',
      '[aria-label*="prijs"]'
    ];
    
    let foundPrices = [];
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`   ✅ Znaleziono ${elements.length} elementów dla: ${selector}`);
          
          for (let i = 0; i < Math.min(elements.length, 5); i++) {
            const text = await elements[i].textContent();
            const cleanText = text.trim();
            if (cleanText) {
              foundPrices.push({
                selector,
                text: cleanText,
                index: i
              });
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 ZNALEZIONE CENY:\n');
    
    if (foundPrices.length === 0) {
      console.log('❌ Nie znaleziono żadnych cen!');
      console.log('\n💡 Sprawdź screenshot: bol-com-screenshot.png');
    } else {
      foundPrices.slice(0, 10).forEach((price, i) => {
        console.log(`${i + 1}. Selektor: ${price.selector}`);
        console.log(`   Tekst: "${price.text}"`);
        console.log('');
      });
      
      console.log(`\n✅ Znaleziono ${foundPrices.length} cen!`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n6️⃣  Sprawdzam HTML strony...\n');
    
    const html = await page.content();
    const htmlPath = path.join(__dirname, 'bol-com-page.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`   ✅ HTML zapisany: ${htmlPath}`);
    
    // Szukaj "price" w HTML
    const priceMatches = html.match(/price[^>]*>([^<]+)</gi);
    if (priceMatches) {
      console.log(`\n   Znaleziono ${priceMatches.length} fragmentów z "price" w HTML`);
      console.log('   Pierwsze 5:');
      priceMatches.slice(0, 5).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.substring(0, 80)}...`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TEST ZAKOŃCZONY\n');
    console.log('📁 Pliki:');
    console.log(`   - Screenshot: ${screenshotPath}`);
    console.log(`   - HTML: ${htmlPath}`);
    console.log('\n💡 Przeglądarka pozostanie otwarta - SPRAWDŹ TERAZ!');
    console.log('💡 Screenshot zapisany - sprawdź co crawler widzi\n');
    console.log('⚠️  PRZEGLĄDARKA NIE ZAMKNIE SIĘ AUTOMATYCZNIE');
    console.log('⚠️  Zamknij ręcznie gdy skończysz sprawdzać\n');
    
    // NIE zamykaj - user musi zobaczyć
    console.log('✅ Test zakończony - przeglądarka otwarta\n');
    
  } catch (error) {
    console.error('\n❌ BŁĄD:', error.message);
    console.error(error.stack);
    
    // NIE zamykaj przy błędzie - user musi zobaczyć co poszło nie tak
    console.log('\n⚠️  Przeglądarka pozostanie otwarta mimo błędu');
  }
}

testBolLive()
  .then(() => {
    console.log('\n✅ Test zakończony - przeglądarka otwarta');
    console.log('⚠️  Naciśnij Ctrl+C żeby zakończyć\n');
    // NIE exit - czekaj na user
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    console.log('⚠️  Naciśnij Ctrl+C żeby zakończyć\n');
    // NIE exit - czekaj na user
  });
