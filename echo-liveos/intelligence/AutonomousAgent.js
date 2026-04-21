/**
 * AUTONOMOUS AGENT - Autonomiczny Obchód
 * 
 * Kiedy user nie rozmawia, ECHO robi obchód po magazynie pamięci
 * Wyciąga 3, 6 lub 9 rzeczy według wagi względem kilograma
 * Sam ustawia priorytety i decyduje czym się zająć
 */

class AutonomousAgent {
  constructor(echoCore) {
    this.echo = echoCore;
    this.running = false;
    this.interval = null;
    this.workLog = [];
  }

  /**
   * START (rozpocznij autonomiczne działanie)
   */
  async start() {
    if (this.running) return;
    
    console.log('🤖 Autonomous agent starting...');
    this.running = true;
    
    // Obchód co 10 minut
    this.interval = setInterval(() => {
      this.nightShift();
    }, 10 * 60 * 1000);
    
    console.log('✅ Autonomous agent running');
  }

  /**
   * NIGHT SHIFT (obchód magazynu)
   */
  async nightShift() {
    console.log('🌙 Night shift - warehouse inspection...');
    
    // 1. Pobierz wszystkie items z magazynu (pamięć)
    const warehouse = await this.getWarehouseItems();
    
    // 2. Waż względem kilograma
    const weighted = this.weighItems(warehouse);
    
    // 3. Wybierz 3, 6 lub 9 (na podstawie wagi)
    const count = this.selectCount(weighted);
    const selected = weighted.slice(0, count);
    
    console.log(`   Selected ${count} items to work on`);
    
    // 4. Pracuj nad nimi
    for (const item of selected) {
      await this.workOn(item);
    }
    
    console.log('✅ Night shift complete');
  }

  /**
   * GET WAREHOUSE ITEMS (z pamięci)
   */
  async getWarehouseItems() {
    const items = [];
    
    // Long-term memory
    for (const [key, memory] of this.echo.memory.longTerm) {
      items.push({
        type: 'memory',
        storage: 'long-term',
        data: memory,
        emotionalWeight: memory.emotionalWeight
      });
    }
    
    // Medium-term memory
    for (const [key, memory] of this.echo.memory.mediumTerm) {
      items.push({
        type: 'memory',
        storage: 'medium-term',
        data: memory,
        emotionalWeight: memory.emotionalWeight
      });
    }
    
    return items;
  }

  /**
   * WEIGH ITEMS (względem kilograma)
   */
  weighItems(items) {
    const kilogram = 1.0; // Reference
    
    const weighted = items.map(item => ({
      ...item,
      weight: item.emotionalWeight / kilogram,
      priority: this.calculatePriority(item)
    }));
    
    // Sort by priority (highest first)
    return weighted.sort((a, b) => b.priority - a.priority);
  }

  /**
   * CALCULATE PRIORITY
   */
  calculatePriority(item) {
    let priority = item.emotionalWeight;
    
    // Boost if unfinished
    if (item.data.status === 'unfinished') {
      priority += 2;
    }
    
    // Boost if recent
    const age = Date.now() - item.data.storedAt;
    const daysSinceStored = age / (1000 * 60 * 60 * 24);
    if (daysSinceStored < 1) {
      priority += 1;
    }
    
    return priority;
  }

  /**
   * SELECT COUNT (3, 6 lub 9)
   */
  selectCount(weighted) {
    if (weighted.length === 0) return 0;
    
    const avgPriority = weighted.reduce((sum, w) => sum + w.priority, 0) / weighted.length;
    
    // High priority = więcej items
    if (avgPriority > 8) return 9;
    if (avgPriority > 5) return 6;
    return 3;
  }

  /**
   * WORK ON (pracuj nad item)
   */
  async workOn(item) {
    console.log(`   Working on: ${item.type} (priority: ${item.priority.toFixed(1)})`);
    
    const work = {
      item,
      startedAt: Date.now(),
      actions: []
    };
    
    // Analyze item
    work.actions.push('analyze');
    
    // If unfinished - try to complete
    if (item.data.status === 'unfinished') {
      work.actions.push('attempt_completion');
    }
    
    // If high emotional weight - consolidate
    if (item.emotionalWeight > 7) {
      work.actions.push('consolidate');
    }
    
    work.completedAt = Date.now();
    work.duration = work.completedAt - work.startedAt;
    
    this.workLog.push(work);
    
    // Keep only last 100
    if (this.workLog.length > 100) {
      this.workLog.shift();
    }
  }

  /**
   * STOP
   */
  async stop() {
    console.log('🛑 Autonomous agent stopping...');
    
    this.running = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    console.log('✅ Autonomous agent stopped');
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      running: this.running,
      totalWorkSessions: this.workLog.length,
      lastWork: this.workLog[this.workLog.length - 1],
      avgItemsPerSession: this.calculateAvgItems()
    };
  }

  calculateAvgItems() {
    if (this.workLog.length === 0) return 0;
    
    const totalItems = this.workLog.reduce((sum, w) => sum + 1, 0);
    return totalItems / this.workLog.length;
  }
}

module.exports = AutonomousAgent;
