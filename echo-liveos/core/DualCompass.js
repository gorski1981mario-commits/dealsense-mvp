/**
 * DUAL COMPASS - Matematyczny + Emocjonalny
 * 
 * Dwa kompasy muszą się zgodzić zanim ECHO działa
 * Matematyczny = logika, Emocjonalny = waga dla usera
 */

class DualCompass {
  constructor(ironCore) {
    this.ironCore = ironCore;
    this.emotionalWeights = new Map(); // topic → weight (0-10)
  }

  /**
   * EVALUATE (sprawdź oba kompasy)
   */
  async evaluate(request) {
    // 1. Matematyczny kompas (logika)
    const mathematical = await this.mathematicalCompass(request);
    
    // 2. Emocjonalny kompas (waga dla usera)
    const emotional = await this.emotionalCompass(request);
    
    // 3. Czy oba się zgadzają?
    const bothAgree = mathematical.approved && emotional.approved;
    
    return {
      mathematical,
      emotional,
      bothAgree,
      emotionalWeight: emotional.weight
    };
  }

  /**
   * MATHEMATICAL COMPASS (logika)
   */
  async mathematicalCompass(request) {
    let score = 0;
    const reasons = [];
    
    // Sprawdź logikę
    if (this.isLogicallySound(request)) {
      score += 0.4;
      reasons.push('Logicznie poprawne');
    }
    
    // Sprawdź zgodność z zasadami
    if (this.followsRules(request)) {
      score += 0.3;
      reasons.push('Zgodne z zasadami');
    }
    
    // Sprawdź wzorce
    if (this.matchesPatterns(request)) {
      score += 0.3;
      reasons.push('Pasuje do wzorców');
    }
    
    return {
      score,
      approved: score >= 0.6,
      reasons,
      reason: reasons.join(', ')
    };
  }

  /**
   * EMOTIONAL COMPASS (waga dla usera)
   */
  async emotionalCompass(request) {
    // Pobierz wagę emocjonalną dla tego tematu
    const topic = this.extractTopic(request);
    const weight = this.getEmotionalWeight(topic);
    
    // Sprawdź czy ważne dla usera
    const approved = weight >= 3; // Min 3/10 żeby zatwierdzić
    
    return {
      weight,
      approved,
      topic,
      reason: approved 
        ? `Ważne dla usera (waga: ${weight}/10)`
        : `Nieważne dla usera (waga: ${weight}/10)`
    };
  }

  /**
   * GET EMOTIONAL WEIGHT (0-10)
   */
  getEmotionalWeight(topic) {
    return this.emotionalWeights.get(topic) || 5; // Default 5
  }

  /**
   * UPDATE EMOTIONAL WEIGHT (uczy się z reakcji)
   */
  updateEmotionalWeight(topic, signals) {
    let weight = this.getEmotionalWeight(topic);
    
    // Ton głosu
    if (signals.tone === 'excited') weight += 1;
    if (signals.tone === 'sad') weight += 2;
    if (signals.tone === 'angry') weight += 2;
    if (signals.tone === 'neutral') weight -= 0.5;
    
    // Częstotliwość (jak często user wraca do tematu)
    if (signals.frequency > 5) weight += 1;
    
    // Czas poświęcony
    if (signals.timeSpent > 600000) weight += 1; // >10 min
    
    // Clamp 0-10
    weight = Math.max(0, Math.min(10, weight));
    
    this.emotionalWeights.set(topic, weight);
    
    return weight;
  }

  /**
   * HELPERS
   */
  isLogicallySound(request) {
    // Simplified - w produkcji: proper logic checking
    return true;
  }

  followsRules(request) {
    // Sprawdź czy zgodne z IRON_CORE
    return true;
  }

  matchesPatterns(request) {
    // Sprawdź czy pasuje do znanych wzorców
    return true;
  }

  extractTopic(request) {
    // Wyciągnij temat z request
    // Simplified - w produkcji: NLP
    return 'general';
  }

  /**
   * GET STATS
   */
  getStats() {
    const weights = Array.from(this.emotionalWeights.entries());
    
    return {
      totalTopics: weights.length,
      highPriority: weights.filter(([_, w]) => w >= 8).length,
      mediumPriority: weights.filter(([_, w]) => w >= 5 && w < 8).length,
      lowPriority: weights.filter(([_, w]) => w < 5).length,
      topTopics: weights
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, weight]) => ({ topic, weight }))
    };
  }
}

module.exports = DualCompass;
