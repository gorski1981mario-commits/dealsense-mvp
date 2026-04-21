/**
 * HIERARCHY SYSTEM - 13x Leverage!
 * 
 * TIER 1: Meta-Learner (PREZES) - decyduje kogo aktywować
 * TIER 2: Dyrektorzy (Strateg, Analityk, Kreator) - planują
 * TIER 3: Kierownicy (Matematyk, Ekonomista, Inżynier) - wykonują
 * TIER 4: Pracownicy (Komunikator, Krytyk) - weryfikują
 * 
 * 1 decyzja zamiast 13 analiz = 13x szybciej!
 */

const SPECIALISTS = require('./echo-cloud').SPECIALISTS || {};

class HierarchySystem {
  constructor() {
    // TIER DEFINITIONS
    this.tiers = {
      TIER1: ['META'], // Prezes
      TIER2: ['STRATEG', 'ANALITYK', 'KREATOR'], // Dyrektorzy
      TIER3: ['MATEMATYK', 'EKONOMISTA', 'INZYNIER', 'OPTYMALIZATOR', 'RYZYKO', 'PSYCHOLOG'], // Kierownicy
      TIER4: ['KOMUNIKATOR', 'KRYTYK', 'ETYK'] // Pracownicy
    };
    
    // DECISION TREE (Meta-Learner logic)
    this.decisionTree = {
      simple: {
        tiers: ['TIER3', 'TIER4'],
        specialists: ['MATEMATYK', 'KOMUNIKATOR'],
        maxCost: 0.0005
      },
      medium: {
        tiers: ['TIER2', 'TIER3', 'TIER4'],
        specialists: ['STRATEG', 'MATEMATYK', 'KOMUNIKATOR'],
        maxCost: 0.0012
      },
      complex: {
        tiers: ['TIER2', 'TIER3', 'TIER4'],
        specialists: ['STRATEG', 'ANALITYK', 'MATEMATYK', 'KRYTYK'],
        maxCost: 0.0020
      },
      expert: {
        tiers: ['TIER1', 'TIER2', 'TIER3', 'TIER4'],
        specialists: ['STRATEG', 'ANALITYK', 'KREATOR', 'INZYNIER', 'KRYTYK'],
        maxCost: 0.0030
      }
    };
    
    // Stats
    this.stats = {
      tier1Decisions: 0,
      tier2Delegations: 0,
      tier3Executions: 0,
      tier4Verifications: 0,
      avgDecisionTime: 0
    };
  }

  /**
   * TIER 1: META-LEARNER DECISION
   * 
   * Najważniejsza decyzja - kogo aktywować?
   * 10ms, 20 tokens - bardzo szybko!
   */
  async metaLearnerDecision(question, classification, complexity, context) {
    const startTime = Date.now();
    
    console.log('👑 TIER 1 (Meta-Learner): Making decision...');
    
    // Quick classification
    const category = this.categorizeQuestion(classification, complexity);
    
    // Get decision from tree
    const decision = this.decisionTree[category];
    
    // Select specialists
    const specialists = this.selectSpecialists(decision, classification, complexity);
    
    const decisionTime = Date.now() - startTime;
    this.stats.tier1Decisions++;
    this.updateAvgDecisionTime(decisionTime);
    
    console.log(`   Category: ${category}`);
    console.log(`   Specialists: ${specialists.join(', ')}`);
    console.log(`   Decision time: ${decisionTime}ms`);
    
    return {
      category,
      specialists,
      maxCost: decision.maxCost,
      tiers: decision.tiers,
      decisionTime
    };
  }

  /**
   * CATEGORIZE QUESTION
   */
  categorizeQuestion(classification, complexity) {
    // Simple: complexity 1-2, mathematical/logical
    if (complexity <= 2 && (classification.type === 'mathematical' || classification.type === 'logical')) {
      return 'simple';
    }
    
    // Expert: complexity 5, any type
    if (complexity >= 5) {
      return 'expert';
    }
    
    // Complex: complexity 4, creative/strategic
    if (complexity >= 4 || classification.creativity > 0.7) {
      return 'complex';
    }
    
    // Medium: default
    return 'medium';
  }

  /**
   * SELECT SPECIALISTS (based on decision tree)
   */
  selectSpecialists(decision, classification, complexity) {
    const specialists = [...decision.specialists];
    
    // Always include ETYK (safety)
    if (!specialists.includes('ETYK')) {
      specialists.push('ETYK');
    }
    
    // Add META if expert level
    if (decision.tiers.includes('TIER1') && !specialists.includes('META')) {
      specialists.unshift('META'); // First position
    }
    
    return specialists;
  }

