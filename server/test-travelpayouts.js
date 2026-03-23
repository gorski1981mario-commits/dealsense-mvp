/**
 * Test Travelpayouts API Integration
 * 
 * Tests:
 * 1. Hotel search with real prices
 * 2. Flight search with real prices
 * 3. Complete vacation package
 */

require('dotenv').config();
const { searchHotels, searchFlights, searchVacationPackage } = require('./market/providers/travelpayouts');

async function testTravelpayouts() {
  console.log('\n🧪 TESTING TRAVELPAYOUTS API\n');
  console.log('='.repeat(60));

  // Test 1: Search Hotels
  console.log('\n📍 TEST 1: Search Hotels (Barcelona)');
  console.log('-'.repeat(60));
  
  const hotels = await searchHotels({
    destination: 'Barcelona',
    checkIn: '2026-07-01',
    checkOut: '2026-07-08',
    adults: 2,
    children: 0,
    currency: 'EUR',
    limit: 5
  });

  if (hotels.length > 0) {
    console.log(`✅ Found ${hotels.length} hotels`);
    hotels.slice(0, 3).forEach((hotel, i) => {
      console.log(`\n${i + 1}. ${hotel.name}`);
      console.log(`   Price: €${hotel.totalPrice} (€${hotel.pricePerNight}/night)`);
      console.log(`   Rating: ${hotel.rating} stars, ${hotel.reviewScore}/10`);
      console.log(`   Link: ${hotel.link}`);
    });
  } else {
    console.log('❌ No hotels found');
  }

  // Test 2: Search Flights
  console.log('\n\n✈️ TEST 2: Search Flights (Amsterdam → Barcelona)');
  console.log('-'.repeat(60));

  const flights = await searchFlights({
    origin: 'Amsterdam',
    destination: 'Barcelona',
    departDate: '2026-07-01',
    returnDate: '2026-07-08',
    adults: 2,
    children: 0,
    currency: 'EUR'
  });

  if (flights.length > 0) {
    console.log(`✅ Found ${flights.length} flights`);
    flights.slice(0, 3).forEach((flight, i) => {
      console.log(`\n${i + 1}. ${flight.airline}`);
      console.log(`   Price: €${flight.price}`);
      console.log(`   Route: ${flight.origin} → ${flight.destination}`);
      console.log(`   Transfers: ${flight.transfers}`);
      console.log(`   Link: ${flight.link}`);
    });
  } else {
    console.log('❌ No flights found');
  }

  // Test 3: Complete Vacation Package
  console.log('\n\n🏖️ TEST 3: Complete Vacation Package');
  console.log('-'.repeat(60));

  const packages = await searchVacationPackage({
    origin: 'Amsterdam',
    destination: 'Barcelona',
    departDate: '2026-07-01',
    returnDate: '2026-07-08',
    adults: 2,
    children: 0,
    currency: 'EUR'
  });

  if (packages.length > 0) {
    console.log(`✅ Found ${packages.length} vacation packages`);
    packages.slice(0, 3).forEach((pkg, i) => {
      console.log(`\n${i + 1}. Package ${i + 1}`);
      console.log(`   Flight: ${pkg.flight.airline} - €${pkg.flight.price}`);
      console.log(`   Hotel: ${pkg.hotel.name} - €${pkg.hotel.totalPrice}`);
      console.log(`   TOTAL: €${pkg.totalPrice}`);
      console.log(`   Source: ${pkg.source}`);
    });
  } else {
    console.log('❌ No packages found');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTING COMPLETE\n');
}

// Run tests
testTravelpayouts().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
