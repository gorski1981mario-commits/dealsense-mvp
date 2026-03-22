"use strict";

const http = require("http");
const https = require("https");
const axiosLib = require("axios");

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

/**
 * GOOGLE HOTELS API PROVIDER
 * 
 * Używa SearchAPI.io - Google Hotels engine
 * Endpoint: https://www.searchapi.io/api/v1/search?engine=google_hotels
 * 
 * Parametry:
 * - q: query (destination/hotel name)
 * - check_in_date: YYYY-MM-DD
 * - check_out_date: YYYY-MM-DD
 * - adults: number (default 2)
 * - children: number (default 0)
 * - children_ages: comma-separated (e.g. "2,5")
 * - hotel_class: 2,3,4,5
 * - sort_by: lowest_price, highest_rating, relevance
 * - rating: 7,8,9 (for 3.5+, 4+, 4.5+ stars)
 * - free_cancellation: true
 * - property_type: hotel, vacation_rental
 */

function mapHotelToOffer(hotel) {
  // Extract price (can be in different formats)
  let price = 0;
  if (hotel.rate_per_night && hotel.rate_per_night.extracted_lowest) {
    price = parseFloat(hotel.rate_per_night.extracted_lowest);
  } else if (hotel.total_rate && hotel.total_rate.extracted_lowest) {
    price = parseFloat(hotel.total_rate.extracted_lowest);
  } else if (hotel.price) {
    price = parseFloat(String(hotel.price).replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
  }

  // Extract rating
  const rating = parseFloat(hotel.overall_rating) || parseFloat(hotel.rating) || 0;
  const reviews = parseInt(hotel.reviews, 10) || 0;

  // Extract amenities
  const amenities = hotel.amenities || [];
  const hasWifi = amenities.some(a => a.toLowerCase().includes('wifi') || a.toLowerCase().includes('internet'));
  const hasPool = amenities.some(a => a.toLowerCase().includes('pool') || a.toLowerCase().includes('zwembad'));
  const hasParking = amenities.some(a => a.toLowerCase().includes('parking') || a.toLowerCase().includes('parkeren'));

  return {
    seller: hotel.name || hotel.title || "Hotel",
    price,
    currency: "EUR",
    availability: hotel.is_vacation_rental ? "vacation_rental" : "in_stock",
    reviewScore: rating,
    reviewCount: reviews,
    url: hotel.link || "",
    title: hotel.name || hotel.title || "",
    thumbnail: hotel.images && hotel.images[0] ? hotel.images[0] : (hotel.thumbnail || ""),
    
    // Hotel-specific fields
    hotelClass: hotel.hotel_class || 0,
    checkInTime: hotel.check_in_time || null,
    checkOutTime: hotel.check_out_time || null,
    amenities: amenities,
    hasWifi,
    hasPool,
    hasParking,
    freeCancellation: hotel.free_cancellation || false,
    description: hotel.description || "",
    address: hotel.address || "",
    
    // Pricing details
    ratePerNight: hotel.rate_per_night || null,
    totalRate: hotel.total_rate || null,
    
    _source: 'google_hotels'
  };
}

function offerDedupKey(o) {
  return `${o.url || ""}|${o.seller || ""}|${o.price ?? ""}`;
}

async function fetchHotels({ 
  query, 
  checkInDate, 
  checkOutDate, 
  adults = 2, 
  children = 0, 
  childrenAges = "", 
  hotelClass = "", 
  sortBy = "relevance",
  rating = "",
  freeCancellation = false,
  propertyType = "",
  apiKey 
}) {
  const key = (apiKey || "").trim();
  if (!key) {
    console.log('[Hotels] No API key provided');
    return null;
  }

  try {
    // Build query parameters
    const params = {
      engine: 'google_hotels',
      q: query,
      api_key: key,
      gl: 'nl', // Netherlands
      hl: 'nl', // Dutch language
    };

    // Add optional parameters
    if (checkInDate) params.check_in_date = checkInDate;
    if (checkOutDate) params.check_out_date = checkOutDate;
    if (adults) params.adults = adults;
    if (children > 0) {
      params.children = children;
      if (childrenAges) params.children_ages = childrenAges;
    }
    if (hotelClass) params.hotel_class = hotelClass;
    if (sortBy) params.sort_by = sortBy;
    if (rating) params.rating = rating;
    if (freeCancellation) params.free_cancellation = true;
    if (propertyType) params.property_type = propertyType;

    console.log('[Hotels] Fetching from Google Hotels API:', {
      query,
      checkInDate,
      checkOutDate,
      adults,
      children,
      sortBy
    });

    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 30000
    });

    if (!response.data || !response.data.properties) {
      console.log('[Hotels] No properties found in response');
      return null;
    }

    const properties = response.data.properties || [];
    console.log(`[Hotels] Found ${properties.length} hotels`);

    // Map to our offer format
    const offers = properties.map(mapHotelToOffer);

    // Deduplicate
    const seen = new Set();
    const uniqueOffers = [];
    for (const offer of offers) {
      const key = offerDedupKey(offer);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueOffers.push(offer);
      }
    }

    console.log(`[Hotels] Returning ${uniqueOffers.length} unique hotels`);
    return uniqueOffers;

  } catch (error) {
    console.error('[Hotels] API Error:', error.message);
    if (error.response) {
      console.error('[Hotels] Response status:', error.response.status);
      console.error('[Hotels] Response data:', error.response.data);
    }
    return null;
  }
}

module.exports = {
  fetchHotels,
  mapHotelToOffer
};
