/**
 * NOWA HYBRYDA: Google Flights + Travelpayouts Hotels
 * 
 * STRATEGIA:
 * 1. Google Flights - loty z prawdziwymi cenami (DZIAŁA!)
 * 2. Travelpayouts - hotele z prawdziwymi cenami (NOWE!)
 * 3. Połączenie - lot + hotel = pełny pakiet wakacyjny
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER;

// Konfiguracja wakacji
const vacationConfig = {
  adults: 2,
  children: 0,
  destination: 'Barcelona',
  departureDate: '2026-07-01',
  duration: 7,
  stars: '4',
  board: 'all_inclusive'
};

// POZIOM 1: Google Flights - loty z prawdziwymi cenami
async function fetchFlightPrice(config) {
  console.log('✈️  POZIOM 1: Google Flights - szukam lotów...');
  console.log('');
  
  const airportMap = {
    'Barcelona': 'BCN',
    'Madrid': 'MAD',
    'Malaga': 'AGP',
    'Alicante': 'ALC',
    'Turkije': 'AYT',
    'Griekenland': 'HER',
    'Egypte': 'SSH'
  };
  
  const arrivalId = airportMap[config.destination] || 'BCN';
  const checkOutDate = new Date(new Date(config.departureDate).getTime() + config.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const params = {
      engine: 'google_flights',
      departure_id: 'AMS',
      arrival_id: arrivalId,
      outbound_date: config.departureDate,
      return_date: checkOutDate,
      adults: config.adults,
      children: config.children,
      currency: 'EUR',
      gl: 'nl',
      hl: 'nl',
      api_key: GOOGLE_API_KEY
    };
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 30000
    });
    
    const bestFlights = response.data.best_flights || [];
    
    if (bestFlights.length > 0) {
      const cheapest = bestFlights[0];
      console.log(`✅ Znaleziono lot: €${cheapest.price}`);
      console.log(`   Airline: ${cheapest.flights?.[0]?.airline || 'N/A'}`);
      console.log(`   Duration: ${cheapest.total_duration} min`);
      console.log('');
      
      return {
        type: 'flight',
        price: cheapest.price,
        airline: cheapest.flights?.[0]?.airline || 'N/A',
        duration: cheapest.total_duration,
        departure: config.departureDate,
        return: checkOutDate,
        source: 'google_flights'
      };
    }
    
  } catch (error) {
    console.log('⚠️  Google Flights error:', error.message);
  }
  
  console.log('❌ Brak lotów w Google Flights');
  console.log('');
  return null;
}

// POZIOM 2: Travelpayouts - hotele z prawdziwymi cenami
async function fetchHotelPrice(config) {
  console.log('🏨 POZIOM 2: Travelpayouts - szukam hoteli...');
  console.log('');
  
  try {
    // Get location ID using Hotellook autocomplete (public API)
    const locationResponse = await axios.get('https://engine.hotellook.com/api/v2/lookup.json', {
      params: {
        query: config.destination,
        lang: 'en',
        lookFor: 'both',
        limit: 1
      },
      timeout: 10000
    });
    
    let locationId = null;
    
    if (locationResponse.data && locationResponse.data.results) {
      // Try to get city location
      if (locationResponse.data.results.locations && locationResponse.data.results.locations.length > 0) {
        locationId = locationResponse.data.results.locations[0].id;
      }
      // Fallback to hotel location
      else if (locationResponse.data.results.hotels && locationResponse.data.results.hotels.length > 0) {
        locationId = locationResponse.data.results.hotels[0].locationId;
      }
    }
    
    if (!locationId) {
      console.log(`❌ Location not found for: ${config.destination}`);
      console.log('');
      return null;
    }
    
    console.log(`   Location ID: ${locationId}`);
    
    // Search hotels using Hotellook API
    const checkOutDate = new Date(new Date(config.departureDate).getTime() + config.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const hotelResponse = await axios.get('https://engine.hotellook.com/api/v2/cache.json', {
      params: {
        location: locationId,
        checkIn: config.departureDate,
        checkOut: checkOutDate,
        adults: config.adults,
        children: config.children,
        currency: 'EUR',
        limit: 5,
        token: TRAVELPAYOUTS_TOKEN
      },
      timeout: 15000
    });
    
    if (hotelResponse.data && hotelResponse.data.length > 0) {
      const cheapest = hotelResponse.data[0];
      const totalPrice = cheapest.priceFrom || cheapest.price || 0;
      const pricePerNight = Math.round(totalPrice / config.duration);
      
      console.log(`✅ Znaleziono hotel: €${totalPrice} (€${pricePerNight}/noc)`);
      console.log(`   Hotel: ${cheapest.hotelName || 'N/A'}`);
      console.log(`   Stars: ${cheapest.stars || 'N/A'}`);
      console.log(`   Link: https://search.hotellook.com/?hotelId=${cheapest.hotelId}&checkIn=${config.departureDate}&checkOut=${checkOutDate}&marker=${TRAVELPAYOUTS_MARKER}`);
      console.log('');
      
      return {
        type: 'hotel',
        name: cheapest.hotelName || 'Hotel',
        price: totalPrice,
        pricePerNight: pricePerNight,
        stars: cheapest.stars || config.stars,
        rating: cheapest.rating || 0,
        hotelId: cheapest.hotelId,
        link: `https://search.hotellook.com/?hotelId=${cheapest.hotelId}&checkIn=${config.departureDate}&checkOut=${checkOutDate}&marker=${TRAVELPAYOUTS_MARKER}`,
        source: 'travelpayouts'
      };
    }
    
  } catch (error) {
    console.log('⚠️  Travelpayouts error:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  console.log('❌ Brak hoteli w Travelpayouts');
  console.log('');
  return null;
}

// GŁÓWNA FUNKCJA HYBRYDOWA
async function getVacationPackage(config) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       NOWA HYBRYDA: Google Flights + Travelpayouts Hotels                 ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 KONFIGURACJA:');
  console.log(`   Destination: ${config.destination}`);
  console.log(`   Dates: ${config.departureDate} - ${config.duration} dni`);
  console.log(`   Passengers: ${config.adults} adults, ${config.children} children`);
  console.log(`   Hotel: ${config.stars} stars, ${config.board}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  // Fetch flight and hotel in parallel
  const [flight, hotel] = await Promise.all([
    fetchFlightPrice(config),
    fetchHotelPrice(config)
  ]);
  
  console.log('═'.repeat(80));
  console.log('');
  console.log('📊 WYNIKI:');
  console.log('');
  
  if (flight && hotel) {
    const totalPrice = flight.price + hotel.price;
    const pricePerPerson = Math.round(totalPrice / (config.adults + config.children));
    
    console.log('✅ PEŁNY PAKIET WAKACYJNY:');
    console.log('');
    console.log(`   ✈️  Lot: ${flight.airline} - €${flight.price}`);
    console.log(`   🏨 Hotel: ${hotel.name} (${hotel.stars}★) - €${hotel.price} (€${hotel.pricePerNight}/noc)`);
    console.log('');
    console.log(`   💰 TOTAL: €${totalPrice} (€${pricePerPerson}/osoba)`);
    console.log('');
    console.log(`   🔗 Hotel Link: ${hotel.link}`);
    console.log('');
    
    return {
      flight: flight,
      hotel: hotel,
      totalPrice: totalPrice,
      pricePerPerson: pricePerPerson,
      source: 'hybrid_google_travelpayouts'
    };
  } else if (flight) {
    console.log('⚠️  TYLKO LOT (brak hotelu):');
    console.log(`   ✈️  Lot: ${flight.airline} - €${flight.price}`);
    console.log('');
    return { flight: flight, hotel: null, totalPrice: flight.price };
  } else if (hotel) {
    console.log('⚠️  TYLKO HOTEL (brak lotu):');
    console.log(`   🏨 Hotel: ${hotel.name} - €${hotel.price}`);
    console.log('');
    return { flight: null, hotel: hotel, totalPrice: hotel.price };
  } else {
    console.log('❌ BRAK WYNIKÓW (ani lot, ani hotel)');
    console.log('');
    return null;
  }
}

// RUN TEST
getVacationPackage(vacationConfig).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
