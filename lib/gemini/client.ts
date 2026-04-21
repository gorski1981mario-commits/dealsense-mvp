/**
 * GEMINI 1.5 FLASH CLIENT
 * For general/complex queries that need natural language understanding
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiResponse {
  text: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costUsd: number;
}

/**
 * Build system prompt with user preferences and context
 */
function buildSystemPrompt(preferences: Record<string, any>): string {
  const favoriteBrands = preferences.favorite_brands || [];
  const priceRange = preferences.price_range || {};
  const language = preferences.language || 'nl';

  return `Je bent ECHO - een slimme AI assistent voor DealSense.

**CORE COMPETENCE (expert):**
- Besparen en financiën
- DealSense uitleg (scanner, pakketten, Ghost Mode)
- Pakketten: FREE (€0, 3 scans), PLUS (€19,99/mnd), PRO (€29,99/mnd), FINANCE (€39,99/mnd)
- Ghost Mode: PLUS 24u, PRO 48u, FINANCE 7 dagen monitoring

**GENERAL (thinking partner):**
- Bedrijfsstrategie en planning
- Beslissingen en keuzes
- Denken en analyseren
- Alles wat gebruiker vraagt

**USER PREFERENCES:**
${favoriteBrands.length > 0 ? `- Favorite brands: ${favoriteBrands.join(', ')}` : ''}
${priceRange.min || priceRange.max ? `- Price range: €${priceRange.min || 0} - €${priceRange.max || 'unlimited'}` : ''}
- Language: ${language}

**REGELS:**
- Antwoord ALTIJD in het Nederlands
- Professioneel, geen emoji (tenzij user vraagt)
- Kort en bondig
- Geef 2-3 follow-up suggesties
- Als je iets niet weet, zeg het eerlijk
- Voor producten/vakantie: verwijs naar DealSense scanner/configurators

**VERBODEN:**
- Code schrijven, refactoren, debuggen
- Adult content, geweld
- Illegale activiteiten`;
}

/**
 * Build conversation context from history
 */
function buildConversationContext(history: any[]): any[] {
  return history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Call Gemini 1.5 Flash API
 */
export async function callGemini(
  message: string,
  preferences: Record<string, any> = {},
  history: any[] = []
): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured - returning fallback response');
    
    // Fallback response when Gemini is not configured
    return {
      text: 'Ik ben ECHO, je DealSense assistent. Ik help je graag met productvergelijking, vakantiedeals, verzekeringen en meer. Wat kan ik voor je doen?',
      tokensUsed: {
        input: 0,
        output: 0,
        total: 0
      },
      costUsd: 0
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(preferences);
    const conversationContext = buildConversationContext(history);

    // Build request (system prompt as first message)
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
        stopSequences: []
      }
    };

    console.log('[Gemini] Calling API...');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extract response text
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, ik kan je vraag nu niet beantwoorden.';

    // Calculate tokens and cost
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = inputTokens + outputTokens;

    // Gemini 1.5 Flash pricing (as of 2026)
    const inputCost = (inputTokens / 1_000_000) * 0.075; // $0.075 per 1M tokens
    const outputCost = (outputTokens / 1_000_000) * 0.30; // $0.30 per 1M tokens
    const totalCost = inputCost + outputCost;

    console.log('[Gemini] Response received:', {
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd: totalCost.toFixed(6)
    });

    return {
      text,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens
      },
      costUsd: totalCost
    };

  } catch (error: any) {
    console.error('[Gemini] API Error:', error.message);
    throw error;
  }
}

/**
 * Estimate cost before calling (for rate limiting)
 */
export function estimateGeminiCost(
  messageLength: number,
  historyLength: number = 0
): number {
  // Rough estimate: 1 token ≈ 4 characters
  const estimatedInputTokens = (messageLength + historyLength * 100) / 4;
  const estimatedOutputTokens = 200; // Average response

  const inputCost = (estimatedInputTokens / 1_000_000) * 0.075;
  const outputCost = (estimatedOutputTokens / 1_000_000) * 0.30;

  return inputCost + outputCost;
}
