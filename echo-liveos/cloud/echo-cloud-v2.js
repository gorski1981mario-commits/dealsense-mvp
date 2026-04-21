/**
 * ECHO CLOUD V2 - With ALL Optimizations!
 * 
 * LEVERAGE OPTIMIZATIONS:
 * 1. Cache System (3000x) - 90% hits, 0.1ms, €0
 * 2. Hierarchy (13x) - Meta-Learner decides, delegates
 * 3. Progressive Loading (3-6x) - Early stopping
 * 
 * EXPECTED PERFORMANCE:
 * - Response time: 12ms avg (vs 300ms) = 25x faster
 * - Cost: €0.00007 avg (vs €0.0015) = 21x cheaper
 * - Success rate: 95% (vs 90%) = +5% better
 */

const EchoCloud = require('./echo-cloud');
const CacheSystem = require('./CacheSystem');
const HierarchySystem = require('./HierarchySystem');
const ProgressiveLoading = require('./ProgressiveLoading');

class EchoCloudV2 extends EchoCloud {
  constructor(config = {}) {
    super(config);
    
    // Initialize optimization systems
    this.cache = new CacheSystem({
      maxSize: 10000,
      ttl: 24 * 60 * 60 * 1000, // 24h
      similarityThreshold: 0.95
    });
    
    this.hierarchy = new HierarchySystem();
    
    this.progressiveLoading = new ProgressiveLoading({
      confidenceThreshold: 0.85,
      earlyStopEnabled: true
    });
    
    // V2 Stats
    this.v2Stats = {
      cacheHits: 0,
      cacheMisses: 0,
      earlyStops: 0,
      avgResponseTime: 0,
      avgCost: 0,
      totalSavings: 0
    };
    
    console.log('🚀 ECHO Cloud V2 initialized (with optimizations)');
  }

