/**
 * TEST DIVERSE KNOT SWARM
 */

const { DiverseKnotSwarm, DiverseKnot } = require('./src/core/DiverseKnotSwarm');
const EthicsCore = require('./src/core/EthicsCore');

async function testDiverseKnotSwarm() {
  console.log('🧪 TESTING DIVERSE KNOT SWARM\n');
  
  // 1. Initialize
  const ethicsCore = new EthicsCore();
  await ethicsCore.initialize();
  
  const swarm = new DiverseKnotSwarm(ethicsCore, {
    numKnots: 16,
    swarmDepth: 5,
    useSwarmProcessing: true
  });
  
  await swarm.initialize();
  
  console.log('\n---\n');
  
  // 2. Test simple state processing
  console.log('📝 TEST 1: Simple state processing');
  const simpleState = [0.5, 0.3, 0.7, 0.2, 0.9];
  const result1 = await swarm.process(simpleState);
  
  console.log('\nInput state:', simpleState);
  console.log('Output state:', result1.result.map(v => v.toFixed(4)));
  console.log('Diversity:', result1.diversity.toFixed(4));
  console.log('Confidence:', (result1.confidence * 100).toFixed(1) + '%');
  console.log('Processing time:', result1.processingTime + 'ms');
  
  console.log('\nTop 5 knots by weight:');
  const sortedKnots = result1.knotOutputs
    .map((ko, idx) => ({ ...ko, weight: result1.weights[idx] }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
  
  sortedKnots.forEach((ko, i) => {
    const personality = ko.identity < 0.3 ? 'konserwatywny' : 
                       ko.identity < 0.7 ? 'zrównoważony' : 'chaotyczny';
    console.log(`  ${i + 1}. ${ko.knotId}: identity=${ko.identity.toFixed(3)} (${personality}), weight=${ko.weight.toFixed(3)}`);
  });
  
  console.log('\n---\n');
  
  // 3. Test problem processing
  console.log('📝 TEST 2: Problem processing');
  const problem = 'Hoe kan ik innovatief denken en tegelijkertijd risico\'s minimaliseren?';
  const result2 = await swarm.processProblem(problem);
  
  console.log('\nProblem:', result2.problem);
  console.log('Solution:', result2.solution);
  console.log('Confidence:', (result2.confidence * 100).toFixed(1) + '%');
  console.log('Swarm analysis:', result2.swarmAnalysis);
  
  console.log('\n---\n');
  
  // 4. Test individual DiverseKnot
  console.log('📝 TEST 3: Individual DiverseKnot (konserwatywny vs chaotyczny)');
  
  const conservativeKnot = new DiverseKnot({
    id: 'conservative',
    identity: 0.1  // Bardzo konserwatywny
  });
  
  const chaoticKnot = new DiverseKnot({
    id: 'chaotic',
    identity: 0.9  // Bardzo chaotyczny
  });
  
  const testInput = [0.5, 0.3, 0.7];
  
  console.log('\nKonserwatywny knot (identity=0.1):');
  console.log('  Config:', conservativeKnot.getStatus());
  const conservativeOutput = conservativeKnot.process(testInput);
  console.log('  Output:', conservativeOutput.map(v => v.toFixed(4)));
  
  console.log('\nChaotyczny knot (identity=0.9):');
  console.log('  Config:', chaoticKnot.getStatus());
  const chaoticOutput = chaoticKnot.process(testInput);
  console.log('  Output:', chaoticOutput.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 5. Test swarm processing (depth layers)
  console.log('📝 TEST 4: Swarm processing (depth layers)');
  
  const swarmKnot = new DiverseKnot({
    id: 'swarm_test',
    identity: 0.5
  });
  
  const swarmResult = swarmKnot.swarmProcess([0.5, 0.3, 0.7], 5);
  
  console.log('\nSwarm layers:', swarmResult.swarm.length);
  console.log('Depth weights:', swarmResult.weights.map(w => w.toFixed(3)));
  console.log('Final result:', swarmResult.result.map(v => v.toFixed(4)));
  
  console.log('\nEach layer:');
  swarmResult.swarm.forEach((layer, i) => {
    console.log(`  Layer ${i}: [${layer.map(v => v.toFixed(3)).join(', ')}] (weight=${swarmResult.weights[i].toFixed(3)})`);
  });
  
  console.log('\n---\n');
  
  // 6. Test diversity across identities
  console.log('📝 TEST 5: Diversity across identities');
  
  const identities = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const outputs = [];
  
  for (const identity of identities) {
    const knot = new DiverseKnot({ identity });
    const output = knot.process([0.5, 0.5, 0.5]);
    outputs.push({ identity, output });
  }
  
  console.log('\nOutputs by identity:');
  outputs.forEach(o => {
    console.log(`  Identity ${o.identity.toFixed(1)}: [${o.output.map(v => v.toFixed(3)).join(', ')}]`);
  });
  
  // Oblicz variance
  const values = outputs.map(o => o.output[0]);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  
  console.log(`\nVariance across identities: ${variance.toFixed(4)}`);
  console.log(`Standard deviation: ${Math.sqrt(variance).toFixed(4)}`);
  
  console.log('\n---\n');
  
  // 7. Compare standard vs swarm processing
  console.log('📝 TEST 6: Standard vs Swarm processing');
  
  const swarmStandard = new DiverseKnotSwarm(ethicsCore, {
    numKnots: 8,
    swarmDepth: 5,
    useSwarmProcessing: false  // STANDARD
  });
  await swarmStandard.initialize();
  
  const swarmAdvanced = new DiverseKnotSwarm(ethicsCore, {
    numKnots: 8,
    swarmDepth: 5,
    useSwarmProcessing: true  // SWARM
  });
  await swarmAdvanced.initialize();
  
  const testState = [0.5, 0.3, 0.7, 0.2, 0.9];
  
  console.log('\nStandard processing:');
  const resultStandard = await swarmStandard.process(testState);
  console.log('  Output:', resultStandard.result.map(v => v.toFixed(4)));
  console.log('  Diversity:', resultStandard.diversity.toFixed(4));
  console.log('  Time:', resultStandard.processingTime + 'ms');
  
  console.log('\nSwarm processing (depth layers):');
  const resultAdvanced = await swarmAdvanced.process(testState);
  console.log('  Output:', resultAdvanced.result.map(v => v.toFixed(4)));
  console.log('  Diversity:', resultAdvanced.diversity.toFixed(4));
  console.log('  Time:', resultAdvanced.processingTime + 'ms');
  
  console.log('\n---\n');
  
  // 8. System status
  console.log('📝 TEST 7: System status');
  const status = swarm.getStatus();
  console.log('\nStatus summary:');
  console.log('  Active:', status.active);
  console.log('  Num knots:', status.numKnots);
  console.log('  Swarm depth:', status.swarmDepth);
  console.log('  Swarm processing:', status.useSwarmProcessing);
  console.log('  Metrics:', status.metrics);
  
  console.log('\n---\n');
  
  // 9. Shutdown
  await swarm.shutdown();
  await swarmStandard.shutdown();
  await swarmAdvanced.shutdown();
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
}

// Run tests
testDiverseKnotSwarm().catch(console.error);
