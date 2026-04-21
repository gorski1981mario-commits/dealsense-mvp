/**
 * TEST KNOT SYSTEM
 */

const { KnotSystem, MicroKnot } = require('./src/core/KnotSystem');
const EthicsCore = require('./src/core/EthicsCore');

async function testKnotSystem() {
  console.log('🧪 TESTING KNOT SYSTEM\n');
  
  // 1. Initialize
  const ethicsCore = new EthicsCore();
  await ethicsCore.initialize();
  
  const knotSystem = new KnotSystem(ethicsCore, {
    numKnots: 8,
    diversityMultiplier: 2.0,
    diversityThreshold: 0.1
  });
  
  await knotSystem.initialize();
  
  console.log('\n---\n');
  
  // 2. Test simple state processing
  console.log('📝 TEST 1: Simple state processing');
  const simpleState = [0.5, 0.3, 0.7, 0.2, 0.9];
  const result1 = await knotSystem.process(simpleState);
  
  console.log('\nInput state:', simpleState);
  console.log('Output state:', result1.result.map(v => v.toFixed(4)));
  console.log('Diversity:', result1.diversity.toFixed(4));
  console.log('Diversity bonus:', result1.diversityBonus.toFixed(4));
  console.log('Processing time:', result1.processingTime + 'ms');
  console.log('\nKnot results:');
  result1.knotResults.forEach((kr, i) => {
    console.log(`  ${kr.knotId}: speed=${kr.speed.toFixed(3)}, weight=${result1.weights[i].toFixed(3)}, result=[${kr.result.map(v => v.toFixed(3)).join(', ')}]`);
  });
  
  console.log('\n---\n');
  
  // 3. Test problem processing
  console.log('📝 TEST 2: Problem processing');
  const problem = 'Hoe kan ik mijn bedrijf laten groeien met beperkt budget?';
  const result2 = await knotSystem.processProblem(problem);
  
  console.log('\nProblem:', result2.problem);
  console.log('Solution:', result2.solution);
  console.log('Confidence:', (result2.confidence * 100).toFixed(1) + '%');
  console.log('Knot analysis:', result2.knotAnalysis);
  
  console.log('\n---\n');
  
  // 4. Test multiple iterations
  console.log('📝 TEST 3: Multiple iterations (diversity check)');
  const diversities = [];
  for (let i = 0; i < 5; i++) {
    const testState = [Math.random(), Math.random(), Math.random()];
    const result = await knotSystem.process(testState);
    diversities.push(result.diversity);
    console.log(`Iteration ${i + 1}: diversity=${result.diversity.toFixed(4)}, bonus=${result.diversityBonus.toFixed(4)}`);
  }
  
  const avgDiversity = diversities.reduce((sum, d) => sum + d, 0) / diversities.length;
  console.log(`\nAverage diversity: ${avgDiversity.toFixed(4)}`);
  
  console.log('\n---\n');
  
  // 5. Test individual MicroKnot
  console.log('📝 TEST 4: Individual MicroKnot');
  const microKnot = new MicroKnot({
    id: 'test_knot',
    alpha: 0.6,
    beta: 0.15,
    loops: 5
  });
  
  const knotInput = [0.5, 0.3, 0.7];
  const knotOutput = microKnot.process(knotInput);
  
  console.log('MicroKnot config:', { alpha: microKnot.alpha, beta: microKnot.beta, loops: microKnot.loops, speed: microKnot.speed.toFixed(3) });
  console.log('Input:', knotInput);
  console.log('Output:', knotOutput.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 6. System status
  console.log('📝 TEST 5: System status');
  const status = knotSystem.getStatus();
  console.log('\nStatus:', JSON.stringify(status, null, 2));
  
  console.log('\n---\n');
  
  // 7. Shutdown
  await knotSystem.shutdown();
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
}

// Run tests
testKnotSystem().catch(console.error);
