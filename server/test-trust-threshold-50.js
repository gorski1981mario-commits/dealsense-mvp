/**
 * TEST TRUST THRESHOLD = 50
 * Sprawdzamy czy podejrzane sklepy są odrzucone
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');
const { getTrustScore } = require('./scoring/trustEngine');

const PRODUCTS = [
  {
    name: 'Adidas Ultraboost 23',
    basePrice: 190.00,
    baseSeller: 'Bol.com',
    category: 'Sportschoenen'
  },
  {
    name: 'Oral-B Pro 3',
    basePrice: 79.00,
    baseSeller: 'DA',
    category: 'Tandverzorging'
  },
  {
    name: 'Lego Star Wars Millennium Falcon',
    basePrice: 179.00,
    baseSeller: 'Bart Smit',
    category: 'Speelgoed'
  },
  {
    name: 'Bosch PSR 1800',
    basePrice: 159.00,
    baseSeller: 'Gamma',
    category: 'Gereedschap'
  },
  {
    name: 'Harry Potter Complete Collection',
    basePrice: 89.00,
    baseSeller: 'Bol.com',
    category: 'Boeken'
  }
];

async function testProduct(product, index) {
  console.log('\n' + '═'.repeat(100));
  console.log(`TEST ${index + 1}/5: ${product.name}`);
  console.log('═'.repeat(100));
  console.log(`Categorie: ${product.category}`);
  console.log(`Prijs in winkel: €${product.basePrice} (${product.baseSeller})`);
  console.log('─'.repeat(100));
  
  const startTime = Date.now();
  
  try {
    const result = await fetchMarketOffers(product.name, null, {
      basePrice: product.basePrice,
      baseSeller: product.baseSeller,
      userId: 'test-user',
      maxResults: 30
    });
    
    const duration = Date.now() - startTime;
    
    if (!result || !result.offers || result.offers.length === 0) {
      console.log(`\n❌ BRAK OFERT (${duration}ms)`);
      console.log(`   Wszystkie sklepy odrzucone przez Trust filter (< 50)`);
      return {
        product: product.name,
        success: false,
        offers: 0,
        duration
      };
    }
    
    const offers = result.offers;
    
    console.log(`\n✅ ${offers.length} OFERT (${duration}ms)\n`);
    
    // Sprawdź Trust Score dla każdej oferty
    console.log('🛡️  TRUST SCORES:\n');
    
    offers.slice(0, 5).forEach((offer, idx) => {
      const trustScore = getTrustScore(offer);
      const passed = trustScore >= 50 ? '✅' : '❌';
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      
      console.log(`${idx + 1}. ${offer.seller}`);
      console.log(`   ${passed} Trust: ${trustScore}/100 ${trustScore >= 50 ? '(PASSED)' : '(FAILED)'}`);
      console.log(`   €${offer.price.toFixed(2)} (besparing: €${savings.toFixed(2)} / ${savingsPercent.toFixed(1)}%)`);
      
      // Pokaż dlaczego dostał taki Trust
      if (trustScore >= 85) {
        console.log(`   → Trusted Seller (gigant)`);
      } else if (trustScore >= 50) {
        console.log(`   → Sprawdzony sklep (reviews, HTTPS, NL)`);
      } else {
        console.log(`   → ODRZUCONY (nowy/podejrzany sklep)`);
      }
      console.log('');
    });
    
    // Statystyki Trust
    const trustScores = offers.map(o => getTrustScore(o));
    const avgTrust = trustScores.reduce((sum, t) => sum + t, 0) / trustScores.length;
    const minTrust = Math.min(...trustScores);
    const maxTrust = Math.max(...trustScores);
    
    console.log('─'.repeat(100));
    console.log('\n📊 TRUST STATISTICS:');
    console.log(`   Średni Trust: ${avgTrust.toFixed(1)}/100`);
    console.log(`   Min Trust: ${minTrust}/100`);
    console.log(`   Max Trust: ${maxTrust}/100`);
    console.log(`   Wszystkie >= 50: ${minTrust >= 50 ? '✅ TAK' : '❌ NIE'}`);
    
    // TOP 3
    console.log('\n💰 TOP 3 AANBIEDINGEN:\n');
    offers.slice(0, 3).forEach((offer, idx) => {
      const savings = product.basePrice - offer.price;
      const savingsPercent = (savings / product.basePrice) * 100;
      const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      const trustScore = getTrustScore(offer);
      
      console.log(`${icon} ${offer.seller}`);
      console.log(`   €${offer.price.toFixed(2)} (besparing: €${savings.toFixed(2)} / ${savingsPercent.toFixed(1)}%)`);
      console.log(`   Trust: ${trustScore}/100`);
      console.log('');
    });
    
    return {
      product: product.name,
      success: true,
      offers: offers.length,
      avgTrust,
      minTrust,
      maxTrust,
      duration
    };
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    return {
      product: product.name,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(100));
  console.log('█  TEST TRUST THRESHOLD = 50'.padEnd(99) + '█');
  console.log('█  Sprawdzamy czy podejrzane sklepy są odrzucone'.padEnd(99) + '█');
  console.log('█'.repeat(100));
  
  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i);
    results.push(result);
    
    if (i < PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Podsumowanie
  console.log('\n\n' + '█'.repeat(100));
  console.log('█  FINAAL OVERZICHT'.padEnd(99) + '█');
  console.log('█'.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Geslaagd: ${successful.length}/5`);
  console.log(`❌ Mislukt: ${failed.length}/5`);
  
  if (successful.length > 0) {
    console.log(`\n📊 TRUST STATISTICS:\n`);
    
    const avgTrustOverall = successful.reduce((sum, r) => sum + r.avgTrust, 0) / successful.length;
    const minTrustOverall = Math.min(...successful.map(r => r.minTrust));
    
    console.log(`   Gemiddelde Trust: ${avgTrustOverall.toFixed(1)}/100`);
    console.log(`   Laagste Trust: ${minTrustOverall}/100`);
    console.log(`   Alle winkels >= 50: ${minTrustOverall >= 50 ? '✅ JA' : '❌ NEE'}`);
    
    console.log(`\n📋 PER PRODUCT:\n`);
    successful.forEach(r => {
      console.log(`   ${r.product}:`);
      console.log(`      Aanbiedingen: ${r.offers}`);
      console.log(`      Avg Trust: ${r.avgTrust.toFixed(1)}/100`);
      console.log(`      Min Trust: ${r.minTrust}/100 ${r.minTrust >= 50 ? '✅' : '❌'}`);
      console.log('');
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ MISLUKTE PRODUCTEN:\n`);
    failed.forEach(r => {
      console.log(`   ${r.product} - ${r.error || 'Brak ofert'}`);
    });
  }
  
  console.log('\n' + '█'.repeat(100) + '\n');
}

runAllTests();
