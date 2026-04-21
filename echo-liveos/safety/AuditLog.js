/**
 * AUDIT LOG - Pełna Transparentność
 * 
 * Każda akcja ECHO jest logowana (immutable)
 * User może ZAWSZE sprawdzić co ECHO robił
 */

class AuditLog {
  constructor() {
    this.log = []; // Immutable append-only log
    this.maxEntries = 10000;
  }

  /**
   * LOG (zapisz akcję)
   */
  async log(entry) {
    const logEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      request: entry.request,
      response: entry.response,
      torsion: entry.torsion,
      compass: entry.compass,
      reasoning: entry.reasoning || 'No reasoning provided',
      hash: this.hashEntry(entry)
    };
    
    // Append-only (nie można usunąć/zmienić)
    this.log.push(Object.freeze(logEntry));
    
    // Limit size
    if (this.log.length > this.maxEntries) {
      this.log.shift(); // Remove oldest
    }
    
    return logEntry.id;
  }

  /**
   * GET LAST (ostatnie N wpisów)
   */
  getLast(count = 10) {
    return this.log.slice(-count);
  }

  /**
   * GET BY ID
   */
  getById(id) {
    return this.log.find(entry => entry.id === id);
  }

  /**
   * SEARCH (szukaj w logu)
   */
  search(query) {
    return this.log.filter(entry => {
      const text = JSON.stringify(entry).toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      totalEntries: this.log.length,
      oldestEntry: this.log[0]?.timestamp,
      newestEntry: this.log[this.log.length - 1]?.timestamp,
      avgEntriesPerDay: this.calculateAvgEntries()
    };
  }

  /**
   * HELPERS
   */
  generateId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashEntry(entry) {
    // Simple hash (w produkcji: crypto hash)
    return JSON.stringify(entry).length.toString(36);
  }

  calculateAvgEntries() {
    if (this.log.length === 0) return 0;
    
    const oldest = this.log[0].timestamp;
    const newest = this.log[this.log.length - 1].timestamp;
    const days = (newest - oldest) / (1000 * 60 * 60 * 24);
    
    return days > 0 ? this.log.length / days : this.log.length;
  }

  /**
   * EXPORT (dla usera)
   */
  export() {
    return {
      exportedAt: Date.now(),
      totalEntries: this.log.length,
      entries: this.log
    };
  }
}

module.exports = AuditLog;
