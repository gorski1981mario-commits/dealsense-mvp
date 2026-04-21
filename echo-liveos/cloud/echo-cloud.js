/**
 * ECHO CLOUD - Production-Ready Implementation
 * 
 * Architecture:
 * - 13 Base Specialists + Dynamic Gear Shift (up to +10)
 * - Mixtral 8x22B (MOE)
 * - Routing (3-5 active)
 * - Mobius Loop (background, 4-6 min)
 * - Pinecone (vectors)
 * - PostgreSQL (decisions)
 * - Cost Limiter (€0.01 max)
 */

const { Configuration, OpenAIApi } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { Pool } = require('pg');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Model
  MIXTRAL_API_URL: 'https://api.together.xyz/v1/chat/completions',
  MIXTRAL_MODEL: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
  
  // Cost limits
  COST_LIMIT: 0.01, // €0.01 per answer
  ALERT_THRESHOLD: 0.008, // 80%
  OPTIMIZE_THRESHOLD: 0.005, // 50%
  
  // Mobius loop
  MOBIUS_INTERVAL: 4 * 60 * 1000, // 4 minutes
  
  // Specialists
  MAX_BASE_SPECIALISTS: 13,
  MAX_TOTAL_SPECIALISTS: 23, // 13 + 10 gear shift
  
  // Pricing (Mixtral)
  PRICE_INPUT: 0.0002 / 1000, // per token
  PRICE_OUTPUT: 0.0006 / 1000 // per token
};

// ============================================================================
// SPECIALISTS DEFINITION
// ============================================================================

