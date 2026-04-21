/**
 * QUICK TEST - Szybki test Echo LiveOS 2.0
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function quickTest() {
  console.log('🚀 QUICK TEST ECHO LiveOS 2.0');
  console.log('='.repeat(50));
  
  try {
    // 1. Inicjalizacja
    console.log('\n1️⃣ Initializing...');
    const echo = new EchoLiveOS();
    
    // 2. Startup
    console.log('\n2️⃣ Starting up...');
    const startupResult = await echo.startup();
    
    console.log('\n✅ STARTUP RESULT:');
    console.log('   Success:', startupResult.success);
    console.log('   Status:', startupResult.status);
    console.log('   Consciousness:', startupResult.consciousness);
    console.log('   Coherence:', startupResult.coherence);
    console.log('   Ethical Score:', startupResult.ethicalScore);
    
    // 3. System Status
    console.log('\n3️⃣ System Status:');
    const status = echo.getSystemStatus();
    console.log('   Active:', status.active);
    console.log('   Coherence:', status.coherence);
    console.log('   Ethical Score:', status.ethicalScore);
    console.log('   Consciousness:', status.consciousness);
    
    // 4. Shutdown
    console.log('\n4️⃣ Shutting down...');
    await echo.shutdown();
    
    console.log('\n🎯 TEST PASSED! ✅');
    console.log('Echo LiveOS 2.0 is WORKING!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

quickTest();
