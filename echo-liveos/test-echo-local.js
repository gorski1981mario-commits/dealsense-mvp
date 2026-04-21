/**
 * TEST ECHO LOKALNIE - Sprawdź szybkość i mądrość
 * 
 * Uruchom: node test-echo-local.js
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function testEcho() {
  console.log('🚀 ECHO LiveOS 2.0 - LOCAL TEST');
  console.log('='.repeat(60));
  
  try {
    // 1. INICJALIZACJA
    console.log('\n📦 Initializing ECHO...');
    const echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict',
      learningMode: 'continuous'
    });
    
    await echo.startup();
    
    // 2. TEST 1: PROSTY PROBLEM (MINIMAL mode)
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: Simple Problem (MINIMAL mode)');
    console.log('='.repeat(60));
    
    const test1Start = Date.now();
    const result1 = await echo.processRequest({
      query: 'What is 2+2?',
      type: 'simple_math',
      urgent: true,
      userPackage: 'FREE'
    });
    const test1Time = Date.now() - test1Start;
    
    console.log(`✅ Result: ${result1.result || 'Processed'}`);
    console.log(`⚡ Time: ${test1Time}ms`);
    console.log(`💰 Cost: ${result1.cost || 'N/A'}x`);
    console.log(`🎯 Power Level: ${result1.powerLevel || 'N/A'}`);
    
    // 3. TEST 2: ŚREDNI PROBLEM (BALANCED mode)
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Medium Problem (BALANCED mode)');
    console.log('='.repeat(60));
    
    const test2Start = Date.now();
    const result2 = await echo.processRequest({
      query: 'Find best deal for iPhone 15 Pro',
      type: 'deal_search',
      domain: 'shopping',
      requiresLogic: true,
      priority: 'survival',
      userPackage: 'PLUS'
    });
    const test2Time = Date.now() - test2Start;
    
    console.log(`✅ Result: ${result2.result || 'Processed'}`);
    console.log(`⚡ Time: ${test2Time}ms`);
    console.log(`💰 Cost: ${result2.cost || 'N/A'}x`);
    console.log(`🎯 Power Level: ${result2.powerLevel || 'N/A'}`);
    
    // 4. TEST 3: ZŁOŻONY PROBLEM (DEEP mode)
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Complex Problem (DEEP mode)');
    console.log('='.repeat(60));
    
    const test3Start = Date.now();
    const result3 = await echo.processRequest({
      query: 'Analyze best battery technology for electric cars: Solid-State vs Li-S',
      type: 'complex_analysis',
      domain: 'technology',
      requiresLogic: true,
      requiresCreativity: true,
      options: [
        'Solid-State Glass-Ceramic (450-500 Wh/kg)',
        'Li-S with Graphene Matrix (600-700 Wh/kg)'
      ],
      userPackage: 'PRO'
    });
    const test3Time = Date.now() - test3Start;
    
    console.log(`✅ Result: ${result3.result || 'Processed'}`);
    console.log(`⚡ Time: ${test3Time}ms`);
    console.log(`💰 Cost: ${result3.cost || 'N/A'}x`);
    console.log(`🎯 Power Level: ${result3.powerLevel || 'N/A'}`);
    
    // 5. PODSUMOWANIE
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const avgTime = (test1Time + test2Time + test3Time) / 3;
    
    console.log(`\nTotal tests: 3`);
    console.log(`Average time: ${avgTime.toFixed(0)}ms`);
    console.log(`\nTest 1 (Simple):  ${test1Time}ms - ${test1Time < 50 ? '✅ FAST' : '⚠️ SLOW'}`);
    console.log(`Test 2 (Medium):  ${test2Time}ms - ${test2Time < 200 ? '✅ FAST' : '⚠️ SLOW'}`);
    console.log(`Test 3 (Complex): ${test3Time}ms - ${test3Time < 500 ? '✅ FAST' : '⚠️ SLOW'}`);
    
    // 6. SYSTEM STATUS
    console.log('\n' + '='.repeat(60));
    console.log('🔧 SYSTEM STATUS');
    console.log('='.repeat(60));
    
    const status = echo.getSystemStatus();
    console.log(`\nActive: ${status.active ? '✅ YES' : '❌ NO'}`);
    console.log(`Consciousness: ${status.consciousness}`);
    console.log(`Coherence: ${status.coherence?.toFixed(2) || 'N/A'}`);
    console.log(`Ethical Score: ${status.ethicalScore?.toFixed(2) || 'N/A'}`);
    
    if (status.engines) {
      console.log(`\nBasic Engines:`);
      console.log(`  Ethics Core: ${status.engines.basic?.ethicsCore ? '✅' : '❌'}`);
      console.log(`  Quantum Core: ${status.engines.basic?.quantumCore ? '✅' : '❌'}`);
      
      console.log(`\nAdvanced Engines:`);
      console.log(`  Rubik Cube: ${status.engines.advanced?.rubikCubeEngine ? '✅' : '❌'}`);
      console.log(`  1000 Brains: ${status.engines.advanced?.thousandBrainsEngine ? '✅' : '❌'}`);
      console.log(`  Quantum Annealing: ${status.engines.advanced?.quantumAnnealing ? '✅' : '❌'}`);
    }
    
    // 7. SHUTDOWN
    console.log('\n' + '='.repeat(60));
    await echo.shutdown();
    console.log('✅ ECHO shutdown complete');
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Uruchom test
testEcho().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
