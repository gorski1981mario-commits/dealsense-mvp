/**
 * REVIEWS SCRAPERS - Multi-source scraping
 * 
 * Sources:
 * - Bol.com
 * - Coolblue
 * - MediaMarkt
 * - Tweakers.net
 * - Reddit (r/Netherlands, r/thenetherlands)
 * - Trustpilot
 */

const axios = require('axios');
const cheerio = require('cheerio');

const scrapers = {
  bol: require('./bol'),
  coolblue: require('./coolblue'),
  mediamarkt: require('./mediamarkt'),
  tweakers: require('./tweakers'),
  reddit: require('./reddit'),
  trustpilot: require('./trustpilot')
};

/**
 * Scrape reviews from multiple sources (parallel)
 */
async function scrapeReviews(ean, productInfo, options = {}) {
  const {
    sources = ['bol', 'coolblue', 'mediamarkt', 'tweakers', 'reddit', 'trustpilot'],
    days = 90,
    maxPerSource = 50,
    timeout = 4000
  } = options;
  
  console.log(`[Scrapers] Starting parallel scraping for ${ean}...`);
  console.log(`[Scrapers] Sources: ${sources.join(', ')}`);
  
  // Run all scrapers in parallel
  const promises = sources.map(async (source) => {
    try {
      if (!scrapers[source]) {
        console.warn(`[Scrapers] Unknown source: ${source}`);
        return [];
      }
      
      const scraper = scrapers[source];
      const reviews = await scraper.scrape(ean, productInfo, { days, maxPerSource });
      
      console.log(`[Scrapers] ${source}: ${reviews.length} reviews`);
      
      return reviews.map(r => ({ ...r, source }));
      
    } catch (error) {
      console.error(`[Scrapers] ${source} failed:`, error.message);
      return [];
    }
  });
  
  // Wait for all scrapers (with timeout)
  const results = await Promise.all(promises);
  
  // Flatten and filter
  const allReviews = results.flat().filter(r => r && r.text && r.text.length > 10);
  
  // Filter by date (last 90 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentReviews = allReviews.filter(r => {
    if (!r.date) return true; // Include if no date
    return new Date(r.date) >= cutoffDate;
  });
  
  console.log(`[Scrapers] Total: ${allReviews.length} reviews, Recent (${days}d): ${recentReviews.length}`);
  
  return recentReviews;
}

module.exports = {
  scrapeReviews
};
