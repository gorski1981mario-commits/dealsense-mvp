/**
 * PLASTIC MEMORY - Pamięć Plastyczna
 * 
 * Zapomina zwykłe rzeczy, mocno trzyma te które przebiły próg emocjonalny
 * Jak ludzki mózg - naturalne uczenie się
 */

class PlasticMemory {
  constructor() {
    this.longTerm = new Map();    // Emotional weight > 7
    this.mediumTerm = new Map();  // Emotional weight 4-7
    this.shortTerm = new Map();   // Emotional weight < 4
    this.reflections = [];
  }

  /**
   * STORE (zapisz pamięć)
   */
  async store(memory) {
    const emotionalWeight = memory.emotionalWeight || 5;
    const key = this.generateKey(memory);
    
    const entry = {
      ...memory,
      storedAt: Date.now(),
      emotionalWeight
    };
    
    // Wybierz storage na podstawie wagi emocjonalnej
    if (emotionalWeight >= 7) {
      // Long-term (mocno trzymaj)
      this.longTerm.set(key, entry);
    } else if (emotionalWeight >= 4) {
      // Medium-term (trzymaj przez 30 dni)
      this.mediumTerm.set(key, {
        ...entry,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
      });
    } else {
      // Short-term (trzymaj przez 1 dzień)
      this.shortTerm.set(key, {
        ...entry,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      });
    }
    
    // Cleanup expired
    await this.cleanup();
  }

  /**
   * RECALL (przypomnij)
   */
  async recall(query) {
    const results = [];
    
    // Search in all storages (long-term first)
    for (const [key, memory] of this.longTerm) {
      if (this.matches(memory, query)) {
        results.push({ ...memory, storage: 'long-term' });
      }
    }
    
    for (const [key, memory] of this.mediumTerm) {
      if (this.matches(memory, query)) {
        results.push({ ...memory, storage: 'medium-term' });
      }
    }
    
    for (const [key, memory] of this.shortTerm) {
      if (this.matches(memory, query)) {
        results.push({ ...memory, storage: 'short-term' });
      }
    }
    
    // Sort by emotional weight (highest first)
    return results.sort((a, b) => b.emotionalWeight - a.emotionalWeight);
  }

  /**
   * STORE REFLECTION (autorefleksja)
   */
  async storeReflection(reflection) {
    this.reflections.push({
      ...reflection,
      timestamp: Date.now()
    });
    
    // Keep only last 100
    if (this.reflections.length > 100) {
      this.reflections.shift();
    }
  }

  /**
   * CLEANUP (usuń wygasłe)
   */
  async cleanup() {
    const now = Date.now();
    
    // Medium-term
    for (const [key, memory] of this.mediumTerm) {
      if (memory.expiresAt && memory.expiresAt < now) {
        this.mediumTerm.delete(key);
      }
    }
    
    // Short-term
    for (const [key, memory] of this.shortTerm) {
      if (memory.expiresAt && memory.expiresAt < now) {
        this.shortTerm.delete(key);
      }
    }
  }

  /**
   * CONSOLIDATE (konsoliduj pamięci)
   */
  async consolidate() {
    // Merge similar memories
    // Promote important medium-term to long-term
    // Simplified for now
  }

  /**
   * HELPERS
   */
  generateKey(memory) {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  matches(memory, query) {
    const text = JSON.stringify(memory).toLowerCase();
    return text.includes(query.toLowerCase());
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      longTerm: this.longTerm.size,
      mediumTerm: this.mediumTerm.size,
      shortTerm: this.shortTerm.size,
      reflections: this.reflections.length,
      total: this.longTerm.size + this.mediumTerm.size + this.shortTerm.size
    };
  }
}

module.exports = PlasticMemory;
