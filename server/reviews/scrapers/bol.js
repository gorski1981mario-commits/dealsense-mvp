/**
 * BOL.COM SCRAPER
 * Scrapes product reviews from Bol.com
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50 } = options;
  
  try {
    // Search for product by EAN
    const searchUrl = `https://www.bol.com/nl/nl/s/?searchtext=${ean}`;
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $ = cheerio.load(searchResponse.data);
    
    // Find product link
    const productLink = $('a.product-title').first().attr('href');
    if (!productLink) {
      console.log('[Bol] Product not found');
      return [];
    }
    
    // Get product page
    const productUrl = productLink.startsWith('http') ? productLink : `https://www.bol.com${productLink}`;
    const productResponse = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $$ = cheerio.load(productResponse.data);
    
    // Extract reviews
    const reviews = [];
    $$('.review').each((i, el) => {
      if (i >= maxPerSource) return false;
      
      const $el = $$(el);
      const text = $el.find('.review__body').text().trim();
      const rating = $el.find('.rating').attr('data-rating');
      const date = $el.find('.review__date').text().trim();
      const author = $el.find('.review__author').text().trim();
      
      if (text) {
        reviews.push({
          text,
          rating: rating ? parseFloat(rating) : null,
          date: parseDate(date),
          author,
          verified: true // Bol.com only verified purchases
        });
      }
    });
    
    return reviews;
    
  } catch (error) {
    console.error('[Bol] Scraping error:', error.message);
    return [];
  }
}

function parseDate(dateStr) {
  // Parse Dutch date format (e.g., "23 maart 2024")
  if (!dateStr) return null;
  
  const months = {
    'januari': 0, 'februari': 1, 'maart': 2, 'april': 3,
    'mei': 4, 'juni': 5, 'juli': 6, 'augustus': 7,
    'september': 8, 'oktober': 9, 'november': 10, 'december': 11
  };
  
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    const monthNum = months[month.toLowerCase()];
    if (monthNum !== undefined) {
      return new Date(year, monthNum, day).toISOString();
    }
  }
  
  return null;
}

module.exports = { scrape };
