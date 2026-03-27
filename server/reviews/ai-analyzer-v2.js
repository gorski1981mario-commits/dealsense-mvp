/**
 * AI ANALYZER V2 - UNIWERSALNY VERDICT
 * "Top 3 problemy, nie oceniaj marki, tylko produkt"
 * Działa na lodówkę, ubezpieczenie, hotel - WSZYSTKO
 */

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY; // Grok (xAI)
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Groq (Llama)

/**
 * UNIWERSALNY PROMPT - działa na WSZYSTKO
 */
const UNIVERSAL_PROMPT = `Jesteś bezlitosnym analitykiem opinii. Analizujesz TYLKO PRODUKT/USŁUGĘ, NIE MARKĘ.

ZASADY:
1. Bez marketingowego bełkotu
2. Bez ogólników typu "produkt jest dobry"
3. TOP 3 PROBLEMY - konkretne, z liczbą wzmianek
4. TOP 3 ZALETY - konkretne, z liczbą wzmianek  
5. Liczby i procenty
6. NIE OCENIAJ MARKI - tylko produkt/usługę

WYMAGANY FORMAT (JSON):
{
  "category": "electronics|home|health|travel|insurance|auto",
  "item_type": "produkt|usługa|miejsce",
  "positive_percent": 75,
  "negative_percent": 15,
  "neutral_percent": 10,
  "total_reviews": 150,
  "top_3_pros": [
    "Długi czas pracy baterii (45 wzmianek)",
    "Dobra jakość zdjęć (38 wzmianek)",
    "Szybkie ładowanie (32 wzmianki)"
  ],
  "top_3_cons": [
    "Przegrzewanie podczas ładowania (23 wzmianki)",
    "Słaba jakość dźwięku (18 wzmianek)",
    "Drogi w naprawie (12 wzmianek)"
  ],
  "critical_issues": [
    "Bateria traci pojemność po 6 miesiącach (15 przypadków)",
    "Ekran pęka przy upadku z 50cm (8 przypadków)"
  ],
  "verdict": {
    "color": "green|yellow|red",
    "summary": "Krótkie podsumowanie (1-2 zdania)",
    "recommendation": "Polecany|OK z zastrzeżeniami|Nie polecany",
    "score": 7.5
  },
  "truth_score": 85
}

KOLORY VERDICT:
- green (7.5-10): Polecany - więcej zalet niż wad
- yellow (5-7.4): OK z zastrzeżeniami - są problemy, ale do zaakceptowania
- red (0-4.9): Nie polecany - poważne problemy

TRUTH SCORE (0-100):
- Jak wiarygodne są opinie (czy są fake reviews, czy prawdziwe)
- 90-100: Bardzo wiarygodne (verified purchases, szczegółowe opinie)
- 70-89: Wiarygodne (mieszanka verified i nie-verified)
- 50-69: Średnio wiarygodne (dużo ogólników)
- 0-49: Niewiarygodne (podejrzenie fake reviews)

KATEGORIE - DOSTOSUJ ANALIZĘ:
- electronics: bateria, jakość wykonania, wydajność
- home: jakość materiałów, montaż, trwałość
- health: skuteczność, bezpieczeństwo, skład
- travel: obsługa, czystość, lokalizacja, stosunek jakości do ceny
- insurance: obsługa szkód, czas wypłaty, ukryte klauzule
- auto: niezawodność, koszty eksploatacji, bezpieczeństwo

Opinie do analizy:`;

/**
 * Analyze reviews with AI - UNIWERSALNY
 */
