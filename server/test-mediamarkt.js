// Test MediaMarkt.nl scraping
const axios = require('axios');
const cheerio = require('cheerio');

async function testMediaMarkt() {
  console.log('🧪 Testing MediaMarkt.nl with stealth headers...\n');
  
  // Real MediaMarkt product URL
  const url = 'https://www.mediamarkt.nl/nl/product/_samsung-galaxy-s24-128gb-zwart-1911634.html';
  
  try {
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
    if (html.includes('Access Denied') || html.includes('403 Forbidden') || html.includes('Cloudflare')) {
      console.log('❌ BLOCKED - Cloudflare/Anti-bot detected');
      console.log('First 500 chars:');
      console.log(html.substring(0, 500));
      return;
    }
    
    const $ = cheerio.load(html);
    
    // MediaMarkt price selectors
    const priceSelectors = [
      '[data-test="mms-product-price"]',
      '.price',
      '[class*="price"]',
      'meta[property="product:price:amount"]'
    ];
    
    let price = null;
    for (const selector of priceSelectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        const text = el.attr('content') || el.text().trim();
        console.log(`✅ Found with "${selector}": ${text}`);
        if (text.match(/\d+/)) {
          price = text;
          break;
        }
      }
    }
    
    // Product title
    const title = $('h1').first().text().trim() || $('title').text();
    console.log(`\n📦 Product: ${title}`);
    
    if (price) {
      console.log(`💰 Price: ${price}`);
      console.log('\n✅ SUCCESS - Can extract price from MediaMarkt!');
    } else {
      console.log('\n⚠️  No price found');
      console.log('Searching for € symbols...');
      const euroMatches = html.match(/€\s*\d+[.,]\d+/g);
      if (euroMatches) {
        console.log(`Found: ${euroMatches.slice(0, 3).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    
    if (error.response) {
      console.log(`📛 HTTP ${error.response.status}`);
      if (error.response.status === 403) {
        console.log('🚫 403 - Need Rebrowser patches or Bright Data');
      }
    }
  }
}

testMediaMarkt().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
});
