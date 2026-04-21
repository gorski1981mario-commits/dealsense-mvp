/**
 * FINAL INTEGRATION TEST - SPRAWDZAM WSZYSTKIE KOMPONENTY
 * Czy pętle się nie zapętlają? Czy torsja działa? Czy wszystko gra?
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function testFinalIntegration() {
  console.log('🔥 FINAL INTEGRATION TEST - CHECKING EVERYTHING!\n');
  
  let testPassed = true;
  const errors = [];
  
  try {
    // 1. Test podstawowy - czy system się włącza
    console.log('1️⃣ Testing System Startup...');
    const startTime = Date.now();
    
    const echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict',
      learningMode: 'continuous',
      creativeMode: 'enabled',
      collectiveMode: 'anonymous'
    });
    
    console.log('   ✅ EchoLiveOS created');
    
    // 2. Test startup - czy się nie zapętla
    console.log('2️⃣ Testing Startup (no infinite loops)...');
    
    const startupPromise = echo.startup();
    const startupTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Startup timeout - possible infinite loop')), 10000)
    );
    
    await Promise.race([startupPromise, startupTimeout]);
    console.log('   ✅ Startup completed without infinite loops');
    
    // 3. Test statusu systemu
    console.log('3️⃣ Testing System Status...');
    const status = echo.getSystemStatus();
    
    console.log('   Basic engines active:', Object.keys(status.basic).filter(k => status.basic[k]).length);
    console.log('   New engines active:', Object.keys(status.new).filter(k => status.new[k]).length);
    console.log('   System consciousness:', status.system.consciousness);
    
    if (status.system.consciousness !== 'active') {
      errors.push('System consciousness not active');
      testPassed = false;
    }
    
    // 4. Test prostego requestu - czy nie zapętla
    console.log('4️⃣ Testing Simple Request (no infinite loops)...');
    
    const simpleRequest = {
      query: 'Test simple request',
      userId: 'test-user',
      context: {
        urgency: 0.5,
        stakes: 0.5,
        novelty: 0.5,
        complexity: 0.5
      },
      domain: 'test',
      topic: 'simple'
    };
    
    const requestPromise = echo.processRequest(simpleRequest);
    const requestTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout - possible infinite loop')), 15000)
    );
    
    const response = await Promise.race([requestPromise, requestTimeout]);
    console.log('   ✅ Simple request processed without infinite loops');
    console.log('   Processing time:', response.meta.processingTime, 'ms');
    
    if (response.meta.processingTime > 10000) {
      errors.push('Request taking too long - possible inefficiency');
      testPassed = false;
    }
    
    // 5. Test Dual Möbius - czy działa
    console.log('5️⃣ Testing Dual Möbius System...');
    
    if (echo.dualMobiusSystem) {
      const dualStatus = echo.dualMobiusSystem.getDualSystemStatus();
      console.log('   Infinite Loop active:', dualStatus.infiniteLoop.active ? '✅' : '❌');
      console.log('   True Möbius active:', dualStatus.trueMobius.active ? '✅' : '❌');
      console.log('   Hybrid mode enabled:', dualStatus.hybrid.enabled ? '✅' : '❌');
      
      if (!dualStatus.infiniteLoop.active || !dualStatus.trueMobius.active) {
        errors.push('Dual Möbius System not fully active');
        testPassed = false;
      }
    } else {
      errors.push('Dual Möbius System not initialized');
      testPassed = false;
    }
    
    // 6. Test Rubik Cube - czy nie halucynuje
    console.log('6️⃣ Testing Rubik Cube Engine...');
    
    if (echo.rubikCubeEngine) {
      const rubikStatus = echo.rubikCubeEngine.getSystemStatus();
      console.log('   Main cube coherence:', rubikStatus.mainCube.coherence.toFixed(2));
      console.log('   System stable:', rubikStatus.systemState.isStable ? '✅' : '❌');
      console.log('   No hallucinations:', rubikStatus.coherenceRules.noHallucinations ? '✅' : '❌');
      
      if (!rubikStatus.systemState.isStable) {
        errors.push('Rubik Cube System not stable');
        testPassed = false;
      }
      
      if (!rubikStatus.coherenceRules.noHallucinations) {
        errors.push('Rubik Cube System has hallucinations');
        testPassed = false;
      }
    } else {
      errors.push('Rubik Cube Engine not initialized');
      testPassed = false;
    }
    
    // 7. Test Leverage Engine - czy działa
    console.log('7️⃣ Testing Leverage Engine...');
    
    if (echo.leverageEngine) {
      const leverageStatus = echo.leverageEngine.getSystemStatus();
      console.log('   Primary lever active:', leverageStatus.levers.primary ? '✅' : '❌');
      console.log('   Secondary levers:', leverageStatus.levers.secondary);
      console.log('   Total advantage:', leverageStatus.advantages.total.toFixed(2), 'x');
      
      if (!leverageStatus.levers.primary) {
        errors.push('Leverage Engine primary lever not active');
        testPassed = false;
      }
    } else {
      errors.push('Leverage Engine not initialized');
      testPassed = false;
    }
    
    // 8. Test Thousand Brains - czy działa
    console.log('8️⃣ Testing Thousand Brains Engine...');
    
    if (echo.thousandBrainsEngine) {
      const brainsStatus = echo.thousandBrainsEngine.getSystemStatus();
      console.log('   Brains active:', brainsStatus.activeBrains);
      console.log('   Conductor active:', brainsStatus.conductorActive ? '✅' : '❌');
      console.log('   Sixth sense active:', brainsStatus.sixthSenseActive ? '✅' : '❌');
      
      if (!brainsStatus.conductorActive) {
        errors.push('Thousand Brains conductor not active');
        testPassed = false;
      }
    } else {
      errors.push('Thousand Brains Engine not initialized');
      testPassed = false;
    }
    
    // 9. Test wydajności - czy nie spowalnia
    console.log('9️⃣ Testing Performance...');
    
    const performanceStart = Date.now();
    const performanceRequest = {
      query: 'Performance test request',
      userId: 'test-performance',
      context: {
        urgency: 0.8,
        stakes: 0.8,
        novelty: 0.8,
        complexity: 0.8
      },
      domain: 'performance',
      topic: 'test'
    };
    
    const performanceResponse = await echo.processRequest(performanceRequest);
    const performanceTime = Date.now() - performanceStart;
    
    console.log('   Performance request time:', performanceTime, 'ms');
    
    if (performanceTime > 20000) {
      errors.push('Performance request too slow');
      testPassed = false;
    }
    
    // 10. Test shutdown - czy się nie zapętla
    console.log('🔟 Testing Shutdown (no infinite loops)...');
    
    const shutdownPromise = echo.shutdown();
    const shutdownTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Shutdown timeout - possible infinite loop')), 5000)
    );
    
    await Promise.race([shutdownPromise, shutdownTimeout]);
    console.log('   ✅ Shutdown completed without infinite loops');
    
    // 11. Finalny wynik
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎯 FINAL INTEGRATION TEST RESULTS:');
    console.log('   Total test time:', totalTime, 'ms');
    console.log('   Test passed:', testPassed ? '✅' : '❌');
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (testPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ No infinite loops detected');
      console.log('✅ All engines working correctly');
      console.log('✅ System stable and performant');
      console.log('✅ No hallucinations in Rubik Cube');
      console.log('✅ Dual Möbius operational');
      console.log('✅ Leverage Engine working');
      console.log('✅ Thousand Brains active');
      console.log('✅ Ready for production!');
      
      console.log('\n🚀 ECHO LIVEOS 2.0 IS READY FOR DEPLOYMENT!');
      console.log('💥 NEXT STEPS:');
      console.log('   1. Integracja z Twoją aplikacją');
      console.log('   2. Podłączenie do realnych danych');
      console.log('   3. Testy produkcyjne');
      console.log('   4. Wdrożenie dla użytkowników');
      
    } else {
      console.log('\n⚠️  SOME ISSUES FOUND - NEED FIXES');
      console.log('🔧 NEXT STEPS:');
      console.log('   1. Fix reported errors');
      console.log('   2. Re-run integration tests');
      console.log('   3. Optimize performance');
      console.log('   4. Ensure stability');
    }
    
  } catch (error) {
    console.error('❌ Final integration test failed:', error.message);
    console.error('Stack:', error.stack);
    testPassed = false;
  }
  
  return testPassed;
}

// Uruchom test
testFinalIntegration().then(passed => {
  if (passed) {
    console.log('\n🏁 INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('🎊 SYSTEM READY FOR NEXT PHASE!');
  } else {
    console.log('\n🛑 INTEGRATION TEST FAILED - FIXES NEEDED!');
  }
}).catch(error => {
  console.error('💥 CRITICAL ERROR IN TEST:', error);
});
