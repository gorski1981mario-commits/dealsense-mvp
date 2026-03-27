/**
 * TEST 3 PRODUKTÓW ELEKTRONICZNYCH
 * Sprawdzamy co SearchAPI faktycznie zwraca
 */

// Hardcode key dla testu (z server/.env)
process.env.GOOGLE_SHOPPING_API_KEY = 'TxZ91oHM53qcbiMvcWpD8vVQ';

const { fetchReviews, aggregateForAI } = require('./searchapi-reviews');

async function test3Products() {
  console.log('=== TEST 3 PRODUKTÓW ELEKTRONICZNYCH ===\n');
  console.log(`SearchAPI Key: ${process.env.GOOGLE_SHOPPING_API_KEY ? 'OK ✅' : 'MISSING ❌'}\n`);
  
  const products = [
    { name: 'iPhone 15 Pro', category: 'electronics' },
    { name: 'Samsung Galaxy S24', category: 'electronics' },
    { name: 'Bosch WAU28PH9BY pralka', category: 'electronics' }
  ];
  
  for (const product of products) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`PRODUKT: ${product.name}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      const startTime = Date.now();
      const results = await fetchReviews(product.name, product.category);
      const elapsed = Date.now() - startTime;
      
      console.log(`⏱️  Czas: ${elapsed}ms\n`);
      
      // 1. Google Shopping Reviews
      console.log(`📦 GOOGLE SHOPPING REVIEWS: ${results.shopping_reviews.length}`);
      if (results.shopping_reviews.length > 0) {
        console.log('   Przykłady:');
        results.shopping_reviews.slice(0, 3).forEach((review, i) => {
          console.log(`   ${i+1}. [${review.rating || 'N/A'}/5] ${review.text.substring(0, 80)}...`);
          console.log(`      Źródło: ${review.source} | Produkt: ${review.product}`);
        });
      } else {
        console.log('   ❌ Brak reviews z Google Shopping');
      }
      
      console.log('');
      
      // 2. Google Search Snippets
      console.log(`🔍 GOOGLE SEARCH SNIPPETS: ${results.search_snippets.length}`);
      if (results.search_snippets.length > 0) {
        const bySource = {};
        results.search_snippets.forEach(s => {
          bySource[s.source] = (bySource[s.source] || 0) + 1;
        });
        
        console.log('   Źródła:');
        Object.entries(bySource).forEach(([source, count]) => {
          console.log(`   - ${source}: ${count} snippets`);
        });
        
        console.log('\n   Przykłady snippets:');
        results.search_snippets.slice(0, 3).forEach((snippet, i) => {
          console.log(`   ${i+1}. [${snippet.source}] ${snippet.title}`);
          console.log(`      ${snippet.snippet.substring(0, 100)}...`);
          console.log(`      Link: ${snippet.link}`);
        });
      } else {
        console.log('   ❌ Brak snippets z Google Search');
      }
      
      console.log('');
      
      // 3. Google Maps Reviews
      console.log(`📍 GOOGLE MAPS REVIEWS: ${results.maps_reviews.length}`);
      if (results.maps_reviews.length > 0) {
        console.log('   Przykłady:');
        results.maps_reviews.slice(0, 3).forEach((review, i) => {
          console.log(`   ${i+1}. [${review.rating}/5] ${review.text.substring(0, 80)}...`);
          console.log(`      User: ${review.user} | Likes: ${review.likes}`);
        });
      } else {
        console.log('   ℹ️  Brak (normalnie dla produktów - Maps to miejsca)');
      }
      
      console.log('');
      
      // 4. Aggregation
      const aggregated = aggregateForAI(results);
      console.log(`📊 AGREGACJA DLA AI: ${aggregated.length} items`);
      console.log(`   - Reviews: ${aggregated.filter(a => a.type === 'review').length}`);
      console.log(`   - Snippets: ${aggregated.filter(a => a.type === 'snippet').length}`);
      
      // 5. Summary
      console.log('\n✅ PODSUMOWANIE:');
      console.log(`   Total sources: ${results.total_sources}`);
      console.log(`   Total data points: ${aggregated.length}`);
      console.log(`   Wystarczy do AI? ${aggregated.length >= 10 ? '✅ TAK' : '⚠️  MAŁO'}`);
      
      // 6. Sample aggregated data
      if (aggregated.length > 0) {
        console.log('\n📝 PRZYKŁAD DANYCH DLA AI:');
        console.log(JSON.stringify(aggregated[0], null, 2));
      }
      
    } catch (error) {
      console.error(`\n❌ ERROR: ${error.message}`);
      console.error(error.stack);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('TEST ZAKOŃCZONY');
  console.log(`${'='.repeat(60)}\n`);
}

// Run test
test3Products().catch(console.error);
