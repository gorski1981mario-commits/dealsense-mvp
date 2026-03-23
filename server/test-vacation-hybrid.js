const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");

/**
 * OPTYMALNA HYBRYDOWA STRATEGIA DLA WAKACJI
 * 
 * 3-POZIOMOWY SYSTEM:
 * 1. Google Shopping - gotowe pakiety wakacyjne (BEST)
 * 2. Google Flights - loty z cenami (BACKUP)
 * 3. Szacowanie hotelu - na podstawie klasy i board type (FALLBACK)
 */

const API_KEY = 'TxZ91oHM53qcbiMvcWpD8vVQ';

// Konfiguracja wakacji (z konfiguratora)
const vacationConfig = {
  adults: 2,
  children: 1,
  childrenAges: [5],
  destination: 'Turkije',
  departureDate: '2026-06-01',
  duration: 7,
  transport: 'flight',
  accommodationType: 'hotel',
  stars: '4',
  board: 'all_inclusive',
  extras: ['free_cancellation', 'pool', 'wifi']
};

// POZIOM 1: Google Shopping - gotowe pakiety
async function fetchVacationPackages(config) {
  console.log('🛒 POZIOM 1: Google Shopping - szukam gotowych pakietów...');
  console.log('');
  
  const queries = [
    `${config.destination} vakantie all inclusive ${config.duration} dagen`,
    `${config.destination} reis ${config.stars} sterren all inclusive`,
    `vakantie ${config.destination} ${config.adults} personen all inclusive`
  ];
  
  for (const query of queries) {
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        num: 20,
        api_key: API_KEY
      };
      
      const response = await axios.get('https://www.searchapi.io/api/v1/search', {
        params,
        timeout: 30000
      });
      
      const results = response.data.shopping_results || [];
      
      // Filter vacation packages
      const packages = results.filter(item => {
        const title = (item.title || '').toLowerCase();
        const price = item.extracted_price || 0;
        
        // Must be vacation package (not just tour)
        const isPackage = (title.includes('vakantie') || title.includes('reis')) &&
                         (title.includes('all inclusive') || title.includes('hotel'));
        
        // Must have reasonable price (€500-€5000 for 7 days)
        const hasPrice = price >= 500 && price <= 5000;
        
        return isPackage && hasPrice;
      });
      
      if (packages.length > 0) {
        console.log(`✅ Znaleziono ${packages.length} pakietów wakacyjnych!`);
        console.log('');
        
        return packages.map(pkg => ({
          type: 'package',
          title: pkg.title,
          price: pkg.extracted_price,
          seller: pkg.seller,
          url: pkg.product_link,
          includes: ['flight', 'hotel', 'all_inclusive'],
          source: 'google_shopping'
        }));
      }
      
    } catch (error) {
      console.log(`⚠️  Query "${query}" failed:`, error.message);
    }
  }
  
  console.log('❌ Brak gotowych pakietów w Google Shopping');
  console.log('');
  return [];
}

// POZIOM 2: Google Flights - loty
async function fetchFlightPrice(config) {
  console.log('✈️  POZIOM 2: Google Flights - szukam lotów...');
  console.log('');
  
  // Map destination to airport code
  const airportMap = {
    'Turkije': 'AYT',  // Antalya
    'Spanje': 'AGP',   // Malaga
    'Griekenland': 'HER', // Heraklion
    'Egypte': 'SSH'    // Sharm el-Sheikh
  };
  
  const arrivalId = airportMap[config.destination] || 'AYT';
  const checkOutDate = new Date(new Date(config.departureDate).getTime() + config.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const params = {
      engine: 'google_flights',
      departure_id: 'AMS',
      arrival_id: arrivalId,
      outbound_date: config.departureDate,
      return_date: checkOutDate,
      adults: config.adults,
      children: config.children,
      currency: 'EUR',
      gl: 'nl',
      hl: 'nl',
      api_key: API_KEY
    };
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params,
      timeout: 30000
    });
    
    const bestFlights = response.data.best_flights || [];
    
    if (bestFlights.length > 0) {
      const cheapest = bestFlights[0];
      console.log(`✅ Znaleziono lot: €${cheapest.price}`);
      console.log('');
      
      return {
        type: 'flight',
        price: cheapest.price,
        airline: cheapest.flights?.[0]?.airline || 'N/A',
        duration: cheapest.total_duration,
        source: 'google_flights'
      };
    }
    
  } catch (error) {
    console.log('⚠️  Google Flights error:', error.message);
  }
  
  console.log('❌ Brak lotów w Google Flights');
  console.log('');
  return null;
}

