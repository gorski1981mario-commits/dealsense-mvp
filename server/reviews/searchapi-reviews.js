/**
 * SEARCHAPI REVIEWS - JEDYNE PRAWDZIWE ŹRÓDŁO
 * 
 * Strategia:
 * 1. Google Shopping API - product reviews (20-30%)
 * 2. Google Search API - snippets z Tweakers, Reddit, fora (40-50%)
 * 3. Google Maps API - reviews dla miejsc (80-90%)
 * 4. AI aggregation - wszystko razem
 * 
 * BEZ scraperów (blokowane), BEZ crowdsourcingu (za drogie)
 */

const axios = require('axios');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;
const SEARCHAPI_URL = 'https://www.searchapi.io/api/v1/search';

/**
 * Fetch reviews from SearchAPI (Google Shopping + Google Search)
 */
async function fetchReviews(identifier, category = 'electronics', options = {}) {
  const results = {
    shopping_reviews: [],
    search_snippets: [],
    maps_reviews: [],
    total_sources: 0
  };
  
  try {
    // 1. Google Shopping reviews (jeśli produkt)
    if (category === 'electronics' || category === 'home' || category === 'health') {
      const shopping = await fetchGoogleShoppingReviews(identifier);
      results.shopping_reviews = shopping;
      if (shopping.length > 0) results.total_sources++;
    }
    
    // 2. Google Search snippets (Tweakers, Reddit, fora)
    const snippets = await fetchGoogleSearchSnippets(identifier, category);
    results.search_snippets = snippets;
    if (snippets.length > 0) results.total_sources++;
    
    // 3. Google Maps reviews (jeśli miejsce)
    if (category === 'travel' || options.includePlace) {
      const maps = await fetchGoogleMapsReviews(identifier);
      results.maps_reviews = maps;
      if (maps.length > 0) results.total_sources++;
    }
    
    return results;
    
  } catch (error) {
    console.error('[SearchAPI Reviews] Error:', error.message);
    return results;
  }
}

/**
 * 1. Google Shopping API - product reviews
 */
async function fetchGoogleShoppingReviews(productName) {
  try {
    const response = await axios.get(SEARCHAPI_URL, {
      params: {
        engine: 'google_shopping',
        q: productName,
        api_key: SEARCHAPI_KEY,
        num: 20 // Top 20 results
      },
      timeout: 5000
    });
    
    const reviews = [];
    const results = response.data.shopping_results || [];
    
    results.forEach(result => {
      // Extract reviews from product
      if (result.product_reviews && result.product_reviews.length > 0) {
        result.product_reviews.forEach(review => {
          reviews.push({
            source: 'google_shopping',
            rating: review.rating || null,
            text: review.text || review.snippet || '',
            date: review.date || null,
            verified: false,
            product: result.title
          });
        });
      }
      
      // Extract rating info
      if (result.rating && result.reviews) {
        reviews.push({
          source: 'google_shopping',
          rating: result.rating,
          text: `Product rated ${result.rating}/5 based on ${result.reviews} reviews`,
          date: null,
          verified: false,
          product: result.title,
          aggregate: true
        });
      }
    });
    
    console.log(`[SearchAPI] Google Shopping: ${reviews.length} reviews`);
    return reviews;
    
  } catch (error) {
    console.error('[SearchAPI] Google Shopping error:', error.message);
    return [];
  }
}

/**
 * 2. Google Search API - snippets z Tweakers, Reddit, fora
 */
async function fetchGoogleSearchSnippets(productName, category) {
  const snippets = [];
  
  // Define search sources based on category
  const sources = getSearchSources(category);
  
  for (const source of sources) {
    try {
      const query = `${productName} ${source.keywords} site:${source.domain}`;
      
      const response = await axios.get(SEARCHAPI_URL, {
        params: {
          engine: 'google',
          q: query,
          api_key: SEARCHAPI_KEY,
          num: 10, // Top 10 results per source
          gl: 'nl', // Netherlands
          hl: 'nl'  // Dutch
        },
        timeout: 5000
      });
      
      const results = response.data.organic_results || [];
      
      results.forEach(result => {
        snippets.push({
          source: source.name,
          domain: source.domain,
          title: result.title || '',
          snippet: result.snippet || '',
          link: result.link || '',
          date: result.date || null,
          position: result.position || 0
        });
      });
      
      console.log(`[SearchAPI] ${source.name}: ${results.length} snippets`);
      
    } catch (error) {
      console.error(`[SearchAPI] ${source.name} error:`, error.message);
    }
  }
  
  return snippets;
}

