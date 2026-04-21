/**
 * TEST EMERGENT CREATIVITY
 * 
 * Pokazuje jak ECHO używa:
 * - Möbius 180° Twist (transformacja perspektywy)
 * - Leverage (trade-off siła vs precyzja)
 * - Rubik Torsion (emergent patterns)
 * 
 * Żeby WYMYŚLAĆ NOWE RZECZY
 */

const EmergentCreativity = require('./src/core/EmergentCreativity');
const EthicsCore = require('./src/core/EthicsCore');
const RubikCubeEngine = require('./src/core/RubikCubeEngine');
const MobiusMetaLearning = require('./src/core/MobiusMetaLearning');
const LeverageEngine = require('./src/core/LeverageEngine');

async function testCreativity() {
  console.log('🎨 TESTING EMERGENT CREATIVITY');
  console.log('='.repeat(70));
  
  try {
    // Inicjalizacja
    console.log('\n📦 Initializing engines...');
    const ethicsCore = new EthicsCore();
    await ethicsCore.initialize();
    
    const rubikCube = new RubikCubeEngine(ethicsCore);
    await rubikCube.initialize();
    
    const mobiusLoop = new MobiusMetaLearning(ethicsCore);
    await mobiusLoop.initialize();
    
    const leverageEngine = new LeverageEngine(ethicsCore);
    await leverageEngine.initialize();
    
    const creativity = new EmergentCreativity(
      ethicsCore,
      rubikCube,
      mobiusLoop,
      leverageEngine
    );
    
    console.log('✅ All engines initialized');
    
    // TEST 1: Wymyśl nową funkcję dla DealSense
    console.log('\n' + '='.repeat(70));
    console.log('TEST 1: Create new DealSense feature');
    console.log('='.repeat(70));
    
    const problem1 = {
      description: 'Users want to save money but don\'t know what to buy',
      domain: 'shopping',
      goal: 'Create new feature'
    };
    
    const existingKnowledge1 = [
      'Scanner (scan products)',
      'Configurators (configure services)',
      'Ghost Mode (monitor prices)',
      'Smart Bundles (bundle products)'
    ];
    
    const creation1 = await creativity.createSomethingNew(problem1, existingKnowledge1);
    
    console.log('\n📊 RESULTS:');
    console.log(`   Novelty: ${creation1.final.novelty.toFixed(2)}`);
    console.log(`   Truly novel: ${creation1.final.trulyNovel ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Insight: ${creation1.final.insight}`);
    
    console.log('\n🎯 TOP 3 IDEAS:');
    creation1.final.top3.forEach((idea, i) => {
      console.log(`   ${i + 1}. [${idea.type}] Novelty: ${idea.novelty.toFixed(2)}`);
      if (idea.insight) {
        console.log(`      Insight: ${idea.insight}`);
      }
    });
    
    // TEST 2: Wymyśl nową technologię baterii
    console.log('\n' + '='.repeat(70));
    console.log('TEST 2: Create new battery technology');
    console.log('='.repeat(70));
    
    const problem2 = {
      description: 'Need better battery for electric cars',
      domain: 'technology',
      goal: 'Innovate'
    };
    
    const existingKnowledge2 = [
      'Li-ion (current standard)',
      'Solid-State (safer)',
      'Li-S (higher density)',
      'Graphene (faster charging)'
    ];
    
    const creation2 = await creativity.createSomethingNew(problem2, existingKnowledge2);
    
    console.log('\n📊 RESULTS:');
    console.log(`   Novelty: ${creation2.final.novelty.toFixed(2)}`);
    console.log(`   Truly novel: ${creation2.final.trulyNovel ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Insight: ${creation2.final.insight}`);
    
    console.log('\n🎯 TOP 3 IDEAS:');
    creation2.final.top3.forEach((idea, i) => {
      console.log(`   ${i + 1}. [${idea.type}] Novelty: ${idea.novelty.toFixed(2)}`);
      if (idea.insight) {
        console.log(`      Insight: ${idea.insight}`);
      }
    });
    
    // PODSUMOWANIE
    console.log('\n' + '='.repeat(70));
    console.log('📊 CREATIVITY STATUS');
    console.log('='.repeat(70));
    
    const status = creativity.getStatus();
    console.log(`\nPatterns detected: ${status.patterns}`);
    console.log(`Insights generated: ${status.insights}`);
    console.log(`Innovations: ${status.innovations}`);
    console.log(`\nStats:`);
    console.log(`   Total creations: ${status.stats.totalCreations}`);
    console.log(`   Truly novel: ${status.stats.trulyNovel}`);
    console.log(`   Transformations: ${status.stats.transformations}`);
    console.log(`   Emergent patterns: ${status.stats.emergentPatterns}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 CREATIVITY TEST COMPLETE!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCreativity().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
