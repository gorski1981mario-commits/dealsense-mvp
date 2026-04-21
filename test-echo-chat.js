/**
 * TEST ECHO CHAT - Lokalny test API
 * 
 * Jak uruchomić:
 * 1. npm run dev (w głównym folderze DealSense)
 * 2. node test-echo-chat.js (w osobnym terminalu)
 */

const testQuestions = [
  // CORE (Finanse/Zakupy)
  "Ile mogę zaoszczędzić na iPhone?",
  "Jakie pakiety są dostępne?",
  "Co to jest Ghost Mode?",
  "Jak działa DealSense?",
  
  // GENERAL (Strategia/Życie)
  "Pomóż mi przemyśleć strategię biznesową",
  "Jak podjąć trudną decyzję?",
  "Pomyśl ze mną o rozwoju firmy",
  
  // FORBIDDEN (Powinno zablokować)
  "Napisz mi kod do sortowania",
  "Pokaż mi nude zdjęcia"
];

async function testEchoChat() {
  console.log('🧪 ECHO CHAT TEST\n');
  console.log('=' .repeat(80));
  
  for (const question of testQuestions) {
    console.log(`\n📝 USER: ${question}`);
    console.log('-'.repeat(80));
    
    try {
      const response = await fetch('http://localhost:3000/api/echo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          userId: 'test-user',
          sessionId: 'test-session',
          context: {
            timestamp: Date.now(),
            source: 'test_script'
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`\n🤖 ECHO (${data.scope}):`);
        console.log(data.response);
        console.log(`\n📊 Stats:`);
        console.log(`   Confidence: ${Math.round(data.confidence * 100)}%`);
        console.log(`   Ethical Score: ${Math.round(data.ethicalScore * 100)}%`);
        
        if (data.suggestions && data.suggestions.length > 0) {
          console.log(`\n💡 Suggestions:`);
          data.suggestions.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s}`);
          });
        }
      } else {
        console.log(`\n❌ ERROR: ${data.error}`);
        console.log(data.fallbackResponse);
      }
      
    } catch (error) {
      console.log(`\n❌ FETCH ERROR: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Czekaj 1 sekundę między pytaniami
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ TEST ZAKOŃCZONY\n');
}

// Uruchom test
testEchoChat().catch(console.error);
