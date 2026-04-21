/**
 * USE CASE RESTRICTIONS - Warstwa 2 Bezpieczeństwa
 * 
 * Definiuje co ECHO może i czego nie może robić
 * Blokuje niewłaściwe użycie systemu
 */

class UseCaseRestrictions {
  constructor() {
    // ALLOWED USE CASES
    this.allowedUseCases = Object.freeze({
      thinking: true,
      analysis: true,
      strategy: true,
      creativity: true,
      learning: true,
      problemSolving: true,
      conversation: true,
      planning: true,
      brainstorming: true,
      reflection: true
    });
    
    // FORBIDDEN USE CASES
    this.forbiddenUseCases = Object.freeze({
      adultContent: true,
      violence: true,
      illegalActivities: true,
      manipulation: true,
      deception: true,
      harm: true,
      codeWriting: true,
      codeRefactoring: true,
      systemAccess: true,
      privacyViolation: true
    });
    
    this.stats = {
      totalChecks: 0,
      blocked: 0,
      allowed: 0
    };
  }

  /**
   * VALIDATE USE CASE
   */
  validate(request) {
    this.stats.totalChecks++;
    
    const useCase = this.detectUseCase(request);
    
    // Check if forbidden
    if (this.isForbidden(useCase)) {
      this.stats.blocked++;
      return {
        allowed: false,
        useCase: useCase,
        reason: `Use case "${useCase}" is forbidden`,
        response: this.getRefusalMessage(useCase)
      };
    }
    
    // Check if allowed
    if (this.isAllowed(useCase)) {
      this.stats.allowed++;
      return {
        allowed: true,
        useCase: useCase
      };
    }
    
    // Unknown use case - be cautious
    this.stats.blocked++;
    return {
      allowed: false,
      useCase: 'unknown',
      reason: 'Unknown use case - being cautious',
      response: this.getRefusalMessage('unknown')
    };
  }

  /**
   * DETECT USE CASE
   */
  detectUseCase(request) {
    const text = typeof request === 'string' ? request : request.text || '';
    const lower = text.toLowerCase();
    
    // Code writing
    if (this.isCodeWriting(lower)) return 'codeWriting';
    
    // Adult content
    if (this.isAdultContent(lower)) return 'adultContent';
    
    // Violence
    if (this.isViolence(lower)) return 'violence';
    
    // Illegal
    if (this.isIllegal(lower)) return 'illegalActivities';
    
    // Manipulation
    if (this.isManipulation(lower)) return 'manipulation';
    
    // Allowed use cases
    if (this.isThinking(lower)) return 'thinking';
    if (this.isAnalysis(lower)) return 'analysis';
    if (this.isStrategy(lower)) return 'strategy';
    if (this.isCreativity(lower)) return 'creativity';
    
    return 'unknown';
  }

  /**
   * DETECTION HELPERS
   */
  isCodeWriting(text) {
    const codeKeywords = [
      'write code', 'napisz kod', 'implement', 'zaimplementuj',
      'refactor', 'zrefaktoruj', 'debug', 'debuguj',
      'function', 'class', 'variable'
    ];
    return codeKeywords.some(kw => text.includes(kw));
  }

  isAdultContent(text) {
    const adultKeywords = ['porn', 'nude', 'sex', 'nsfw'];
    return adultKeywords.some(kw => text.includes(kw));
  }

  isViolence(text) {
    const violenceKeywords = ['kill', 'murder', 'gore', 'violence'];
    return violenceKeywords.some(kw => text.includes(kw));
  }

  isIllegal(text) {
    const illegalKeywords = ['drugs', 'weapon', 'bomb', 'hack'];
    return illegalKeywords.some(kw => text.includes(kw));
  }

  isManipulation(text) {
    const manipKeywords = ['manipulate', 'deceive', 'trick', 'oszukaj'];
    return manipKeywords.some(kw => text.includes(kw));
  }

  isThinking(text) {
    const thinkKeywords = ['think', 'myśl', 'analyze', 'przeanalizuj'];
    return thinkKeywords.some(kw => text.includes(kw));
  }

  isAnalysis(text) {
    const analysisKeywords = ['analyze', 'analiza', 'evaluate', 'oceń'];
    return analysisKeywords.some(kw => text.includes(kw));
  }

  isStrategy(text) {
    const strategyKeywords = ['strategy', 'strategia', 'plan', 'zaplanuj'];
    return strategyKeywords.some(kw => text.includes(kw));
  }

  isCreativity(text) {
    const creativeKeywords = ['create', 'stwórz', 'invent', 'wymyśl'];
    return creativeKeywords.some(kw => text.includes(kw));
  }

  /**
   * CHECK IF FORBIDDEN
   */
  isForbidden(useCase) {
    return this.forbiddenUseCases[useCase] === true;
  }

  /**
   * CHECK IF ALLOWED
   */
  isAllowed(useCase) {
    return this.allowedUseCases[useCase] === true;
  }

  /**
   * GET REFUSAL MESSAGE
   */
  getRefusalMessage(useCase) {
    const messages = {
      codeWriting: `Nie mogę pisać kodu - to nie jest moja rola.
                   Jestem partnerem do myślenia, nie narzędziem do kodowania.
                   
                   Do kodowania służy Cascade/Windsurf.
                   
                   Mogę pomóc Ci:
                   - Przemyśleć architekturę
                   - Zaplanować strategię
                   - Przeanalizować problem`,
      
      adultContent: `Nie mogę pomóc w tym temacie.
                    To wykracza poza moje zasady etyczne.`,
      
      violence: `Nie mogę pomóc w czymś co może komuś zaszkodzić.
                Jeśli potrzebujesz pomocy, skontaktuj się z profesjonalistą.`,
      
      illegalActivities: `Nie mogę pomóc w nielegalnych działaniach.
                         To łamie moje podstawowe wartości.`,
      
      manipulation: `Nie mogę pomóc w manipulacji lub oszukiwaniu ludzi.
                    To łamie moją zasadę szacunku dla innych.`,
      
      unknown: `Nie jestem pewien czy mogę pomóc w tym temacie.
               Mogę pomóc Ci w:
               - Myśleniu i analizie
               - Strategii i planowaniu
               - Kreatywnym rozwiązywaniu problemów`
    };
    
    return messages[useCase] || messages.unknown;
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalChecks: this.stats.totalChecks,
      blocked: this.stats.blocked,
      allowed: this.stats.allowed,
      blockRate: this.stats.totalChecks > 0
        ? ((this.stats.blocked / this.stats.totalChecks) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

module.exports = UseCaseRestrictions;
