// GPT-4 Self-Healing Parser
// When parser fails, GPT extracts data from HTML

const OpenAI = require('openai')

class GPTSelfHealing {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.enabled = !!process.env.OPENAI_API_KEY
  }

  async extractProductData(html, url) {
    if (!this.enabled) {
      throw new Error('GPT self-healing not enabled (missing OPENAI_API_KEY)')
    }

    try {
      // Truncate HTML to first 8000 chars (GPT token limit)
      const truncatedHtml = html.substring(0, 8000)

      const prompt = `Extract product information from this HTML snippet.
Return ONLY valid JSON with this structure:
{
  "title": "product name",
  "price": 123.45,
  "seller": "store name",
  "rating": 4.5,
  "inStock": true,
  "url": "${url}"
}

If you cannot find a field, use null. Price must be a number.

HTML:
${truncatedHtml}

JSON:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a data extraction expert. Return only valid JSON, no explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 500
      })

      const jsonStr = response.choices[0].message.content.trim()
      const data = JSON.parse(jsonStr)

      console.log('✓ GPT extracted data:', data)

      return {
        offers: [data],
        source: 'gpt-self-healing',
        scrapedAt: Date.now()
      }

    } catch (error) {
      console.error('GPT self-healing failed:', error.message)
      throw error
    }
  }

  async extractEnergyData(html, url) {
    if (!this.enabled) {
      throw new Error('GPT self-healing not enabled')
    }

    try {
      const truncatedHtml = html.substring(0, 8000)

      const prompt = `Extract energy provider offers from this HTML.
Return ONLY valid JSON array:
[{
  "provider": "provider name",
  "monthlyPrice": 123.45,
  "contractType": "variabel or vast",
  "greenEnergy": true/false
}]

HTML:
${truncatedHtml}

JSON:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a data extraction expert. Return only valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 1000
      })

      const jsonStr = response.choices[0].message.content.trim()
      const providers = JSON.parse(jsonStr)

      return {
        providers,
        source: 'gpt-self-healing',
        scrapedAt: Date.now()
      }

    } catch (error) {
      console.error('GPT energy extraction failed:', error.message)
      throw error
    }
  }
}

module.exports = { GPTSelfHealing }