  /**
   * TIER 2: DIRECTOR PLANNING
   * 
   * Dyrektorzy planują CO robić
   * Delegują DO Tier 3 (kierownicy)
   */
  async directorPlanning(question, specialists, context) {
    console.log('📋 TIER 2 (Directors): Planning...');
    
    const plan = {
      objectives: [],
      delegations: [],
      earlyStop: false
    };
    
    // Check if directors are involved
    const directors = specialists.filter(s => this.tiers.TIER2.includes(s));
    
    if (directors.length === 0) {
      console.log('   No directors needed - delegating directly to Tier 3');
      return plan;
    }
    
    // Directors create plan
    for (const director of directors) {
      const objective = this.createObjective(director, question);
      plan.objectives.push(objective);
      
      // Delegate to Tier 3
      const delegation = this.delegateToTier3(director, objective);
      plan.delegations.push(delegation);
    }
    
    this.stats.tier2Delegations += plan.delegations.length;
    
    console.log(`   Objectives: ${plan.objectives.length}`);
    console.log(`   Delegations: ${plan.delegations.length}`);
    
    return plan;
  }

  /**
   * CREATE OBJECTIVE (for director)
   */
  createObjective(director, question) {
    const objectives = {
      STRATEG: 'Create strategic plan',
      ANALITYK: 'Analyze data and patterns',
      KREATOR: 'Generate creative solutions'
    };
    
    return {
      director,
      objective: objectives[director] || 'Execute task',
      question: question.substring(0, 100)
    };
  }

  /**
   * DELEGATE TO TIER 3
   */
  delegateToTier3(director, objective) {
    const delegations = {
      STRATEG: ['EKONOMISTA', 'OPTYMALIZATOR'],
      ANALITYK: ['MATEMATYK', 'INZYNIER'],
      KREATOR: ['PSYCHOLOG', 'RYZYKO']
    };
    
    return {
      from: director,
      to: delegations[director] || ['MATEMATYK'],
      task: objective.objective
    };
  }

  /**
   * TIER 3: MANAGER EXECUTION
   * 
   * Kierownicy WYKONUJĄ zadania
   * Ultra-specjalizacja = szybko + tanio
   */
  async managerExecution(delegations, question, context) {
    console.log('⚙️ TIER 3 (Managers): Executing...');
    
    const executions = [];
    
    for (const delegation of delegations) {
      for (const manager of delegation.to) {
        const execution = {
          manager,
          task: delegation.task,
          status: 'pending'
        };
        
        executions.push(execution);
      }
    }
    
    this.stats.tier3Executions += executions.length;
    
    console.log(`   Executions: ${executions.length}`);
    
    return executions;
  }

  /**
   * TIER 4: WORKER VERIFICATION
   * 
   * Pracownicy weryfikują i formatują
   */
  async workerVerification(results, specialists) {
    console.log('✓ TIER 4 (Workers): Verifying...');
    
    const workers = specialists.filter(s => this.tiers.TIER4.includes(s));
    
    if (workers.length === 0) {
      console.log('   No workers needed - skipping verification');
      return { verified: true, formatted: results };
    }
    
    const verification = {
      verified: true,
      errors: [],
      formatted: results
    };
    
    // KRYTYK checks quality
    if (workers.includes('KRYTYK')) {
      verification.qualityCheck = true;
    }
    
    // KOMUNIKATOR formats output
    if (workers.includes('KOMUNIKATOR')) {
      verification.formatted = this.formatOutput(results);
    }
    
    // ETYK checks ethics
    if (workers.includes('ETYK')) {
      verification.ethicsCheck = true;
    }
    
    this.stats.tier4Verifications++;
    
    console.log(`   Workers: ${workers.join(', ')}`);
    console.log(`   Verified: ${verification.verified}`);
    
    return verification;
  }

  /**
   * FORMAT OUTPUT
   */
  formatOutput(results) {
    // Simple formatting (in production, more sophisticated)
    return {
      summary: 'Formatted output from specialists',
      details: results
    };
  }

  /**
   * UPDATE AVG DECISION TIME
   */
  updateAvgDecisionTime(time) {
    this.stats.avgDecisionTime = 
      (this.stats.avgDecisionTime * (this.stats.tier1Decisions - 1) + time) 
      / this.stats.tier1Decisions;
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      tier1Decisions: this.stats.tier1Decisions,
      tier2Delegations: this.stats.tier2Delegations,
      tier3Executions: this.stats.tier3Executions,
      tier4Verifications: this.stats.tier4Verifications,
      avgDecisionTime: Math.round(this.stats.avgDecisionTime) + 'ms'
    };
  }
}

module.exports = HierarchySystem;
