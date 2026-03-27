/**
 * TRUSTPILOT SCRAPER
 * Scrapes reviews from Trustpilot for Dutch electronics stores
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50 } = options;
  
  try {
    // Search Trustpilot for product name + brand
    const searchQuery = encodeURIComponent(productInfo.name || ean);
    const searchUrl = `https://www.trustpilot.com/search?query=${searchQuery}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $ = cheerio.load(response.data);
    
    // Find company page
    const companyLink = $('.search-results a').first().attr('href');
    if (!companyLink) {
      console.log('[Trustpilot] No results found');
      return [];
    }
    
    // Get reviews page
    const reviewsUrl = companyLink.startsWith('http') 
      ? companyLink 
      : `https://www.trustpilot.com${companyLink}`;
      
    const reviewsResponse = await axios.get(reviewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $$ = cheerio.load(reviewsResponse.data);
    
    // Extract reviews
    const reviews = [];
    $$('.review-card').each((i, el) => {
      if (i >= maxPerSource) return false;
      
      const $el = $$(el);
      const text = $el.find('.review-content__text').text().trim();
      const rating = $el.find('.star-rating').attr('data-rating');
      const date = $el.find('.review-date').text().trim();
      const author = $el.find('.consumer-info__name').text().trim();
      
      if (text) {
        reviews.push({
          text,
          rating: rating ? parseFloat(rating) : null,
          date: date || null,
          author,
          verified: $el.find('.verified-badge').length > 0
        });
      }
    });
    
    return reviews;
    
  } catch (error) {
    console.error('[Trustpilot] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrape };
