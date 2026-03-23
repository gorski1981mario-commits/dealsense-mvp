const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");

/**
 * TEST WSZYSTKICH TRAVEL APIs W SEARCHAPI.IO
 * 
 * Testujemy:
 * 1. Google Flights - loty z cenami
 * 2. Google Travel Explore - pakiety wakacyjne
 * 3. Sprawdzamy które API ma CENY dla wakacji
 */

async function testGoogleFlights() {
  const apiKey = process.env.GOOGLE_SHOPPING_API_KEY || 'TxZ91oHM53qcbiMvcWpD8vVQ';
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST 1: GOOGLE FLIGHTS API                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const params = {
    engine: 'google_flights',
    departure_id: 'AMS', // Amsterdam
    arrival_id: 'AYT', // Antalya, Turkey
    outbound_date: '2026-06-01',
    return_date: '2026-06-08',
    currency: 'EUR',
    hl: 'nl',
    gl: 'nl',
    adults: 2,
    children: 1,
    api_key: apiKey
  };
  
  console.log('📋 PARAMETERS:');
  console.log('   Route: Amsterdam (AMS) → Antalya (AYT)');
  console.log('   Outbound:', params.outbound_date);
  console.log('   Return:', params.return_date);
  console.log('   Passengers: 2 adults, 1 child');
  console.log('');
  
  try {
    console.log('🚀 Sending request to Google Flights API...');
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 30000
    });
    
    console.log('✅ SUCCESS!');
    console.log('');
    
    // Check for flights
    if (response.data.best_flights && response.data.best_flights.length > 0) {
      console.log('✈️ BEST FLIGHTS FOUND:', response.data.best_flights.length);
      console.log('');
      
      response.data.best_flights.slice(0, 3).forEach((flight, i) => {
        console.log(`${i + 1}. Flight:`);
        console.log('   Price:', flight.price || 'N/A');
        console.log('   Airline:', flight.airline || 'N/A');
        console.log('   Duration:', flight.total_duration || 'N/A');
        console.log('   Stops:', flight.stops || 0);
        console.log('');
      });
    }
    
    // Check for other flights
    if (response.data.other_flights && response.data.other_flights.length > 0) {
      console.log('✈️ OTHER FLIGHTS FOUND:', response.data.other_flights.length);
    }
    
    // Full response (first flight)
    if (response.data.best_flights && response.data.best_flights[0]) {
      console.log('🔍 FULL FLIGHT OBJECT (first):');
      console.log(JSON.stringify(response.data.best_flights[0], null, 2));
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testGoogleTravelExplore() {
  const apiKey = process.env.GOOGLE_SHOPPING_API_KEY || 'TxZ91oHM53qcbiMvcWpD8vVQ';
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                 TEST 2: GOOGLE TRAVEL EXPLORE API                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const params = {
    engine: 'google_travel',
    q: 'Turkije vacation packages',
    hl: 'nl',
    gl: 'nl',
    currency: 'EUR',
    api_key: apiKey
  };
  
  console.log('📋 PARAMETERS:');
  console.log('   Query:', params.q);
  console.log('');
  
  try {
    console.log('🚀 Sending request to Google Travel Explore API...');
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 30000
    });
    
    console.log('✅ SUCCESS!');
    console.log('');
    
    console.log('🔍 FULL RESPONSE:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function runAllTests() {
  console.log('');
  console.log('🧪 TESTING ALL TRAVEL APIs IN SEARCHAPI.IO');
  console.log('');
  
  // Test 1: Google Flights
  const flightsData = await testGoogleFlights();
  
  // Test 2: Google Travel Explore
  const travelData = await testGoogleTravelExplore();
  
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  console.log('📊 SUMMARY:');
  console.log('');
  console.log('Google Flights:', flightsData ? '✅ Works' : '❌ Failed');
  console.log('Google Travel Explore:', travelData ? '✅ Works' : '❌ Failed');
  console.log('');
  
  if (flightsData && flightsData.best_flights && flightsData.best_flights.length > 0) {
    console.log('💰 FLIGHTS HAVE PRICES:', flightsData.best_flights[0].price ? 'YES ✅' : 'NO ❌');
  }
  
  console.log('');
  console.log('✅ ALL TESTS COMPLETED!');
}

runAllTests().catch(console.error);
