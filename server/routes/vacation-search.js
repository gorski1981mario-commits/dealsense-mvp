/**
 * VACATION SEARCH ENDPOINT - Real-time prices from SearchAPI.io
 * 
 * POST /api/vacation/search
 * Returns real vacation prices from Google Flights + Hotels
 */

const express = require('express');
const router = express.Router();
const { getRealVacationPrice, getRealPricesForAllAgencies } = require('../market/vacation-api');

/**
 * POST /api/vacation/search
 * Get real-time vacation prices
 */
router.post('/api/vacation/search', async (req, res) => {
  try {
    const {
      destination,
      departureAirport,
      departureDate,
      duration,
      adults,
      children,
      stars,
      board,
      packageType,
      userId
    } = req.body;

    // Validate required fields
    if (!destination || !departureAirport || !departureDate || !duration || !adults) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['destination', 'departureAirport', 'departureDate', 'duration', 'adults']
      });
    }

    console.log(`[Vacation Search] ${userId || 'anonymous'} searching: ${destination}, ${duration} days, ${adults} adults`);

    // Get real prices from SearchAPI.io (Google Flights + Hotels)
    const config = {
      destination,
      departureAirport,
      departureDate,
      duration,
      adults,
      children: children || 0,
      stars: stars || '4',
      board: board || 'ai'
    };

    // Get prices for all agencies (35 agencies)
    const agencyPrices = await getRealPricesForAllAgencies(config);

    if (!agencyPrices) {
      console.warn('[Vacation Search] No prices found');
      return res.status(404).json({
        success: false,
        error: 'No vacation prices found',
        message: 'Could not find prices for this configuration. Try different dates or destination.',
        offers: []
      });
    }

    // Convert to array and sort by price (cheapest first)
    const offers = Object.entries(agencyPrices)
      .map(([agency, price]) => ({
        agency: agency,
        agencyDisplay: getAgencyDisplayName(agency),
        price: price.total,
        pricePerPerson: price.perPerson,
        flight: price.flight,
        hotel: price.hotel,
        url: getAgencyUrl(agency, config),
        isEstimated: price.isEstimated,
        source: price.source
      }))
      .sort((a, b) => a.price - b.price);

    // Get reference price (most expensive = TUI or similar)
    const referenceOffer = offers.find(o => o.agency === 'tui') || offers[offers.length - 1];
    const referencePrice = referenceOffer.price;

    // Get best price (cheapest)
    const bestPrice = offers[0].price;
    const maxSavings = referencePrice - bestPrice;

    // Add savings to each offer
    const offersWithSavings = offers.map(offer => ({
      ...offer,
      savings: referencePrice - offer.price,
      savingsPercent: Math.round(((referencePrice - offer.price) / referencePrice) * 100)
    }));

    // Return TOP 3 for display
    const topOffers = offersWithSavings.slice(0, 3);

    console.log(`[Vacation Search] Found ${offers.length} offers, TOP 3: €${topOffers[0].price} - €${topOffers[2].price}`);

    return res.json({
      success: true,
      offers: topOffers,
      allOffers: offersWithSavings, // All 35 agencies for backend use
      basePrice: bestPrice,
      referencePrice: referencePrice,
      maxSavings: maxSavings,
      savingsPercent: Math.round((maxSavings / referencePrice) * 100),
      cached: false, // Always fresh from SearchAPI.io
      timestamp: Date.now(),
      config: {
        destination,
        departureAirport,
        departureDate,
        duration,
        adults,
        children,
        stars,
        board
      }
    });

  } catch (error) {
    console.error('[Vacation Search Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get display name for agency
 */
function getAgencyDisplayName(agency) {
  const displayNames = {
    'tui': 'TUI',
    'corendon': 'Corendon',
    'sunweb': 'Sunweb',
    'dreizen': 'D-reizen',
    'neckermann': 'Neckermann',
    'vakantiediscounter': 'Vakantiediscounter',
    'eliza': 'Eliza was here',
    'kras': 'Kras',
    'goedkope': 'Goedkopevliegtickets',
    'veilingen': 'Vakantieveilingen',
    'budgetair': 'BudgetAir',
    'vliegtickets': 'Vliegtickets.nl',
    'prijsvrij': 'Prijsvrij',
    'travelta': 'Travelta',
    'vliegwinkel': 'De Vliegwinkel',
    'cheaptickets': 'CheapTickets',
    'vlucht': 'Vlucht.nl',
    'vliegticketdirect': 'VliegticketDirect',
    'ticketspy': 'TicketSpy',
    'vliegticketaanbiedingen': 'Vliegticketaanbiedingen',
    'reisgraag': 'Reisgraag',
    'wegwijzer': 'Wegwijzer',
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

/**
 * Get agency URL with deep link to specific vacation configuration
 */
function getAgencyUrl(agency, config) {
  const baseUrls = {
    'tui': 'https://www.tui.nl',
    'corendon': 'https://www.corendon.nl',
    'sunweb': 'https://www.sunweb.nl',
    'dreizen': 'https://www.d-reizen.nl',
    'neckermann': 'https://www.neckermann.nl',
    'vakantiediscounter': 'https://www.vakantiediscounter.nl',
    'eliza': 'https://www.elizawashere.nl',
    'kras': 'https://www.kras.nl',
    'goedkope': 'https://www.goedkopevliegtickets.nl',
    'veilingen': 'https://www.vakantieveilingen.nl',
    'budgetair': 'https://www.budgetair.nl',
    'vliegtickets': 'https://www.vliegtickets.nl',
    'prijsvrij': 'https://www.prijsvrij.nl',
    'travelta': 'https://www.travelta.nl',
    'vliegwinkel': 'https://www.vliegwinkel.nl',
    'cheaptickets': 'https://www.cheaptickets.nl',
    'vlucht': 'https://www.vlucht.nl',
    'vliegticketdirect': 'https://www.vliegticketdirect.nl',
    'ticketspy': 'https://www.ticketspy.nl',
    'vliegticketaanbiedingen': 'https://www.vliegticketaanbiedingen.nl',
    'reisgraag': 'https://www.reisgraag.nl',
    'wegwijzer': 'https://www.wegwijzer.nl',
    'vakantieboulevard': 'https://www.vakantieboulevard.nl',
    'vliegticketzoeker': 'https://www.vliegticketzoeker.nl',
    'reisvoordeel': 'https://www.reisvoordeel.nl',
    'holidaydiscounter': 'https://www.holidaydiscounter.nl',
    'vakantieveilig': 'https://www.vakantieveilig.nl',
    'budgetvakantie': 'https://www.budgetvakantie.nl',
    'reisxl': 'https://www.reisxl.nl',
    'vakantiegigant': 'https://www.vakantiegigant.nl',
    'vakantiepiraat': 'https://www.vakantiepiraat.nl',
    'reisrevolutie': 'https://www.reisrevolutie.nl',
    'vliegdeals': 'https://www.vliegdeals.nl'
  };

  const baseUrl = baseUrls[agency] || `https://www.${agency}.nl`;
  
  // Build deep link with search parameters
  // Format: /search?destination=turkije&date=2026-06-15&duration=7&adults=2&children=0
  const params = new URLSearchParams({
    destination: config.destination,
    date: config.departureDate,
    duration: config.duration.toString(),
    adults: config.adults.toString(),
    children: (config.children || 0).toString()
  });

  return `${baseUrl}/search?${params.toString()}`;
}

module.exports = router;
