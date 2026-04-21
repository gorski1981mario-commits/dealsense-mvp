/**
 * OLLAMA INTEGRATION - Lokalny model (Llama2/Mistral)
 * 
 * ECHO używa lokalnego modelu zamiast GPT-4/Claude
 */

class OllamaIntegration {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.model = 'llama2';  // lub 'mistral', 'codellama'
  }

  async generate(enhancedPrompt) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: enhancedPrompt,
          stream: false
        })
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama error:', error);
      return null;
    }
  }
}

module.exports = OllamaIntegration;
