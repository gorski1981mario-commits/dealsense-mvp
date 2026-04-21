/**
 * TEST THOUSAND BRAINS ENGINE Z PRAWDZIWYM MOBIUSEM
 */

const ThousandBrainsEngine = require('./src/core/ThousandBrainsEngine');

async function testThousandBrains() {
  console.log('🧠 TESTING THOUSAND BRAINS WITH REAL MÖBIUS!\n');
  
  try {
    // 1. Inicjalizacja
    console.log('1️⃣ Initializing Thousand Brains Engine...');
    const engine = new ThousandBrainsEngine();
    await engine.initialize();
    
    // 2. Status
    console.log('2️⃣ Status:');
    const status = engine.getStatus();
    console.log('   Total brains:', status.totalBrains);
    console.log('   Active brains:', status.activeBrains);
    console.log('   Is running:', status.isRunning);
    
    // 3. Prosty problem
    console.log('\n3️⃣ Processing simple problem...');
    const result = await engine.processProblem(
      'What is the meaning of life?',
      {
        urgency: 0.5,
        stakes: 0.8,
        novelty: 0.7,
        ethical_dilemma: true
      }
    );
    
    console.log('✅ Problem processed!');
    console.log('   Contributing brains:', result.contributingBrains.length);
    console.log('   Confidence:', result.confidence);
    console.log('   Sixth sense:', result.sixthSenseActivated);
    console.log('   Processing time:', result.processingTime, 'ms');
    
    // 4. Stop
    await engine.stop();
    console.log('\n🎉 THOUSAND BRAINS TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Thousand Brains test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testThousandBrains();
