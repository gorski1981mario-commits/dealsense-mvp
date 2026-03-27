/**
 * DEMO: Show exact booking links user gets
 * Demonstrates the difference between old (generic) and new (specific) approach
 */

require('dotenv').config();
const { getRealPricesForAllAgencies } = require('./market/vacation-api');

async function demoBookingLinks() {
  console.log('\n🔗 BOOKING LINKS DEMO - What User Gets\n');
  console.log('=' .repeat(80));
  
  const userConfig = {
    destination: 'Turkije',
    departureAirport: 'AMS',
    departureDate: '2026-07-15',
    duration: 10,
    adults: 2,
    children: 2,
    stars: '4',
    board: 'ai'
  };

  console.log('\n👤 USER CONFIGUREERT:');
  console.log(`   Familie: ${userConfig.adults} volwassenen + ${userConfig.children} kinderen`);
  console.log(`   Bestemming: ${userConfig.destination}`);
  console.log(`   Datum: ${userConfig.departureDate} (${userConfig.duration} dagen)`);
  console.log('\n🔍 Searching...\n');

  try {
    const agencyPrices = await getRealPricesForAllAgencies(userConfig);
    
    if (!agencyPrices) {
      console.log('❌ No prices found');
      return;
    }

    const offers = Object.entries(agencyPrices)
      .map(([agency, price]) => ({ agency, ...price }))
      .sort((a, b) => a.total - b.total);

    const bestOffer = offers[0];

    console.log('=' .repeat(80));
    console.log('\n✅ BESTE DEAL GEVONDEN:\n');
    console.log(`   Reisorganisatie: ${bestOffer.agency.toUpperCase()}`);
    console.log(`   Prijs: €${bestOffer.total} (€${bestOffer.perPerson}/persoon)`);
    console.log(`   Vlucht: €${bestOffer.flight} | Hotel: €${bestOffer.hotel}`);
    
    console.log('\n' + '=' .repeat(80));
    console.log('\n🔗 WAT USER KRIJGT NA BETALING:\n');

    console.log('📊 OUDE AANPAK (generic deep link):');
    console.log('   ❌ URL: https://www.vliegticketaanbiedingen.nl/search?destination=turkije&date=2026-07-15&duration=10&adults=2&children=2');
    console.log('   ❌ User komt op generic search page');
    console.log('   ❌ User moet ZELF opnieuw configureren');
    console.log('   ❌ GEEN GARANTIE van dezelfde prijs');
    console.log('   ❌ GEEN GARANTIE van dezelfde hotel/vlucht');
    console.log('   ❌ User moet 10-20 minuten zoeken');

    console.log('\n📊 NIEUWE AANPAK (specific booking links):\n');

    console.log('✈️  VLUCHT:');
    console.log(`   ✅ URL: ${bestOffer.flightSearchUrl}`);
    console.log('   ✅ User komt op Google Flights met EXACTE zoekopdracht');
    console.log('   ✅ Alle vluchten voor AMS → IST, 15-25 juli, 2+2 personen');
    console.log('   ✅ User kiest vlucht → boekt direct');
    console.log('   ✅ Tijd: 2-3 minuten');

    console.log('\n🏨 HOTEL:');
    console.log(`   ✅ Hotel: ${bestOffer.hotelName} (${bestOffer.hotelRating || 'N/A'}⭐)`);
    console.log(`   ✅ URL: ${bestOffer.hotelLink || 'N/A'}`);
    console.log('   ✅ User komt DIRECT op hotel website');
    console.log('   ✅ Ziet EXACTE hotel met datums en gasten ingevuld');
    console.log('   ✅ Één klik "Book Now" → reservering');
    console.log('   ✅ Tijd: 1-2 minuten');

    console.log('\n' + '=' .repeat(80));
    console.log('\n💡 VERSCHIL:\n');

    console.log('❌ OUDE AANPAK:');
    console.log('   - User moet 10-20 minuten zoeken');
    console.log('   - Geen garantie van prijs/hotel');
    console.log('   - Frustratie als prijs anders is');
    console.log('   - Mogelijk geen boeking');

    console.log('\n✅ NIEUWE AANPAK:');
    console.log('   - User boekt in 3-5 minuten totaal');
    console.log('   - Exacte hotel + vluchten zoals beloofd');
    console.log('   - Hoge conversie (user boekt echt)');
    console.log('   - Tevreden klant → repeat business');

    console.log('\n' + '=' .repeat(80));
    console.log('\n🎯 VOOR ANDERE CONFIGURATORS (SearchAPI.io engines):\n');

    console.log('📋 BESCHIKBARE ENGINES:');
    console.log('   ✅ Google Jobs - ZAKELIJK configurator (recruitment)');
    console.log('   ✅ Google Finance - Finance configurator (investments)');
    console.log('   ✅ Google Events - Events/activities booking');
    console.log('   ✅ Google Local - Local services (plumbers, electricians)');
    console.log('   ✅ Airbnb - Vacation rentals (alternatief voor hotels)');
    console.log('   ✅ Google Shopping - Producten (al gebruikt!)');
    console.log('   ✅ Google Maps - Lokale bedrijven');

    console.log('\n💡 MOGELIJKHEDEN:');
    console.log('   1. ZAKELIJK: Google Jobs voor recruitment configurator');
    console.log('   2. FINANCE: Google Finance voor investment products');
    console.log('   3. VACATION: Airbnb API voor vacation rentals');
    console.log('   4. ENERGY/TELECOM: Google Local voor providers');
    console.log('   5. INSURANCE: Google Finance voor insurance products');

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ DEMO COMPLETED!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

demoBookingLinks();
