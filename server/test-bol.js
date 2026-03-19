// Test bol.com scraping with enhanced stealth
const axios = require('axios');
const cheerio = require('cheerio');

async function testBolCom() {
  console.log('🧪 Testing bol.com with stealth headers...\n');
  
  const url = 'https://www.bol.com/nl/nl/p/samsung-galaxy-s24-128gb-zwart-5g/9300000157583174/';
  
  try {
    // Random delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📡 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.google.nl/'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Content length: ${response.data.length} bytes\n`);
    
    const html = response.data;
    
    // Check for blocks
    if (html.includes('Access Denied') || html.includes('403 Forbidden')) {
      console.log('❌ 403 FORBIDDEN - Anti-bot detected');
      console.log('First 1000 chars:');
      console.log(html.substring(0, 1000));
      return;
    }
    
    if (html.includes('captcha') || html.includes('challenge')) {
      console.log('❌ CAPTCHA/CHALLENGE detected');
      return;
    }
    
    // Try to parse price
    const $ = cheerio.load(html);
    
    // Look for price selectors
    const priceSelectors = [
      '.promo-price',
      '[data-test="price"]',
      '.price-block__highlight',
      '.product-prices__current',
      'span[class*="price"]',
      'div[class*="price"]'
    ];
    
    let foundPrice = false;
    for (const selector of priceSelectors) {
      const priceEl = $(selector).first();
      if (priceEl.length > 0) {
        const priceText = priceEl.text().trim();
        console.log(`✅ Found price with selector "${selector}": ${priceText}`);
        foundPrice = true;
        break;
      }
    }
    
    if (!foundPrice) {
      console.log('⚠️  No price found with known selectors');
      console.log('\nSearching for any element containing "€"...');
      
      const allText = $('body').text();
      const euroMatches = allText.match(/€\s*\d+[.,]\d+/g);
      if (euroMatches) {
        console.log(`Found ${euroMatches.length} price-like strings:`);
        euroMatches.slice(0, 5).forEach(m => console.log(`   - ${m}`));
      }
    }
    
    // Check page title
    const title = $('title').text();
    console.log(`\n📄 Page title: ${title}`);
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏱️  TIMEOUT - Page too slow');
    } else if (error.response) {
      console.log(`📛 HTTP ${error.response.status}: ${error.response.statusText}`);
      
      if (error.response.status === 403) {
        console.log('🚫 403 FORBIDDEN - Need proxy or browser automation');
      } else if (error.response.status === 429) {
        console.log('⏸️  429 TOO MANY REQUESTS - Rate limited');
      }
    }
  }
}

testBolCom().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
