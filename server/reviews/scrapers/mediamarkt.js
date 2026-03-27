/**
 * MEDIAMARKT SCRAPER
 * Scrapes product reviews from MediaMarkt.nl
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50 } = options;
  
  try {
    // MediaMarkt search
    const searchUrl = `https://www.mediamarkt.nl/nl/search.html?query=${ean}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $ = cheerio.load(response.data);
    
    // Find product link
    const productLink = $('a.product').first().attr('href');
    if (!productLink) {
      console.log('[MediaMarkt] Product not found');
      return [];
    }
    
    // Get product page
    const productUrl = productLink.startsWith('http') ? productLink : `https://www.mediamarkt.nl${productLink}`;
    const productResponse = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $$ = cheerio.load(productResponse.data);
    
    // Extract reviews
    const reviews = [];
    $$('.review-item').each((i, el) => {
      if (i >= maxPerSource) return false;
      
      const $el = $$(el);
      const text = $el.find('.review-text').text().trim();
      const rating = $el.find('.rating-stars').attr('data-rating');
      const date = $el.find('.review-date').text().trim();
      const author = $el.find('.review-author').text().trim();
      
      if (text) {
        reviews.push({
          text,
          rating: rating ? parseFloat(rating) : null,
          date: date || null,
          author,
          verified: false
        });
      }
    });
    
    return reviews;
    
  } catch (error) {
    console.error('[MediaMarkt] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrape };
