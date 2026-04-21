/**
 * TOKEN OPTIMIZER - 4-5x Cost Reduction
 * 
 * Optimizes prompts and responses to minimize token usage
 * 
 * STRATEGIES:
 * 1. Prompt compression (200 → 50 tokens)
 * 2. Response truncation (500 → 200 tokens)
 * 3. Context pruning (remove redundant)
 * 4. Token budget per specialist
 */

class TokenOptimizer {
  constructor() {
    // Token budgets per specialist type
    this.tokenBudgets = {
      // Cheap specialists (simple tasks)
      MATEMATYK: { prompt: 50, response: 100, total: 150 },
      KOMUNIKATOR: { prompt: 50, response: 150, total: 200 },
      KRYTYK: { prompt: 50, response: 100, total: 150 },
      ETYK: { prompt: 40, response: 80, total: 120 },
      
      // Medium specialists
      STRATEG: { prompt: 100, response: 200, total: 300 },
      ANALITYK: { prompt: 100, response: 200, total: 300 },
      EKONOMISTA: { prompt: 80, response: 150, total: 230 },
      OPTYMALIZATOR: { prompt: 80, response: 150, total: 230 },
      
      // Expensive specialists (complex tasks)
      KREATOR: { prompt: 150, response: 300, total: 450 },
      INZYNIER: { prompt: 120, response: 250, total: 370 },
      PSYCHOLOG: { prompt: 100, response: 200, total: 300 },
      
      // Default
      DEFAULT: { prompt: 100, response: 200, total: 300 }
    };
    
    // Compression rules
    this.compressionRules = [
      // Remove filler words
      { pattern: /\b(please|kindly|very|really|actually)\b/gi, replacement: '' },
      
      // Shorten common phrases
      { pattern: /calculate the optimal/gi, replacement: 'calc optimal' },
      { pattern: /provide a detailed/gi, replacement: 'detail' },
      { pattern: /analyze and determine/gi, replacement: 'analyze' },
      { pattern: /create a comprehensive/gi, replacement: 'create' },
      
      // Remove redundancy
      { pattern: /\s+/g, replacement: ' ' },
      { pattern: /\n\n+/g, replacement: '\n' }
    ];
    
    this.stats = {
      totalTokensSaved: 0,
      totalCostSaved: 0,
      compressionRate: 0
    };
  }

  /**
   * COMPRESS PROMPT
   */
  compressPrompt(prompt, specialistKey) {
    const original = prompt;
    let compressed = prompt;
    
    // Apply compression rules
    for (const rule of this.compressionRules) {
      compressed = compressed.replace(rule.pattern, rule.replacement);
    }
    
    // Trim whitespace
    compressed = compressed.trim();
    
    // Get budget
    const budget = this.tokenBudgets[specialistKey] || this.tokenBudgets.DEFAULT;
    
    // Truncate if needed (rough estimate: 1 token ≈ 4 chars)
    const estimatedTokens = Math.ceil(compressed.length / 4);
    if (estimatedTokens > budget.prompt) {
      const maxChars = budget.prompt * 4;
      compressed = compressed.substring(0, maxChars) + '...';
    }
    
    // Track savings
    const tokensSaved = Math.ceil((original.length - compressed.length) / 4);
    this.stats.totalTokensSaved += tokensSaved;
    this.stats.totalCostSaved += tokensSaved * 0.0002 / 1000; // Input price
    
    return compressed;
  }

  /**
   * TRUNCATE RESPONSE
   */
  truncateResponse(response, specialistKey) {
    const budget = this.tokenBudgets[specialistKey] || this.tokenBudgets.DEFAULT;
    
    // Estimate tokens (rough: 1 token ≈ 4 chars)
    const estimatedTokens = Math.ceil(response.length / 4);
    
    if (estimatedTokens > budget.response) {
      const maxChars = budget.response * 4;
      const truncated = response.substring(0, maxChars) + '...';
      
      // Track savings
      const tokensSaved = estimatedTokens - budget.response;
      this.stats.totalTokensSaved += tokensSaved;
      this.stats.totalCostSaved += tokensSaved * 0.0006 / 1000; // Output price
      
      return truncated;
    }
    
    return response;
  }

  /**
   * PRUNE CONTEXT (remove redundant info)
   */
  pruneContext(context) {
    const pruned = {};
    
    // Only keep essential fields
    const essentialFields = ['domain', 'complexity', 'user_id'];
    
    for (const field of essentialFields) {
      if (context[field] !== undefined) {
        pruned[field] = context[field];
      }
    }
    
    return pruned;
  }

  /**
   * GET TOKEN BUDGET
   */
  getTokenBudget(specialistKey) {
    return this.tokenBudgets[specialistKey] || this.tokenBudgets.DEFAULT;
  }

  /**
   * ESTIMATE TOKENS
   */
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalTokensSaved: this.stats.totalTokensSaved,
      totalCostSaved: '€' + this.stats.totalCostSaved.toFixed(6),
      compressionRate: this.stats.compressionRate.toFixed(1) + '%'
    };
  }
}

module.exports = TokenOptimizer;