/**
 * 3. Google Maps API - reviews dla miejsc
 */
async function fetchGoogleMapsReviews(placeName) {
  try {
    const response = await axios.get(SEARCHAPI_URL, {
      params: {
        engine: 'google_maps',
        q: placeName,
        api_key: SEARCHAPI_KEY,
        type: 'search',
        gl: 'nl',
        hl: 'nl'
      },
      timeout: 5000
    });
    
    const reviews = [];
    const places = response.data.local_results || [];
    
    places.forEach(place => {
      if (place.reviews_data && place.reviews_data.length > 0) {
        place.reviews_data.forEach(review => {
          reviews.push({
            source: 'google_maps',
            rating: review.rating || null,
            text: review.snippet || review.text || '',
            date: review.date || null,
            user: review.user?.name || 'Anonymous',
            likes: review.likes || 0,
            place: place.title
          });
        });
      }
    });
    
    console.log(`[SearchAPI] Google Maps: ${reviews.length} reviews`);
    return reviews;
    
  } catch (error) {
    console.error('[SearchAPI] Google Maps error:', error.message);
    return [];
  }
}

/**
 * Get search sources based on category
 */
function getSearchSources(category) {
  const sources = {
    electronics: [
      { name: 'Tweakers', domain: 'tweakers.net', keywords: 'review test' },
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'ervaringen mening' },
      { name: 'Reddit NL Tech', domain: 'reddit.com/r/dutch', keywords: 'review' },
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews' }
    ],
    
    home: [
      { name: 'VivaForum', domain: 'vivaforum.nl', keywords: 'ervaringen' },
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'mening' },
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews' }
    ],
    
    health: [
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'ervaringen' },
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews' }
    ],
    
    travel: [
      { name: 'TripAdvisor', domain: 'tripadvisor.nl', keywords: 'reviews' },
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews' },
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'ervaringen' }
    ],
    
    insurance: [
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews ervaringen' },
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'verzekering mening' },
      { name: 'Independer', domain: 'independer.nl', keywords: 'reviews' }
    ],
    
    auto: [
      { name: 'AutoTrack', domain: 'autotrack.nl', keywords: 'reviews' },
      { name: 'Reddit NL', domain: 'reddit.com/r/thenetherlands', keywords: 'auto ervaringen' },
      { name: 'Trustpilot', domain: 'nl.trustpilot.com', keywords: 'reviews' }
    ]
  };
  
  return sources[category] || sources.electronics;
}

/**
 * Aggregate all reviews and snippets for AI analysis
 */
function aggregateForAI(results) {
  const aggregated = [];
  
  // 1. Shopping reviews
  results.shopping_reviews.forEach(review => {
    if (!review.aggregate) { // Skip aggregate ratings
      aggregated.push({
        source: review.source,
        type: 'review',
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
  });
  
  // 2. Search snippets
  results.search_snippets.forEach(snippet => {
    aggregated.push({
      source: snippet.source,
      type: 'snippet',
      rating: null,
      text: `${snippet.title}. ${snippet.snippet}`,
      date: snippet.date,
      link: snippet.link
    });
  });
  
  // 3. Maps reviews
  results.maps_reviews.forEach(review => {
    aggregated.push({
      source: review.source,
      type: 'review',
      rating: review.rating,
      text: review.text,
      date: review.date,
      user: review.user
    });
  });
  
  return aggregated;
}

module.exports = {
  fetchReviews,
  aggregateForAI
};
