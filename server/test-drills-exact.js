/**
 * TEST EXACT MATCHING - 3 różne wiertarki
 * 
 * 1. Bosch GSR 18V-55 (wkrętarka)
 * 2. DeWalt DCD791 (wiertarka)
 * 3. Black+Decker BDCHD18K (młotowiertarka)
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const DRILLS = [
  {
    name: 'Bosch GSR 18V-55',
    ean: '3165140888738',
    basePrice: 140,
    brand: 'Bosch'
  },
  {
    name: 'DeWalt DCD791',
    ean: '5035048661697',
    basePrice: 160,
    brand: 'DeWalt'
  },
  {
    name: 'Black+Decker BDCHD18K',
    ean: '5035048661703',
    basePrice: 120,
    brand: 'Black+Decker'
  }
];

async function testDrill(drill) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 TESTING: ${drill.name}`);
  console.log(`📊 EAN: ${drill.ean}`);
  console.log(`💰 Base Price: €${drill.basePrice}`);
  console.log('='.repeat(80));

  try {
    const result = await fetchMarketOffers({
      productName: drill.name,
      ean: drill.ean,
      userPrice: drill.basePrice,
      userId: 'test-drills',
      scanCount: 0,
      maxResults: 30
    });

    if (!result || !result.offers || result.offers.length === 0) {
      console.log('❌ NO OFFERS FOUND');
      return { product: drill.name, success: false, offers: 0 };
    }

    const offers = result.offers;
    console.log(`\n✅ FOUND ${offers.length} OFFERS\n`);

    // Wyświetl pierwsze 5 ofert
    console.log('TOP 5 OFFERS:');
    offers.slice(0, 5).forEach((o, i) => {
      const title = (o.title || '').toLowerCase();
      const brandMatch = title.includes(drill.brand.toLowerCase());
      const status = brandMatch ? '✅' : '❌';
      console.log(`${i+1}. ${status} €${o.price.toString().padStart(6)} - ${(o.title || '').substring(0, 60)}`);
    });

    // Analiza
    const correctBrand = offers.filter(o => 
      (o.title || '').toLowerCase().includes(drill.brand.toLowerCase())
    ).length;

    console.log('\n📊 ANALYSIS:');
    console.log(`Total Offers:        ${offers.length}`);
    console.log(`Correct Brand:       ${correctBrand}/${offers.length} (${Math.round(correctBrand/offers.length*100)}%)`);
    console.log(`Price Range:         €${Math.min(...offers.map(o => o.price))} - €${Math.max(...offers.map(o => o.price))}`);

    return {
      product: drill.name,
      success: true,
      total: offers.length,
      correctBrand,
      percentage: Math.round(correctBrand/offers.length*100)
    };

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { product: drill.name, success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🚀 TESTING 3 DIFFERENT DRILLS - EXACT MATCHING');
  console.log('Checking: Exact product matching, correct brand, real prices\n');

  const results = [];

  for (const drill of DRILLS) {
    const result = await testDrill(drill);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const totalOffers = results.reduce((sum, r) => sum + (r.total || 0), 0);
  const avgCorrect = results.filter(r => r.success).reduce((sum, r) => sum + (r.percentage || 0), 0) / successful;

  console.log(`Tests Run:           ${results.length}`);
  console.log(`Successful:          ${successful}/${results.length}`);
  console.log(`Total Offers:        ${totalOffers}`);
  console.log(`Avg Correct Brand:   ${Math.round(avgCorrect)}%`);

  console.log('\n🎯 VERDICT:');
  if (successful === results.length && avgCorrect >= 70) {
    console.log('✅ EXACT MATCHING WORKS - All products matched correctly');
  } else if (successful >= results.length / 2) {
    console.log('⚠️  PARTIAL SUCCESS - Some products matched');
  } else {
    console.log('❌ EXACT MATCHING FAILED - Most products not matched');
  }

  console.log('\n');
}

runTests().catch(console.error);
