/**
 * MULTIPLE DESTINATIONS TEST - Vacation Configurator
 * Test różne popularne destynacje dla Holendrów
 */

require('dotenv').config();
const { getRealVacationPrice } = require('./market/vacation-api');

async function testMultipleDestinations() {
  console.log('\n🌍 VACATION CONFIGURATOR - MULTIPLE DESTINATIONS TEST\n');
  console.log('=' .repeat(70));
  
  // Test configurations - najpopularniejsze destynacje dla Holendrów
  const testConfigs = [
    {
      name: 'Turcja (Antalya) - All Inclusive',
      destination: 'Turkije',
      departureAirport: 'AMS',
      departureDate: '2026-06-15',
      duration: 7,
      adults: 2,
      children: 0,
      stars: '4',
      board: 'ai'
    },
    {
      name: 'Grecja (Kreta) - Half Board',
      destination: 'Griekenland',
      departureAirport: 'AMS',
      departureDate: '2026-07-01',
      duration: 10,
      adults: 2,
      children: 2,
      stars: '4',
      board: 'hb'
    },
    {
      name: 'Egipt (Hurghada) - All Inclusive',
      destination: 'Egypte',
      departureAirport: 'AMS',
      departureDate: '2026-05-20',
      duration: 7,
      adults: 2,
      children: 0,
      stars: '5',
      board: 'ai'
    },
    {
      name: 'Spanje (Barcelona) - B&B',
      destination: 'Spanje',
      departureAirport: 'RTM',
      departureDate: '2026-08-10',
      duration: 5,
      adults: 2,
      children: 1,
      stars: '3',
      board: 'bb'
    }
  ];

  const results = [];

  for (const config of testConfigs) {
    console.log(`\n📍 Testing: ${config.name}`);
    console.log(`   ${config.departureAirport} → ${config.destination}`);
    console.log(`   ${config.departureDate}, ${config.duration} days`);
    console.log(`   ${config.adults} adults, ${config.children} children, ${config.stars}⭐, ${config.board}`);
    console.log('   Searching...');

    try {
      const price = await getRealVacationPrice(config);
      
      if (price) {
        results.push({
          name: config.name,
          success: true,
          total: price.total,
          perPerson: price.perPerson,
          flight: price.flight,
          hotel: price.hotel,
          source: price.source
        });
        console.log(`   ✅ Found: €${price.total} total (€${price.perPerson}/person)`);
      } else {
        results.push({
          name: config.name,
          success: false,
          error: 'No price found'
        });
        console.log(`   ❌ No price found`);
      }
    } catch (error) {
      results.push({
        name: config.name,
        success: false,
        error: error.message
      });
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('\n📊 SUMMARY:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n🏆 SUCCESSFUL SEARCHES:\n');
    successful.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`   Total: €${r.total} | Per person: €${r.perPerson}`);
      console.log(`   Flight: €${r.flight} | Hotel: €${r.hotel}`);
      console.log(`   Source: ${r.source}`);
      console.log('');
    });

    // Price comparison
    const cheapest = successful.reduce((min, r) => r.total < min.total ? r : min);
    const mostExpensive = successful.reduce((max, r) => r.total > max.total ? r : max);

    console.log('💰 PRICE COMPARISON:');
    console.log(`   Cheapest: ${cheapest.name} - €${cheapest.total}`);
    console.log(`   Most expensive: ${mostExpensive.name} - €${mostExpensive.total}`);
    console.log(`   Difference: €${mostExpensive.total - cheapest.total}`);
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED SEARCHES:\n');
    failed.forEach(r => {
      console.log(`   ${r.name}: ${r.error}`);
    });
  }

  console.log('\n' + '=' .repeat(70));
  console.log(`\n✅ TEST COMPLETED! Success rate: ${Math.round((successful.length / results.length) * 100)}%\n`);
}

testMultipleDestinations();
