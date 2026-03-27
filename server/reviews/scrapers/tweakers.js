/**
 * TWEAKERS.NET SCRAPER
 * Scrapes product reviews from Tweakers.net (Dutch tech reviews)
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50 } = options;
  
  try {
    // Search Tweakers by product name (EAN search doesn't work well)
    const searchQuery = encodeURIComponent(productInfo.name || ean);
    const searchUrl = `https://tweakers.net/zoeken/?keyword=${searchQuery}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $ = cheerio.load(response.data);
    
    // Find product link
    const productLink = $('.searchResults a').first().attr('href');
    if (!productLink) {
      console.log('[Tweakers] Product not found');
      return [];
    }
    
    // Get reviews page
    const reviewsUrl = productLink.includes('/reviews/') 
      ? productLink 
      : productLink.replace('/pricewatch/', '/reviews/');
      
    const reviewsResponse = await axios.get(reviewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $$ = cheerio.load(reviewsResponse.data);
    
    // Extract reviews
    const reviews = [];
    $$('.review').each((i, el) => {
      if (i >= maxPerSource) return false;
      
      const $el = $$(el);
      const text = $el.find('.reviewContent').text().trim();
      const rating = $el.find('.rating').text().trim();
      const date = $el.find('.date').text().trim();
      const author = $el.find('.author').text().trim();
      
      // Tweakers has pros/cons format
      const pros = $el.find('.pros li').map((i, el) => $$(el).text().trim()).get().join('; ');
      const cons = $el.find('.cons li').map((i, el) => $$(el).text().trim()).get().join('; ');
      
      const fullText = [text, pros ? `Pros: ${pros}` : '', cons ? `Cons: ${cons}` : '']
        .filter(Boolean)
        .join(' | ');
      
      if (fullText) {
        reviews.push({
          text: fullText,
          rating: rating ? parseFloat(rating) : null,
          date: date || null,
          author,
          verified: true // Tweakers reviews are verified
        });
      }
    });
    
    return reviews;
    
  } catch (error) {
    console.error('[Tweakers] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrape };
