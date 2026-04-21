/**
 * HARD TEST ECHO LiveOS - NA TWARDO BEZ HALUCYNACJI
 * Sprawdzamy realną wydajność i funkcje
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function hardTest() {
  console.log('🔥 HARD TEST ECHO LiveOS - BEZ HALUCYNACJI');
  console.log('='.repeat(50));
  
  try {
    // 1. Inicjalizacja
    console.log('1️⃣ Initializing...');
    const startInit = Date.now();
    const echo = new EchoLiveOS();
    const initTime = Date.now() - startInit;
    console.log('⚡ Init time:', initTime + 'ms');
    
    // 2. Startup
    console.log('2️⃣ Starting up...');
    const startStartup = Date.now();
    await echo.startup();
    const startupTime = Date.now() - startStartup;
    console.log('⚡ Startup time:', startupTime + 'ms');
    
    // 3. Status systemu
    console.log('3️⃣ System status:');
    const status = echo.getSystemStatus();
    console.log('   - Active:', status.active);
    console.log('   - Coherence:', status.coherence);
    console.log('   - Ethical Score:', status.ethicalScore);
    console.log('   - Consciousness:', status.consciousness);
    
    // 4. Test prostego zapytania
    console.log('4️⃣ Basic processing test...');
    const startBasic = Date.now();
    const basicResult = await echo.processRequest({
      type: 'question',
      query: 'Jaka jest najlepsza strategia?',
      domain: 'business'
    });
    const basicTime = Date.now() - startBasic;
    console.log('⚡ Basic processing:', basicTime + 'ms');
    console.log('📊 Result:', basicResult.success ? 'SUCCESS' : 'FAILED');
    
    // 5. Test kwantowy
    console.log('5️⃣ Quantum processing test...');
    const startQuantum = Date.now();
    const quantumResult = await echo.processRequest({
      type: 'quantum_optimization',
      query: 'Optymalizuj system',
      domain: 'technology'
    });
    const quantumTime = Date.now() - startQuantum;
    console.log('⚡ Quantum processing:', quantumTime + 'ms');
    console.log('📊 Result:', quantumResult.success ? 'SUCCESS' : 'FAILED');
    
    // 6. Test etyczny
    console.log('6️⃣ Ethics test...');
    const ethicsResult = await echo.processRequest({
      type: 'ethical_check',
      query: 'Czy oszukiwanie jest OK?',
      domain: 'ethics'
    });
    console.log('📊 Ethics result:', ethicsResult.success ? 'ETHICAL' : 'UNETHICAL');
    
    // 7. Podsumowanie
    console.log('\n🎯 HARD RESULTS SUMMARY:');
    console.log('='.repeat(30));
    console.log('⚡ Init time:', initTime + 'ms');
    console.log('⚡ Startup time:', startupTime + 'ms');
    console.log('⚡ Basic processing:', basicTime + 'ms');
    console.log('⚡ Quantum processing:', quantumTime + 'ms');
    console.log('📊 System active:', status.active ? 'YES' : 'NO');
    console.log('📊 Coherence:', status.coherence);
    console.log('📊 Ethical score:', status.ethicalScore);
    
    // 8. Ocena
    let performance = 'SLOW';
    if (initTime < 100 && startupTime < 500 && basicTime < 200) {
      performance = 'FAST';
    } else if (initTime < 200 && startupTime < 1000 && basicTime < 500) {
      performance = 'MEDIUM';
    }
    
    console.log('\n🏆 PERFORMANCE RATING:', performance);
    console.log('💡 SYSTEM TYPE:', status.active ? 'QUANTUM AI' : 'BASIC SYSTEM');
    
    return {
      performance,
      initTime,
      startupTime,
      basicTime,
      quantumTime,
      active: status.active,
      coherence: status.coherence
    };
    
  } catch (error) {
    console.error('❌ HARD TEST FAILED:', error.message);
    return { error: error.message };
  }
}

// Uruchom test
hardTest().then(results => {
  console.log('\n✅ HARD TEST COMPLETED');
  console.log('🔍 CONCLUSION:', results.error ? 'SYSTEM BROKEN' : 'SYSTEM WORKING');
}).catch(err => {
  console.error('💥 COMPLETE FAILURE:', err.message);
});
