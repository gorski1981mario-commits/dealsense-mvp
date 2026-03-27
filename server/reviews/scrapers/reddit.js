/**
 * REDDIT SCRAPER
 * Scrapes product mentions from r/Netherlands, r/thenetherlands
 */

const axios = require('axios');

async function scrape(ean, productInfo, options = {}) {
  const { maxPerSource = 50, days = 90 } = options;
  
  try {
    // Search Reddit for product name
    const searchQuery = encodeURIComponent(productInfo.name || ean);
    const subreddits = ['Netherlands', 'thenetherlands', 'dutch'];
    
    const reviews = [];
    
    for (const subreddit of subreddits) {
      try {
        // Reddit JSON API
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${searchQuery}&restrict_sr=1&sort=new&limit=25`;
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 2000
        });
        
        const posts = response.data?.data?.children || [];
        
        posts.forEach(post => {
          const data = post.data;
          
          // Filter by date (last 90 days)
          const postDate = new Date(data.created_utc * 1000);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          if (postDate < cutoffDate) return;
          
          // Combine title + selftext
          const text = [data.title, data.selftext].filter(Boolean).join(' | ');
          
          if (text && text.length > 20) {
            reviews.push({
              text,
              rating: null, // Reddit doesn't have ratings
              date: postDate.toISOString(),
              author: data.author,
              verified: false,
              upvotes: data.ups,
              comments: data.num_comments
            });
          }
        });
        
      } catch (error) {
        console.error(`[Reddit] ${subreddit} error:`, error.message);
      }
    }
    
    // Sort by upvotes and limit
    return reviews
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, maxPerSource);
    
  } catch (error) {
    console.error('[Reddit] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrape };
