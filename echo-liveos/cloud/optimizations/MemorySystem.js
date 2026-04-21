/**
 * MEMORY SYSTEM - 2x Intelligence Boost
 * 
 * Long-term memory for ECHO
 * Remembers across sessions, learns from history
 * 
 * TYPES:
 * 1. Episodic Memory (specific events)
 * 2. Semantic Memory (concepts, patterns)
 * 3. Working Memory (current context)
 * 4. Procedural Memory (how to do things)
 */

class MemorySystem {
  constructor(db, vectorDB) {
    this.db = db; // PostgreSQL
    this.vectorDB = vectorDB; // Pinecone
    
    // Working memory (current session)
    this.workingMemory = {
      context: {},
      recentQuestions: [],
      userPreferences: {}
    };
    
    this.stats = {
      episodicMemories: 0,
      semanticMemories: 0,
      memoryHits: 0,
      learningEvents: 0
    };
  }

  /**
   * REMEMBER (store new memory)
   */
  async remember(memory) {
    const { type, content, context, importance } = memory;
    
    // Store in appropriate memory type
    switch (type) {
      case 'episodic':
        await this.storeEpisodicMemory(content, context, importance);
        break;
      case 'semantic':
        await this.storeSemanticMemory(content, context, importance);
        break;
      case 'procedural':
        await this.storeProceduralMemory(content, context, importance);
        break;
    }
    
    console.log(`💾 Remembered: ${type} memory`);
  }

  /**
   * EPISODIC MEMORY (specific events)
   * "Last time user asked X, we did Y and it worked"
   */
  async storeEpisodicMemory(content, context, importance) {
    await this.db.query(`
      INSERT INTO episodic_memory (
        content, context, importance, created_at
      ) VALUES ($1, $2, $3, NOW())
    `, [JSON.stringify(content), JSON.stringify(context), importance]);
    
    this.stats.episodicMemories++;
  }

  /**
   * RECALL EPISODIC (find similar past events)
   */
  async recallEpisodic(query, limit = 5) {
    // Search in vector DB for similar events
    const results = await this.vectorDB.query({
      vector: await this.embed(query),
      topK: limit,
      filter: { type: 'episodic' }
    });
    
    if (results.matches.length > 0) {
      this.stats.memoryHits++;
      console.log(`🧠 Recalled ${results.matches.length} episodic memories`);
    }
    
    return results.matches;
  }

  /**
   * SEMANTIC MEMORY (concepts, patterns)
   * "User prefers quality over price"
   */
  async storeSemanticMemory(content, context, importance) {
    await this.db.query(`
      INSERT INTO semantic_memory (
        concept, pattern, context, importance, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [content.concept, content.pattern, JSON.stringify(context), importance]);
    
    this.stats.semanticMemories++;
  }

  /**
   * RECALL SEMANTIC (find relevant concepts)
   */
  async recallSemantic(concept) {
    const result = await this.db.query(`
      SELECT * FROM semantic_memory
      WHERE concept ILIKE $1
      ORDER BY importance DESC, created_at DESC
      LIMIT 10
    `, [`%${concept}%`]);
    
    if (result.rows.length > 0) {
      this.stats.memoryHits++;
      console.log(`🧠 Recalled ${result.rows.length} semantic memories`);
    }
    
    return result.rows;
  }

  /**
   * PROCEDURAL MEMORY (how to do things)
   * "When solving X type problem, use Y approach"
   */
  async storeProceduralMemory(content, context, importance) {
    await this.db.query(`
      INSERT INTO procedural_memory (
        problem_type, approach, success_rate, context, importance, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      content.problemType,
      JSON.stringify(content.approach),
      content.successRate || 0.5,
      JSON.stringify(context),
      importance
    ]);
  }

  /**
   * RECALL PROCEDURAL (find best approach)
   */
  async recallProcedural(problemType) {
    const result = await this.db.query(`
      SELECT * FROM procedural_memory
      WHERE problem_type = $1
      ORDER BY success_rate DESC, importance DESC
      LIMIT 5
    `, [problemType]);
    
    if (result.rows.length > 0) {
      this.stats.memoryHits++;
      console.log(`🧠 Recalled ${result.rows.length} procedural memories`);
    }
    
    return result.rows;
  }

  /**
   * WORKING MEMORY (current session context)
   */
  updateWorkingMemory(key, value) {
    this.workingMemory.context[key] = value;
  }

  getWorkingMemory(key) {
    return this.workingMemory.context[key];
  }

  addRecentQuestion(question, answer) {
    this.workingMemory.recentQuestions.push({ question, answer, timestamp: Date.now() });
    
    // Keep only last 10
    if (this.workingMemory.recentQuestions.length > 10) {
      this.workingMemory.recentQuestions.shift();
    }
  }

  /**
   * LEARN FROM EXPERIENCE
   */
  async learnFromExperience(experience) {
    const { question, answer, outcome, specialists, cost, time } = experience;
    
    // Store episodic memory
    await this.remember({
      type: 'episodic',
      content: { question, answer, outcome, specialists, cost, time },
      context: { timestamp: Date.now() },
      importance: outcome === 'success' ? 0.8 : 0.5
    });
    
    // Extract patterns (semantic memory)
    if (outcome === 'success') {
      await this.remember({
        type: 'semantic',
        content: {
          concept: 'successful_pattern',
          pattern: { specialists, cost, time }
        },
        context: { questionType: this.classifyQuestion(question) },
        importance: 0.9
      });
    }
    
    // Update procedural memory
    const problemType = this.classifyQuestion(question);
    await this.remember({
      type: 'procedural',
      content: {
        problemType,
        approach: { specialists },
        successRate: outcome === 'success' ? 1.0 : 0.0
      },
      context: {},
      importance: 0.7
    });
    
    this.stats.learningEvents++;
  }

  /**
   * CONSOLIDATE MEMORIES (merge similar, forget unimportant)
   */
  async consolidateMemories() {
    console.log('🧠 Consolidating memories...');
    
    // Delete low-importance old memories
    await this.db.query(`
      DELETE FROM episodic_memory
      WHERE importance < 0.3
      AND created_at < NOW() - INTERVAL '30 days'
    `);
    
    // Merge similar semantic memories
    // (simplified - in production, use clustering)
    
    console.log('✅ Memory consolidation complete');
  }

  /**
   * HELPER: Classify question
   */
  classifyQuestion(question) {
    const q = question.toLowerCase();
    if (q.match(/calculate|compute|math/)) return 'mathematical';
    if (q.match(/create|invent|design/)) return 'creative';
    if (q.match(/analyze|compare|evaluate/)) return 'analytical';
    if (q.match(/plan|strategy|approach/)) return 'strategic';
    return 'general';
  }

  /**
   * HELPER: Embed text (placeholder)
   */
  async embed(text) {
    // In production, use actual embedding model
    // For now, return dummy vector
    return new Array(1536).fill(0);
  }

  /**
   * GET STATS
   */
  getStats() {
    return {
      episodicMemories: this.stats.episodicMemories,
      semanticMemories: this.stats.semanticMemories,
      memoryHits: this.stats.memoryHits,
      learningEvents: this.stats.learningEvents,
      workingMemorySize: Object.keys(this.workingMemory.context).length
    };
  }
}

module.exports = MemorySystem;