async function analyzeWithAI(reviews, itemInfo, category = 'electronics') {
  const provider = process.env.AI_PROVIDER || 'openai';
  
  // Prepare reviews text
  const reviewsText = reviews.map((r, i) => {
    const rating = r.rating ? `[${r.rating}/5]` : '';
    const verified = r.verified ? '[VERIFIED]' : '';
    const source = r.source ? `[${r.source.toUpperCase()}]` : '';
    return `${i+1}. ${source} ${rating} ${verified} ${r.text}`;
  }).join('\n\n');
  
  const fullPrompt = `${UNIVERSAL_PROMPT}\n\nKATEGORIA: ${category}\nPRODUKT/USŁUGA: ${itemInfo.name}\n\n${reviewsText}`;
  
  try {
    if (provider === 'groq' && GROQ_API_KEY) {
      return await analyzeWithGroq(fullPrompt);
    } else if (provider === 'xai' && XAI_API_KEY) {
      return await analyzeWithGrok(fullPrompt);
    } else if (provider === 'anthropic' && ANTHROPIC_API_KEY) {
      return await analyzeWithClaude(fullPrompt);
    } else if (OPENAI_API_KEY) {
      return await analyzeWithGPT(fullPrompt);
    } else {
      throw new Error('No AI API key configured');
    }
  } catch (error) {
    console.error('[AI Analyzer V2] Error:', error.message);
    
    // Fallback: simple analysis
    return fallbackAnalysis(reviews, category);
  }
}

/**
 * Analyze with Groq (Llama 3.3 70B) - OpenAI-compatible API
 */
async function analyzeWithGroq(prompt) {
  console.log(`[AI Analyzer V2] Using Groq (Llama 3.3 70B) with key: ${GROQ_API_KEY ? GROQ_API_KEY.substring(0, 20) + '...' : 'MISSING'}`);
  
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are a ruthless analyst. Only facts, no marketing BS. Analyze PRODUCT/SERVICE, not BRAND.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log(`[AI Analyzer V2] Groq response status: ${response.status}`);
    
    const content = response.data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error(`[AI Analyzer V2] Groq error details:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
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
        { 
          role: 'system', 
          content: 'You are a ruthless analyst. Only facts, no marketing BS. Analyze PRODUCT/SERVICE, not BRAND.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Lower = more factual
      max_tokens: 1500
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
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
 * Analyze with Grok (xAI) - OpenAI-compatible API
 */
async function analyzeWithGrok(prompt) {
  console.log(`[AI Analyzer V2] Using Grok (xAI) with key: ${XAI_API_KEY ? XAI_API_KEY.substring(0, 20) + '...' : 'MISSING'}`);
  
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-2',
        messages: [
          { 
            role: 'system', 
            content: 'You are a ruthless analyst. Only facts, no marketing BS. Analyze PRODUCT/SERVICE, not BRAND.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log(`[AI Analyzer V2] Grok response status: ${response.status}`);
    
    const content = response.data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error(`[AI Analyzer V2] Grok error details:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

/**
 * Analyze with Claude 3.5
 */
async function analyzeWithClaude(prompt) {
  console.log(`[AI Analyzer V2] Using Claude with key: ${ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 20) + '...' : 'MISSING'}`);
  
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
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
        timeout: 15000
      }
    );
    
    console.log(`[AI Analyzer V2] Claude response status: ${response.status}`);
    
    const content = response.data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error(`[AI Analyzer V2] Claude error details:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

/**
 * Fallback analysis (if AI fails)
 */
function fallbackAnalysis(reviews, category) {
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
  let recommendation = 'OK z zastrzeżeniami';
  
  if (positivePercent >= 70) {
    color = 'green';
    score = 7.5;
    recommendation = 'Polecany';
  } else if (negativePercent >= 40) {
    color = 'red';
    score = 4.0;
    recommendation = 'Nie polecany';
  }
  
  return {
    category,
    item_type: 'produkt',
    positive_percent: positivePercent,
    negative_percent: negativePercent,
    neutral_percent: neutralPercent,
    total_reviews: total,
    top_3_pros: ['Analiza AI niedostępna - użyj pełnej wersji'],
    top_3_cons: ['Analiza AI niedostępna - użyj pełnej wersji'],
    critical_issues: [],
    verdict: {
      color,
      summary: 'Podstawowa analiza - włącz AI dla szczegółów',
      recommendation,
      score
    },
    truth_score: 50, // Unknown
    fallback: true
  };
}

module.exports = {
  analyzeWithAI
};
