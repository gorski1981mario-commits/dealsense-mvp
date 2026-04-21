/**
 * CLOUD MODEL INTEGRATION - GPT-4 / Claude
 * 
 * ECHO używa cloud model (production)
 */

class CloudModelIntegration {
  constructor(config = {}) {
    this.provider = config.provider || 'openai';  // 'openai' lub 'anthropic'
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'gpt-4';
  }

  async generate(enhancedPrompt) {
    if (this.provider === 'openai') {
      return this.generateOpenAI(enhancedPrompt);
    } else if (this.provider === 'anthropic') {
      return this.generateClaude(enhancedPrompt);
    }
  }

  async generateOpenAI(enhancedPrompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant enhanced by ECHO LiveOS 2.0' },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  async generateClaude(enhancedPrompt) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: enhancedPrompt }
          ]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude error:', error);
      return null;
    }
  }
}

module.exports = CloudModelIntegration;
