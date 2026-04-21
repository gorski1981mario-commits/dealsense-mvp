const fetch = require('node-fetch');

async function testSimple() {
  const tests = [
    "Hallo",
    "Welke pakketten zijn er?",
    "Hoe werkt DealSense?"
  ];
  
  for (const msg of tests) {
    console.log(`\n📝 TEST: "${msg}"`);
    
    const response = await fetch('http://localhost:3000/api/echo/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        userId: 'test',
        sessionId: 'test',
        context: {}
      })
    });
    
    const data = await response.json();
    console.log(`✅ Success: ${data.success}`);
    console.log(`📊 Scope: ${data.scope}`);
    console.log(`💬 Response: ${data.response.substring(0, 100)}...`);
    console.log('---');
  }
}

testSimple();
