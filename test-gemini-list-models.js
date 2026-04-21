/**
 * LIST AVAILABLE GEMINI MODELS
 */

const GEMINI_API_KEY = 'AIzaSyAQ4hwitArieEEZ3uZoqvsgxx3A8eD5o84';

async function listModels() {
  console.log('📋 LISTING AVAILABLE GEMINI MODELS\n');
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ ERROR: ${response.status}`);
      console.log(JSON.stringify(error, null, 2));
      return;
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log(`✅ Found ${data.models.length} models:\n`);
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Display: ${model.displayName}`);
        console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No models found - API may not be enabled');
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

listModels().catch(console.error);
