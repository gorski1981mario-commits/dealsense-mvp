/**
 * LOCAL TEST - Vacation Configurator
 * Test SearchAPI.io Google Flights + Hotels integration
 */

require('dotenv').config();
const { getRealVacationPrice, getRealPricesForAllAgencies } = require('./market/vacation-api');

async function testVacationSearch() {
  console.log('\n🏖️ VACATION CONFIGURATOR - LOCAL TEST\n');
  console.log('=' .repeat(60));
  
  // Test configuration - Amsterdam to Spain
  const testConfig = {
    destination: 'Spanje',
    departureAirport: 'AMS',
    departureDate: '2026-05-01',
    duration: 7,
    adults: 2,
    children: 0,
    stars: '4',
    board: 'ai' // all inclusive
  };

  console.log('\n📋 TEST CONFIGURATION:');
  console.log(`   Destination: ${testConfig.destination}`);
  console.log(`   From: ${testConfig.departureAirport}`);
  console.log(`   Date: ${testConfig.departureDate}`);
  console.log(`   Duration: ${testConfig.duration} days`);
  console.log(`   Travelers: ${testConfig.adults} adults, ${testConfig.children} children`);
  console.log(`   Hotel: ${testConfig.stars} stars, ${testConfig.board}`);
  console.log('\n' + '=' .repeat(60));

  try {
    console.log('\n🔍 Searching real prices via SearchAPI.io...\n');
    
    // Test 1: Get base real price
    console.log('TEST 1: Get base real price (Google Flights + Hotels)');
    const basePrice = await getRealVacationPrice(testConfig);
    
    if (basePrice) {
      console.log('\n✅ BASE PRICE FOUND:');
      console.log(`   Total: €${basePrice.total}`);
      console.log(`   Per person: €${basePrice.perPerson}`);
      console.log(`   Flight: €${basePrice.flight}`);
      console.log(`   Hotel: €${basePrice.hotel}`);
      console.log(`   Source: ${basePrice.source}`);
      console.log(`   Estimated: ${basePrice.isEstimated ? 'Yes' : 'No (REAL PRICE!)'}`);
    } else {
      console.log('\n❌ No base price found');
      console.log('   Check if GOOGLE_SHOPPING_API_KEY is set in .env');
      return;
    }

    console.log('\n' + '=' .repeat(60));

    // Test 2: Get prices for all agencies
    console.log('\nTEST 2: Get prices for all agencies (35 agencies)');
    const agencyPrices = await getRealPricesForAllAgencies(testConfig);
    
    if (agencyPrices) {
      console.log('\n✅ AGENCY PRICES GENERATED:');
      
      // Show top 5 cheapest
      const sortedAgencies = Object.entries(agencyPrices)
        .sort((a, b) => a[1].total - b[1].total)
        .slice(0, 5);
      
      console.log('\n🏆 TOP 5 CHEAPEST:');
      sortedAgencies.forEach(([agency, price], index) => {
        const savings = Math.round(((basePrice.total - price.total) / basePrice.total) * 100);
        console.log(`   ${index + 1}. ${agency.toUpperCase()}: €${price.total} (${savings}% savings)`);
      });

      // Show most expensive
      const mostExpensive = Object.entries(agencyPrices)
        .sort((a, b) => b[1].total - a[1].total)[0];
      
      console.log(`\n💰 MOST EXPENSIVE: ${mostExpensive[0].toUpperCase()}: €${mostExpensive[1].total}`);
      
      const maxSavings = Math.round(((mostExpensive[1].total - sortedAgencies[0][1].total) / mostExpensive[1].total) * 100);
      console.log(`\n💎 MAX SAVINGS: ${maxSavings}% (€${mostExpensive[1].total - sortedAgencies[0][1].total})`);
      
    } else {
      console.log('\n❌ No agency prices generated');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ TEST COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
}

// Run test
testVacationSearch();
