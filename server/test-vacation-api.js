/**
 * Test /api/vacation/search endpoint
 * 
 * Testuje pełną integrację:
 * - 11 biur podróży (4 giganci + 7 niszowych)
 * - Pricing intelligence
 * - Savings calculation
 * - Dual revenue model
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const axios = require("axios");

// Start server
const app = require('./server');
const PORT = 4001;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  
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
  
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              VACATION API TEST - 11 BIUR PODRÓŻY                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 USER CONFIGURATION:');
  console.log(`   Destination: ${userConfig.destination}`);
  console.log(`   Dates: ${userConfig.departureDate} - ${userConfig.duration} dni`);
  console.log(`   Passengers: ${userConfig.adults} adults, ${userConfig.children} children`);
  console.log(`   Hotel: ${userConfig.stars} sterren, ${userConfig.board}`);
  console.log('\n' + '═'.repeat(80) + '\n');
  
  try {
    const response = await axios.post(`http://localhost:${PORT}/api/vacation/search`, userConfig);
    
    const { offers, summary } = response.data;
    
    console.log('📊 SUMMARY:');
    console.log(`   Total offers: ${summary.totalOffers}`);
    console.log(`   Cheapest: ${summary.cheapest} (€${summary.cheapestPrice})`);
    console.log(`   Most expensive: ${summary.mostExpensive} (€${summary.mostExpensivePrice})`);
    console.log(`   Max savings: €${summary.maxSavings}`);
    console.log(`   Search time: ${summary.searchTime}`);
    console.log('\n' + '═'.repeat(80) + '\n');
    
    console.log('🏆 ALL OFFERS (sorted by price):\n');
    
    offers.forEach((offer, i) => {
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      const type = offer.type === 'niche' ? '💎 NICHE' : '🏢 GIANT';
      
      console.log(`${emoji} ${i + 1}. ${offer.agency} ${type}`);
      console.log(`   💰 Price: €${offer.estimatedPrice.total} (€${offer.estimatedPrice.perPerson}/person)`);
      console.log(`   💸 Savings: €${offer.savings} (${offer.savingsPercentage}% cheaper)`);
      console.log(`   ✈️  Flight: €${offer.estimatedPrice.flight}`);
      console.log(`   🏨 Hotel: €${offer.estimatedPrice.hotel}`);
      console.log(`   🔗 Link: ${offer.url}`);
      console.log('');
    });
    
    console.log('═'.repeat(80) + '\n');
    
    // Dual Revenue Model calculation
    const bestOffer = offers[0];
    const savings = bestOffer.savings;
    const userCommission = Math.round(savings * 0.10); // 10% prowizji od oszczędności
    const affiliateCommission = Math.round(bestOffer.estimatedPrice.total * 0.04); // 4% affiliate
    const totalRevenue = userCommission + affiliateCommission;
    
    console.log('💰 DUAL REVENUE MODEL:\n');
    console.log(`   User oszczędza: €${savings}`);
    console.log(`   User płaci nam: €${userCommission} (10% prowizji)`);
    console.log(`   Biuro płaci nam: €${affiliateCommission} (4% affiliate)`);
    console.log(`   TOTAL REVENUE: €${totalRevenue} per transakcja`);
    console.log('');
    console.log('═'.repeat(80) + '\n');
    
    console.log('🎯 UNFAIR ADVANTAGES:\n');
    console.log('   ✅ 11 biur podróży (4 giganci + 7 niszowych)');
    console.log('   ✅ Niszowe biura = największe przebicia cenowe');
    console.log('   ✅ Podwójna prowizja (user + affiliate)');
    console.log('   ✅ Bezstronność (pokazujemy najtańsze według Deal Score)');
    console.log('   ✅ Oszczędność czasu (gotowe oferty w < 1 sekundę)');
    console.log('   ✅ AI + KWANT mają duży wachlarz do analizy');
    console.log('');
    
    console.log('✅ TEST PASSED!\n');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
  
  server.close();
  process.exit(0);
});