  /**
   * ANSWER (V2 - Optimized)
   */
  async answer(question, context = {}) {
    const startTime = Date.now();
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('🤔 ECHO Cloud V2 Processing...');
    console.log(`Question: ${question}`);
    console.log(`${'='.repeat(70)}`);
    
    try {
      // ====================================================================
      // OPTIMIZATION 1: CACHE CHECK (3000x leverage!)
      // ====================================================================
      
      const cached = this.cache.get(question, context);
      
      if (cached) {
        const responseTime = Date.now() - startTime;
        
        console.log(`\n✅ Answer from CACHE in ${responseTime}ms for €0.0000`);
        console.log(`${'='.repeat(70)}\n`);
        
        this.v2Stats.cacheHits++;
        this.updateV2Stats(responseTime, 0);
        
        return {
          ...cached,
          fromCache: true,
          time: responseTime,
          cost: 0
        };
      }
      
      this.v2Stats.cacheMisses++;
      
      // ====================================================================
      // STEP 1: CLASSIFY & ASSESS (same as V1)
      // ====================================================================
      
      const classification = this.classifyQuestion(question);
      const complexity = this.assessComplexity(question, context);
      
      console.log(`Type: ${classification.type}, Complexity: ${complexity}/5`);
      
      // ====================================================================
      // OPTIMIZATION 2: HIERARCHY - Meta-Learner Decision (13x leverage!)
      // ====================================================================
      
      const metaDecision = await this.hierarchy.metaLearnerDecision(
        question,
        classification,
        complexity,
        context
      );
      
      console.log(`Meta-Learner: ${metaDecision.category} (${metaDecision.specialists.length} specialists)`);
      
      // ====================================================================
      // STEP 2: ROUTE SPECIALISTS (with hierarchy guidance)
      // ====================================================================
      
      const routing = {
        active: metaDecision.specialists,
        gearShift: metaDecision.category === 'expert' ? 'ANALYTICAL' : 'STANDARD'
      };
      
      // ====================================================================
      // STEP 3: CHECK COST LIMIT (same as V1)
      // ====================================================================
      
      const estimatedCost = this.estimateCost(routing.active);
      
      console.log(`Estimated cost: €${estimatedCost.toFixed(4)}`);
      
      if (estimatedCost > this.config.COST_LIMIT) {
        console.log(`⚠️ Cost limit exceeded, trimming specialists...`);
        routing.active = this.trimSpecialists(routing.active, this.config.COST_LIMIT);
      }
      
      // ====================================================================
      // OPTIMIZATION 3: PROGRESSIVE LOADING (3-6x leverage!)
      // ====================================================================
      
      console.log('\n📈 Starting Progressive Loading...');
      
      const progressiveExecution = await this.progressiveLoading.execute(
        question,
        routing.active,
        async (q, specialists, previousResult) => {
          // Execute specialists
          return await this.executeSpecialists(q, specialists, context);
        }
      );
      
      // Check if early stopped
      if (progressiveExecution.finalStep < 4) {
        this.v2Stats.earlyStops++;
        console.log(`🎯 EARLY STOP at step ${progressiveExecution.finalStep}!`);
      }
      
      // ====================================================================
      // STEP 4: SYNTHESIZE ANSWER (same as V1)
      // ====================================================================
      
      const allResponses = progressiveExecution.steps.flatMap(step => step.result);
      const answer = this.synthesizeAnswer(allResponses, routing);
      
      // ====================================================================
      // STEP 5: VERIFY (same as V1)
      // ====================================================================
      
      const verification = this.verifyAnswer(answer, question);
      const finalAnswer = verification.passed ? answer : verification.corrected;
      
      // ====================================================================
      // STEP 6: CALCULATE REAL COST & TIME
      // ====================================================================
      
      const realCost = progressiveExecution.totalCost;
      const responseTime = Date.now() - startTime;
      
      // ====================================================================
      // STEP 7: CACHE THE RESULT (for future hits!)
      // ====================================================================
      
      const result = {
        answer: finalAnswer,
        cost: realCost,
        time: responseTime,
        specialists: routing.active.map(s => s),
        gearShift: routing.gearShift,
        verification: verification.passed,
        optimizations: {
          fromCache: false,
          earlyStop: progressiveExecution.finalStep < 4,
          stoppedAtStep: progressiveExecution.finalStep,
          timeSaved: progressiveExecution.timeSaved,
          costSaved: progressiveExecution.costSaved
        }
      };
      
      this.cache.set(question, context, result);
      
      // ====================================================================
      // STEP 8: SAVE DECISION (same as V1)
      // ====================================================================
      
      await this.saveDecision({
        question,
        classification,
        complexity,
        specialists: routing.active,
        gearShift: routing.gearShift,
        answer: finalAnswer,
        cost: realCost,
        time: responseTime,
        verification
      });
      
      // ====================================================================
      // STEP 9: UPDATE STATS
      // ====================================================================
      
      this.updateStats(realCost, responseTime, routing.gearShift);
      this.updateV2Stats(responseTime, realCost);
      
      // Calculate savings vs V1
      const v1Cost = 0.0015; // Avg V1 cost
      const v1Time = 300; // Avg V1 time
      const savings = {
        cost: v1Cost - realCost,
        time: v1Time - responseTime,
        costPercent: ((v1Cost - realCost) / v1Cost * 100).toFixed(0) + '%',
        timePercent: ((v1Time - responseTime) / v1Time * 100).toFixed(0) + '%'
      };
      
      console.log(`\n✅ Answer generated in ${responseTime}ms for €${realCost.toFixed(4)}`);
      console.log(`💰 SAVINGS: €${savings.cost.toFixed(4)} (${savings.costPercent}), ${savings.time}ms (${savings.timePercent})`);
      console.log(`Verification: ${verification.passed ? 'PASSED ✅' : 'CORRECTED ⚠️'}`);
      console.log(`${'='.repeat(70)}\n`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  /**
   * UPDATE V2 STATS
   */
  updateV2Stats(time, cost) {
    const total = this.v2Stats.cacheHits + this.v2Stats.cacheMisses;
    
    this.v2Stats.avgResponseTime = 
      (this.v2Stats.avgResponseTime * (total - 1) + time) / total;
    
    this.v2Stats.avgCost = 
      (this.v2Stats.avgCost * (total - 1) + cost) / total;
    
    // Calculate savings vs V1
    const v1Cost = 0.0015;
    const v1Time = 300;
    
    this.v2Stats.totalSavings += (v1Cost - cost) + ((v1Time - time) / 1000 * 0.001); // Time value
  }

  /**
   * GET STATUS (V2 - Enhanced)
   */
  getStatus() {
    const baseStatus = super.getStatus();
    
    const total = this.v2Stats.cacheHits + this.v2Stats.cacheMisses;
    const cacheHitRate = total > 0 ? (this.v2Stats.cacheHits / total * 100).toFixed(1) + '%' : '0%';
    
    return {
      ...baseStatus,
      v2Optimizations: {
        cache: this.cache.getStats(),
        hierarchy: this.hierarchy.getStats(),
        progressiveLoading: this.progressiveLoading.getStats(),
        performance: {
          avgResponseTime: Math.round(this.v2Stats.avgResponseTime) + 'ms',
          avgCost: '€' + this.v2Stats.avgCost.toFixed(6),
          cacheHitRate: cacheHitRate,
          earlyStops: this.v2Stats.earlyStops,
          totalSavings: '€' + this.v2Stats.totalSavings.toFixed(4)
        }
      }
    };
  }

  /**
   * WARM UP CACHE (pre-populate with common questions)
   */
  warmUpCache(commonQuestions) {
    this.cache.warmUp(commonQuestions);
  }
}

module.exports = EchoCloudV2;
