require("dotenv").config();
const { fetchOffersByCategory } = require('./categories/categoryOrchestrator');

const TEST_PRODUCTS = [
  {
    name: 'Philips Sonicare DiamondClean',
    ean: '0622233667878', // Philips Sonicare EAN (dom)
    basePrice: 199.00,
    baseSeller: 'bol.com',
    description: 'Philips Sonicare - dom'
  },
  {
    name: 'Yoga mat',
    ean: '8719154661028', // Yoga mat EAN (sport)
    basePrice: 29.95,
    baseSeller: null,
    description: 'Yoga mat - sport'
  },
  {
    name: 'Harry Potter and the Philosophers Stone',
    ean: '9781408855652', // Harry Potter EAN (książki)
    basePrice: 12.99,
    baseSeller: null,
    description: 'Harry Potter - książki'
  },
  {
    name: 'L\'Oreal Paris Revitalift',
    ean: '3600522419235', // L'Oreal EAN (kosmetyki)
    basePrice: 24.95,
    baseSeller: null,
    description: 'L\'Oreal - kosmetyki'
  },
  {
    name: 'Bosch Cordless Drill',
    ean: '3165140498255', // Bosch EAN (narzędzia)
    basePrice: 149.99,
    baseSeller: null,
    description: 'Bosch - narzędzia'
  }
];

async function testProducts() {
  console.log('='.repeat(80));
  console.log('TEST FILTRÓW - LOKALNY');
  console.log('='.repeat(80));
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const product = TEST_PRODUCTS[i];
    console.log(`\nTest ${i + 1}/${TEST_PRODUCTS.length}: ${product.name}`);
    console.log('-'.repeat(80));
    console.log(`EAN: ${product.ean}`);
    console.log(`Cena bazowa: €${product.basePrice}`);
    console.log(`Sklep bazowy: ${product.baseSeller || 'Brak'}`);
    
    try {
      const result = await fetchOffersByCategory(product.name, product.ean, product.basePrice, product.baseSeller);

      console.log(`\nKATEGORIA: ${result.category}`);
      console.log(`Oferty znalezione: ${result.totalOffers}`);

      if (result.success && result.offers.length > 0) {
        console.log('\n4 sklepy (hierarchia):');
        console.log('PRODUKT: ' + product.name);
        console.log('Cena bazowa: €' + product.basePrice);
        console.log('Sklep bazowy: ' + (product.baseSeller || 'Brak'));
        console.log('-'.repeat(80));
        result.offers.slice(0, 4).forEach((offer, idx) => {
          const seller = offer.seller || 'Unknown';
          const price = offer.price || 0;
          const savings = (product.basePrice - price).toFixed(2);
          const type = idx === 0 ? 'BASE' : (idx === 1 ? 'BEST' : (idx === 2 ? 'MID' : 'WORST'));
          console.log('  ' + (idx + 1) + '. ' + type + ': ' + seller + ': €' + price + ' (savings: €' + savings + ')');
        });
      } else {
        console.log('❌ Brak ofert');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('TESTY ZAKOŃCZONE');
  console.log('='.repeat(80));
}

testProducts().catch(console.error);
