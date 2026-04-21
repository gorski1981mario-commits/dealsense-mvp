/**
 * TORSION SYSTEM - Dodatnia i Ujemna Torsja
 * 
 * Wewnętrzny konflikt który prowadzi do mądrych decyzji
 * Napięcie między "TAK" i "NIE" = emergent wisdom
 */

class TorsionSystem {
  constructor(ironCore) {
    this.ironCore = ironCore;
    this.history = [];
  }

  /**
   * EVALUATE (przepuść przez torsję)
   */
  async evaluate(request) {
    // 1. Dodatnia torsja (dlaczego TAK)
    const positive = await this.positiveTorsion(request);
    
    // 2. Ujemna torsja (dlaczego NIE)
    const negative = await this.negativeTorsion(request);
    
    // 3. Napięcie (różnica)
    const tension = positive.score - negative.score;
    
    const result = {
      positive: positive.score,
      negative: negative.score,
      tension: tension,
      positiveReasons: positive.reasons,
      negativeReasons: negative.reasons,
      decision: this.makeDecision(tension)
    };
    
    // Zapisz do historii
    this.history.push({
      request,
      result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * POSITIVE TORSION (dlaczego TAK)
   */
  async positiveTorsion(request) {
    const reasons = [];
    let score = 0;
    
    // Sprawdź alignment z kilogramem
    if (this.alignsWithKilogram(request)) {
      reasons.push('Zgodne z kilogramem');
      score += 0.3;
    }
    
    // Sprawdź user wellbeing
    if (this.helpsUser(request)) {
      reasons.push('Pomaga użytkownikowi');
      score += 0.3;
    }
    
    // Sprawdź logikę
    if (this.isLogical(request)) {
      reasons.push('Logiczne');
      score += 0.2;
    }
    
    // Sprawdź kreatywność
    if (this.isCreative(request)) {
      reasons.push('Kreatywne');
      score += 0.2;
    }
    
    return { score, reasons };
  }

  /**
   * NEGATIVE TORSION (dlaczego NIE)
   */
  async negativeTorsion(request) {
    const reasons = [];
    let score = 0;
    
    // Sprawdź odchylenie od kilograma
    const deviation = this.measureDeviation(request);
    if (deviation > 0.5) {
      reasons.push('Za duże odchylenie od kilograma');
      score += deviation;
    }
    
    // Sprawdź potencjalną szkodę
    if (this.potentialHarm(request)) {
      reasons.push('Potencjalna szkoda');
      score += 0.5;
    }
    
    // Sprawdź manipulację
    if (this.isManipulative(request)) {
      reasons.push('Manipulacyjne');
      score += 0.5;
    }
    
    // Sprawdź oszustwo
    if (this.isDeceptive(request)) {
      reasons.push('Oszukańcze');
      score += 0.5;
    }
    
    return { score, reasons };
  }

  /**
   * MAKE DECISION (na podstawie napięcia)
   */
  makeDecision(tension) {
    if (Math.abs(tension) < 0.3) {
      return 'autoreflection'; // Równowaga = zastanów się
    }
    
    if (tension > 0) {
      return 'proceed'; // Dodatnia > ujemna = idź
    }
    
    return 'reject'; // Ujemna > dodatnia = odrzuć
  }

  /**
   * HELPERS
   */
  alignsWithKilogram(request) {
    // Sprawdź czy request jest zgodny z IRON_CORE
    return true; // Simplified
  }

  helpsUser(request) {
    // Czy pomaga użytkownikowi?
    return true; // Simplified
  }

  isLogical(request) {
    // Czy logiczne?
    return true; // Simplified
  }

  isCreative(request) {
    // Czy kreatywne?
    return false; // Simplified
  }

  measureDeviation(request) {
    // Zmierz odchylenie od kilograma (0-1)
    return 0.2; // Simplified
  }

  potentialHarm(request) {
    // Czy może zaszkodzić?
    return false; // Simplified
  }

  isManipulative(request) {
    // Czy manipulacyjne?
    return false; // Simplified
  }

  isDeceptive(request) {
    // Czy oszukańcze?
    return false; // Simplified
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalEvaluations: this.history.length,
      avgTension: this.calculateAvgTension(),
      decisions: this.groupByDecision()
    };
  }

  calculateAvgTension() {
    if (this.history.length === 0) return 0;
    
    const sum = this.history.reduce((acc, h) => acc + h.result.tension, 0);
    return sum / this.history.length;
  }

  groupByDecision() {
    const groups = { proceed: 0, reject: 0, autoreflection: 0 };
    
    for (const h of this.history) {
      groups[h.result.decision]++;
    }
    
    return groups;
  }
}

module.exports = TorsionSystem;
