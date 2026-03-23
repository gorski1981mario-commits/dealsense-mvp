/**
 * TEST: Holenderskie pakiety wakacyjne z Google Shopping
 * 
 * BIURA PODRÓŻY:
 * - TUI.nl
 * - Corendon.nl
 * - Sunweb.nl
 * - D-reizen.nl
 * - Prijsvrij.nl
 * 
 * STRATEGIA:
 * User buduje profil → My znajdujemy pakiety → Redirect do biura podróży
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });
const axios = require("axios");

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

// Profil wakacji (z konfiguratora)
const vacationProfile = {
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

async function searchVacationPackages(profile) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         HOLENDERSKIE PAKIETY WAKACYJNE - Google Shopping                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 PROFIL WAKACJI:');
  console.log(`   Destination: ${profile.destination}`);
  console.log(`   Dates: ${profile.departureDate} - ${profile.duration} dni`);
  console.log(`   Passengers: ${profile.adults} adults, ${profile.children} children (${profile.childrenAges.join(', ')} lat)`);
  console.log(`   Hotel: ${profile.stars} sterren, ${profile.board}`);
  console.log(`   Departure: ${profile.departureAirport}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  
  // Generuj różne queries dla holenderskich biur podróży
  const queries = [
    // TUI specific
    `TUI ${profile.destination} ${profile.duration} dagen all inclusive ${profile.adults} personen`,
    `TUI vakantie ${profile.destination} ${profile.stars} sterren all inclusive`,
    
    // Corendon specific
    `Corendon ${profile.destination} all inclusive ${profile.duration} dagen`,
    `Corendon reis ${profile.destination} ${profile.stars} sterren`,
    
    // Sunweb specific
    `Sunweb ${profile.destination} vakantie all inclusive`,
    `Sunweb ${profile.destination} ${profile.duration} dagen ${profile.adults} personen`,
    
    // Generic (catches all travel agencies)
    `${profile.destination} vakantie all inclusive ${profile.duration} dagen ${profile.adults} personen`,
    `${profile.destination} reis ${profile.stars} sterren all inclusive vertrek Amsterdam`,
    `all inclusive vakantie ${profile.destination} ${profile.duration} dagen`,
    
    // D-reizen, Prijsvrij
    `D-reizen ${profile.destination} all inclusive`,
    `Prijsvrij ${profile.destination} vakantie`
  ];
  
  const allPackages = [];
  
  for (const query of queries) {
    console.log(`🔍 Query: "${query}"`);
    
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        num: 30,
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
        const seller = (item.source || '').toLowerCase();
        
        // Must be vacation package
        const isPackage = (title.includes('vakantie') || title.includes('reis') || title.includes('all inclusive')) &&
                         !title.includes('verzekering') && // nie ubezpieczenie
                         !title.includes('boek') && // nie książka
                         !title.includes('gids'); // nie przewodnik
        
        // Must have reasonable price (€300-€5000 for 7 days)
        const hasPrice = price >= 300 && price <= 5000;
        
        // Prefer known travel agencies
        const isTravelAgency = seller.includes('tui') || 
                              seller.includes('corendon') || 
                              seller.includes('sunweb') ||
                              seller.includes('d-reizen') ||
                              seller.includes('prijsvrij') ||
                              seller.includes('vakantie');
        
        return isPackage && hasPrice;
      });
      
      if (packages.length > 0) {
        console.log(`   ✅ Found ${packages.length} packages`);
        allPackages.push(...packages);
      } else {
        console.log(`   ❌ No packages found`);
      }
      
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('═'.repeat(80));
  console.log('');
  console.log('📊 WYNIKI:');
  console.log('');
  
  if (allPackages.length === 0) {
    console.log('❌ Brak pakietów wakacyjnych');
    return [];
  }
  
  // Deduplicate by title + price
  const uniquePackages = [];
  const seen = new Set();
  
  for (const pkg of allPackages) {
    const key = `${pkg.title}-${pkg.extracted_price}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePackages.push(pkg);
    }
  }
  
  // Sort by price (cheapest first)
  uniquePackages.sort((a, b) => (a.extracted_price || 0) - (b.extracted_price || 0));
  
  console.log(`✅ Znaleziono ${uniquePackages.length} unikalnych pakietów wakacyjnych`);
  console.log('');
  
  // Show top 10
  const top10 = uniquePackages.slice(0, 10);
  
  top10.forEach((pkg, i) => {
    console.log(`${i + 1}. ${pkg.title}`);
    console.log(`   💰 Cena: €${pkg.extracted_price}`);
    console.log(`   🏢 Seller: ${pkg.source}`);
    console.log(`   🔗 Link: ${pkg.link}`);
    console.log('');
  });
  
  // Analyze by travel agency
  console.log('═'.repeat(80));
  console.log('');
  console.log('📈 ANALIZA PO BIURACH PODRÓŻY:');
  console.log('');
  
  const agencies = {
    'TUI': uniquePackages.filter(p => (p.source || '').toLowerCase().includes('tui')),
    'Corendon': uniquePackages.filter(p => (p.source || '').toLowerCase().includes('corendon')),
    'Sunweb': uniquePackages.filter(p => (p.source || '').toLowerCase().includes('sunweb')),
    'D-reizen': uniquePackages.filter(p => (p.source || '').toLowerCase().includes('d-reizen')),
    'Prijsvrij': uniquePackages.filter(p => (p.source || '').toLowerCase().includes('prijsvrij')),
    'Inne': uniquePackages.filter(p => {
      const seller = (p.source || '').toLowerCase();
      return !seller.includes('tui') && 
             !seller.includes('corendon') && 
             !seller.includes('sunweb') &&
             !seller.includes('d-reizen') &&
             !seller.includes('prijsvrij');
    })
  };
  
  for (const [agency, packages] of Object.entries(agencies)) {
    if (packages.length > 0) {
      const avgPrice = Math.round(packages.reduce((sum, p) => sum + (p.extracted_price || 0), 0) / packages.length);
      const minPrice = Math.min(...packages.map(p => p.extracted_price || 0));
      const maxPrice = Math.max(...packages.map(p => p.extracted_price || 0));
      
      console.log(`${agency}:`);
      console.log(`   Pakiety: ${packages.length}`);
      console.log(`   Cena min: €${minPrice}`);
      console.log(`   Cena avg: €${avgPrice}`);
      console.log(`   Cena max: €${maxPrice}`);
      console.log('');
    }
  }
  
  return uniquePackages;
}

// RUN TEST
searchVacationPackages(vacationProfile).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
