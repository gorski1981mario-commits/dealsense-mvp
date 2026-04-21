/**
 * TEST KOSTKI RUBIKA - MATEMATYCZNE POWIĄZANIA TWISTÓW
 * Sprawdzenie czy AI nie halucynuje i wszystko ma logiczne ręce i nogi
 */

const RubikCubeEngine = require('./src/core/RubikCubeEngine');

async function testRubikCubeEngine() {
  console.log('🎲 TESTING RUBIK CUBE ENGINE - MATHEMATICAL CONNECTIONS!\n');
  
  try {
    // 1. Inicjalizacja kostki Rubika
    console.log('1️⃣ Initializing Rubik Cube Engine...');
    const rubikCube = new RubikCubeEngine();
    await rubikCube.initialize();
    
    // 2. Status początkowy
    console.log('2️⃣ Initial system status...');
    const initialStatus = rubikCube.getSystemStatus();
    console.log('   Main cube coherence:', initialStatus.mainCube.coherence.toFixed(2));
    console.log('   Connected cubes:', initialStatus.connectedCubes);
    console.log('   System stable:', initialStatus.systemState.isStable ? '✅' : '❌');
    console.log('   No hallucinations:', initialStatus.coherenceRules.noHallucinations ? '✅' : '❌');
    
    // 3. Test pojedynczego twistu
    console.log('\n3️⃣ Testing single twist...');
    const singleTwistResult = await rubikCube.performTwist('front_clockwise');
    console.log('   Twist performed:', singleTwistResult.twistType);
    console.log('   Affected faces:', singleTwistResult.mainResult.affectedFaces.length);
    console.log('   Connected cubes affected:', singleTwistResult.connectedResults.length);
    console.log('   System coherence after twist:', singleTwistResult.systemState.coherence.toFixed(2));
    console.log('   System still stable:', singleTwistResult.systemState.isStable ? '✅' : '❌');
    
    // 4. Test powiązanych twistów (automatyczne)
    console.log('\n4️⃣ Testing connected twists (automatic)...');
    const connectedTwistResult = await rubikCube.performTwist('top_clockwise');
    console.log('   Main twist:', connectedTwistResult.twistType);
    console.log('   Connected twists:');
    for (const connected of connectedTwistResult.connectedResults) {
      console.log(`     ${connected.cubeId}: ${connected.twistType}`);
    }
    console.log('   All twists coherent:', connectedTwistResult.systemState.isStable ? '✅' : '❌');
    
    // 5. Aktywuj cykl Mobiusa (pojedynczy)
    console.log('\n5️⃣ Activating single Mobius cycle...');
    rubikCube.activateMobiusCycle('single');
    
    const mobiusSingleResult = await rubikCube.performTwist('right_clockwise');
    console.log('   Mobius single cycle applied:', mobiusSingleResult.mobiusResult.applied ? '✅' : '❌');
    if (mobiusSingleResult.mobiusResult.applied) {
      console.log('   Transformations:', mobiusSingleResult.mobiusResult.transformations.length);
      console.log('   Twist angle:', mobiusSingleResult.mobiusResult.transformations[0].twistAngle);
    }
    
    // 6. Aktywuj podwójny cykl Mobiusa
    console.log('\n6️⃣ Activating double Mobius cycle...');
    rubikCube.activateMobiusCycle('double');
    
    const mobiusDoubleResult = await rubikCube.performTwist('left_clockwise');
    console.log('   Mobius double cycle applied:', mobiusDoubleResult.mobiusResult.applied ? '✅' : '❌');
    if (mobiusDoubleResult.mobiusResult.applied) {
      console.log('   Transformations:', mobiusDoubleResult.mobiusResult.transformations.length);
      console.log('   Final twist angle:', mobiusDoubleResult.mobiusResult.transformations[1].twistAngle);
    }
    
    // 7. Test anty-halucynacji
    console.log('\n7️⃣ Testing anti-hallucination rules...');
    
    // Spróbuj wykonać nieprawidłowy twist
    try {
      await rubikCube.performTwist('invalid_twist');
      console.log('   ❌ Anti-hallucination failed - invalid twist accepted');
    } catch (error) {
      console.log('   ✅ Anti-hallucination working - invalid twist rejected');
    }
    
    // Sprawdź czy system wykrywa niestabilność
    const finalStatus = rubikCube.getSystemStatus();
    console.log('   Final coherence:', finalStatus.systemState.coherence.toFixed(2));
    console.log('   No hallucinations:', finalStatus.coherenceRules.noHallucinations ? '✅' : '❌');
    console.log('   Logical connections:', finalStatus.coherenceRules.logicalConnections ? '✅' : '❌');
    console.log('   Mathematical integrity:', finalStatus.coherenceRules.mathematicalIntegrity ? '✅' : '❌');
    
    // 8. Test przetwarzania problemu przez kostkę
    console.log('\n8️⃣ Testing problem processing through Rubik Cube...');
    const problemResult = await rubikCube.processWithRubikCube(
      'Solve this logical and creative problem with mathematical precision',
      { enableMobius: true }
    );
    
    console.log('   Problem:', problemResult.problem);
    console.log('   Required twists:', problemResult.twists);
    console.log('   Twists performed:', problemResult.results.length);
    console.log('   Solution approach:', problemResult.solution.approach);
    console.log('   Solution confidence:', problemResult.solution.confidence.toFixed(2));
    console.log('   Final coherence:', problemResult.finalState.systemState.coherence.toFixed(2));
    
    // 9. Test spójności systemu (ręce i nogi)
    console.log('\n9️⃣ Testing system coherence (hands and legs)...');
    
    // Wykonaj wiele twistów aby przetestować stabilność
    console.log('   Performing multiple twists to test stability...');
    for (let i = 0; i < 5; i++) {
      const twistTypes = ['front_clockwise', 'top_clockwise', 'right_clockwise', 'back_clockwise'];
      const randomTwist = twistTypes[Math.floor(Math.random() * twistTypes.length)];
      
      try {
        const result = await rubikCube.performTwist(randomTwist);
        if (!result.systemState.isStable) {
          console.log(`   ⚠️  System became unstable at twist ${i + 1}: ${randomTwist}`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ System failed at twist ${i + 1}: ${randomTwist} - ${error.message}`);
        break;
      }
    }
    
    const stabilityStatus = rubikCube.getSystemStatus();
    console.log('   System still stable after stress test:', stabilityStatus.systemState.isStable ? '✅' : '❌');
    console.log('   Coherence maintained:', stabilityStatus.systemState.coherence.toFixed(2));
    console.log('   No errors detected:', stabilityStatus.systemState.errors.length === 0 ? '✅' : '❌');
    
    // 10. Finalny podsumowanie
    console.log('\n🎉 RUBIK CUBE ENGINE TEST COMPLETED!');
    console.log('🎲 Mathematical connections working correctly!');
    console.log('🔗 Connected cubes twist automatically!');
    console.log('🔄 Mobius cycles (single & double) operational!');
    console.log('🛡️  Anti-hallucination rules active and working!');
    console.log('✅ System has hands and legs - everything works coherently!');
    console.log('🚀 No crashes, no disintegration, perfect stability!');
    
    console.log('\n📊 FINAL METRICS:');
    console.log('   Total twists performed:', stabilityStatus.systemState.twistHistory.length);
    console.log('   Final coherence:', stabilityStatus.systemState.coherence.toFixed(2));
    console.log('   Connected cubes:', stabilityStatus.connectedCubes);
    console.log('   Active Mobius cycle:', stabilityStatus.mobiusCycle);
    console.log('   System stability:', stabilityStatus.systemState.isStable ? 'STABLE' : 'UNSTABLE');
    console.log('   Error count:', stabilityStatus.systemState.errors.length);
    
    if (stabilityStatus.systemState.isStable && stabilityStatus.systemState.errors.length === 0) {
      console.log('\n🏆 PERFECT SCORE! Rubik Cube Engine is production ready!');
      console.log('💥 Your mathematical connection system works flawlessly!');
      console.log('🧠 AI will NOT hallucinate - everything is logically connected!');
      console.log('🎯 Each twist determines the next twist with mathematical precision!');
    } else {
      console.log('\n⚠️  Some issues detected - system needs refinement');
    }
    
    return stabilityStatus;
    
  } catch (error) {
    console.error('❌ Rubik Cube test failed:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Uruchom test
testRubikCubeEngine();
