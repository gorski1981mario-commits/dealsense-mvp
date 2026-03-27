/**
 * AI REVIEWS MODULE - UNIWERSALNY SYSTEM OPINII
 * "Drugi Google, ale bez fejków, bez reklam, bez sponsorowanych rankingów"
 * 
 * Funkcjonalność:
 * 1. Scraping z wielu źródeł (Bol, Coolblue, MediaMarkt, Tweakers, Reddit, Trustpilot, fora)
 * 2. AI verdict uniwersalny - top 3 problemy (działa na lodówkę i ubezpieczenie)
 * 3. Cache Redis (30 dni TTL) - świeże opinie
 * 4. Target: 6s response time
 * 5. Kategorie: WSZYSTKO (elektronika → meble → wakacje → ubezpieczenia)
 * 6. Crowdsourcing: 1€ kredytu za recenzję
 * 
 * WIZJA: DealSense Truth Database - prawdziwe opinie od realnych ludzi
 */

const { fetchReviews, aggregateForAI } = require('./searchapi-reviews');
const { analyzeWithAI } = require('./ai-analyzer-v2');
const { cacheGet, cacheSet } = require('./cache');
const { extractIdentifier } = require('./identifier');

/**
 * Main function - pobiera opinie dla WSZYSTKIEGO (produkt, usługa, miejsce)
 * @param {string} identifier - EAN, URL, nazwa produktu, usługi, etc.
 * @param {object} options - Opcje:
 *   - category: 'electronics' | 'home' | 'health' | 'travel' | 'insurance' | 'auto' | etc.
 *   - forceRefresh: bool
 *   - timeout: number (ms)
 *   - sources: array (które źródła użyć)
 * @returns {Promise<object>} - Analiza opinii z AI verdict
 */
async function getReviewsAnalysis(identifier, options = {}) {
  const startTime = Date.now();
  const timeout = options.timeout || 6000; // 6s default
  
  try {
    // 1. Extract identifier (EAN, product name, service name, etc.)
    const { type, value, category } = extractIdentifier(identifier, options.category);
    const cacheKey = `reviews:${category}:${value}`;
    
    console.log(`[Reviews] Analyzing ${type}: ${value} (category: ${category})`);
    
    // 2. Check cache first (Redis - 30 dni)
    if (!options.forceRefresh) {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        console.log(`[Reviews] Cache HIT for ${value} (${Date.now() - startTime}ms)`);
        return {
          ...cached,
          cached: true,
          responseTime: Date.now() - startTime
        };
      }
    }
    
    console.log(`[Reviews] Cache MISS for ${value} - fetching from SearchAPI...`);
    
    // 3. Fetch reviews from SearchAPI (Google Shopping + Google Search + Google Maps)
    const reviewsData = await Promise.race([
      fetchReviews(value, category, { timeout: 5000 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SearchAPI timeout')), 6000))
    ]);
    
    // 4. Aggregate all reviews and snippets for AI
    const aggregated = aggregateForAI(reviewsData);
    
    if (!aggregated || aggregated.length === 0) {
      throw new Error('No reviews found from SearchAPI');
    }
    
    console.log(`[Reviews] Fetched ${aggregated.length} reviews/snippets from ${reviewsData.total_sources} sources in ${Date.now() - startTime}ms`);
    
    // 5. Analyze with AI (GPT-4 or Claude)
    const itemInfo = { name: value, category };
    const aiAnalysis = await Promise.race([
      analyzeWithAI(aggregated, itemInfo, category),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI analysis timeout')), 3000))
    ]);
    
    // 6. Build final result
    const result = {
      identifier: value,
      type,
      category,
      totalReviews: aggregated.length,
      sources: {
        shopping_reviews: reviewsData.shopping_reviews.length,
        search_snippets: reviewsData.search_snippets.length,
        maps_reviews: reviewsData.maps_reviews.length,
        total_sources: reviewsData.total_sources
      },
      analysis: aiAnalysis,
      fetchedAt: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      method: 'searchapi' // BEZ scraperów
    };
    
    // 7. Cache result (30 days)
    await cacheSet(cacheKey, result);
    
    console.log(`[Reviews] Analysis complete for ${value} (${result.responseTime}ms)`);
    
    return result;
    
  } catch (error) {
    console.error(`[Reviews] Error for ${value}:`, error.message);
    console.error(`[Reviews] Error for ${eanOrUrl}:`, error.message);
    
    // Return error response
    return {
      error: error.message,
      ean: extractEAN(eanOrUrl),
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Extract EAN from URL or return EAN if already EAN
 */
function extractEAN(eanOrUrl) {
  // If already EAN (13 digits)
  if (/^\d{13}$/.test(eanOrUrl)) {
    return eanOrUrl;
  }
  
  // Extract from URL
  const match = eanOrUrl.match(/\b(\d{13})\b/);
  return match ? match[1] : null;
}

/**
 * Get statistics per source
 */
function getSourceStats(reviews) {
  const stats = {};
  
  reviews.forEach(review => {
    if (!stats[review.source]) {
      stats[review.source] = { count: 0, avgRating: 0 };
    }
    stats[review.source].count++;
  });
  
  return stats;
}

module.exports = {
  getReviewsAnalysis
};
