/**
 * TEST BIOKNOT SWARM
 */

const { BioKnotSwarm, BioKnot, MyceliumNetwork } = require('./src/core/BioKnot');
const EthicsCore = require('./src/core/EthicsCore');

async function testBioKnot() {
  console.log('🧪 TESTING BIOKNOT SWARM\n');
  
  // 1. Initialize
  const ethicsCore = new EthicsCore();
  await ethicsCore.initialize();
  
  const swarm = new BioKnotSwarm(ethicsCore, {
    numKnots: 16,
    photosyntheticThreshold: 0.5,  // Top 50%
    regenerationThreshold: 0.3,
    regenerationCheckInterval: 5,
    votingInterval: 3,
    votingThreshold: 0.6
  });
  
  await swarm.initialize();
  
  console.log('\n---\n');
  
  // 2. Test SWARM THINK
  console.log('📝 TEST 1: SWARM THINK with voting and regeneration');
  const input = [0.5, 0.3, 0.7, 0.2, 0.9];
  const result = await swarm.swarmThink(input, 10);
  
  console.log('\n=== RESULTS ===');
  console.log('Input:', input);
  console.log('Output:', result.result.map(v => v.toFixed(4)));
  console.log('Active knots:', result.activeKnots, '/', result.totalKnots);
  console.log('Processing time:', result.processingTime + 'ms');
  
  console.log('\n---\n');
  
  // 3. Test individual BioKnot
  console.log('📝 TEST 2: Individual BioKnot');
  
  const bioknot = new BioKnot({
    id: 'test_knot',
    alpha: 0.7,
    beta: 0.5,
    loops: 5
  });
  
  console.log('\nBioKnot config:', bioknot.getStatus());
  
  // Test photosynthesis
  const photoResult = bioknot.photosynthesis([0.5, 0.3, 0.7]);
  console.log('\nPhotosynthesis result:');
  console.log('  State:', photoResult.state.map(v => v.toFixed(4)));
  console.log('  Quality:', photoResult.quality.toFixed(4));
  console.log('  Efficiency:', photoResult.efficiency.toFixed(4));
  
  // Test full processing
  const processResult = bioknot.process([0.5, 0.3, 0.7]);
  console.log('\nFull processing result:', processResult.map(v => v.toFixed(4)));
  
  console.log('\n---\n');
  
  // 4. Test MYCELIUM NETWORK
  console.log('📝 TEST 3: Mycelium Network (cross-knot communication)');
  
  const network = new MyceliumNetwork();
  
  const knot1 = new BioKnot({ id: 'knot_1' });
  const knot2 = new BioKnot({ id: 'knot_2' });
  const knot3 = new BioKnot({ id: 'knot_3' });
  
  network.registerKnot(knot1);
  network.registerKnot(knot2);
  network.registerKnot(knot3);
  
  // Knot 1 przetwarza i dzieli się stanem
  knot1.process([0.5, 0.3, 0.7]);
  knot1.shareState();
  
  console.log('\nKnot 1 shared state');
  console.log('Knot 2 received states:', knot2.sharedStates.size);
  console.log('Knot 3 received states:', knot3.sharedStates.size);
  
  // Sprawdź czy knot2 otrzymał stan od knot1
  const receivedState = knot2.sharedStates.get('knot_1');
  console.log('\nKnot 2 received from Knot 1:');
  console.log('  Energy:', receivedState?.energy);
  console.log('  Health:', receivedState?.health);
  console.log('  Leadership score:', receivedState?.leadershipScore);
  
  console.log('\n---\n');
  
  // 5. Test VOTING
  console.log('📝 TEST 4: Voting mechanism');
  
  const voter = new BioKnot({ id: 'voter' });
  voter.process([0.5, 0.3, 0.7]);
  voter.trajectory = [0.8, 0.6, 0.9];
  voter.energy = 0.8;
  voter.leadershipScore = 0.7;
  
  const currentTrajectory = [0.2, 0.1, 0.3];
  const vote = voter.voteForDirection(currentTrajectory);
  
  console.log('\nVoting result:');
  console.log('  Vote:', vote.vote ? 'YES' : 'NO');
  console.log('  Confidence:', (vote.confidence * 100).toFixed(1) + '%');
  console.log('  Trajectory:', vote.trajectory?.map(v => v.toFixed(3)));
  
  console.log('\n---\n');
  
  // 6. Test REGENERATION
  console.log('📝 TEST 5: Regeneration mechanism');
  
  const regenerator = new BioKnot({ id: 'regenerator' });
  
  console.log('\nBefore regeneration:');
  console.log('  Alpha:', regenerator.alpha.toFixed(3));
  console.log('  Beta:', regenerator.beta.toFixed(3));
  console.log('  Loops:', regenerator.loops);
  console.log('  Age:', regenerator.age);
  console.log('  Regeneration count:', regenerator.regenerationCount);
  
  // Symuluj słaby performance
  regenerator.updatePerformance(0.2);
  regenerator.updatePerformance(0.1);
  regenerator.updatePerformance(0.15);
  
  console.log('\nPerformance history:', regenerator.performanceHistory.map(p => p.toFixed(2)));
  console.log('Health:', regenerator.health.toFixed(3));
  
  // Regeneruj
  regenerator.regenerate();
  
  console.log('\nAfter regeneration:');
  console.log('  Alpha:', regenerator.alpha.toFixed(3));
  console.log('  Beta:', regenerator.beta.toFixed(3));
  console.log('  Loops:', regenerator.loops);
  console.log('  Age:', regenerator.age);
  console.log('  Regeneration count:', regenerator.regenerationCount);
  
  console.log('\n---\n');
  
  // 7. Test PHOTOSYNTHETIC EFFICIENCY
  console.log('📝 TEST 6: Photosynthetic efficiency comparison');
  
  const efficientKnot = new BioKnot({ id: 'efficient' });
  efficientKnot.photosyntheticEfficiency = 0.9;
  
  const inefficientKnot = new BioKnot({ id: 'inefficient' });
  inefficientKnot.photosyntheticEfficiency = 0.3;
  
  const testInput = [0.5, 0.3, 0.7];
  
  const efficientResult = efficientKnot.photosynthesis(testInput);
  const inefficientResult = inefficientKnot.photosynthesis(testInput);
  
  console.log('\nEfficient knot (efficiency=0.9):');
  console.log('  Quality:', efficientResult.quality.toFixed(4));
  
  console.log('\nInefficient knot (efficiency=0.3):');
  console.log('  Quality:', inefficientResult.quality.toFixed(4));
  
  console.log('\nDifference:', ((efficientResult.quality - inefficientResult.quality) * 100).toFixed(1) + '%');
  
  console.log('\n---\n');
  
  // 8. Test FULL SWARM with multiple iterations
  console.log('📝 TEST 7: Full swarm with multiple iterations');
  
  const swarm2 = new BioKnotSwarm(ethicsCore, {
    numKnots: 8,
    photosyntheticThreshold: 0.625,  // Top 62.5% (5/8)
    regenerationThreshold: 0.25,
    regenerationCheckInterval: 3,
    votingInterval: 2,
    votingThreshold: 0.5
  });
  
  await swarm2.initialize();
  
  console.log('\nRunning swarm think with 15 iterations...');
  const result2 = await swarm2.swarmThink([0.5, 0.5, 0.5], 15);
  
  console.log('\n=== RESULTS ===');
  console.log('Output:', result2.result.map(v => v.toFixed(4)));
  console.log('Active knots:', result2.activeKnots, '/', result2.totalKnots);
  console.log('Energy savings:', ((result2.totalKnots - result2.activeKnots) / result2.totalKnots * 100).toFixed(0) + '%');
  
  console.log('\n---\n');
  
  // 9. System status
  console.log('📝 TEST 8: System status');
  
  const status = swarm.getStatus();
  console.log('\nSwarm status:');
  console.log('  Total knots:', status.numKnots);
  console.log('  Active knots:', status.activeKnots);
  console.log('  Metrics:', status.metrics);
  console.log('  Mycelium network:', status.myceliumNetwork);
  
  console.log('\nTop 5 knots by leadership:');
  const topKnots = status.knots
    .sort((a, b) => b.leadershipScore - a.leadershipScore)
    .slice(0, 5);
  
  topKnots.forEach((k, i) => {
    console.log(`  ${i + 1}. ${k.id}: leadership=${k.leadershipScore.toFixed(3)}, energy=${k.energy.toFixed(3)}, health=${k.health.toFixed(3)}, votes=${k.successfulVotes}`);
  });
  
  console.log('\nKnots regenerated:', status.knots.filter(k => k.regenerationCount > 0).length);
  
  console.log('\n---\n');
  
  // 10. Shutdown
  await swarm.shutdown();
  await swarm2.shutdown();
  
  console.log('\n✅ ALL TESTS COMPLETED!\n');
}

// Run tests
testBioKnot().catch(console.error);
