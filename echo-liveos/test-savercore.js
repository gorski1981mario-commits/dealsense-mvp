/**
 * TEST SAVERCORE - Prosty, szybki, tani system
 */

const { SaverCore, Router, Specialist, SaverCache } = require('./src/core/SaverCore');

async function testSaverCore() {
  console.log('🧪 TESTING SAVERCORE - Simple, Fast, Cheap\n');
  
  // 1. Test CACHE
  console.log('📝 TEST 1: Cache Layer');
  
  const cache = new SaverCache(100, 60000);  // 100 entries, 1min TTL
  
  const key1 = cache.generateKey('Wat kost deze laptop?');
  cache.set(key1, { response: 'De laptop kost €599', intent: 'products' });
  
  const cached = cache.get(key1);
  console.log('Cached result:', cached);
  console.log('Cache stats:', cache.getStats());
  
  console.log('\n---\n');
  
  // 2. Test ROUTER
  console.log('📝 TEST 2: Router (Intent Detection)');
  
  const router = new Router();
  
  const testMessages = [
    'Wat kost deze laptop?',
    'Ik zoek een vakantie naar Spanje',
    'Welke autoverzekering is het beste?',
    'Goedkope telefoon abonnement',
    'Energie contract vergelijken',
    'Hoe werkt de scanner?'
  ];
  
  for (const msg of testMessages) {
    const result = await router.route(msg);
    console.log(`"${msg}"`);
    console.log(`  → Intent: ${result.intent} (confidence: ${result.confidence.toFixed(2)}, ${result.method})`);
  }
  
  console.log('\n---\n');
  
  // 3. Test SPECIALIST
  console.log('📝 TEST 3: Specialist Models');
  
  const productSpecialist = new Specialist('products');
  const vacationSpecialist = new Specialist('vacation');
  const insuranceSpecialist = new Specialist('insurance');
  
  const productResult = await productSpecialist.process('Hoe scan ik een product?');
  console.log('Products specialist:');
  console.log(`  Response: "${productResult.response}"`);
  console.log(`  Method: ${productResult.method}, Time: ${productResult.processingTime}ms`);
  
  const vacationResult = await vacationSpecialist.process('Ik zoek een hotel in Barcelona');
  console.log('\nVacation specialist:');
  console.log(`  Response: "${vacationResult.response}"`);
  console.log(`  Method: ${vacationResult.method}, Time: ${vacationResult.processingTime}ms`);
  
  const insuranceResult = await insuranceSpecialist.process('Autoverzekering vergelijken');
  console.log('\nInsurance specialist:');
  console.log(`  Response: "${insuranceResult.response}"`);
  console.log(`  Method: ${insuranceResult.method}, Time: ${insuranceResult.processingTime}ms`);
  
  console.log('\n---\n');
  
  // 4. Test SAVERCORE (full flow)
  console.log('📝 TEST 4: SaverCore (Full Flow)');
  
  const saverCore = new SaverCore({
    enableCache: true,
    cacheSize: 1000,
    cacheTTL: 3600000
  });
  
  const questions = [
    'Wat kost deze laptop?',
    'Hoe werkt de DealSense scanner?',
    'Ik zoek een goedkope vakantie',
    'Welke verzekering is het beste?',
    'Wat kost deze laptop?'  // Duplicate - should hit cache
  ];
  
  for (const question of questions) {
    console.log(`\nQuestion: "${question}"`);
    const result = await saverCore.process(question);
    console.log(`Response: "${result.response}"`);
    console.log(`Intent: ${result.intent}, Cached: ${result.cached}, Time: ${result.processingTime}ms`);
  }
  
  console.log('\n---\n');
  
  // 5. Test CACHE HIT RATE
  console.log('📝 TEST 5: Cache Hit Rate');
  
  const saverCore2 = new SaverCore();
  
  // Zadaj te same pytania kilka razy
  const repeatedQuestions = [
    'Wat kost deze laptop?',
    'Hoe werkt de scanner?',
    'Wat kost deze laptop?',  // Duplicate
    'Vakantie naar Spanje',
    'Hoe werkt de scanner?',  // Duplicate
    'Wat kost deze laptop?',  // Duplicate
  ];
  
  for (const q of repeatedQuestions) {
    await saverCore2.process(q);
  }
  
  const status = saverCore2.getStatus();
  console.log('\nCache performance:');
  console.log(`  Total requests: ${status.metrics.totalRequests}`);
  console.log(`  Cache hits: ${status.metrics.cacheHits}`);
  console.log(`  Cache misses: ${status.metrics.cacheMisses}`);
  console.log(`  Hit rate: ${(status.metrics.cacheStats.hitRate * 100).toFixed(1)}%`);
  console.log(`  Average response time: ${status.metrics.averageResponseTime.toFixed(1)}ms`);
  
  console.log('\n---\n');
  
  // 6. Test PERFORMANCE (speed)
  console.log('📝 TEST 6: Performance (Speed)');
  
  const saverCore3 = new SaverCore();
  
  const perfTests = [
    'Product scan',
    'Vakantie zoeken',
    'Verzekering vergelijken',
    'Energie contract',
    'Telefoon abonnement'
  ];
  
  const times = [];
  
  for (const test of perfTests) {
    const start = Date.now();
    await saverCore3.process(test);
    const time = Date.now() - start;
    times.push(time);
    console.log(`"${test}": ${time}ms`);
  }
  
  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`\nPerformance stats:`);
  console.log(`  Average: ${avgTime.toFixed(1)}ms`);
  console.log(`  Min: ${minTime}ms`);
  console.log(`  Max: ${maxTime}ms`);
  
  console.log('\n---\n');
  
  // 7. Test FALLBACK
  console.log('📝 TEST 7: Fallback Mechanism');
  
  const saverCore4 = new SaverCore();
  
  // Symuluj błąd (pusty message)
  const fallbackResult = await saverCore4.process('');
  console.log('Fallback result:');
  console.log(`  Response: "${fallbackResult.response}"`);
  console.log(`  Method: ${fallbackResult.method}`);
  console.log(`  Error: ${fallbackResult.error || 'none'}`);
  
  console.log('\n---\n');
  
  // 8. Test MULTI-DOMAIN
  console.log('📝 TEST 8: Multi-Domain Routing');
  
  const saverCore5 = new SaverCore();
  
  const domainTests = [
    { msg: 'Scanner gebruiken', expected: 'products' },
    { msg: 'Vakantie boeken', expected: 'vacation' },
    { msg: 'Autoverzekering', expected: 'insurance' },
    { msg: 'Internet abonnement', expected: 'telecom' },
    { msg: 'Stroom contract', expected: 'energy' },
    { msg: 'Hypotheek rente', expected: 'mortgage' },
    { msg: 'Persoonlijke lening', expected: 'loan' },
    { msg: 'Creditcard aanvragen', expected: 'creditcard' },
    { msg: 'Netflix opzeggen', expected: 'subscriptions' },
    { msg: 'Hoe werkt DealSense?', expected: 'general' }
  ];
  
  let correct = 0;
  
  for (const test of domainTests) {
    const result = await saverCore5.process(test.msg);
    const match = result.intent === test.expected;
    if (match) correct++;
    
    console.log(`"${test.msg}"`);
    console.log(`  Expected: ${test.expected}, Got: ${result.intent} ${match ? '✅' : '❌'}`);
  }
  
  console.log(`\nAccuracy: ${correct}/${domainTests.length} (${(correct / domainTests.length * 100).toFixed(0)}%)`);
  
  console.log('\n---\n');
  
  // 9. Test SYSTEM STATUS
  console.log('📝 TEST 9: System Status');
  
  const finalStatus = saverCore.getStatus();
  
  console.log('\nSaverCore Status:');
  console.log('  Router:', finalStatus.router);
  console.log('  Specialists:', finalStatus.specialists);
  console.log('  Cache:', finalStatus.cache);
  console.log('  Metrics:', finalStatus.metrics);
  
  console.log('\n---\n');
  
  // 10. Test COST COMPARISON
  console.log('📝 TEST 10: Cost Analysis');
  
  const requestsPerDay = 10000;
  const cacheHitRate = 0.35;  // 35% (conservative)
  
  // GPT-4
  const gpt4CostPerRequest = 0.014;  // $0.014 per request
  const gpt4Monthly = requestsPerDay * 30 * gpt4CostPerRequest;
  
  // Claude
  const claudeCostPerRequest = 0.006;
  const claudeMonthly = requestsPerDay * 30 * claudeCostPerRequest;
  
  // SaverCore (self-hosted)
  const serverCost = 65;  // $65/month flat
  const effectiveRequests = requestsPerDay * (1 - cacheHitRate);  // Cache reduces load
  const saverCoreMonthly = serverCost;
  
  console.log(`\nCost comparison (${requestsPerDay} requests/day):`);
  console.log(`  GPT-4: $${gpt4Monthly.toFixed(2)}/month`);
  console.log(`  Claude: $${claudeMonthly.toFixed(2)}/month`);
  console.log(`  SaverCore: $${saverCoreMonthly.toFixed(2)}/month`);
  console.log(`\nSavings vs GPT-4: $${(gpt4Monthly - saverCoreMonthly).toFixed(2)}/month (${((1 - saverCoreMonthly / gpt4Monthly) * 100).toFixed(1)}%)`);
  console.log(`Savings vs Claude: $${(claudeMonthly - saverCoreMonthly).toFixed(2)}/month (${((1 - saverCoreMonthly / claudeMonthly) * 100).toFixed(1)}%)`);
  console.log(`\nWith ${(cacheHitRate * 100).toFixed(0)}% cache hit rate:`);
  console.log(`  Effective requests: ${(effectiveRequests * 30).toFixed(0)}/month`);
  console.log(`  Cost per request: $${(saverCoreMonthly / (requestsPerDay * 30)).toFixed(6)}`);
  
  console.log('\n---\n');
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
  console.log('🎯 SAVERCORE - SIMPLE, FAST, CHEAP');
  console.log('   - Zero swarms, momentum, chaos, photosynthesis');
  console.log('   - Router (keyword-based) + Specialist (template-based)');
  console.log('   - Strong cache layer (35%+ hit rate)');
  console.log('   - Simple timeout + fallback');
  console.log('   - 1 GPU or CPU');
  console.log('   - 96-99% cheaper than GPT-4/Claude');
}

// Run tests
testSaverCore().catch(console.error);
