const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { fetchHotels } = require("./market/providers/hotels");

/**
 * TEST GOOGLE HOTELS API
 * 
 * Testujemy zapytanie do Google Hotels API:
 * - Destination: Turkije (Turkey)
 * - Check-in: 2026-06-01
 * - Check-out: 2026-06-08 (7 nights)
 * - Adults: 2
 * - Hotel class: 4 stars
 * - Sort by: lowest_price
 */

async function testGoogleHotels() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST GOOGLE HOTELS API                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const apiKey = process.env.GOOGLE_SHOPPING_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: GOOGLE_SHOPPING_API_KEY not found in .env');
    console.log('');
    console.log('Add to .env:');
    console.log('GOOGLE_SHOPPING_API_KEY=your_key_here');
    return;
  }
  
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  console.log('');
  
  // PEŁNA KONFIGURACJA WAKACJI (jak prawdziwy user!)
  const vacationConfig = {
    // 1. REIZIGERS
    adults: 2,
    children: 1,
    childrenAges: [5], // 1 dziecko, 5 lat
    
    // 2. BESTEMMING & DATUM
    destination: 'Turkije',
    departureDate: '2026-06-01',
    duration: 7, // 7 dni
    
    // 3. VERVOER
    transport: 'flight', // Vliegtuig
    
    // 4. ACCOMMODATIE
    accommodationType: 'hotel', // Hotel
    
    // 5. STERREN
    stars: '4', // 4 stars
    
    // 6. VERBLIJF
    board: 'all_inclusive', // All inclusive
    
    // 7. EXTRAS
    extras: ['free_cancellation', 'pool', 'wifi']
  };
  
  // Calculate check-out date
  const checkOutDate = new Date(new Date(vacationConfig.departureDate).getTime() + vacationConfig.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Map to Google Hotels API parameters
  const testParams = {
    query: vacationConfig.destination,
    checkInDate: vacationConfig.departureDate,
    checkOutDate: checkOutDate,
    adults: vacationConfig.adults,
    children: vacationConfig.children,
    childrenAges: vacationConfig.childrenAges.join(','),
    hotelClass: vacationConfig.stars,
    sortBy: 'lowest_price', // goedkoopste
    rating: '',
    freeCancellation: vacationConfig.extras.includes('free_cancellation'),
    propertyType: vacationConfig.accommodationType === 'hotel' ? 'hotel' : 'vacation_rental',
    apiKey
  };
  
  console.log('📋 PEŁNA KONFIGURACJA WAKACJI:');
  console.log('');
  console.log('1. REIZIGERS:');
  console.log('   Volwassenen:', vacationConfig.adults);
  console.log('   Kinderen:', vacationConfig.children, '(ages:', vacationConfig.childrenAges.join(',') + ')');
  console.log('');
  console.log('2. BESTEMMING & DATUM:');
  console.log('   Bestemming:', vacationConfig.destination);
  console.log('   Vertrekdatum:', vacationConfig.departureDate);
  console.log('   Duur:', vacationConfig.duration, 'dagen');
  console.log('   Check-out:', checkOutDate);
  console.log('');
  console.log('3. VERVOER:');
  console.log('   Transport:', vacationConfig.transport === 'flight' ? '✈️ Vliegtuig' : '🚗 Eigen vervoer');
  console.log('');
  console.log('4. ACCOMMODATIE:');
  console.log('   Type:', vacationConfig.accommodationType === 'hotel' ? '🏨 Hotel' : '🏠 Appartement');
  console.log('');
  console.log('5. STERREN:');
  console.log('   Hotel class:', vacationConfig.stars, '⭐');
  console.log('');
  console.log('6. VERBLIJF:');
  console.log('   Board:', vacationConfig.board === 'all_inclusive' ? '🍽️ All inclusive' : vacationConfig.board);
  console.log('');
  console.log('7. EXTRAS:');
  console.log('   Extras:', vacationConfig.extras.join(', '));
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  console.log('🚀 Sending request to Google Hotels API...');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const hotels = await fetchHotels(testParams);
    
    const duration = Date.now() - startTime;
    
    // DEBUG: Pokaż RAW response (pierwsze 3 hotele)
    if (hotels && hotels.length > 0) {
      console.log('🔍 DEBUG - RAW RESPONSE (pierwsze 3 hotele):');
      console.log('═'.repeat(80));
      hotels.slice(0, 3).forEach((hotel, i) => {
        console.log(`\nHotel ${i + 1} - FULL OBJECT:`);
        console.log(JSON.stringify(hotel, null, 2));
      });
      console.log('═'.repeat(80));
      console.log('');
    }
    
    if (!hotels || hotels.length === 0) {
      console.log('❌ NO HOTELS FOUND');
      console.log('');
      console.log('Possible reasons:');
      console.log('- Invalid API key');
      console.log('- No hotels available for these dates');
      console.log('- API rate limit exceeded');
      console.log('- Network error');
      return;
    }
    
    console.log('✅ SUCCESS!');
    console.log('');
    console.log('📊 RESULTS:');
    console.log('   Hotels found:', hotels.length);
    console.log('   Response time:', duration, 'ms');
    console.log('');
    
    console.log('🏨 TOP 5 HOTELS:');
    console.log('═'.repeat(80));
    
    hotels.slice(0, 5).forEach((hotel, index) => {
      console.log('');
      console.log(`${index + 1}. ${hotel.seller || hotel.title}`);
      console.log('   Price: €' + (hotel.price || 'N/A') + ' per night');
      console.log('   Rating:', hotel.reviewScore || 'N/A', '⭐ (' + (hotel.reviewCount || 0) + ' reviews)');
      console.log('   Class:', hotel.hotelClass || 'N/A', 'stars');
      console.log('   Address:', hotel.address || 'N/A');
      
      if (hotel.amenities && hotel.amenities.length > 0) {
        console.log('   Amenities:', hotel.amenities.slice(0, 3).join(', '));
      }
      
      if (hotel.hasWifi) console.log('   ✅ WiFi');
      if (hotel.hasPool) console.log('   ✅ Pool');
      if (hotel.hasParking) console.log('   ✅ Parking');
      if (hotel.freeCancellation) console.log('   ✅ Free cancellation');
      
      console.log('   URL:', hotel.url || 'N/A');
    });
    
    console.log('');
    console.log('═'.repeat(80));
    console.log('');
    
    // Statistics
    const prices = hotels.map(h => h.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices).toFixed(2) : 0;
    
    const ratings = hotels.map(h => h.reviewScore).filter(r => r > 0);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    console.log('📈 STATISTICS:');
    console.log('   Average price: €' + avgPrice + ' per night');
    console.log('   Price range: €' + minPrice + ' - €' + maxPrice);
    console.log('   Average rating:', avgRating, '⭐');
    console.log('   Hotels with WiFi:', hotels.filter(h => h.hasWifi).length);
    console.log('   Hotels with Pool:', hotels.filter(h => h.hasPool).length);
    console.log('   Hotels with Parking:', hotels.filter(h => h.hasParking).length);
    console.log('   Hotels with Free Cancellation:', hotels.filter(h => h.freeCancellation).length);
    console.log('');
    
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('');
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('');
    console.log('Stack trace:');
    console.log(error.stack);
  }
}

// Run test
testGoogleHotels().catch(console.error);
