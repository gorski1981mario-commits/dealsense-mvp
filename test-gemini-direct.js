/**
 * TEST GEMINI API DIRECTLY
 * Sprawdza czy API key i endpoint działają
 */

const GEMINI_API_KEY = 'AIzaSyAQ4hwitArieEEZ3uZoqvsgxx3A8eD5o84';

async function testGeminiDirect() {
  console.log('🔍 TESTING GEMINI API DIRECTLY\n');
  console.log('='.repeat(60));

  // Test 1: v1beta/gemini-1.5-flash
  console.log('\n[1/3] Testing v1beta/gemini-1.5-flash...');
  try {
    const url1 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response1 = await fetch(url1, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hoi!' }] }]
      })
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ SUCCESS!');
      console.log(`   Response: ${data1.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50)}...`);
    } else {
      const error1 = await response1.json();
      console.log(`❌ FAILED: ${response1.status}`);
      console.log(`   Error: ${JSON.stringify(error1)}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  // Test 2: v1/gemini-1.5-flash-latest
  console.log('\n[2/3] Testing v1/gemini-1.5-flash-latest...');
  try {
    const url2 = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const response2 = await fetch(url2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hoi!' }] }]
      })
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ SUCCESS!');
      console.log(`   Response: ${data2.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50)}...`);
    } else {
      const error2 = await response2.json();
      console.log(`❌ FAILED: ${response2.status}`);
      console.log(`   Error: ${JSON.stringify(error2)}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  // Test 3: v1beta/gemini-pro
  console.log('\n[3/3] Testing v1beta/gemini-pro...');
  try {
    const url3 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const response3 = await fetch(url3, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hoi!' }] }]
      })
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ SUCCESS!');
      console.log(`   Response: ${data3.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50)}...`);
    } else {
      const error3 = await response3.json();
      console.log(`❌ FAILED: ${response3.status}`);
      console.log(`   Error: ${JSON.stringify(error3)}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
}

testGeminiDirect().catch(console.error);
