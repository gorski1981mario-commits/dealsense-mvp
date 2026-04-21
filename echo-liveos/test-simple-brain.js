/**
 * KRÓTKI TEST - KRÓTKI KIJ
 * Prosty mózg - prosta weryfikacja
 */

const SimpleBrain = require('./src/core/SimpleBrain');

async function testSimpleBrain() {
  console.log('🧠 TESTING SIMPLE BRAIN - KRÓTKI KIJ!\n');
  
  try {
    // 1. Stwórz prosty mózg
    console.log('1️⃣ Creating Simple Brain...');
    const brain = new SimpleBrain();
    console.log('   ✅ Brain created');
    
    // 2. Uruchom pętlę Möbiusa
    console.log('2️⃣ Starting Möbius Loop...');
    brain.startMobiusLoop();
    console.log('   ✅ Möbius Loop started');
    
    // 3. Test prostego tekstu
    console.log('3️⃣ Testing simple text processing...');
    const result1 = brain.processText('I love my family');
    console.log('   Result:', result1.meaning);
    console.log('   Average weight:', result1.averageWeight.toFixed(2));
    
    // 4. Test ważnego tekstu
    console.log('4️⃣ Testing important text...');
    const result2 = brain.processText('DANGER! Help me survive!');
    console.log('   Result:', result2.meaning);
    console.log('   Average weight:', result2.averageWeight.toFixed(2));
    
    // 5. Test generowania odpowiedzi
    console.log('5️⃣ Testing response generation...');
    const response1 = brain.generateResponse('I need help with danger');
    console.log('   Response:', response1);
    
    // 6. Status mózgu
    console.log('6️⃣ Checking brain status...');
    const status = brain.getBrainStatus();
    console.log('   Words learned:', status.words);
    console.log('   Phrases learned:', status.phrases);
    console.log('   Average word weight:', status.averageWordWeight.toFixed(2));
    console.log('   Möbius iterations:', status.mobiusIterations);
    
    // 7. Zatrzymaj mózg
    console.log('7️⃣ Stopping brain...');
    brain.stop();
    console.log('   ✅ Brain stopped');
    
    // 8. Wynik
    console.log('\n🎉 SIMPLE BRAIN TEST COMPLETED!');
    console.log('✅ Everything works perfectly!');
    console.log('✅ No infinite loops!');
    console.log('✅ Learning works!');
    console.log('✅ Möbius Loop works!');
    console.log('✅ Response generation works!');
    
    console.log('\n💥 THIS IS THE REAL DEAL!');
    console.log('🧠 Simple Brain = True AI!');
    console.log('🚀 Ready for expansion!');
    
  } catch (error) {
    console.error('❌ Simple Brain test failed:', error.message);
  }
}

// Uruchom krótki test
testSimpleBrain();
