/**
 * TEST TEMPORAL LOOP ENGINE
 */

const TemporalLoopEngine = require('./src/core/TemporalLoopEngine');
const EthicsCore = require('./src/core/EthicsCore');

async function testTemporalLoop() {
  console.log('🧪 TESTING TEMPORAL LOOP ENGINE\n');
  
  // 1. Initialize
  const ethicsCore = new EthicsCore();
  await ethicsCore.initialize();
  
  const temporalLoop = new TemporalLoopEngine(ethicsCore);
  await temporalLoop.initialize();
  
  console.log('\n---\n');
  
  // 2. Test simple state processing
  console.log('📝 TEST 1: Simple state processing');
  const simpleState = [0.5, 0.3, 0.7, 0.2, 0.9];
  const result1 = await temporalLoop.process(simpleState);
  
  console.log('Input state:', simpleState);
  console.log('Output state:', result1.result);
  console.log('Processing time:', result1.processingTime + 'ms');
  console.log('Temporal jumps:', result1.temporalJumps);
  console.log('Spatial compressions:', result1.spatialCompressions);
  
  console.log('\n---\n');
  
  // 3. Test problem processing
  console.log('📝 TEST 2: Problem processing');
  const problem = 'Hoe kan ik mijn bedrijf laten groeien?';
  const result2 = await temporalLoop.processProblem(problem);
  
  console.log('Problem:', result2.problem);
  console.log('Solution:', result2.solution);
  console.log('Confidence:', (result2.confidence * 100).toFixed(1) + '%');
  console.log('Temporal analysis:', result2.temporalAnalysis);
  
  console.log('\n---\n');
  
  // 4. Test multiple iterations
  console.log('📝 TEST 3: Multiple iterations');
  for (let i = 0; i < 3; i++) {
    const testState = [Math.random(), Math.random(), Math.random()];
    const result = await temporalLoop.process(testState);
    console.log(`Iteration ${i + 1}:`, result.result.map(v => v.toFixed(3)));
  }
  
  console.log('\n---\n');
  
  // 5. Status check
  console.log('📝 TEST 4: System status');
  const status = temporalLoop.getStatus();
  console.log('Status:', JSON.stringify(status, null, 2));
  
  console.log('\n---\n');
  
  // 6. Shutdown
  await temporalLoop.shutdown();
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
}

// Run tests
testTemporalLoop().catch(console.error);
