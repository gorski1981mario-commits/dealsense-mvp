// Simple crawler test - one domain, direct scraping
const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  console.log('🧪 Testing direct scrape of bol.com...\n');
  
  const url = 'https://www.bol.com/nl/nl/s/?searchtext=iPhone+15';
  
  try {
    console.log(`📡 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Content length: ${response.data.length} bytes`);
    
    // Check if we got HTML or captcha/block page
    const html = response.data;
    
    if (html.includes('captcha') || html.includes('blocked')) {
      console.log('❌ BLOCKED - Captcha or anti-bot detected');
      return;
    }
    
    if (html.includes('Access Denied') || html.includes('403')) {
      console.log('❌ 403 FORBIDDEN - Proxy banned or IP blocked');
      return;
    }
    
    // Try to parse products
    const $ = cheerio.load(html);
    
    // Bol.com product selectors
    const products = [];
    $('[data-test="product-item"]').each((i, el) => {
      const $el = $(el);
      const title = $el.find('[data-test="product-title"]').text().trim();
      const priceText = $el.find('[data-test="price"]').text().trim();
      const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'));
      
      if (title && price) {
        products.push({ title, price });
      }
    });
    
    if (products.length > 0) {
      console.log(`\n✅ SUCCESS - Found ${products.length} products:`);
      products.slice(0, 3).forEach(p => {
        console.log(`   - ${p.title}: €${p.price}`);
      });
    } else {
      console.log('\n⚠️  NO PRODUCTS FOUND - Selectors might be wrong');
      console.log('First 500 chars of HTML:');
      console.log(html.substring(0, 500));
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏱️  TIMEOUT - Page is too slow or JS-heavy');
    } else if (error.response) {
      console.log(`📛 HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.status === 403) {
        console.log('🚫 403 FORBIDDEN - Proxy banned or IP blocked');
      } else if (error.response.status === 429) {
        console.log('⏸️  429 TOO MANY REQUESTS - Rate limited');
      }
    } else {
      console.log('🔌 Network error:', error.code);
    }
  }
}

// Run test
testScrape().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
