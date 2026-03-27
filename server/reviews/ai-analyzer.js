/**
 * AI ANALYZER - GPT-4 / Claude 3.5
 * Bezlitosny analityk - tylko fakty, bez marketingowego bełkotu
 */

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const PROMPT = `Jesteś bezlitosnym analitykiem produktów. Przeanalizuj poniższe recenzje i wyodrębnij TYLKO FAKTY.

ZASADY:
1. Bez marketingowego bełkotu
2. Bez ogólników typu "produkt jest dobry"
3. Konkretne problemy i zalety
4. Liczby i procenty
5. Najczęstsze skargi i pochwały

WYMAGANY FORMAT ODPOWIEDZI (JSON):
{
  "positive_percent": 75,
  "negative_percent": 15,
  "neutral_percent": 10,
  "total_reviews": 150,
  "top_pros": [
    "Długi czas pracy baterii (wspomniane 45 razy)",
    "Dobra jakość zdjęć (wspomniane 38 razy)",
    "Szybkie ładowanie (wspomniane 32 razy)"
  ],
  "top_cons": [
    "Przegrzewanie się podczas ładowania (wspomniane 23 razy)",
    "Słaba jakość dźwięku (wspomniane 18 razy)",
    "Drogi w naprawie (wspomniane 12 razy)"
  ],
  "critical_issues": [
    "Bateria traci pojemność po 6 miesiącach (15 przypadków)",
    "Ekran pęka przy upadku z 50cm (8 przypadków)"
  ],
  "verdict": {
    "color": "green",
    "text": "Dobry wybór dla większości użytkowników, ale uważaj na przegrzewanie",
    "score": 7.5
  }
}

KOLORY VERDICT:
- green: 7.5-10 (polecany)
- yellow: 5-7.4 (OK, ale z zastrzeżeniami)
- red: 0-4.9 (nie polecany)

Recenzje do analizy:`;

/**
 * Analyze reviews with AI
 */
async function analyzeWithAI(reviews, productInfo) {
  const provider = process.env.AI_PROVIDER || 'openai'; // openai or anthropic
  
  // Prepare reviews text
  const reviewsText = reviews.map((r, i) => {
    const rating = r.rating ? `[${r.rating}/5]` : '';
    const verified = r.verified ? '[VERIFIED]' : '';
    return `${i+1}. ${rating} ${verified} ${r.text}`;
  }).join('\n\n');
  
  const fullPrompt = `${PROMPT}\n\n${reviewsText}`;
  
  try {
    if (provider === 'anthropic' && ANTHROPIC_API_KEY) {
      return await analyzeWithClaude(fullPrompt);
    } else if (OPENAI_API_KEY) {
      return await analyzeWithGPT(fullPrompt);
    } else {
      throw new Error('No AI API key configured');
    }
  } catch (error) {
    console.error('[AI Analyzer] Error:', error.message);
    
    // Fallback: simple analysis
    return fallbackAnalysis(reviews);
  }
}

/**
 * Analyze with GPT-4
 */
async function analyzeWithGPT(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a ruthless product analyst. Only facts, no marketing bullshit.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );
  
  const content = response.data.choices[0].message.content;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Invalid AI response format');
}

/**
 * Analyze with Claude 3.5
 */
async function analyzeWithClaude(prompt) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );
  
  const content = response.data.content[0].text;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Invalid AI response format');
}

/**
 * Fallback analysis (if AI fails)
 */
function fallbackAnalysis(reviews) {
  const total = reviews.length;
  
  // Count positive/negative based on rating
  let positive = 0;
  let negative = 0;
  
  reviews.forEach(r => {
    if (r.rating >= 4) positive++;
    else if (r.rating <= 2) negative++;
  });
  
  const positivePercent = Math.round((positive / total) * 100);
  const negativePercent = Math.round((negative / total) * 100);
  const neutralPercent = 100 - positivePercent - negativePercent;
  
  // Simple verdict
  let color = 'yellow';
  let score = 5.0;
  
  if (positivePercent >= 70) {
    color = 'green';
    score = 7.5;
  } else if (negativePercent >= 40) {
    color = 'red';
    score = 4.0;
  }
  
  return {
    positive_percent: positivePercent,
    negative_percent: negativePercent,
    neutral_percent: neutralPercent,
    total_reviews: total,
    top_pros: ['Analiza AI niedostępna - użyj pełnej wersji'],
    top_cons: ['Analiza AI niedostępna - użyj pełnej wersji'],
    critical_issues: [],
    verdict: {
      color,
      text: 'Podstawowa analiza - włącz AI dla szczegółów',
      score
    },
    fallback: true
  };
}

module.exports = {
  analyzeWithAI
};
