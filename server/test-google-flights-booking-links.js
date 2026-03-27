/**
 * TEST: Google Flights API - Check if it returns booking links
 * We need DIRECT booking links to specific flights, not generic search
 */

require('dotenv').config();
const axios = require('axios');

const GOOGLE_SHOPPING_API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function testFlightsBookingLinks() {
  console.log('\n✈️ GOOGLE FLIGHTS API - BOOKING LINKS TEST\n');
  console.log('=' .repeat(80));
  
  try {
    const params = {
      engine: 'google_flights',
      departure_id: 'AMS',
      arrival_id: 'IST',
      outbound_date: '2026-07-15',
      return_date: '2026-07-25',
      flight_type: 'round_trip',
      travel_class: 'economy',
      adults: 2,
      children: 2,
      currency: 'EUR',
      hl: 'nl',
      gl: 'nl',
      api_key: GOOGLE_SHOPPING_API_KEY
    };

    console.log('📋 REQUEST:');
    console.log(`   Route: ${params.departure_id} → ${params.arrival_id}`);
    console.log(`   Dates: ${params.outbound_date} - ${params.return_date}`);
    console.log(`   Passengers: ${params.adults} adults, ${params.children} children`);
    console.log('\n🔍 Calling SearchAPI.io...\n');

    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 20000
    });

    if (!response.data || !response.data.best_flights) {
      console.log('❌ No flights found');
      return;
    }

    console.log(`✅ Found ${response.data.best_flights.length} flights\n`);
    console.log('=' .repeat(80));

    // Check first 3 flights for booking links
    response.data.best_flights.slice(0, 3).forEach((flight, i) => {
      console.log(`\n✈️ FLIGHT ${i + 1}:`);
      console.log(`   Price: €${flight.price}`);
      console.log(`   Airline: ${flight.flights?.[0]?.airline || 'Unknown'}`);
      console.log(`   Departure: ${flight.flights?.[0]?.departure_airport?.time || 'N/A'}`);
      console.log(`   Arrival: ${flight.flights?.[0]?.arrival_airport?.time || 'N/A'}`);
      
      // CHECK FOR BOOKING LINKS
      console.log('\n   📊 BOOKING LINK ANALYSIS:');
      
      if (flight.booking_token) {
        console.log(`   ✅ booking_token: ${flight.booking_token.substring(0, 50)}...`);
      } else {
        console.log('   ❌ NO booking_token');
      }
      
      if (flight.booking) {
        console.log(`   ✅ booking object exists`);
        console.log(`      Keys: ${Object.keys(flight.booking).join(', ')}`);
      } else {
        console.log('   ❌ NO booking object');
      }
      
      if (flight.deep_link || flight.deeplink || flight.url || flight.link) {
        const link = flight.deep_link || flight.deeplink || flight.url || flight.link;
        console.log(`   ✅ Direct link: ${link}`);
      } else {
        console.log('   ❌ NO direct link');
      }

      // Show all available keys
      console.log(`\n   📋 Available keys: ${Object.keys(flight).join(', ')}`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('\n💡 CONCLUSION:');
    
    const hasBookingTokens = response.data.best_flights.some(f => f.booking_token);
    const hasDirectLinks = response.data.best_flights.some(f => f.deep_link || f.url);
    
    if (hasBookingTokens) {
      console.log('✅ Google Flights API returns booking_token');
      console.log('   → Can be used to generate booking URL via Google Flights');
    } else {
      console.log('❌ No booking_token found');
    }
    
    if (hasDirectLinks) {
      console.log('✅ Google Flights API returns direct booking links');
      console.log('   → Can redirect user directly to airline/booking site');
    } else {
      console.log('❌ No direct booking links found');
    }

    if (!hasBookingTokens && !hasDirectLinks) {
      console.log('\n⚠️ PROBLEM: No way to book specific flight!');
      console.log('   User would need to search manually on airline website');
      console.log('   → NOT acceptable for our use case');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFlightsBookingLinks();
