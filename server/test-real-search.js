// Test real product search and price extraction
const axios = require('axios');
const cheerio = require('cheerio');

async function testRealSearch() {
  console.log('🧪 Testing real product search on Coolblue...\n');
  
  const searchUrl = 'https://www.coolblue.nl/zoeken?query=iPhone+15';
  
  try {
    console.log(`📡 Fetching: ${searchUrl}`);
    
    const response = await axios.get(searchUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9',
        'Referer': 'https://www.google.nl/'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Content: ${response.data.length} bytes\n`);
    
    const $ = cheerio.load(response.data);
    
    // Coolblue product selectors
    const products = [];
    
    // Try different selectors
    $('article.product, .product-card, [data-test*="product"]').each((i, el) => {
      if (i >= 5) return; // Only first 5
      
      const $el = $(el);
      const title = $el.find('h3, h2, .product-title, [class*="title"]').first().text().trim();
      const priceText = $el.find('[class*="price"], .sales-price, [data-test*="price"]').first().text().trim();
      
      if (title && priceText) {
        const price = priceText.match(/\d+[.,]\d+/)?.[0];
        if (price) {
          products.push({ 
            title: title.substring(0, 60), 
            price: price.replace(',', '.'),
            seller: 'Coolblue'
          });
        }
      }
    });
    
    if (products.length > 0) {
      console.log(`✅ SUCCESS! Found ${products.length} products:\n`);
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title}`);
        console.log(`   💰 €${p.price} - ${p.seller}\n`);
      });
      
      console.log('🎉 CRAWLER WORKS! Can extract real prices from Coolblue!');
      return true;
    } else {
      console.log('⚠️  No products found with selectors');
      console.log('\nSearching for any price patterns...');
      
      const allText = $.text();
      const prices = allText.match(/€\s*\d+[.,]\d+/g);
      if (prices) {
        console.log(`Found ${prices.length} price-like strings:`);
        prices.slice(0, 10).forEach(p => console.log(`   ${p}`));
      }
      
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    if (error.response) {
      console.log(`HTTP ${error.response.status}`);
    }
    return false;
  }
}

testRealSearch().then(success => {
  if (success) {
    console.log('\n✅ Test PASSED - Ready to integrate crawler!');
    process.exit(0);
  } else {
    console.log('\n❌ Test FAILED - Need to fix selectors');
    process.exit(1);
  }
});