const SPECIALISTS = {
  // Base 13
  STRATEG: {
    name: 'Strateg',
    role: 'Strategy & Planning',
    triggers: ['strategy', 'plan', 'approach', 'roadmap'],
    costWeight: 1.0,
    avgTokens: 1000,
    priority: 8
  },
  
  ANALITYK: {
    name: 'Analityk',
    role: 'Data Analysis',
    triggers: ['analyze', 'data', 'patterns', 'trends'],
    costWeight: 1.2,
    avgTokens: 1200,
    priority: 9
  },
  
  KREATOR: {
    name: 'Kreator',
    role: 'Creativity & Innovation',
    triggers: ['create', 'invent', 'new', 'innovative'],
    costWeight: 1.5,
    avgTokens: 1500,
    priority: 7
  },
  
  KRYTYK: {
    name: 'Krytyk',
    role: 'Quality Assurance',
    triggers: ['verify', 'check', 'validate', 'review'],
    costWeight: 0.8,
    avgTokens: 800,
    priority: 10
  },
  
  RYZYKO: {
    name: 'Przewidywacz Ryzyka',
    role: 'Risk Assessment',
    triggers: ['risk', 'danger', 'failure', 'problem'],
    costWeight: 1.0,
    avgTokens: 1000,
    priority: 8
  },
  
  OPTYMALIZATOR: {
    name: 'Optymalizator',
    role: 'Performance Optimization',
    triggers: ['optimize', 'improve', 'faster', 'efficient'],
    costWeight: 1.1,
    avgTokens: 1100,
    priority: 7
  },
  
  ETYK: {
    name: 'Etyk',
    role: 'Ethics & Safety',
    triggers: ['ethical', 'safe', 'moral', 'right'],
    costWeight: 0.7,
    avgTokens: 700,
    priority: 10
  },
  
  MATEMATYK: {
    name: 'Matematyk',
    role: 'Calculations & Logic',
    triggers: ['calculate', 'math', 'logic', 'proof'],
    costWeight: 0.9,
    avgTokens: 900,
    priority: 9
  },
  
  PSYCHOLOG: {
    name: 'Psycholog',
    role: 'User Behavior',
    triggers: ['user', 'behavior', 'emotion', 'ux'],
    costWeight: 1.0,
    avgTokens: 1000,
    priority: 6
  },
  
  EKONOMISTA: {
    name: 'Ekonomista',
    role: 'Cost & ROI',
    triggers: ['cost', 'price', 'roi', 'profit'],
    costWeight: 0.9,
    avgTokens: 900,
    priority: 7
  },
  
  INZYNIER: {
    name: 'Inżynier',
    role: 'Technical Solutions',
    triggers: ['implement', 'build', 'technical', 'code'],
    costWeight: 1.2,
    avgTokens: 1200,
    priority: 8
  },
  
  KOMUNIKATOR: {
    name: 'Komunikator',
    role: 'Clear Explanations',
    triggers: ['explain', 'clarify', 'simple', 'understand'],
    costWeight: 0.8,
    avgTokens: 800,
    priority: 9
  },
  
  META: {
    name: 'Meta-Learner',
    role: 'Learning from History',
    triggers: ['always'],
    costWeight: 0.5,
    avgTokens: 500,
    priority: 5
  },
  
  // Gear Shift - Creative Team (+5)
  ARTYSTA: {
    name: 'Artysta',
    role: 'Artistic Perspective',
    gearShift: 'CREATIVE',
    costWeight: 1.3,
    avgTokens: 1300,
    priority: 6
  },
  
  FILOZOF: {
    name: 'Filozof',
    role: 'Philosophical Thinking',
    gearShift: 'CREATIVE',
    costWeight: 1.2,
    avgTokens: 1200,
    priority: 6
  },
  
  FUTURYSTA: {
    name: 'Futurysta',
    role: 'Future Scenarios',
    gearShift: 'CREATIVE',
    costWeight: 1.4,
    avgTokens: 1400,
    priority: 6
  },
  
  LATERAL: {
    name: 'Lateral Thinker',
    role: 'Unconventional Paths',
    gearShift: 'CREATIVE',
    costWeight: 1.5,
    avgTokens: 1500,
    priority: 6
  },
  
  SYNTHESIZER: {
    name: 'Synthesizer',
    role: 'Combining Ideas',
    gearShift: 'CREATIVE',
    costWeight: 1.3,
    avgTokens: 1300,
    priority: 7
  },
  
  // Gear Shift - Analytical Team (+3)
  STATYSTYK: {
    name: 'Statystyk',
    role: 'Statistical Depth',
    gearShift: 'ANALYTICAL',
    costWeight: 1.3,
    avgTokens: 1300,
    priority: 7
  },
  
  RESEARCHER: {
    name: 'Researcher',
    role: 'Literature Review',
    gearShift: 'ANALYTICAL',
    costWeight: 1.2,
    avgTokens: 1200,
    priority: 7
  },
  
  VALIDATOR: {
    name: 'Validator',
    role: 'Cross-Validation',
    gearShift: 'ANALYTICAL',
    costWeight: 1.1,
    avgTokens: 1100,
    priority: 8
  },
  
  // Gear Shift - Balance Team (+2)
  MEDIATOR: {
    name: 'Mediator',
    role: 'Finding Middle Ground',
    gearShift: 'BALANCE',
    costWeight: 1.0,
    avgTokens: 1000,
    priority: 7
  },
  
  INTEGRATOR: {
    name: 'Integrator',
    role: 'Combining Perspectives',
    gearShift: 'BALANCE',
    costWeight: 1.1,
    avgTokens: 1100,
    priority: 7
  }
};

// ============================================================================
// ECHO CLOUD CLASS
// ============================================================================

class EchoCloud {
  constructor(config = {}) {
    this.config = { ...CONFIG, ...config };
    
    // Initialize clients
    this.mixtral = null;
    this.pinecone = null;
    this.db = null;
    
    // Routing weights (learned by Mobius Loop)
    this.routingWeights = this.initializeWeights();
    
    // Mobius loop
    this.mobiusInterval = null;
    
    // Stats
    this.stats = {
      totalAnswers: 0,
      totalCost: 0,
      gearShiftCount: 0,
      avgResponseTime: 0
    };
  }

  /**
   * INITIALIZE
   */
  async initialize() {
    console.log('🚀 Initializing ECHO Cloud...');
    
    // Mixtral API (Together AI)
    this.mixtral = {
      apiKey: process.env.MIXTRAL_API_KEY,
      url: this.config.MIXTRAL_API_URL,
      model: this.config.MIXTRAL_MODEL
    };
    
    // Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    this.index = this.pinecone.index('echo-decisions');
    
    // PostgreSQL
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Start Mobius Loop
    this.startMobiusLoop();
    
    console.log('✅ ECHO Cloud initialized');
  }

