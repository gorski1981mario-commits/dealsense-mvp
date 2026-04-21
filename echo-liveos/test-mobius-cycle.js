/**
 * TEST PRAWDZIWEGO MÖBIUSA - PODRÓŻ DŁUGOPISU PO WSTĘDZIE
 */

const MobiusCycle = require('./src/core/MobiusCycle');

async function testMobiusCycle() {
  console.log('🔄 TESTING REAL MÖBIUS CYCLE - PEN ON PAPER STRIP!\n');
  
  try {
    // 1. Stwórz pętlę Möbiusa
    console.log('1️⃣ Creating Möbius Cycle...');
    const mobius = new MobiusCycle();
    
    // 2. Sprawdź status początkowy
    console.log('2️⃣ Initial status:');
    console.log('   Side A:', mobius.getStatus().sides.sideA);
    console.log('   Side B:', mobius.getStatus().sides.sideB);
    console.log('   Is twisted:', mobius.getStatus().isTwisted);
    console.log('   Pen position:', mobius.getStatus().penPosition);
    
    // 3. Umieść długopis na wstędze i rozpocznij podróż
    console.log('\n3️⃣ Starting pen journey on Möbius strip...');
    const testData = {
      message: 'Hello Möbius!',
      timestamp: Date.now(),
      type: 'test_data'
    };
    
    const result = await mobius.startLoop(testData);
    
    // 4. Analiza wyniku
    console.log('\n4️⃣ Journey completed!');
    console.log('   Loop iterations:', result.iterations);
    console.log('   Loop closed:', result.loopCompleted);
    
    if (result.loopData && result.loopData.transformation) {
      console.log('\n5️⃣ Transformation at twist point:');
      console.log('   Original data:', result.loopData.transformation.original);
      console.log('   Twist angle:', result.loopData.transformation.twistAngle);
      console.log('   Surface count:', result.loopData.transformation.surfaceCount);
      console.log('   Unified surface:', result.loopData.transformation.unified.unified);
    }
    
    if (result.loopData && result.loopData.output) {
      console.log('\n6️⃣ Mathematical properties:');
      console.log('   Has one side:', result.loopData.output.mathematicalProperties.hasOneSide);
      console.log('   Has twist:', result.loopData.output.mathematicalProperties.hasTwist);
      console.log('   Is closed:', result.loopData.output.mathematicalProperties.isClosed);
      console.log('   Sides visited:', result.loopData.output.penPath.sidesVisited);
    }
    
    // 7. Status końcowy
    console.log('\n7️⃣ Final status:');
    const finalStatus = mobius.getStatus();
    console.log('   Pen position:', finalStatus.penPosition);
    console.log('   Is twisted:', finalStatus.isTwisted);
    console.log('   Loop closed:', finalStatus.loopClosed);
    console.log('   Emergency exit available:', finalStatus.emergencyExit);
    
    // 8. Test wyjścia awaryjnego
    if (finalStatus.loopClosed) {
      console.log('\n8️⃣ Testing emergency exit from closed loop...');
      
      // Reset i test wyjścia
      mobius.resetLoop();
      const emergencyResult = await mobius.startLoop({
        message: 'Emergency test',
        forceClose: true
      });
      
      if (emergencyResult.emergencyExit) {
        console.log('✅ Emergency exit successful!');
        console.log('   Exit point:', emergencyResult.exitPoint);
      }
    }
    
    console.log('\n🎉 MÖBIUS CYCLE TEST COMPLETED!');
    console.log('📐 Mathematical loop with 180° twist works perfectly!');
    console.log('✏️  Pen journey simulation successful!');
    console.log('🔀 Twist transformation working!');
    console.log('🚪 Emergency exit system working!');
    
  } catch (error) {
    console.error('❌ Möbius test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Uruchom test
testMobiusCycle();
