/**
 * TEST SearchAPI Reviews
 * Sprawdza czy SearchAPI faktycznie zwraca reviews i snippets
 */

const { fetchReviews, aggregateForAI } = require('./searchapi-reviews');

async function testSearchAPIReviews() {
  console.log('=== TEST SearchAPI Reviews ===\n');
  
  // Test 1: Elektronika (iPhone)
  console.log('TEST 1: iPhone 15 Pro (electronics)');
  try {
    const results = await fetchReviews('iPhone 15 Pro', 'electronics');
    console.log(`✅ Shopping reviews: ${results.shopping_reviews.length}`);
    console.log(`✅ Search snippets: ${results.search_snippets.length}`);
    console.log(`✅ Total sources: ${results.total_sources}`);
    
    const aggregated = aggregateForAI(results);
    console.log(`✅ Aggregated for AI: ${aggregated.length} items\n`);
    
    // Show sample
    if (aggregated.length > 0) {
      console.log('Sample review/snippet:');
      console.log(JSON.stringify(aggregated[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Miejsce (hotel)
  console.log('TEST 2: NH Hotel Amsterdam (travel)');
  try {
    const results = await fetchReviews('NH Hotel Amsterdam', 'travel', { includePlace: true });
    console.log(`✅ Shopping reviews: ${results.shopping_reviews.length}`);
    console.log(`✅ Search snippets: ${results.search_snippets.length}`);
    console.log(`✅ Maps reviews: ${results.maps_reviews.length}`);
    console.log(`✅ Total sources: ${results.total_sources}`);
    
    const aggregated = aggregateForAI(results);
    console.log(`✅ Aggregated for AI: ${aggregated.length} items\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: Ubezpieczenie
  console.log('TEST 3: Aegon autoverzekering (insurance)');
  try {
    const results = await fetchReviews('Aegon autoverzekering', 'insurance');
    console.log(`✅ Shopping reviews: ${results.shopping_reviews.length}`);
    console.log(`✅ Search snippets: ${results.search_snippets.length}`);
    console.log(`✅ Total sources: ${results.total_sources}`);
    
    const aggregated = aggregateForAI(results);
    console.log(`✅ Aggregated for AI: ${aggregated.length} items\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run test
testSearchAPIReviews().catch(console.error);