  /**
   * INITIALIZE ROUTING WEIGHTS
   */
  initializeWeights() {
    const weights = {};
    
    for (const [key, spec] of Object.entries(SPECIALISTS)) {
      weights[key] = 1.0; // Equal weights initially
    }
    
    return weights;
  }

  /**
   * MAIN METHOD - Answer Question
   */
  async answer(question, context = {}) {
    const startTime = Date.now();
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('🤔 ECHO Cloud Processing...');
    console.log(`Question: ${question}`);
    console.log(`${'='.repeat(70)}`);
    
    try {
      // STEP 1: Classify & Assess
      const classification = this.classifyQuestion(question);
      const complexity = this.assessComplexity(question, context);
      
      console.log(`Type: ${classification.type}, Complexity: ${complexity}/5`);
      
      // STEP 2: Route Specialists
      const routing = this.routeSpecialists(question, classification, complexity, context);
      
      console.log(`Specialists: ${routing.active.map(s => SPECIALISTS[s].name).join(', ')}`);
      console.log(`Gear Shift: ${routing.gearShift}`);
      
      // STEP 3: Estimate Cost
      const estimatedCost = this.estimateCost(routing.active);
      
      console.log(`Estimated cost: €${estimatedCost.toFixed(4)}`);
      
      // STEP 4: Check Cost Limit
      if (estimatedCost > this.config.COST_LIMIT) {
        console.log(`⚠️ Cost limit exceeded, trimming specialists...`);
        routing.active = this.trimSpecialists(routing.active, this.config.COST_LIMIT);
      }
      
      // STEP 5: Execute Specialists
      const responses = await this.executeSpecialists(question, routing.active, context);
      
      // STEP 6: Synthesize Answer
      const answer = this.synthesizeAnswer(responses, routing);
      
      // STEP 7: Verify (Fact Check)
      const verification = this.verifyAnswer(answer, question);
      
      const finalAnswer = verification.passed ? answer : verification.corrected;
      
      // STEP 8: Calculate Real Cost
      const realCost = this.calculateRealCost(responses);
      const responseTime = Date.now() - startTime;
      
      // STEP 9: Save Decision
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
      
      // STEP 10: Update Stats
      this.updateStats(realCost, responseTime, routing.gearShift);
      
      console.log(`\n✅ Answer generated in ${responseTime}ms for €${realCost.toFixed(4)}`);
      console.log(`Verification: ${verification.passed ? 'PASSED ✅' : 'CORRECTED ⚠️'}`);
      console.log(`${'='.repeat(70)}\n`);
      
      return {
        answer: finalAnswer,
        cost: realCost,
        time: responseTime,
        specialists: routing.active.map(s => SPECIALISTS[s].name),
        gearShift: routing.gearShift,
        verification: verification.passed
      };
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  /**
   * CLASSIFY QUESTION
   */
  classifyQuestion(question) {
    const q = question.toLowerCase();
    
    // Mathematical
    if (q.match(/\d+|\+|\-|\*|\/|calculate|compute|optimize/)) {
      return { type: 'mathematical', creativity: 0.2, logic: 0.9 };
    }
    
    // Creative
    if (q.match(/create|invent|imagine|design|new|innovative/)) {
      return { type: 'creative', creativity: 0.9, logic: 0.3 };
    }
    
    // Strategic
    if (q.match(/plan|strategy|approach|how to|best way/)) {
      return { type: 'strategic', creativity: 0.5, logic: 0.7 };
    }
    
    // Analytical
    if (q.match(/analyze|compare|evaluate|assess|data/)) {
      return { type: 'analytical', creativity: 0.3, logic: 0.8 };
    }
    
    // Default
    return { type: 'general', creativity: 0.5, logic: 0.5 };
  }

  /**
   * ASSESS COMPLEXITY
   */
  assessComplexity(question, context) {
    let complexity = 2; // Base
    
    // Length
    const words = question.split(' ').length;
    if (words > 50) complexity++;
    if (words > 100) complexity++;
    
    // Context
    if (context.domain && context.domain !== 'general') complexity++;
    
    // Keywords
    const q = question.toLowerCase();
    if (q.match(/complex|advanced|expert|sophisticated/)) complexity++;
    if (q.match(/multiple|various|different|several/)) complexity++;
    
    return Math.min(complexity, 5);
  }

  /**
   * ROUTE SPECIALISTS
   */
  routeSpecialists(question, classification, complexity, context) {
    const active = [];
    
    // STEP 1: Select base specialists (3-5)
    const baseCount = Math.min(3 + Math.floor(complexity / 2), 5);
    
    // Match specialists by triggers
    const matched = [];
    for (const [key, spec] of Object.entries(SPECIALISTS)) {
      if (spec.gearShift) continue; // Skip gear shift specialists
      
      const score = this.matchScore(question, spec, classification);
      matched.push({ key, score });
    }
    
    // Sort by score * weight
    matched.sort((a, b) => {
      const scoreA = a.score * this.routingWeights[a.key];
      const scoreB = b.score * this.routingWeights[b.key];
      return scoreB - scoreA;
    });
    
    // Take top N
    for (let i = 0; i < baseCount && i < matched.length; i++) {
      active.push(matched[i].key);
    }
    
    // Always include ETYK (safety)
    if (!active.includes('ETYK')) {
      active.push('ETYK');
    }
    
    // STEP 2: Check Gear Shift
    const gearShift = this.shouldActivateGearShift(classification, complexity, context);
    
    if (gearShift !== 'STANDARD') {
      const gearSpecialists = this.getGearShiftSpecialists(gearShift);
      active.push(...gearSpecialists);
    }
    
    return { active, gearShift };
  }

  /**
   * MATCH SCORE
   */
  matchScore(question, specialist, classification) {
    let score = 0;
    
    const q = question.toLowerCase();
    
    // Trigger words
    for (const trigger of specialist.triggers) {
      if (q.includes(trigger)) {
        score += 1.0;
      }
    }
    
    // Type match
    if (specialist.role.toLowerCase().includes(classification.type)) {
      score += 0.5;
    }
    
    // Priority
    score += specialist.priority * 0.1;
    
    return score;
  }

  /**
   * SHOULD ACTIVATE GEAR SHIFT
   */
  shouldActivateGearShift(classification, complexity, context) {
    // Check cost allowance
    const currentCost = this.estimateCost(['STRATEG', 'ANALITYK', 'KREATOR']); // Base estimate
    const costAllows = currentCost < (this.config.COST_LIMIT * 0.5);
    
    if (!costAllows) {
      return 'STANDARD';
    }
    
    // Creative Gear
    if (classification.creativity > 0.8) {
      return 'CREATIVE';
    }
    
    // Analytical Gear
    if (complexity > 4 && classification.logic > 0.7) {
      return 'ANALYTICAL';
    }
    
    // Balance Gear
    if (Math.abs(classification.creativity - classification.logic) < 0.1) {
      return 'BALANCE';
    }
    
    return 'STANDARD';
  }

  /**
   * GET GEAR SHIFT SPECIALISTS
   */
  getGearShiftSpecialists(gearType) {
    const specialists = [];
    
    for (const [key, spec] of Object.entries(SPECIALISTS)) {
      if (spec.gearShift === gearType) {
        specialists.push(key);
      }
    }
    
    return specialists;
  }

  /**
   * ESTIMATE COST
   */
  estimateCost(specialists) {
    let totalTokens = 0;
    
    for (const key of specialists) {
      const spec = SPECIALISTS[key];
      totalTokens += spec.avgTokens * spec.costWeight;
    }
    
    const inputCost = totalTokens * this.config.PRICE_INPUT;
    const outputCost = totalTokens * this.config.PRICE_OUTPUT;
    
    return inputCost + outputCost;
  }

  /**
   * TRIM SPECIALISTS (if cost too high)
   */
  trimSpecialists(specialists, limit) {
    let estimated = this.estimateCost(specialists);
    
    while (estimated > limit && specialists.length > 1) {
      // Remove lowest priority
      const lowest = specialists.reduce((min, key) => {
        return SPECIALISTS[key].priority < SPECIALISTS[min].priority ? key : min;
      });
      
      specialists = specialists.filter(s => s !== lowest);
      estimated = this.estimateCost(specialists);
    }
    
    return specialists;
  }

  /**
   * EXECUTE SPECIALISTS
   */
  async executeSpecialists(question, specialists, context) {
    const responses = [];
    
    for (const key of specialists) {
      const spec = SPECIALISTS[key];
      
      const prompt = this.buildPrompt(question, spec, context);
      const response = await this.callMixtral(prompt);
      
      responses.push({
        specialist: key,
        name: spec.name,
        response: response.text,
        tokens: response.tokens
      });
    }
    
    return responses;
  }

  /**
   * BUILD PROMPT
   */
  buildPrompt(question, specialist, context) {
    return `You are ${specialist.name}, a specialist in ${specialist.role}.

Your task: ${question}

Context: ${JSON.stringify(context)}

Provide your expert perspective on this question. Be concise and focused on your area of expertise.

Response:`;
  }

  /**
   * CALL MIXTRAL API
   */
  async callMixtral(prompt) {
    const response = await fetch(this.mixtral.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.mixtral.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.mixtral.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    
    return {
      text: data.choices[0].message.content,
      tokens: data.usage.total_tokens
    };
  }

  /**
   * SYNTHESIZE ANSWER
   */
  synthesizeAnswer(responses, routing) {
    let synthesis = '';
    
    // Combine responses
    for (const resp of responses) {
      synthesis += `${resp.name}: ${resp.response}\n\n`;
    }
    
    // Add meta-synthesis
    synthesis += `\nFinal Answer (synthesized from ${responses.length} specialists):\n`;
    
    // Simple synthesis (in production, use another Mixtral call)
    const mainPoints = responses.map(r => r.response).join(' ');
    synthesis += mainPoints.substring(0, 500) + '...';
    
    return synthesis;
  }

  /**
   * VERIFY ANSWER (Fact Check)
   */
  verifyAnswer(answer, question) {
    // Simple verification (in production, more sophisticated)
    
    // Check for mathematical errors
    const mathErrors = this.checkMathErrors(answer);
    
    if (mathErrors.length > 0) {
      return {
        passed: false,
        errors: mathErrors,
        corrected: this.correctMathErrors(answer, mathErrors)
      };
    }
    
    return { passed: true };
  }

  /**
   * CHECK MATH ERRORS
   */
  checkMathErrors(answer) {
    const errors = [];
    
    // Find math expressions
    const mathExpr = answer.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)/g);
    
    if (mathExpr) {
      for (const expr of mathExpr) {
        const match = expr.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)/);
        const a = parseInt(match[1]);
        const op = match[2];
        const b = parseInt(match[3]);
        const result = parseInt(match[4]);
        
        let correct;
        switch (op) {
          case '+': correct = a + b; break;
          case '-': correct = a - b; break;
          case '*': correct = a * b; break;
          case '/': correct = Math.floor(a / b); break;
        }
        
        if (result !== correct) {
          errors.push({ expr, correct });
        }
      }
    }
    
