// Grok Cloud Ranking - Advanced AI ranking with Grok
// Optional: Falls back to local algorithm if not available

const axios = require('axios')

class GrokRanking {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY
    this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1'
    this.enabled = !!this.apiKey
  }

  async rankOffers(offers, category = 'products') {
    if (!this.enabled) {
      console.log('Grok ranking not enabled, using local algorithm')
      return null // Fallback to local ranking
    }

    try {
      const prompt = this.buildPrompt(offers, category)

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at ranking product offers. Return only valid JSON array of top 3 offers with scores.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const content = response.data.choices[0].message.content
      const ranked = JSON.parse(content)

      console.log('✓ Grok ranked offers:', ranked.length)

      return ranked

    } catch (error) {
      console.error('Grok ranking failed:', error.message)
      return null // Fallback to local ranking
    }
  }

  buildPrompt(offers, category) {
    const offersJson = JSON.stringify(offers.slice(0, 20), null, 2)

    return `Rank these ${category} offers and return TOP 3.

Consider:
- Price (lower is better)
- Rating (higher is better)
- Reviews count (more is better)
- Seller reputation
- In stock availability
- Shipping cost

Filter out:
- Scam offers (rating < 4.0)
- Suspicious prices (too low or too high)
- Out of stock items

Return ONLY valid JSON array with top 3:
[
  {
    "title": "...",
    "price": 123.45,
    "seller": "...",
    "rating": 4.5,
    "score": 0.95,
    "reason": "Best price with excellent rating"
  }
]

Offers:
${offersJson}

JSON:`
  }

  async analyzeScam(offer) {
    if (!this.enabled) return { isScam: false, confidence: 0 }

    try {
      const prompt = `Analyze if this offer is a scam:

${JSON.stringify(offer, null, 2)}

Return JSON:
{
  "isScam": true/false,
  "confidence": 0.0-1.0,
  "reasons": ["reason 1", "reason 2"]
}

JSON:`

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            { role: 'system', content: 'You are a scam detection expert.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      )

      const content = response.data.choices[0].message.content
      return JSON.parse(content)

    } catch (error) {
      console.error('Grok scam analysis failed:', error.message)
      return { isScam: false, confidence: 0 }
    }
  }
}

module.exports = { GrokRanking }
