/**
 * TEST CRAWLERA - LIVE TEST
 * 
 * Testuje crawlera na prawdziwym produkcie (Samsung Galaxy S24)
 * Sprawdza:
 * - Czy omija Cloudflare/Akamai
 * - Czy ma human-like behavior
 * - Czy zwraca prawdziwe oferty
 */

require('dotenv').config();
const { fetchMarketOffers } = require('./market-api');

async function testCrawler() {
  console.log('\n🧪 TEST CRAWLERA - LIVE TEST\n');
  console.log('Product: Samsung Galaxy S24 Ultra 256GB');
  console.log('EAN: 8806095334790');
  console.log('Expected: Real offers from NL shops\n');
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    
    const result = await fetchMarketOffers({
      productName: 'Samsung Galaxy S24 Ultra 256GB',
      ean: '8806095334790',
      userPrice: 1449,
      userId: 'test-crawler',
      scanCount: 0,
      maxResults: 30
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!result || !result.offers || result.offers.length === 0) {
      console.log('❌ NO OFFERS FOUND');
      console.log(`Duration: ${duration}s`);
      return;
    }

    const offers = result.offers;
    console.log(`\n✅ FOUND ${offers.length} OFFERS in ${duration}s\n`);

    // Analiza źródeł
    const sources = {};
    offers.forEach(o => {
      const source = o._source || o.source || 'unknown';
      sources[source] = (sources[source] || 0) + 1;
    });

    console.log('📊 SOURCES:');
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`  - ${source}: ${count} offers (${Math.round(count/offers.length*100)}%)`);
    });

    // Pierwsze 5 ofert
    console.log('\nTOP 5 OFFERS:');
    offers.slice(0, 5).forEach((o, i) => {
      const source = o._source || o.source || 'unknown';
      const seller = (o.seller || 'unknown').substring(0, 25);
      console.log(`${i+1}. [${source}] ${seller.padEnd(25)} €${o.price} - ${(o.title || '').substring(0, 40)}`);
    });

    // Analiza NL shops
    const nlShops = offers.filter(o => {
      const seller = (o.seller || '').toLowerCase();
      return seller.includes('.nl') || 
             ['bol', 'coolblue', 'mediamarkt', 'kpn', 'amazon.nl'].some(s => seller.includes(s));
    }).length;

    console.log('\n📊 ANALYSIS:');
    console.log(`Total Offers:        ${offers.length}`);
    console.log(`NL Shops:            ${nlShops} (${Math.round(nlShops/offers.length*100)}%)`);
    console.log(`Duration:            ${duration}s`);
    console.log(`Avg per offer:       ${(parseFloat(duration) / offers.length).toFixed(2)}s`);

    console.log('\n🎯 VERDICT:');
    if (sources.crawler && sources.crawler > 0) {
      console.log('✅ CRAWLER WORKS - Got offers from crawler');
    } else if (sources.searchapi && sources.searchapi > 0) {
      console.log('⚠️  USING SEARCHAPI - Crawler not used or failed');
    } else {
      console.log('❓ UNKNOWN SOURCE');
    }

    if (nlShops / offers.length >= 0.5) {
      console.log('✅ GOOD NL COVERAGE (50%+)');
    } else {
      console.log('⚠️  LOW NL COVERAGE (<50%)');
    }

    if (parseFloat(duration) < 10) {
      console.log('✅ FAST (<10s)');
    } else if (parseFloat(duration) < 20) {
      console.log('⚠️  MODERATE (10-20s)');
    } else {
      console.log('❌ SLOW (>20s)');
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(error.stack);
  }

  console.log('\n');
}

testCrawler().catch(console.error);
