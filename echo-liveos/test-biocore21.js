/**
 * TEST BIOCORE21 - ULTIMATE HYBRID SYSTEM
 */

const { BioCore21, Nod21 } = require('./src/core/BioCore21');
const EthicsCore = require('./src/core/EthicsCore');

async function testBioCore21() {
  console.log('🧪 TESTING BIOCORE21 - ULTIMATE HYBRID\n');
  
  // 1. Initialize
  const ethicsCore = new EthicsCore();
  await ethicsCore.initialize();
  
  const biocore = new BioCore21(ethicsCore, {
    numNodes: 23,
    dim: 6,
    photosyntheticRatio: 0.52,  // 12/23 nodes
    regenerationRatio: 0.13     // 3/23 nodes
  });
  
  await biocore.initialize();
  
  console.log('\n---\n');
  
  // 2. Test individual Nod21
  console.log('📝 TEST 1: Individual Nod21 (Poziom 21 core)');
  
  const nod = new Nod21({ id: 'test_nod', dim: 6 });
  
  const input = [0.5, 0.3, 0.7, 0.2, 0.9, 0.4];
  
  console.log('\nInput:', input);
  
  // Quick sample (1 iteration)
  const quickResult = nod.quickSample(input);
  console.log('Quick sample (1 iter):', quickResult.map(v => v.toFixed(4)));
  
  // Full processing (10 iterations)
  const fullResult = nod.process(input, 10);
  console.log('Full processing (10 iter):', fullResult.map(v => v.toFixed(4)));
  
  console.log('\nNod21 status:', nod.getStatus());
  
  console.log('\n---\n');
  
  // 3. Test MOMENTUM + VELOCITY
  console.log('📝 TEST 2: Momentum + Velocity (Poziom 21)');
  
  const nod2 = new Nod21({ id: 'momentum_test', dim: 3 });
  
  const states = [];
  let state = [0.5, 0.5, 0.5];
  
  for (let i = 0; i < 5; i++) {
    state = nod2.process(state, 1);
    states.push([...state]);
    console.log(`Iteration ${i + 1}: [${state.map(v => v.toFixed(3)).join(', ')}]`);
  }
  
  console.log('\nVelocity:', nod2.velocity.map(v => v.toFixed(4)));
  console.log('Memory:', nod2.memory.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 4. Test CHAOS PARAMETERS
  console.log('📝 TEST 3: Chaos Parameters (żywe alpha/beta)');
  
  const nod3 = new Nod21({ id: 'chaos_test', dim: 3 });
  
  const testInput = [0.5, 0.3, 0.7];
  
  // Symuluj różne stany pamięci i sprawdź jak alpha/beta się zmieniają
  for (let i = 0; i < 5; i++) {
    nod3.memory = [i * 0.2, i * 0.3, i * 0.1];
    
    const memSum = nod3.memory.reduce((sum, m) => sum + m, 0);
    const alpha = 0.7 + 0.19 * Math.cos(memSum);
    const beta = 0.7 + 0.06 * Math.sin(memSum);
    
    console.log(`Memory sum: ${memSum.toFixed(3)} → alpha=${alpha.toFixed(3)}, beta=${beta.toFixed(3)}`);
  }
  
  console.log('\n---\n');
  
  // 5. Test LOOP DETECTION
  console.log('📝 TEST 4: Loop Detection (anti-stagnation)');
  
  const nod4 = new Nod21({ id: 'loop_test', dim: 3 });
  
  // Symuluj zapętlenie - ten sam input wiele razy
  const loopInput = [0.1, 0.1, 0.1];
  
  for (let i = 0; i < 20; i++) {
    nod4.process(loopInput, 1);
  }
  
  console.log(`Loop detections: ${nod4.loopDetections}`);
  console.log('Status:', nod4.getStatus());
  
  console.log('\n---\n');
  
  // 6. Test BIOCORE21 THINK
  console.log('📝 TEST 5: BioCore21 THINK (full system)');
  
  const thinkInput = [0.5, 0.3, 0.7, 0.2, 0.9, 0.4];
  const result = await biocore.think(thinkInput);
  
  console.log('\n=== RESULTS ===');
  console.log('Input:', thinkInput);
  console.log('Output:', result.result.map(v => v.toFixed(4)));
  console.log('Swarm signal:', result.swarmSignal.map(v => v.toFixed(4)));
  console.log('Active nodes:', result.activeNodes, '/', result.totalNodes);
  console.log('Regenerated nodes:', result.regeneratedNodes);
  console.log('Processing time:', result.processingTime + 'ms');
  
  console.log('\n---\n');
  
  // 7. Test FOTOSYNTEZA (energy savings)
  console.log('📝 TEST 6: Photosynthesis (energy savings)');
  
  const biocore2 = new BioCore21(ethicsCore, {
    numNodes: 20,
    dim: 5,
    photosyntheticRatio: 0.5  // 50% (10/20)
  });
  
  await biocore2.initialize();
  
  const result2 = await biocore2.think([0.5, 0.5, 0.5, 0.5, 0.5]);
  
  console.log('\n=== PHOTOSYNTHESIS RESULTS ===');
  console.log('Total nodes:', result2.totalNodes);
  console.log('Active nodes:', result2.activeNodes);
  console.log('Energy savings:', ((1 - result2.activeNodes / result2.totalNodes) * 100).toFixed(0) + '%');
  console.log('Photosynthetic savings (cumulative):', biocore2.metrics.photosyntheticSavings);
  
  console.log('\n---\n');
  
  // 8. Test REGENERACJA (multiple cycles)
  console.log('📝 TEST 7: Regeneration (multiple cycles)');
  
  const biocore3 = new BioCore21(ethicsCore, {
    numNodes: 10,
    dim: 4,
    photosyntheticRatio: 0.6,
    regenerationRatio: 0.2  // 20% regeneration
  });
  
  await biocore3.initialize();
  
  console.log('\nRunning 5 cycles...');
  for (let i = 0; i < 5; i++) {
    const cycleResult = await biocore3.think([0.5, 0.5, 0.5, 0.5]);
    console.log(`Cycle ${i + 1}: Regenerated ${cycleResult.regeneratedNodes} nodes`);
  }
  
  console.log('\nTotal regenerations:', biocore3.metrics.totalRegenerations);
  
  console.log('\n---\n');
  
  // 9. Test SWARM SIGNAL
  console.log('📝 TEST 8: Swarm Signal (collective intelligence)');
  
  const biocore4 = new BioCore21(ethicsCore, {
    numNodes: 8,
    dim: 3
  });
  
  await biocore4.initialize();
  
  const result4 = await biocore4.think([0.8, 0.2, 0.5]);
  
  console.log('\n=== SWARM SIGNAL ===');
  console.log('Individual outputs (sample):');
  const status = biocore4.getStatus();
  status.nodes.slice(0, 3).forEach((n, i) => {
    console.log(`  Node ${i}: processCount=${n.processCount}, loopDetections=${n.loopDetections}`);
  });
  
  console.log('\nSwarm signal:', result4.swarmSignal.map(v => v.toFixed(4)));
  console.log('Final result:', result4.result.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 10. Test GLOBAL MEMORY
  console.log('📝 TEST 9: Global Memory (system learning)');
  
  const biocore5 = new BioCore21(ethicsCore, {
    numNodes: 5,
    dim: 3
  });
  
  await biocore5.initialize();
  
  console.log('\nInitial global memory:', biocore5.globalMemory.map(v => v.toFixed(4)));
  
  await biocore5.think([0.5, 0.5, 0.5]);
  console.log('After 1st think:', biocore5.globalMemory.map(v => v.toFixed(4)));
  
  await biocore5.think([0.8, 0.2, 0.6]);
  console.log('After 2nd think:', biocore5.globalMemory.map(v => v.toFixed(4)));
  
  await biocore5.think([0.3, 0.7, 0.4]);
  console.log('After 3rd think:', biocore5.globalMemory.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 11. System status
  console.log('📝 TEST 10: System Status');
  
  const finalStatus = biocore.getStatus();
  
  console.log('\nBioCore21 Status:');
  console.log('  Total nodes:', finalStatus.numNodes);
  console.log('  Active nodes:', finalStatus.activeNodes);
  console.log('  Dimension:', finalStatus.dim);
  console.log('  Photosynthetic ratio:', (finalStatus.photosyntheticRatio * 100).toFixed(0) + '%');
  console.log('  Regeneration ratio:', (finalStatus.regenerationRatio * 100).toFixed(0) + '%');
  console.log('  Global memory:', finalStatus.globalMemory.map(v => v.toFixed(3)));
  console.log('  Metrics:', finalStatus.metrics);
  
  console.log('\nTop 5 nodes by process count:');
  const topNodes = finalStatus.nodes
    .sort((a, b) => b.processCount - a.processCount)
    .slice(0, 5);
  
  topNodes.forEach((n, i) => {
    console.log(`  ${i + 1}. ${n.id}: processCount=${n.processCount}, loopDetections=${n.loopDetections}`);
  });
  
  console.log('\n---\n');
  
  // 12. Shutdown
  await biocore.shutdown();
  await biocore2.shutdown();
  await biocore3.shutdown();
  await biocore4.shutdown();
  await biocore5.shutdown();
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
  console.log('🎯 BIOCORE21 - ULTIMATE HYBRID SYSTEM');
  console.log('   - Poziom 21 core processing (momentum, velocity, chaos, loop detection)');
  console.log('   - Swarm management (fotosynteza, regeneracja, grzybnienie)');
  console.log('   - Energy savings: 48-50%');
  console.log('   - Winrate target: 97%+');
}

// Run tests
testBioCore21().catch(console.error);
