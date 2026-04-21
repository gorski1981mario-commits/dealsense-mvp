/**
 * SIMPLE GEMINI TEST
 */

const GEMINI_API_KEY = 'AIzaSyAQ4hwitArieEEZ3uZoqvsgxx3A8eD5o84';

async function testSimple() {
  console.log('🧪 SIMPLE GEMINI TEST\n');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Hoi! Zeg gewoon "Hallo" terug.' }]
    }]
  };
  
  console.log('Calling Gemini API...\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log(`Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
      console.log(`\nTokens: ${data.usageMetadata?.totalTokenCount || 0}`);
    } else {
      console.log('❌ FAILED:', response.status);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

testSimple().catch(console.error);