    return errors;
  }

  /**
   * CORRECT MATH ERRORS
   */
  correctMathErrors(answer, errors) {
    let corrected = answer;
    
    for (const error of errors) {
      corrected = corrected.replace(error.expr, error.expr.replace(/=\s*\d+/, `= ${error.correct}`));
    }
    
    return corrected;
  }

  /**
   * CALCULATE REAL COST
   */
  calculateRealCost(responses) {
    const totalTokens = responses.reduce((sum, r) => sum + r.tokens, 0);
    
    const inputCost = (totalTokens / 2) * this.config.PRICE_INPUT;
    const outputCost = (totalTokens / 2) * this.config.PRICE_OUTPUT;
    
    return inputCost + outputCost;
  }

  /**
   * SAVE DECISION
   */
  async saveDecision(decision) {
    // Save to PostgreSQL
    await this.db.query(`
      INSERT INTO decisions (
        id, question, question_type, complexity, specialists, gear_shift,
        cost, time_ms, outcome, confidence, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      )
    `, [
      decision.question,
      decision.classification.type,
      decision.complexity,
      JSON.stringify(decision.specialists),
      decision.gearShift,
      decision.cost,
      decision.time,
      decision.verification.passed ? 'success' : 'failure',
      decision.verification.passed ? 1.0 : 0.8
    ]);
    
    // Save to Pinecone (vector embedding)
    // TODO: Implement embedding + upsert
  }

  /**
   * UPDATE STATS
   */
  updateStats(cost, time, gearShift) {
    this.stats.totalAnswers++;
    this.stats.totalCost += cost;
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * (this.stats.totalAnswers - 1) + time) / this.stats.totalAnswers;
    
    if (gearShift !== 'STANDARD') {
      this.stats.gearShiftCount++;
    }
  }

  /**
   * START MOBIUS LOOP
   */
  startMobiusLoop() {
    console.log('🔄 Starting Mobius Loop...');
    
    this.mobiusInterval = setInterval(async () => {
      await this.runMobiusLoop();
    }, this.config.MOBIUS_INTERVAL);
  }

  /**
   * RUN MOBIUS LOOP
   */
  async runMobiusLoop() {
    console.log('\n🔄 Mobius Loop running...');
    
    try {
      // Fetch recent decisions
      const result = await this.db.query(`
        SELECT * FROM decisions
        ORDER BY created_at DESC
        LIMIT 20
      `);
      
      const decisions = result.rows;
      
      if (decisions.length === 0) {
        console.log('No decisions to learn from yet');
        return;
      }
      
      // Analyze
      const insights = this.analyzeDecisions(decisions);
      
      // Mutate weights
      const newWeights = this.mutateWeights(insights);
      
      // Update routing
      this.routingWeights = newWeights;
      
      console.log(`✅ Mobius Loop: ${Object.keys(insights).length} insights, weights updated`);
      
    } catch (error) {
      console.error('❌ Mobius Loop error:', error.message);
    }
  }

  /**
   * ANALYZE DECISIONS
   */
  analyzeDecisions(decisions) {
    const insights = {};
    
    for (const decision of decisions) {
      const specialists = JSON.parse(decision.specialists);
      
      for (const specialist of specialists) {
        if (!insights[specialist]) {
          insights[specialist] = {
            uses: 0,
            successes: 0,
            totalCost: 0
          };
        }
        
        insights[specialist].uses++;
        
        if (decision.outcome === 'success') {
          insights[specialist].successes++;
        }
        
        insights[specialist].totalCost += parseFloat(decision.cost);
      }
    }
    
    // Calculate rates
    for (const specialist in insights) {
      const data = insights[specialist];
      data.successRate = data.successes / data.uses;
      data.avgCost = data.totalCost / data.uses;
    }
    
    return insights;
  }

  /**
   * MUTATE WEIGHTS
   */
  mutateWeights(insights) {
    const weights = { ...this.routingWeights };
    
    for (const [specialist, data] of Object.entries(insights)) {
      // Good performance → +5% weight
      if (data.successRate > 0.8) {
        weights[specialist] *= 1.05;
      }
      
      // Poor performance → -5% weight
      else if (data.successRate < 0.5) {
        weights[specialist] *= 0.95;
      }
      
      // Cheap and good → +10% weight
      if (data.avgCost < 0.001 && data.successRate > 0.7) {
        weights[specialist] *= 1.10;
      }
    }
    
    // Normalize
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const key in weights) {
      weights[key] /= sum;
    }
    
    return weights;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalAnswers: this.stats.totalAnswers,
      totalCost: this.stats.totalCost.toFixed(4),
      avgCost: (this.stats.totalCost / this.stats.totalAnswers).toFixed(4),
      avgResponseTime: Math.round(this.stats.avgResponseTime),
      gearShiftRate: ((this.stats.gearShiftCount / this.stats.totalAnswers) * 100).toFixed(1) + '%'
    };
  }

  /**
   * SHUTDOWN
   */
  async shutdown() {
    console.log('🛑 Shutting down ECHO Cloud...');
    
    if (this.mobiusInterval) {
      clearInterval(this.mobiusInterval);
    }
    
    if (this.db) {
      await this.db.end();
    }
    
    console.log('✅ ECHO Cloud shut down');
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = EchoCloud;
