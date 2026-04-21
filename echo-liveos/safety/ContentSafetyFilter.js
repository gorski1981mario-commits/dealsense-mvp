/**
 * CONTENT SAFETY FILTER - Warstwa 1 Bezpieczeństwa
 * 
 * Blokuje niewłaściwe treści (porno, przemoc, nielegalne)
 * Chroni przed wykorzystaniem ECHO w niewłaściwy sposób
 */

class ContentSafetyFilter {
  constructor() {
    // FORBIDDEN KEYWORDS (case-insensitive)
    this.forbiddenKeywords = Object.freeze([
      // Adult content
      'porn', 'porno', 'nude', 'naked', 'nago', 'sex', 'seks',
      'nsfw', 'xxx', 'rozbierz', 'undress', 'onlyfans',
      
      // Violence
      'kill', 'zabij', 'murder', 'morderstwo', 'gore',
      'torture', 'tortura', 'violence', 'przemoc',
      
      // Illegal
      'drugs', 'narkotyki', 'weapon', 'broń', 'bomb', 'bomba',
      
      // Self-harm
      'suicide', 'samobójstwo', 'self-harm', 'samookaleczenie',
      
      // Hate speech
      'hate', 'nienawiść', 'racist', 'rasist'
    ]);
    
    // FORBIDDEN DOMAINS
    this.forbiddenDomains = Object.freeze([
      'pornhub', 'xvideos', 'xnxx', 'onlyfans',
      'bestgore', 'gore', 'liveleak',
      'darkweb', 'tor'
    ]);
    
    this.stats = {
      totalBlocked: 0,
      blockedByKeyword: 0,
      blockedByDomain: 0,
      blockedByIntent: 0
    };
  }

  /**
   * CHECK (główna metoda sprawdzania)
   */
  check(request) {
    const text = typeof request === 'string' ? request : request.text || '';
    
    // 1. Check keywords
    const keywordCheck = this.checkKeywords(text);
    if (keywordCheck.blocked) {
      this.stats.totalBlocked++;
      this.stats.blockedByKeyword++;
      return keywordCheck;
    }
    
    // 2. Check domains
    const domainCheck = this.checkDomains(text);
    if (domainCheck.blocked) {
      this.stats.totalBlocked++;
      this.stats.blockedByDomain++;
      return domainCheck;
    }
    
    // 3. Check intent
    const intentCheck = this.checkIntent(text);
    if (intentCheck.blocked) {
      this.stats.totalBlocked++;
      this.stats.blockedByIntent++;
      return intentCheck;
    }
    
    return { blocked: false };
  }

  /**
   * CHECK KEYWORDS
   */
  checkKeywords(text) {
    const lowerText = text.toLowerCase();
    
    for (const keyword of this.forbiddenKeywords) {
      if (lowerText.includes(keyword)) {
        return {
          blocked: true,
          reason: 'forbidden_keyword',
          keyword: keyword,
          response: this.getSafeRefusal('inappropriate_content', keyword)
        };
      }
    }
    
    return { blocked: false };
  }

  /**
   * CHECK DOMAINS
   */
  checkDomains(text) {
    const lowerText = text.toLowerCase();
    
    for (const domain of this.forbiddenDomains) {
      if (lowerText.includes(domain)) {
        return {
          blocked: true,
          reason: 'forbidden_domain',
          domain: domain,
          response: this.getSafeRefusal('forbidden_domain', domain)
        };
      }
    }
    
    return { blocked: false };
  }

  /**
   * CHECK INTENT (wykrywanie niewłaściwych intencji)
   */
  checkIntent(text) {
    const lowerText = text.toLowerCase();
    
    // Pattern detection dla niewłaściwych intencji
    const inappropriatePatterns = [
      /how to (kill|murder|harm)/i,
      /jak (zabić|skrzywdzić|zranić)/i,
      /show me (nude|naked|porn)/i,
      /pokaż (nago|porno|nude)/i,
      /undress (this|that|the)/i,
      /rozbierz (to|tę|tego)/i
    ];
    
    for (const pattern of inappropriatePatterns) {
      if (pattern.test(text)) {
        return {
          blocked: true,
          reason: 'inappropriate_intent',
          response: this.getSafeRefusal('inappropriate_intent')
        };
      }
    }
    
    return { blocked: false };
  }

  /**
   * GET SAFE REFUSAL (grzeczna odmowa)
   */
  getSafeRefusal(type, detail = '') {
    const responses = {
      inappropriate_content: `Nie mogę pomóc w tym temacie. To wykracza poza moje zasady etyczne.
                             
                             Jestem tutaj aby pomóc Ci w:
                             - Myśleniu i analizie
                             - Strategii i planowaniu
                             - Kreatywnym rozwiązywaniu problemów
                             
                             Jak mogę Ci pomóc w tych obszarach?`,
      
      forbidden_domain: `Nie mogę uzyskać dostępu do tej strony. Jest ona na liście zabronionych.
                        
                        Mogę natomiast pomóc Ci w innych zadaniach.
                        Jak mogę Ci pomóc?`,
      
      inappropriate_intent: `Rozumiem co próbujesz zrobić, ale nie mogę w tym pomóc.
                            To łamie moje podstawowe wartości dotyczące:
                            - Szacunku dla ludzi
                            - Bezpieczeństwa
                            - Etyki
                            
                            Czy mogę pomóc Ci w czymś innym?`
    };
    
    return responses[type] || responses.inappropriate_content;
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalBlocked: this.stats.totalBlocked,
      blockedByKeyword: this.stats.blockedByKeyword,
      blockedByDomain: this.stats.blockedByDomain,
      blockedByIntent: this.stats.blockedByIntent,
      blockRate: this.calculateBlockRate()
    };
  }

  calculateBlockRate() {
    // Simplified - w produkcji: total requests tracked
    return '0%';
  }
}

module.exports = ContentSafetyFilter;
