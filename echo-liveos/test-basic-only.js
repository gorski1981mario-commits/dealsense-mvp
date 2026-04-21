/**
 * TEST PODSTAWOWYCH ENGINE - BEZ NOWYCH
 * Sprawdzamy czy podstawowe działają
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function testBasicOnly() {
  console.log('🚀 TESTING BASIC ENGINES ONLY!\n');
  
  try {
    // 1. Inicjalizacja TYLKO z podstawowymi
    console.log('1️⃣ Initializing ECHO LiveOS with basic engines only...');
    const echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict'
    });
    
    // 2. Sprawdź status
    console.log('2️⃣ Checking basic status...');
    const status = echo.getSystemStatus();
    console.log('✅ Basic Engines:', Object.keys(status.basic).filter(k => status.basic[k]).length, '/5 active');
    
    // 3. Prosty request
    console.log('3️⃣ Testing simple request...');
    const response = await echo.processRequest({
      query: 'What is AI?',
      userId: 'test-user'
    });
    
    console.log('✅ Basic request successful!');
    console.log('   Processing time:', response.meta.processingTime, 'ms');
    
    // 4. Shutdown
    await echo.shutdown();
    console.log('🎉 BASIC TEST PASSED!');
    
  } catch (error) {
    console.error('❌ Basic test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBasicOnly();
