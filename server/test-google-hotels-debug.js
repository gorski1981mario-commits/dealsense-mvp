/**
 * DEBUG TEST - Google Hotels API Response
 * Check exact response format from SearchAPI.io
 */

require('dotenv').config();
const axios = require('axios');

const GOOGLE_SHOPPING_API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function debugGoogleHotels() {
  console.log('\n🏨 GOOGLE HOTELS API - DEBUG TEST\n');
  console.log('=' .repeat(60));
  
  try {
    console.log('API Key:', GOOGLE_SHOPPING_API_KEY ? '✅ Set' : '❌ Missing');
    
    if (!GOOGLE_SHOPPING_API_KEY) {
      console.log('\n❌ GOOGLE_SHOPPING_API_KEY not set in .env');
      return;
    }

    const params = {
      engine: 'google_hotels',
      q: 'Barcelona Spain',
      check_in_date: '2026-05-01',
      check_out_date: '2026-05-08',
      adults: 2,
      children: 0,
      hotel_class: '4',
      currency: 'EUR',
      gl: 'nl',
      hl: 'nl',
      api_key: GOOGLE_SHOPPING_API_KEY
    };

    console.log('\n📋 REQUEST PARAMS:');
    console.log(JSON.stringify(params, null, 2));
    console.log('\n🔍 Calling SearchAPI.io...\n');

    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 15000
    });

    console.log('✅ RESPONSE RECEIVED\n');
    console.log('Status:', response.status);
    console.log('Data keys:', Object.keys(response.data));
    
    if (response.data.properties) {
      console.log('\n🏨 PROPERTIES FOUND:', response.data.properties.length);
      
      // Show first 3 hotels with full structure
      console.log('\n📊 FIRST 3 HOTELS (FULL STRUCTURE):\n');
      response.data.properties.slice(0, 3).forEach((hotel, i) => {
        console.log(`\n--- HOTEL ${i + 1} ---`);
        console.log(JSON.stringify(hotel, null, 2));
      });

      // Check price fields
      console.log('\n💰 PRICE FIELD ANALYSIS:\n');
      response.data.properties.slice(0, 5).forEach((hotel, i) => {
        console.log(`Hotel ${i + 1}: ${hotel.name || 'Unknown'}`);
        console.log('  - rate_per_night:', hotel.rate_per_night);
        console.log('  - total_rate:', hotel.total_rate);
        console.log('  - price:', hotel.price);
        console.log('  - prices:', hotel.prices);
        console.log('');
      });

    } else {
      console.log('\n❌ No properties in response');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugGoogleHotels();
