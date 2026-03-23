/**
 * Travelpayouts API Provider
 * 
 * Provides real hotel and flight prices for vacation packages
 * 
 * APIs:
 * - Hotels: Booking.com, Hotels.com, Agoda via Hotellook
 * - Flights: Skyscanner, Aviasales
 * 
 * Revenue: Commission-based (40-50% of partner commission)
 */

const axios = require('axios');

const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '510705';

const BASE_URL = 'https://api.travelpayouts.com';

/**
 * Search hotels with real prices
 * 
 * @param {Object} params
 * @param {string} params.destination - City name or IATA code
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} params.adults - Number of adults
 * @param {number} params.children - Number of children
 * @param {string} params.currency - Currency code (EUR, USD)
 * @param {number} params.limit - Max results
 * @returns {Promise<Array>} Hotels with real prices
 */
async function searchHotels(params) {
  const {
    destination,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    currency = 'EUR',
    limit = 10
  } = params;

  try {
    // First, get location ID from city name
    const locationId = await getLocationId(destination);
    
    if (!locationId) {
      console.log(`[Travelpayouts] Location not found: ${destination}`);
      return [];
    }

    // Search hotels using Hotellook API
    const response = await axios.get(`${BASE_URL}/v2/cache.json`, {
      params: {
        location: locationId,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: adults,
        children: children,
        currency: currency,
        limit: limit,
        token: TRAVELPAYOUTS_TOKEN
      },
      timeout: 10000
    });

    if (!response.data || !response.data.hotels) {
      console.log('[Travelpayouts] No hotels found');
      return [];
    }

    // Transform to our format
    const hotels = response.data.hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      price: hotel.priceFrom,
      pricePerNight: hotel.priceAvg,
      totalPrice: hotel.priceFrom,
      currency: currency,
      rating: hotel.stars,
      reviewScore: hotel.rating,
      reviewCount: hotel.reviewsCount,
      image: hotel.photoCount > 0 ? `https://photo.hotellook.com/image_v2/limit/${hotel.id}/800/520.auto` : null,
      location: hotel.location,
      address: hotel.address,
      amenities: hotel.amenities || [],
      link: generateHotelLink(hotel.id, checkIn, checkOut, adults, children),
      source: 'Travelpayouts (Booking.com/Hotels.com/Agoda)'
    }));

    console.log(`[Travelpayouts] Found ${hotels.length} hotels for ${destination}`);
    return hotels;

  } catch (error) {
    console.error('[Travelpayouts] Hotel search error:', error.message);
    return [];
  }
}

/**
 * Search flights with real prices
 * 
 * @param {Object} params
 * @param {string} params.origin - Origin IATA code (e.g., AMS)
 * @param {string} params.destination - Destination IATA code (e.g., BCN)
 * @param {string} params.departDate - Departure date (YYYY-MM-DD)
 * @param {string} params.returnDate - Return date (YYYY-MM-DD)
 * @param {number} params.adults - Number of adults
 * @param {number} params.children - Number of children
 * @param {string} params.currency - Currency code (EUR, USD)
 * @returns {Promise<Array>} Flights with real prices
 */
async function searchFlights(params) {
  const {
    origin,
    destination,
    departDate,
    returnDate,
    adults = 2,
    children = 0,
    currency = 'EUR'
  } = params;

  try {
    // Get origin IATA code
    const originIATA = await getIATACode(origin);
    const destIATA = await getIATACode(destination);

    if (!originIATA || !destIATA) {
      console.log(`[Travelpayouts] IATA codes not found: ${origin} -> ${destination}`);
      return [];
    }

    // Search flights using Aviasales API
    const response = await axios.get(`${BASE_URL}/aviasales/v3/prices_for_dates`, {
      params: {
        origin: originIATA,
        destination: destIATA,
        departure_at: departDate,
        return_at: returnDate,
        currency: currency,
        limit: 10,
        token: TRAVELPAYOUTS_TOKEN
      },
      timeout: 10000
    });

    if (!response.data || !response.data.data) {
      console.log('[Travelpayouts] No flights found');
      return [];
    }

    // Transform to our format
    const flights = response.data.data.map(flight => ({
      id: `${flight.origin}-${flight.destination}-${flight.departure_at}`,
      airline: flight.airline,
      price: flight.price,
      currency: currency,
      origin: flight.origin,
      destination: flight.destination,
      departDate: flight.departure_at,
      returnDate: flight.return_at,
      duration: flight.duration,
      transfers: flight.transfers,
      link: generateFlightLink(originIATA, destIATA, departDate, returnDate, adults, children),
      source: 'Travelpayouts (Skyscanner/Aviasales)'
    }));

    console.log(`[Travelpayouts] Found ${flights.length} flights for ${origin} -> ${destination}`);
    return flights;

  } catch (error) {
    console.error('[Travelpayouts] Flight search error:', error.message);
    return [];
  }
}

