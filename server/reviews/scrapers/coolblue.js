/**
 * COOLBLUE SCRAPER
 * Scrapes product reviews from Coolblue.nl
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50 } = options;
  
  try {
    // Coolblue API endpoint for reviews
    const searchUrl = `https://www.coolblue.nl/zoeken?query=${ean}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const $ = cheerio.load(response.data);
    
    // Find product ID
    const productLink = $('.product-card__title a').first().attr('href');
    if (!productLink) {
      console.log('[Coolblue] Product not found');
      return [];
    }
    
    // Extract product ID from URL
    const productId = productLink.match(/\/(\d+)\//)?.[1];
    if (!productId) {
      return [];
    }
    
    // Get reviews from API
    const reviewsUrl = `https://www.coolblue.nl/api/reviews/product/${productId}`;
    const reviewsResponse = await axios.get(reviewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    const reviewsData = reviewsResponse.data;
    const reviews = [];
    
    if (reviewsData && reviewsData.reviews) {
      reviewsData.reviews.slice(0, maxPerSource).forEach(review => {
        reviews.push({
          text: review.text || review.review,
          rating: review.rating,
          date: review.date || review.createdAt,
          author: review.author || review.name,
          verified: review.verified || false
        });
      });
    }
    
    return reviews;
    
  } catch (error) {
    console.error('[Coolblue] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrape };
