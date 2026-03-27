/**
 * WERYFIKACJA SEARCHAPI - CZY TO PRAWDZIWE PRODUKTY
 * 
 * Sprawdzamy:
 * 1. Czy to prawdziwe produkty (nie moki)
 * 2. Czy ceny są realne
 * 3. Czy to nie są części/akcesoria
 * 4. Czy opisy się zgadzają
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const SEARCHAPI_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

async function verifyProduct(productName, expectedPrice) {
  try {
    console.log('\n' + '='.repeat(80));
    console.log(`🔍 WERYFIKACJA: ${productName}`);
    console.log(`Expected price: €${expectedPrice}`);
    console.log('='.repeat(80));
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google_shopping',
        q: productName,
        api_key: SEARCHAPI_KEY,
        gl: 'nl',
        hl: 'nl',
        num: 10
      },
      timeout: 10000
    });

    const results = response.data.shopping_results || [];
    
    if (results.length === 0) {
      console.log('❌ No results');
      return;
    }

    console.log(`\n✅ Found ${results.length} results\n`);

    // Analyze top 5 offers
    const topOffers = results.slice(0, 5);
    
    topOffers.forEach((offer, i) => {
      console.log(`\n[${i+1}] ${offer.title}`);
      console.log(`    Shop: ${offer.seller || 'Unknown'}`);
      console.log(`    Price: ${offer.price} (extracted: €${offer.extracted_price})`);
      console.log(`    Link: ${offer.product_link}`);
      
      if (offer.rating) {
        console.log(`    Rating: ${offer.rating} ⭐ (${offer.reviews || 0} reviews)`);
      }
      
      if (offer.delivery_return) {
        console.log(`    Delivery: ${offer.delivery_return}`);
      }
      
      if (offer.condition) {
        console.log(`    ⚠️  Condition: ${offer.condition}`);
      }
      
      // Check if it's an accessory
      const title = offer.title.toLowerCase();
      const isAccessory = 
        title.includes('hoes') || 
        title.includes('case') || 
        title.includes('cover') ||
        title.includes('kabel') ||
        title.includes('cable') ||
        title.includes('adapter') ||
        title.includes('oplader') ||
        title.includes('charger') ||
        title.includes('screen protector') ||
        title.includes('screenprotector') ||
        title.includes('band') ||
        title.includes('bandje') ||
        title.includes('strap');
      
      if (isAccessory) {
        console.log(`    🚨 WARNING: Mogelijk accessoire!`);
      }
      
      // Check if price is realistic
      const priceRatio = offer.extracted_price / expectedPrice;
      if (priceRatio < 0.3) {
        console.log(`    🚨 WARNING: Cena bardzo niska (${(priceRatio * 100).toFixed(0)}% expected) - możliwe accessoire lub używane`);
      } else if (priceRatio > 1.5) {
        console.log(`    🚨 WARNING: Cena bardzo wysoka (${(priceRatio * 100).toFixed(0)}% expected) - możliwy bundle lub premium`);
      } else {
        console.log(`    ✅ Cena realistyczna (${(priceRatio * 100).toFixed(0)}% expected)`);
      }
    });

    // Summary
    console.log('\n' + '-'.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('-'.repeat(80));
    
    const accessories = topOffers.filter(o => {
      const title = o.title.toLowerCase();
      return title.includes('hoes') || title.includes('case') || title.includes('cover') ||
             title.includes('kabel') || title.includes('cable') || title.includes('adapter') ||
             title.includes('oplader') || title.includes('charger') || title.includes('band');
    });
    
    const used = topOffers.filter(o => o.condition && o.condition.toLowerCase().includes('tweedehands'));
    
    const realistic = topOffers.filter(o => {
      const ratio = o.extracted_price / expectedPrice;
      return ratio >= 0.3 && ratio <= 1.5;
    });
    
    console.log(`Accessories: ${accessories.length}/${topOffers.length}`);
    console.log(`Used/Tweedehands: ${used.length}/${topOffers.length}`);
    console.log(`Realistic prices: ${realistic.length}/${topOffers.length}`);
    
    const validOffers = topOffers.filter(o => {
      const title = o.title.toLowerCase();
      const isAccessory = title.includes('hoes') || title.includes('case') || title.includes('kabel');
      const isUsed = o.condition && o.condition.toLowerCase().includes('tweedehands');
      const ratio = o.extracted_price / expectedPrice;
      const isRealistic = ratio >= 0.3 && ratio <= 1.5;
      
      return !isAccessory && !isUsed && isRealistic;
    });
    
    console.log(`\n✅ VALID OFFERS: ${validOffers.length}/${topOffers.length}`);
    
    if (validOffers.length > 0) {
      console.log('\nValid offers:');
      validOffers.forEach(o => {
        console.log(`  - ${o.seller}: €${o.extracted_price} - ${o.title}`);
      });
    }
    
    // Save detailed report
    const report = {
      product: productName,
      expectedPrice,
      totalResults: results.length,
      topOffers: topOffers.map(o => ({
        title: o.title,
        seller: o.seller,
        price: o.extracted_price,
        condition: o.condition,
        rating: o.rating,
        reviews: o.reviews,
        link: o.product_link
      })),
      analysis: {
        accessories: accessories.length,
        used: used.length,
        realistic: realistic.length,
        valid: validOffers.length
      }
    };
    
    fs.writeFileSync(
      `verification-${productName.replace(/\s+/g, '-').toLowerCase()}.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n💾 Saved to verification-${productName.replace(/\s+/g, '-').toLowerCase()}.json`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function runVerification() {
  console.log('\n🔍 SEARCHAPI VERIFICATION - PRAWDZIWE PRODUKTY?\n');
  
  // Test 3 różne produkty
  await verifyProduct('iPhone 15', 879);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await verifyProduct('Dyson V15', 599);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await verifyProduct('Samsung Galaxy S24', 899);
  
  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 FINAL VERDICT:');
  console.log('='.repeat(80));
  console.log('\nSprawdź pliki verification-*.json dla szczegółów');
  console.log('Zweryfikuj linki manualnie w przeglądarce');
  console.log('\n');
}

runVerification().catch(console.error);