/**
 * Get location ID from city name
 * Using Hotellook autocomplete API (public, no special permissions needed)
 */
async function getLocationId(cityName) {
  try {
    const response = await axios.get('https://engine.hotellook.com/api/v2/lookup.json', {
      params: {
        query: cityName,
        lang: 'en',
        lookFor: 'both',
        limit: 1
      },
      timeout: 5000
    });

    if (response.data && response.data.results && response.data.results.hotels) {
      const hotel = response.data.results.hotels[0];
      return hotel ? hotel.locationId : null;
    }

    return null;
  } catch (error) {
    console.error('[Travelpayouts] Location lookup error:', error.message);
    return null;
  }
}

/**
 * Get IATA code from city name
 */
async function getIATACode(cityName) {
  // Common IATA codes for Dutch cities
  const commonCodes = {
    'amsterdam': 'AMS',
    'rotterdam': 'RTM',
    'eindhoven': 'EIN',
    'maastricht': 'MST',
    'groningen': 'GRQ',
    'barcelona': 'BCN',
    'madrid': 'MAD',
    'paris': 'PAR',
    'london': 'LON',
    'rome': 'ROM',
    'athens': 'ATH',
    'istanbul': 'IST',
    'dubai': 'DXB',
    'new york': 'NYC',
    'los angeles': 'LAX'
  };

  const normalized = cityName.toLowerCase().trim();
  return commonCodes[normalized] || null;
}

/**
 * Generate affiliate hotel link
 */
function generateHotelLink(hotelId, checkIn, checkOut, adults, children) {
  const baseUrl = 'https://search.hotellook.com';
  return `${baseUrl}/?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&marker=${TRAVELPAYOUTS_MARKER}`;
}

/**
 * Generate affiliate flight link
 */
function generateFlightLink(origin, destination, departDate, returnDate, adults, children) {
  const baseUrl = 'https://www.aviasales.com';
  const passengers = adults + children;
  return `${baseUrl}/search/${origin}${departDate}${destination}${returnDate}${passengers}?marker=${TRAVELPAYOUTS_MARKER}`;
}

/**
 * Search complete vacation package (hotels + flights)
 */
async function searchVacationPackage(params) {
  const {
    origin = 'Amsterdam',
    destination,
    departDate,
    returnDate,
    adults = 2,
    children = 0,
    currency = 'EUR'
  } = params;

  try {
    console.log(`[Travelpayouts] Searching vacation package: ${origin} -> ${destination}`);

    // Search hotels and flights in parallel
    const [hotels, flights] = await Promise.all([
      searchHotels({
        destination,
        checkIn: departDate,
        checkOut: returnDate,
        adults,
        children,
        currency,
        limit: 5
      }),
      searchFlights({
        origin,
        destination,
        departDate,
        returnDate,
        adults,
        children,
        currency
      })
    ]);

    // Combine into packages
    const packages = [];
    
    if (flights.length > 0 && hotels.length > 0) {
      // Create packages by combining cheapest flights with each hotel
      const cheapestFlight = flights[0];
      
      hotels.forEach(hotel => {
        packages.push({
          id: `${cheapestFlight.id}-${hotel.id}`,
          flight: cheapestFlight,
          hotel: hotel,
          totalPrice: cheapestFlight.price + hotel.totalPrice,
          currency: currency,
          savings: 0, // Calculate based on reference prices
          source: 'Travelpayouts'
        });
      });
    }

    console.log(`[Travelpayouts] Created ${packages.length} vacation packages`);
    return packages;

  } catch (error) {
    console.error('[Travelpayouts] Vacation package search error:', error.message);
    return [];
  }
}

module.exports = {
  searchHotels,
  searchFlights,
  searchVacationPackage
};
