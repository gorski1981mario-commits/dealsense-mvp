/**
 * TEST PEŁNEGO FLOW: SearchAPI → AI Analysis → Verdict
 * Sprawdzamy czy AI potrafi wyciągnąć top 3 pros/cons ze snippets
 */

// Hardcode keys dla testu
process.env.GOOGLE_SHOPPING_API_KEY = 'TxZ91oHM53qcbiMvcWpD8vVQ';
process.env.GROQ_API_KEY = 'gsk_ikO0EZ0xbs83IzVW5dafWGdyb3FYayP7aX4boaHuad2ahhehttsTH';
process.env.AI_PROVIDER = 'groq'; // Użyj Groq (Llama 3.3 70B)

const { fetchReviews, aggregateForAI } = require('./searchapi-reviews');
const { analyzeWithAI } = require('./ai-analyzer-v2');

async function testFullFlow() {
  console.log('=== TEST PEŁNEGO FLOW: SearchAPI → AI → Verdict ===\n');
  
  // Test na iPhone 15 Pro (wiemy że ma dużo danych)
  const productName = 'iPhone 15 Pro';
  const category = 'electronics';
  
  console.log(`Produkt: ${productName}`);
  console.log(`Kategoria: ${category}\n`);
  
  try {
    // KROK 1: Fetch z SearchAPI
    console.log('KROK 1: Fetching z SearchAPI...');
    const startFetch = Date.now();
    const reviewsData = await fetchReviews(productName, category);
    const fetchTime = Date.now() - startFetch;
    
    console.log(`✅ Fetch zakończony (${fetchTime}ms)`);
    console.log(`   Shopping reviews: ${reviewsData.shopping_reviews.length}`);
    console.log(`   Search snippets: ${reviewsData.search_snippets.length}`);
    console.log(`   Total sources: ${reviewsData.total_sources}\n`);
    
    // KROK 2: Agregacja dla AI
    console.log('KROK 2: Agregacja danych dla AI...');
    const aggregated = aggregateForAI(reviewsData);
    console.log(`✅ Agregacja zakończona`);
    console.log(`   Total items: ${aggregated.length}`);
    console.log(`   Reviews: ${aggregated.filter(a => a.type === 'review').length}`);
    console.log(`   Snippets: ${aggregated.filter(a => a.type === 'snippet').length}\n`);
    
    if (aggregated.length === 0) {
      console.log('❌ Brak danych do analizy AI');
      return;
    }
    
    // KROK 3: AI Analysis
    console.log('KROK 3: AI Analysis...');
    
    // Check if AI keys available
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'BRAK';
    const hasAnthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'BRAK';
    
    if (!hasOpenAI && !hasAnthropic) {
      console.log('⚠️  Brak AI API keys - używam fallback analysis\n');
    }
    
    const startAI = Date.now();
    const itemInfo = { name: productName, category };
    const analysis = await analyzeWithAI(aggregated, itemInfo, category);
    const aiTime = Date.now() - startAI;
    
    console.log(`✅ AI Analysis zakończona (${aiTime}ms)\n`);
    
    // KROK 4: Wyniki
    console.log('='.repeat(60));
    console.log('WYNIKI AI ANALYSIS:');
    console.log('='.repeat(60));
    
    console.log(`\n📊 STATYSTYKI:`);
    console.log(`   Positive: ${analysis.positive_percent}%`);
    console.log(`   Negative: ${analysis.negative_percent}%`);
    console.log(`   Neutral: ${analysis.neutral_percent}%`);
    console.log(`   Total reviews analyzed: ${analysis.total_reviews}`);
    
    console.log(`\n✅ TOP 3 PROS:`);
    analysis.top_3_pros.forEach((pro, i) => {
      console.log(`   ${i+1}. ${pro}`);
    });
    
    console.log(`\n❌ TOP 3 CONS:`);
    analysis.top_3_cons.forEach((con, i) => {
      console.log(`   ${i+1}. ${con}`);
    });
    
    if (analysis.critical_issues && analysis.critical_issues.length > 0) {
      console.log(`\n⚠️  CRITICAL ISSUES:`);
      analysis.critical_issues.forEach((issue, i) => {
        console.log(`   ${i+1}. ${issue}`);
      });
    }
    
    console.log(`\n🎯 VERDICT:`);
    console.log(`   Color: ${analysis.verdict.color === 'green' ? '🟢' : analysis.verdict.color === 'yellow' ? '🟡' : '🔴'} ${analysis.verdict.color.toUpperCase()}`);
    console.log(`   Score: ${analysis.verdict.score}/10`);
    console.log(`   Recommendation: ${analysis.verdict.recommendation}`);
    console.log(`   Summary: ${analysis.verdict.summary}`);
    
    if (analysis.truth_score) {
      console.log(`\n🔍 TRUTH SCORE: ${analysis.truth_score}/100`);
      const truthLevel = analysis.truth_score >= 90 ? 'Bardzo wiarygodne' :
                        analysis.truth_score >= 70 ? 'Wiarygodne' :
                        analysis.truth_score >= 50 ? 'Średnio wiarygodne' : 'Niewiarygodne';
      console.log(`   ${truthLevel}`);
    }
    
    if (analysis.fallback) {
      console.log(`\n⚠️  UWAGA: Użyto fallback analysis (brak AI API keys)`);
    }
    
    // KROK 5: Performance
    console.log(`\n⏱️  PERFORMANCE:`);
    console.log(`   Fetch time: ${fetchTime}ms`);
    console.log(`   AI time: ${aiTime}ms`);
    console.log(`   Total time: ${fetchTime + aiTime}ms`);
    console.log(`   Target: <8000ms ${fetchTime + aiTime < 8000 ? '✅' : '❌'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST ZAKOŃCZONY');
    console.log('='.repeat(60));
    
    // KROK 6: Full result object
    console.log('\n📝 FULL RESULT OBJECT:');
    console.log(JSON.stringify({
      identifier: productName,
      category,
      totalReviews: aggregated.length,
      sources: {
        shopping_reviews: reviewsData.shopping_reviews.length,
        search_snippets: reviewsData.search_snippets.length,
        total_sources: reviewsData.total_sources
      },
      analysis,
      responseTime: fetchTime + aiTime,
      method: 'searchapi'
    }, null, 2));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

// Run test
testFullFlow().catch(console.error);
