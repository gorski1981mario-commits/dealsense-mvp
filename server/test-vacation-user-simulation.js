/**
 * USER SIMULATION - Real vacation configurator flow
 * Shows exactly what a user gets when they configure a vacation
 */

require('dotenv').config();
const { getRealPricesForAllAgencies } = require('./market/vacation-api');
const { generateAllLinks } = require('./market/vacation-deeplinks');

async function simulateUserFlow() {
  console.log('\n👤 USER SIMULATION - Vacation Configurator\n');
  console.log('=' .repeat(80));
  
  // USER STORY: Familie van 4 personen wil naar Turkije in zomervakantie
  const userConfig = {
    destination: 'Turkije',
    departureAirport: 'AMS',
    departureDate: '2026-07-15', // Zomervakantie
    duration: 10, // 10 dagen
    adults: 2,
    children: 2,
    stars: '4',
    board: 'ai' // All Inclusive (belangrijk met kinderen!)
  };

  console.log('\n📝 USER CONFIGUREERT:');
  console.log(`   👨‍👩‍👧‍👦 Familie: ${userConfig.adults} volwassenen + ${userConfig.children} kinderen`);
  console.log(`   🌍 Bestemming: ${userConfig.destination}`);
  console.log(`   📅 Datum: ${userConfig.departureDate} (${userConfig.duration} dagen)`);
  console.log(`   ✈️  Vertrek: ${userConfig.departureAirport} (Amsterdam Schiphol)`);
  console.log(`   ⭐ Hotel: ${userConfig.stars} sterren, ${userConfig.board.toUpperCase()} (All Inclusive)`);
  console.log('\n' + '=' .repeat(80));

  try {
    console.log('\n🔍 DEALSENSE ZOEKT... (real-time via SearchAPI.io)\n');
    
    // Get REAL prices from SearchAPI.io (Google Flights + Hotels)
    const startTime = Date.now();
    const agencyPrices = await getRealPricesForAllAgencies(userConfig);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!agencyPrices) {
      console.log('❌ Geen prijzen gevonden');
      return;
    }

    // Convert to sorted array with deep links
    const offers = Object.entries(agencyPrices)
      .map(([agency, price]) => ({
        agency: agency,
        agencyDisplay: getAgencyDisplayName(agency),
        price: price.total,
        pricePerPerson: price.perPerson,
        flight: price.flight,
        hotel: price.hotel,
        url: buildDeepLink(agency, userConfig),
        source: price.source
      }))
      .sort((a, b) => a.price - b.price);

    const referencePrice = offers.find(o => o.agency === 'tui')?.price || offers[offers.length - 1].price;
    const bestPrice = offers[0].price;
    const maxSavings = referencePrice - bestPrice;

    console.log(`✅ GEVONDEN in ${searchTime}s - ${offers.length} reisorganisaties doorzocht`);
    console.log('\n' + '=' .repeat(80));

    // STEP 1: BEFORE PAYMENT - User sees TOP 3 with hidden agency names
    console.log('\n📊 STAP 1: VOOR BETALING (wat user ZIET):\n');
    console.log(`💰 Referentie prijs (TUI): €${referencePrice} totaal (€${Math.round(referencePrice/4)}/persoon)`);
    console.log(`🎯 Beste prijs gevonden: €${bestPrice} totaal (€${Math.round(bestPrice/4)}/persoon)`);
    console.log(`💸 Maximale besparing: €${maxSavings} (${Math.round((maxSavings/referencePrice)*100)}%)\n`);

    console.log('🏆 TOP 3 DEALS (reisorganisatie VERBORGEN 🔒):\n');
    offers.slice(0, 3).forEach((offer, i) => {
      const badge = i === 0 ? '🥇 BESTE PRIJS' : i === 1 ? '🥈 TWEEDE BESTE' : '🥉 DERDE BESTE';
      const savings = referencePrice - offer.price;
      const savingsPercent = Math.round((savings / referencePrice) * 100);
      
      console.log(`${badge}`);
      console.log(`   💶 Prijs: €${offer.price} totaal (€${offer.pricePerPerson}/persoon)`);
      console.log(`   ✈️  Vlucht: €${offer.flight} | 🏨 Hotel: €${offer.hotel}`);
      console.log(`   💸 Besparing: €${savings} (${savingsPercent}%)`);
      console.log(`   🔒 Reisorganisatie: VERBORGEN (betaal om te zien)`);
      console.log('');
    });

    console.log('💳 COMMISSIE:');
    const commission = 0.09; // 9% for PLUS/PRO/FINANCE
    const commissionAmount = Math.round(maxSavings * commission);
    const netSavings = maxSavings - commissionAmount;
    console.log(`   Maximale besparing: €${maxSavings}`);
    console.log(`   Commissie (9%): €${commissionAmount}`);
    console.log(`   Jouw netto besparing: €${netSavings}`);
    console.log(`   \n   👉 Betaal €${commissionAmount} om reisorganisaties te zien`);

    console.log('\n' + '=' .repeat(80));

    // STEP 2: AFTER PAYMENT - User sees agency names + booking links
    console.log('\n📊 STAP 2: NA BETALING (wat user KRIJGT):\n');
    console.log('✅ Toegang verkregen! Je kunt nu boeken bij:\n');

    offers.slice(0, 3).forEach((offer, i) => {
      const badge = i === 0 ? '🥇 BESTE DEAL' : i === 1 ? '🥈 TWEEDE BESTE' : '🥉 DERDE BESTE';
      const savings = referencePrice - offer.price;
      const savingsPercent = Math.round((savings / referencePrice) * 100);
      
      console.log(`${badge}`);
      console.log(`   🏢 Reisorganisatie: ${offer.agencyDisplay}`);
      console.log(`   💶 Prijs: €${offer.price} totaal (€${offer.pricePerPerson}/persoon)`);
      console.log(`   ✈️  Vlucht: €${offer.flight} | 🏨 Hotel: €${offer.hotel}`);
      console.log(`   💸 Besparing: €${savings} (${savingsPercent}%)`);
      console.log(`   🌐 Boek nu: ${offer.url}`);
      console.log(`   \n   👉 Klik "Boek bij ${offer.agencyDisplay}" → direct naar hun website`);
      console.log('');
    });

    console.log('=' .repeat(80));

    // COMPARISON: What user gets vs traditional search
    console.log('\n📈 WAT GEEFT DEALSENSE ANDERS DAN TRADITIONEEL ZOEKEN?\n');
    
    console.log('❌ TRADITIONEEL (Google/TUI.nl direct):');
    console.log(`   - User zoekt zelf op TUI.nl, Corendon.nl, Sunweb.nl, etc.`);
    console.log(`   - Tijd: 30-60 minuten (handmatig vergelijken)`);
    console.log(`   - Prijs: €${referencePrice} (gemiddeld bij grote spelers)`);
    console.log(`   - Geen garantie dat je de beste deal vindt`);
    console.log('');

    console.log('✅ MET DEALSENSE:');
    console.log(`   - AI zoekt automatisch bij ${offers.length} reisorganisaties`);
    console.log(`   - Tijd: ${searchTime}s (instant resultaten)`);
    console.log(`   - Prijs: €${bestPrice} (beste deal gegarandeerd)`);
    console.log(`   - Besparing: €${maxSavings} (${Math.round((maxSavings/referencePrice)*100)}%)`);
    console.log(`   - Direct booking link naar beste deals`);
    console.log(`   - Commissie: €${commissionAmount} (9% van besparing)`);
    console.log(`   - Netto voordeel: €${netSavings}`);
    console.log('');

    console.log('🎯 UNFAIR ADVANTAGES:');
    console.log(`   1. 📊 Real-time prijzen van ${offers.length} reisorganisaties (niet alleen grote spelers)`);
    console.log(`   2. 🤖 AI vergelijkt instant (${searchTime}s vs 30-60 min handmatig)`);
    console.log(`   3. 💰 Grootste besparingen bij niche spelers (${offers[0].agencyDisplay}: ${Math.round(((referencePrice-bestPrice)/referencePrice)*100)}% goedkoper)`);
    console.log(`   4. 🔗 Direct booking links (geen handmatig zoeken meer)`);
    console.log(`   5. 🎁 Betaal alleen commissie op besparing (niet op totale prijs)`);
    console.log(`   6. ✅ 100% transparant (zie exact wat je bespaart)`);

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ USER SIMULATION COMPLETED!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

function getAgencyDisplayName(agency) {
  const displayNames = {
    'tui': 'TUI', 'corendon': 'Corendon', 'sunweb': 'Sunweb',
    'dreizen': 'D-reizen', 'neckermann': 'Neckermann',
    'vakantiediscounter': 'Vakantiediscounter', 'eliza': 'Eliza was here',
    'kras': 'Kras', 'goedkope': 'Goedkopevliegtickets',
    'veilingen': 'Vakantieveilingen', 'budgetair': 'BudgetAir',
    'vliegtickets': 'Vliegtickets.nl', 'prijsvrij': 'Prijsvrij',
    'travelta': 'Travelta', 'vliegwinkel': 'De Vliegwinkel',
    'cheaptickets': 'CheapTickets', 'vlucht': 'Vlucht.nl',
    'vliegticketdirect': 'VliegticketDirect', 'ticketspy': 'TicketSpy',
    'vliegticketaanbiedingen': 'Vliegticketaanbiedingen',
    'reisgraag': 'Reisgraag', 'wegwijzer': 'Wegwijzer',
    'vakantieboulevard': 'Vakantieboulevard',
    'vliegticketzoeker': 'Vliegticketzoeker',
    'reisvoordeel': 'Reisvoordeel',
    'holidaydiscounter': 'HolidayDiscounter',
    'vakantieveilig': 'Vakantieveilig',
    'budgetvakantie': 'Budgetvakantie',
    'reisxl': 'ReisXL',
    'vakantiegigant': 'Vakantiegigant',
    'vakantiepiraat': 'Vakantiepiraat',
    'reisrevolutie': 'Reisrevolutie',
    'vliegdeals': 'Vliegdeals'
  };
  return displayNames[agency] || agency.charAt(0).toUpperCase() + agency.slice(1);
}

function buildDeepLink(agency, config) {
  const baseUrl = `https://www.${agency}.nl`;
  const params = new URLSearchParams({
    destination: config.destination.toLowerCase(),
    date: config.departureDate,
    duration: config.duration.toString(),
    adults: config.adults.toString(),
    children: (config.children || 0).toString()
  });
  return `${baseUrl}/search?${params.toString()}`;
}

simulateUserFlow();
