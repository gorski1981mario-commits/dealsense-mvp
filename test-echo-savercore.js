/**
 * TEST ECHO + SAVERCORE INTEGRATION
 */

async function testEchoSaverCore() {
  console.log('🧪 TESTING ECHO + SAVERCORE INTEGRATION\n');
  
  const API_URL = 'http://localhost:3000/api/echo/chat';
  
  const testMessages = [
    'Wat kost deze laptop?',
    'Hoe werkt de DealSense scanner?',
    'Ik zoek een goedkope vakantie naar Spanje',
    'Welke verzekering is het beste?',
    'Wat kost deze laptop?',  // Duplicate - should hit cache
    'Help me met mijn bedrijfsstrategie',
    'Energie contract vergelijken',
    'Hypotheek rente',
    'Hoe werkt de scanner?',  // Duplicate
    'Creditcard aanvragen'
  ];
  
  console.log('Testing ECHO Chat API with SaverCore...\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    
    console.log(`\n[${i + 1}/${testMessages.length}] "${message}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          userId: 'test_user',
          sessionId: 'test_session',
          conversationHistory: []
        })
      });
      
      const data = await response.json();
      const totalTime = Date.now() - startTime;
      
      if (data.success) {
        console.log(`✅ Success (${totalTime}ms)`);
        console.log(`   Intent: ${data.intent}`);
        console.log(`   Scope: ${data.scope}`);
        console.log(`   Cached: ${data.cached ? 'YES' : 'NO'}`);
        console.log(`   Processing: ${data.processingTime}ms`);
        console.log(`   Response: "${data.response.substring(0, 80)}..."`);
        console.log(`   Suggestions: ${data.suggestions.slice(0, 2).join(', ')}`);
      } else {
        console.log(`❌ Failed: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n\n✅ INTEGRATION TEST COMPLETED!');
  console.log('\n📊 EXPECTED RESULTS:');
  console.log('   - Fast responses (0-50ms total, 0-1ms processing)');
  console.log('   - Cache hits for duplicates (instant)');
  console.log('   - Correct intent detection (90%+ accuracy)');
  console.log('   - Dutch language responses');
  console.log('   - Relevant suggestions per intent');
}

// Run test
testEchoSaverCore().catch(console.error);
