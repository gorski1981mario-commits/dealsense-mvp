/**
 * 15 TESTÓW - PO 3 PRODUKTY W KAŻDEJ KATEGORII
 * Porównanie wyników między kategoriami
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

const PRODUCTS = [
  // KATEGORIA 1: SPORTSCHOENEN (3 produkty)
  {
    name: 'Nike Air Max 90',
    basePrice: 149.00,
    baseSeller: 'Zalando',
    category: 'Sportschoenen'
  },
  {
    name: 'Adidas Ultraboost 23',
    basePrice: 190.00,
    baseSeller: 'Bol.com',
    category: 'Sportschoenen'
  },
  {
    name: 'New Balance 574',
    basePrice: 99.00,
    baseSeller: 'Foot Locker',
    category: 'Sportschoenen'
  },
  
  // KATEGORIA 2: GEREEDSCHAP (3 produkty)
  {
    name: 'Bosch PSR 1800',
    basePrice: 159.00,
    baseSeller: 'Gamma',
    category: 'Gereedschap'
  },
  {
    name: 'Makita DHP484Z',
    basePrice: 159.00,
    baseSeller: 'Praxis',
    category: 'Gereedschap'
  },
  {
    name: 'DeWalt DCD796',
    basePrice: 199.00,
    baseSeller: 'Karwei',
    category: 'Gereedschap'
  },
  
  // KATEGORIA 3: TANDVERZORGING (3 produkty)
  {
    name: 'Oral-B iO Series 9',
    basePrice: 299.00,
    baseSeller: 'Etos',
    category: 'Tandverzorging'
  },
  {
    name: 'Philips Sonicare DiamondClean',
    basePrice: 249.00,
    baseSeller: 'Kruidvat',
    category: 'Tandverzorging'
  },
  {
    name: 'Oral-B Pro 3',
    basePrice: 79.00,
    baseSeller: 'DA',
    category: 'Tandverzorging'
  },
  
  // KATEGORIA 4: SPEELGOED (3 produkty)
  {
    name: 'Lego Technic Porsche 911',
    basePrice: 169.00,
    baseSeller: 'Intertoys',
    category: 'Speelgoed'
  },
  {
    name: 'Lego Star Wars Millennium Falcon',
    basePrice: 179.00,
    baseSeller: 'Bart Smit',
    category: 'Speelgoed'
  },
  {
    name: 'Playmobil Piratenschip',
    basePrice: 89.00,
    baseSeller: 'Bol.com',
    category: 'Speelgoed'
  },
  
  // KATEGORIA 5: FITNESSAPPARATUUR (3 produkty)
  {
    name: 'Tunturi Cardio Fit E30',
    basePrice: 449.00,
    baseSeller: 'Decathlon',
    category: 'Fitnessapparatuur'
  },
  {
    name: 'Kettler Racer 9',
    basePrice: 599.00,
    baseSeller: 'Fitshop',
    category: 'Fitnessapparatuur'
  },
  {
    name: 'Domyos Bench 500',
    basePrice: 149.00,
    baseSeller: 'Decathlon',
    category: 'Fitnessapparatuur'
  }
];

const GIANTS = ['bol.com', 'bol', 'coolblue', 'mediamarkt', 'amazon.nl', 'wehkamp', 'zalando', 'decathlon'];

function isGiant(seller) {
  const sellerLower = (seller || '').toLowerCase();
  return GIANTS.some(g => sellerLower.includes(g));
}

async function testProduct(product, index, total) {
  console.log(`\n[${index + 1}/${total}] Testing: ${product.name} (${product.category})`);
  
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
      console.log(`   ❌ Geen aanbiedingen (${duration}ms)`);
      return {
        product: product.name,
        category: product.category,
        baseSeller: product.baseSeller,
        basePrice: product.basePrice,
        success: false,
        offers: 0,
        duration
      };
    }
    
    const offers = result.offers;
    const bundles = result.smartBundles || [];
    
    const giantOffers = offers.filter(o => isGiant(o.seller));
    const nicheOffers = offers.filter(o => !isGiant(o.seller));
    
    const avgPrice = offers.reduce((sum, o) => sum + o.price, 0) / offers.length;
    const avgSavings = product.basePrice - avgPrice;
    const avgSavingsPercent = (avgSavings / product.basePrice) * 100;
    const maxSavings = product.basePrice - offers[0].price;
    const maxSavingsPercent = (maxSavings / product.basePrice) * 100;
    
    // Sprawdź czy baseSeller jest w wynikach
    const baseSellerInResults = offers.some(o => {
      const seller = (o.seller || '').toLowerCase();
      const base = product.baseSeller.toLowerCase();
      return seller.includes(base) || base.includes(seller);
    });
    
    console.log(`   ✅ ${offers.length} aanbiedingen | Avg: ${avgSavingsPercent.toFixed(1)}% | Max: ${maxSavingsPercent.toFixed(1)}% | Giants: ${giantOffers.length} | Niche: ${nicheOffers.length} | ${duration}ms`);
    if (baseSellerInResults) {
      console.log(`   ⚠️  BASE SELLER IN RESULTS!`);
    }
    
    return {
      product: product.name,
      category: product.category,
      baseSeller: product.baseSeller,
      basePrice: product.basePrice,
      success: true,
      offers: offers.length,
      bundles: bundles.length,
      avgSavings: avgSavingsPercent,
      maxSavings: maxSavingsPercent,
      bestOffer: offers[0].seller,
      bestPrice: offers[0].price,
      giants: giantOffers.length,
      niche: nicheOffers.length,
      duration,
      baseSellerFiltered: !baseSellerInResults
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      product: product.name,
      category: product.category,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(100));
  console.log('█  15 TESTÓW - PORÓWNANIE KATEGORII (po 3 produkty w każdej)'.padEnd(99) + '█');
  console.log('█'.repeat(100) + '\n');
  
  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await testProduct(PRODUCTS[i], i, PRODUCTS.length);
    results.push(result);
    
    // Pauza co 3 testy
    if ((i + 1) % 3 === 0 && i < PRODUCTS.length - 1) {
      console.log('\n⏳ Pauza 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (i < PRODUCTS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Analiza per kategoria
  console.log('\n\n' + '█'.repeat(100));
  console.log('█  WYNIKI PER KATEGORIA'.padEnd(99) + '█');
  console.log('█'.repeat(100) + '\n');
  
  const categories = ['Sportschoenen', 'Gereedschap', 'Tandverzorging', 'Speelgoed', 'Fitnessapparatuur'];
  const categoryStats = {};
  
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat && r.success);
    
    if (catResults.length === 0) {
      categoryStats[cat] = {
        success: 0,
        total: 3,
        avgSavings: 0,
        maxSavings: 0,
        totalOffers: 0,
        giants: 0,
        niche: 0
      };
      return;
    }
    
    const avgSavings = catResults.reduce((sum, r) => sum + r.avgSavings, 0) / catResults.length;
    const maxSavings = Math.max(...catResults.map(r => r.maxSavings));
    const totalOffers = catResults.reduce((sum, r) => sum + r.offers, 0);
    const totalGiants = catResults.reduce((sum, r) => sum + r.giants, 0);
    const totalNiche = catResults.reduce((sum, r) => sum + r.niche, 0);
    const baseSellerWorking = catResults.filter(r => r.baseSellerFiltered).length;
    
    categoryStats[cat] = {
      success: catResults.length,
      total: 3,
      avgSavings,
      maxSavings,
      totalOffers,
      avgOffersPerProduct: totalOffers / catResults.length,
      giants: totalGiants,
      niche: totalNiche,
      nichePercent: (totalNiche / (totalGiants + totalNiche)) * 100,
      baseSellerWorking
    };
  });
  
  // Sortuj kategorie po avgSavings
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.avgSavings - a.avgSavings);
  
  sortedCategories.forEach(([cat, stats], idx) => {
    const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
    console.log(`${icon} ${cat}:`);
    console.log(`   Sukces: ${stats.success}/3`);
    console.log(`   Gemiddelde besparing: ${stats.avgSavings.toFixed(1)}%`);
    console.log(`   Grootste besparing: ${stats.maxSavings.toFixed(1)}%`);
    console.log(`   Aanbiedingen: ${stats.totalOffers} totaal (${stats.avgOffersPerProduct.toFixed(1)} per product)`);
    console.log(`   Giganten vs Niche: ${stats.giants} (${(100 - stats.nichePercent).toFixed(0)}%) vs ${stats.niche} (${stats.nichePercent.toFixed(0)}%)`);
    console.log(`   Base Seller Filter: ${stats.baseSellerWorking}/3 werkt`);
    console.log('');
  });
  
  // Globale statistieken
  const successful = results.filter(r => r.success);
  const totalOffers = successful.reduce((sum, r) => sum + r.offers, 0);
  const totalGiants = successful.reduce((sum, r) => sum + r.giants, 0);
  const totalNiche = successful.reduce((sum, r) => sum + r.niche, 0);
  const avgSavings = successful.reduce((sum, r) => sum + r.avgSavings, 0) / successful.length;
  const baseSellerWorking = successful.filter(r => r.baseSellerFiltered).length;
  
  console.log('─'.repeat(100));
  console.log('\n🎯 GLOBALE STATISTIEKEN:');
  console.log(`   Sukces: ${successful.length}/15 (${((successful.length/15)*100).toFixed(0)}%)`);
  console.log(`   Gemiddelde besparing: ${avgSavings.toFixed(1)}%`);
  console.log(`   Totaal aanbiedingen: ${totalOffers} (${(totalOffers/successful.length).toFixed(1)} per product)`);
  console.log(`   Giganten vs Niche: ${totalGiants} (${((totalGiants/(totalGiants+totalNiche))*100).toFixed(0)}%) vs ${totalNiche} (${((totalNiche/(totalGiants+totalNiche))*100).toFixed(0)}%)`);
  console.log(`   Base Seller Filter werkt: ${baseSellerWorking}/${successful.length} (${((baseSellerWorking/successful.length)*100).toFixed(0)}%)`);
  
  console.log('\n' + '█'.repeat(100) + '\n');
  
  // Zapisz szczegółowe wyniki
  console.log('\n📋 SZCZEGÓŁOWE WYNIKI:\n');
  results.forEach(r => {
    if (r.success) {
      console.log(`${r.category} - ${r.product}:`);
      console.log(`   ${r.baseSeller} €${r.basePrice} → ${r.bestOffer} €${r.bestPrice.toFixed(2)}`);
      console.log(`   Besparing: €${(r.basePrice - r.bestPrice).toFixed(2)} (${r.maxSavings.toFixed(1)}%)`);
      console.log('');
    }
  });
}

runAllTests();
