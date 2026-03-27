/**
 * TEST: Google Hotels API - Check if it returns booking links
 * We need DIRECT booking links to specific hotels with exact prices
 */

require('dotenv').config();
const axios = require('axios');

const GOOGLE_SHOPPING_API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function testHotelsBookingLinks() {
  console.log('\n🏨 GOOGLE HOTELS API - BOOKING LINKS TEST\n');
  console.log('=' .repeat(80));
  
  try {
    const params = {
      engine: 'google_hotels',
      q: 'Istanbul Turkey',
      check_in_date: '2026-07-15',
      check_out_date: '2026-07-25',
      adults: 2,
      children: 2,
      hotel_class: '4',
      currency: 'EUR',
      gl: 'nl',
      hl: 'nl',
      api_key: GOOGLE_SHOPPING_API_KEY
    };

    console.log('📋 REQUEST:');
    console.log(`   Location: ${params.q}`);
    console.log(`   Dates: ${params.check_in_date} - ${params.check_out_date}`);
    console.log(`   Guests: ${params.adults} adults, ${params.children} children`);
    console.log(`   Class: ${params.hotel_class} stars`);
    console.log('\n🔍 Calling SearchAPI.io...\n');

    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 20000
    });

    if (!response.data || !response.data.properties) {
      console.log('❌ No hotels found');
      return;
    }

    console.log(`✅ Found ${response.data.properties.length} hotels\n`);
    console.log('=' .repeat(80));

    // Check first 3 hotels for booking links
    response.data.properties.slice(0, 3).forEach((hotel, i) => {
      console.log(`\n🏨 HOTEL ${i + 1}:`);
      console.log(`   Name: ${hotel.name || 'Unknown'}`);
      console.log(`   Price: €${hotel.total_price?.extracted_price_before_taxes || 'N/A'}`);
      console.log(`   Rating: ${hotel.rating || 'N/A'}/5`);
      
      // CHECK FOR BOOKING LINKS
      console.log('\n   📊 BOOKING LINK ANALYSIS:');
      
      if (hotel.link || hotel.url) {
        const link = hotel.link || hotel.url;
        console.log(`   ✅ Direct link: ${link}`);
        
        // Check if it's a Google redirect or direct booking site
        if (link.includes('google.com')) {
          console.log('   ⚠️  Link is Google redirect (not direct booking)');
        } else if (link.includes('booking.com') || link.includes('hotels.com') || link.includes('expedia')) {
          console.log('   ✅ Link goes to booking site (Booking.com/Hotels.com/Expedia)');
        }
      } else {
        console.log('   ❌ NO direct link');
      }
      
      if (hotel.booking_options || hotel.rates || hotel.offers) {
        console.log(`   ✅ Booking options available`);
        const bookingData = hotel.booking_options || hotel.rates || hotel.offers;
        if (Array.isArray(bookingData) && bookingData.length > 0) {
          console.log(`   📋 ${bookingData.length} booking options found`);
          bookingData.slice(0, 2).forEach((option, j) => {
            console.log(`      ${j + 1}. ${option.provider || option.name || 'Unknown'}: €${option.price || 'N/A'}`);
            if (option.link || option.url) {
              console.log(`         Link: ${(option.link || option.url).substring(0, 60)}...`);
            }
          });
        }
      } else {
        console.log('   ❌ NO booking options');
      }

      // Show all available keys
      console.log(`\n   📋 Available keys: ${Object.keys(hotel).slice(0, 15).join(', ')}...`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('\n💡 CONCLUSION:');
    
    const hasDirectLinks = response.data.properties.some(h => h.link || h.url);
    const hasBookingOptions = response.data.properties.some(h => h.booking_options || h.rates);
    
    if (hasDirectLinks) {
      console.log('✅ Google Hotels API returns direct links');
      
      const sampleLink = response.data.properties.find(h => h.link || h.url);
      const link = sampleLink?.link || sampleLink?.url;
      
      if (link?.includes('google.com')) {
        console.log('   ⚠️  Links are Google redirects');
        console.log('   → User clicks → Google → Booking site');
        console.log('   → Still works, but extra step');
      } else {
        console.log('   ✅ Links go directly to booking sites');
        console.log('   → User clicks → Booking.com/Hotels.com directly');
      }
    } else {
      console.log('❌ No direct links found');
    }
    
    if (hasBookingOptions) {
      console.log('✅ Google Hotels API returns booking options from multiple providers');
      console.log('   → Can show user multiple booking sites (Booking.com, Hotels.com, etc.)');
    } else {
      console.log('❌ No booking options found');
    }

    if (!hasDirectLinks && !hasBookingOptions) {
      console.log('\n⚠️ PROBLEM: No way to book specific hotel!');
      console.log('   User would need to search manually');
      console.log('   → NOT acceptable for our use case');
    } else {
      console.log('\n✅ SOLUTION: Use hotel links from Google Hotels API');
      console.log('   → Redirect user to specific hotel on Booking.com/Hotels.com');
      console.log('   → User sees exact hotel with exact dates/guests');
      console.log('   → One click to book!');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testHotelsBookingLinks();
