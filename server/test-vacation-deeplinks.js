/**
 * Test Vacation Deep Links Generator
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const { generateAllLinks } = require('./market/vacation-deeplinks');

// User configuration from VacationConfigurator
const userConfig = {
  destination: 'Turkije',
  departureDate: '2026-07-01',
  duration: 7,
  adults: 2,
  children: 1,
  childrenAges: [5],
  stars: '4',
  board: 'all_inclusive',
  departureAirport: 'Amsterdam'
};

function testDeepLinks() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              VACATION DEEP LINKS - COMPARISON ENGINE                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 USER CONFIGURATION:');
  console.log(`   Destination: ${userConfig.destination}`);
  console.log(`   Dates: ${userConfig.departureDate} - ${userConfig.duration} dni`);
  console.log(`   Passengers: ${userConfig.adults} adults, ${userConfig.children} children`);
  console.log(`   Hotel: ${userConfig.stars} sterren, ${userConfig.board}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  const links = generateAllLinks(userConfig);
  
  console.log('🏆 BEST OFFERS (sorted by price):');
  console.log('');
  
  links.forEach((link, i) => {
    const totalPersons = userConfig.adults + userConfig.children;
    
    console.log(`${i + 1}. ${link.agency}`);
    console.log(`   💰 Price: €${link.estimatedPrice.total} (€${link.estimatedPrice.perPerson}/person)`);
    console.log(`   ✈️  Flight: €${link.estimatedPrice.flight}`);
    console.log(`   🏨 Hotel: €${link.estimatedPrice.hotel}`);
    console.log(`   🔗 Link: ${link.url}`);
    console.log('');
  });
  
  console.log('═'.repeat(80));
  console.log('');
  console.log('💡 BUSINESS MODEL:');
  console.log('');
  console.log('   1. User builds configuration in VacationConfigurator');
  console.log('   2. We show TOP offers from all travel agencies');
  console.log('   3. User clicks → redirect to travel agency');
  console.log('   4. User books → we get affiliate commission');
  console.log('');
  console.log('   🎯 UNFAIR ADVANTAGE: We compare ALL agencies, user gets best price!');
  console.log('');
  
  // Best offer
  const best = links[0];
  console.log('═'.repeat(80));
  console.log('');
  console.log('🥇 BEST OFFER:');
  console.log('');
  console.log(`   Agency: ${best.agency}`);
  console.log(`   Price: €${best.estimatedPrice.total} (€${best.estimatedPrice.perPerson}/person)`);
  console.log(`   Savings: €${links[links.length - 1].estimatedPrice.total - best.estimatedPrice.total} vs most expensive`);
  console.log(`   Link: ${best.url}`);
  console.log('');
}

testDeepLinks();
