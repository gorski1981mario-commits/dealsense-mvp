/**
 * QUALITY CONTROL MANAGER
 * 
 * Monitor crawler success rate and auto-rotate proxy pool if < 85%
 * Check every 100 requests
 */

class QualityControl {
  constructor(proxyManager) {
    this.proxyManager = proxyManager;
    
    this.successCount = 0;
    this.totalCount = 0;
    this.checkInterval = 100; // Check every 100 requests
    
    // History for trending
    this.history = [];
    this.maxHistory = 10;
  }

  /**
   * Record scrape result
   */
  async recordResult(success, domain = null) {
    this.totalCount++;
    if (success) this.successCount++;
    
    // Check quality every 100 requests
    if (this.totalCount % this.checkInterval === 0) {
      await this.checkQuality();
    }
  }

  /**
   * Check quality and take action if needed
   */
  async checkQuality() {
    const successRate = (this.successCount / this.totalCount) * 100;
    
    // Add to history
    this.history.push({
      successRate,
      timestamp: Date.now(),
      total: this.totalCount,
      successful: this.successCount
    });
    
    // Keep only last 10 checks
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    console.log(`\n[QC] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[QC] Quality Check #${this.history.length}`);
    console.log(`[QC] Success Rate: ${successRate.toFixed(1)}% (${this.successCount}/${this.totalCount})`);
    console.log(`[QC] Threshold: 85%`);
    
    // If success rate < 85%, rotate entire proxy pool
    if (successRate < 85) {
      console.log(`[QC] ⚠️  LOW SUCCESS RATE! Rotating proxy pool...`);
      await this.proxyManager.rotateEntirePool();
      
      // Reset counters after rotation
      this.successCount = 0;
      this.totalCount = 0;
      
      console.log(`[QC] ✅ Proxy pool rotated, counters reset`);
    } else {
      console.log(`[QC] ✅ Quality OK`);
    }
    
    console.log(`[QC] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  }

  /**
   * Get current statistics
   */
  getStats() {
    const successRate = this.totalCount > 0 
      ? (this.successCount / this.totalCount * 100).toFixed(1) 
      : 0;
    
    return {
      total: this.totalCount,
      successful: this.successCount,
      failed: this.totalCount - this.successCount,
      successRate: successRate + '%',
      checksPerformed: this.history.length,
      trend: this.getTrend()
    };
  }

  /**
   * Get success rate trend
   */
  getTrend() {
    if (this.history.length < 2) return 'stable';
    
    const recent = this.history.slice(-3);
    const avg = recent.reduce((sum, h) => sum + h.successRate, 0) / recent.length;
    
    if (avg > 90) return 'excellent';
    if (avg > 85) return 'good';
    if (avg > 75) return 'declining';
    return 'poor';
  }

  /**
   * Reset statistics
   */
  reset() {
    this.successCount = 0;
    this.totalCount = 0;
    this.history = [];
  }
}

module.exports = QualityControl;