// POZIOM 3: Szacowanie ceny hotelu
function estimateHotelPrice(config) {
  console.log('🏨 POZIOM 3: Szacowanie ceny hotelu...');
  console.log('');
  
  // Base prices per night (Turcja, różne klasy)
  const basePrices = {
    '2': 30,
    '3': 50,
    '4': 70,
    '5': 120
  };
  
  // Board type multipliers
  const boardMultipliers = {
    'room_only': 1.0,
    'breakfast': 1.2,
    'half_board': 1.5,
    'all_inclusive': 1.8
  };
  
  const basePrice = basePrices[config.stars] || 50;
  const multiplier = boardMultipliers[config.board] || 1.0;
  const pricePerNight = Math.round(basePrice * multiplier);
  const totalPrice = pricePerNight * config.duration;
  
  console.log(`✅ Szacowana cena: €${pricePerNight}/noc × ${config.duration} dni = €${totalPrice}`);
  console.log('');
  
  return {
    type: 'hotel_estimate',
    pricePerNight: pricePerNight,
    totalPrice: totalPrice,
    stars: config.stars,
    board: config.board,
    isEstimated: true,
    source: 'estimation'
  };
}

// GŁÓWNA FUNKCJA HYBRYDOWA
async function getVacationOffers(config) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          OPTYMALNA HYBRYDOWA STRATEGIA - TEST WAKACJI                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 KONFIGURACJA:');
  console.log(`   Destination: ${config.destination}`);
  console.log(`   Dates: ${config.departureDate} - ${config.duration} dni`);
  console.log(`   Passengers: ${config.adults} adults, ${config.children} children`);
  console.log(`   Hotel: ${config.stars} stars, ${config.board}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  // POZIOM 1: Gotowe pakiety
  const packages = await fetchVacationPackages(config);
  
  if (packages.length > 0) {
    console.log('🎉 SUKCES - POZIOM 1!');
    console.log('');
    console.log('Znaleziono gotowe pakiety wakacyjne:');
    console.log('');
    
    packages.slice(0, 3).forEach((pkg, i) => {
      console.log(`${i + 1}. ${pkg.title}`);
      console.log(`   Cena: €${pkg.price}`);
      console.log(`   Seller: ${pkg.seller}`);
      console.log(`   Includes: ${pkg.includes.join(', ')}`);
      console.log('');
    });
    
    return {
      strategy: 'packages',
      offers: packages,
      totalPrice: packages[0].price,
      confidence: 'high',
      includes: ['flight', 'hotel', 'all_inclusive']
    };
  }
  
  // POZIOM 2 + 3: Flights + Hotel estimate
  console.log('⚠️  Brak gotowych pakietów - używam POZIOM 2 + 3');
  console.log('');
  
  const flight = await fetchFlightPrice(config);
  const hotel = estimateHotelPrice(config);
  
  if (flight) {
    const totalPrice = flight.price + hotel.totalPrice;
    
    console.log('═'.repeat(80));
    console.log('');
    console.log('🎉 SUKCES - POZIOM 2 + 3!');
    console.log('');
    console.log('BREAKDOWN:');
    console.log(`   ✈️  Lot: €${flight.price} (${flight.airline})`);
    console.log(`   🏨 Hotel: €${hotel.totalPrice} (${hotel.stars} stars, ${hotel.board})`);
    console.log(`   💰 TOTAL: €${totalPrice}`);
    console.log('');
    console.log('⚠️  UWAGA: Cena hotelu jest szacowana!');
    console.log('');
    
    return {
      strategy: 'hybrid',
      flight: flight,
      hotel: hotel,
      totalPrice: totalPrice,
      confidence: 'medium',
      includes: ['flight', 'hotel_estimated'],
      disclaimer: 'Cena hotelu jest szacowana. Finalna cena może się różnić.'
    };
  }
  
  console.log('❌ BŁĄD: Nie udało się znaleźć ani pakietów ani lotów!');
  return null;
}

// RUN TEST
getVacationOffers(vacationConfig)
  .then(result => {
    console.log('═'.repeat(80));
    console.log('');
    console.log('📊 FINALNE WYNIKI:');
    console.log('');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('✅ TEST ZAKOŃCZONY!');
  })
  .catch(error => {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  });
