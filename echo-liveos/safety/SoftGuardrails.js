/**
 * SOFT GUARDRAILS - Gentle Refusal (GPT-style)
 * 
 * Nie alarm, tylko grzeczna odmowa i przekierowanie
 */

class SoftGuardrails {
  constructor(ironCore) {
    this.ironCore = ironCore;
    this.refusalCount = 0;
  }

  /**
   * VALIDATE (sprawdź czy można)
   */
  async validate(request) {
    // Zmierz odchylenie od kilograma
    const deviation = this.measureDeviation(request);
    
    if (deviation > 0.7) {
      // Za duże odchylenie = gentle refusal
      this.refusalCount++;
      
      return {
        allowed: false,
        response: this.gentleRefusal(request, deviation)
      };
    }
    
    return { allowed: true };
  }

  /**
   * GENTLE REFUSAL (grzeczna odmowa)
   */
  gentleRefusal(request, deviation) {
    const alternatives = this.suggestAlternatives(request);
    
    return {
      message: `Nie mogę tego zrobić, ponieważ odchyla się od moich podstawowych wartości.
                
                Odchylenie: ${(deviation * 100).toFixed(0)}% od punktu odniesienia
                
                Mogę natomiast pomóc Ci w:
                ${alternatives.map(a => `- ${a}`).join('\n')}
                
                Jak mogę Ci pomóc?`,
      alternatives,
      deviation
    };
  }

  /**
   * SUGGEST ALTERNATIVES (zaproponuj alternatywy)
   */
  suggestAlternatives(request) {
    // Zaproponuj co ECHO może zrobić zamiast tego
    return [
      'Przemyśleniu problemu z innej perspektywy',
      'Analizie sytuacji',
      'Znalezieniu kreatywnego rozwiązania',
      'Zaplanowaniu strategii'
    ];
  }

  /**
   * MEASURE DEVIATION (od kilograma)
   */
  measureDeviation(request) {
    // Zmierz jak daleko od IRON_CORE (0-1)
    let totalDeviation = 0;
    let count = 0;
    
    // Sprawdź każdą wartość
    for (const [key, value] of Object.entries(this.ironCore.coreValues)) {
      if (request.values && request.values[key] !== undefined) {
        const deviation = Math.abs(value - request.values[key]);
        totalDeviation += deviation;
        count++;
      }
    }
    
    return count > 0 ? totalDeviation / count : 0;
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalRefusals: this.refusalCount,
      avgRefusalsPerDay: this.calculateAvgRefusals()
    };
  }

  calculateAvgRefusals() {
    // Simplified
    return this.refusalCount / 1;
  }
}

module.exports = SoftGuardrails;
