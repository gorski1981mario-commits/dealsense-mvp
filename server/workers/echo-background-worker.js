/**
 * ECHO BACKGROUND WORKER - RECURSIVE LOOP ARCHITECTURE
 * Inspiracja: insight użytkownika o nieskończonej pętli tła
 * Backend nie czeka - system działa ciągle!
 */

const { enqueue: kwantEnqueue } = require('../kwant/queue');
const { getDealScores, rotateDeals } = require('../scoring/dealScoreV2');
const { generateQueries } = require('../scoring/queryGenerator');
const cacheStrategy = require('../lib/cacheStrategy');

class EchoBackgroundWorker {
  constructor() {
    this.isRunning = false;
    this.userQueue = [];
    this.processingInterval = 5000; // 5 sekund
    this.maxConcurrentUsers = 50;
    this.cachePrefix = 'echo:background:';
    this.systemLoad = 0;
  }

  async start() {
    if (this.isRunning) {
      console.log('[WORKER] Already running...');
      return;
    }

    console.log('🚀 [WORKER] Starting ECHO Background Recursive Loop...');
    this.isRunning = true;
    
    // Start recursive loop
    await this.recursiveLoop();
  }

  async stop() {
    console.log('⏹️ [WORKER] Stopping background worker...');
    this.isRunning = false;
  }

  async recursiveLoop() {
    while (this.isRunning) {
      try {
        const startTime = Date.now();
        
        // 1. Pobierz aktywnych użytkowników
        const activeUsers = await this.getActiveUsers();
        
        // 2. Przetwarzaj batch użytkowników
        await this.processUserBatch(activeUsers);
        
        // 3. Aktualizuj cache z wynikami
        await this.updateCache();
        
        // 4. Monitoruj obciążenie systemu
        await this.monitorSystemLoad();
        
        // 5. Dynamiczna kontrola prędkości
        const processingTime = Date.now() - startTime;
        const nextInterval = this.calculateNextInterval(processingTime);
        
        console.log(`[WORKER] Batch processed in ${processingTime}ms, next interval: ${nextInterval}ms`);
        
        // Rekurencyjne opóźnienie
        await this.sleep(nextInterval);
        
      } catch (error) {
        console.error('[WORKER] Error in recursive loop:', error);
        await this.sleep(10000); // 10 sekund przy błędzie
      }
    }
  }

  async getActiveUsers() {
    // Pobierz użytkowników z aktywnych sesji
    try {
      // Z Redis/cache - aktywni w ostatnich 5 minut
      const activeUsers = await this.getActiveUsersFromCache();
      
      // Limituj concurrent processing
      return activeUsers.slice(0, this.maxConcurrentUsers);
    } catch (error) {
      console.error('[WORKER] Error getting active users:', error);
      return [];
    }
  }

  async processUserBatch(users) {
    const batchPromises = users.map(user => this.processUser(user));
    
    // Przetwarzaj równolegle z limitem
    const results = await this.batchProcess(batchPromises, 10);
    
    // Zapisz wyniki do queue
    for (const result of results) {
      if (result) {
        await this.saveUserResult(result);
      }
    }
  }

  async processUser(user) {
    try {
      const userId = user.id;
      const userProfile = await this.getUserProfile(userId);
      
      // 1. Generuj spersonalizowane query
      const queries = await this.generatePersonalizedQueries(userProfile);
      
      // 2. Rotacja WAG dla użytkownika
      const rotatedDeals = await this.performWAGRotation(userId, queries);
      
      // 3. Kwantowa optymalizacja
      const quantumOptimized = await this.quantumOptimize(rotatedDeals, userProfile);
      
      // 4. Predykcja zachowań
      const predictions = await this.generatePredictions(userProfile, quantumOptimized);
      
      return {
        userId,
        timestamp: Date.now(),
        queries: queries.length,
        deals: rotatedDeals.length,
        optimized: quantumOptimized.length,
        predictions,
        processingTime: Date.now()
      };
      
    } catch (error) {
      console.error(`[WORKER] Error processing user ${user.id}:`, error);
      return null;
    }
  }

  async generatePersonalizedQueries(userProfile) {
    // Na podstawie historii i preferencji
    const baseQueries = [
      userProfile.lastSearch,
      userProfile.interests,
      userProfile.budgetRange
    ].filter(Boolean);
    
    // Generuj warianty z AI
    const aiQueries = await generateQueries(baseQueries, {
      userId: userProfile.id,
      preferences: userProfile.preferences,
      history: userProfile.searchHistory
    });
    
    return aiQueries.slice(0, 20); // Limit 20 query per user
  }

  async performWAGRotation(userId, queries) {
    // Rotacja WAG - Weighted Average Graph
    const userContext = await this.getUserContext(userId);
    
    const rotatedDeals = [];
    
    for (const query of queries) {
      const deals = await this.getDealsForQuery(query);
      const rotated = await rotateDeals(deals, {
        userId,
        context: userContext,
        query
      });
      
      rotatedDeals.push(...rotated);
    }
    
    // Usuń duplikaty i ogranicz
    return this.deduplicateDeals(rotatedDeals).slice(0, 50);
  }

  async quantumOptimize(deals, userProfile) {
    // Kwantowa optymalizacja - znajdź najlepsze dopasowanie
    const optimized = await this.applyQuantumScoring(deals, userProfile);
    
    // Sortuj po quantum score
    return optimized
      .sort((a, b) => b.quantumScore - a.quantumScore)
      .slice(0, 20); // Top 20 dla użytkownika
  }

  async generatePredictions(userProfile, optimizedDeals) {
    // Predykcja: co użytkownik zrobi next?
    const predictions = {
      likelyToBuy: [],
      mightSave: [],
      willIgnore: [],
      nextSearch: null,
      bestTimeToContact: null
    };
    
    for (const deal of optimizedDeals) {
      const probability = await this.calculateConversionProbability(userProfile, deal);
      
      if (probability > 0.8) {
        predictions.likelyToBuy.push(deal);
      } else if (probability > 0.5) {
        predictions.mightSave.push(deal);
      } else {
        predictions.willIgnore.push(deal);
      }
    }
    
    // Predykcja next search
    predictions.nextSearch = await this.predictNextSearch(userProfile);
    
    return predictions;
  }

  async updateCache() {
    // Zapisz wyniki do cache dla natychmiastowego dostępu
    for (const result of this.userQueue) {
      const cacheKey = `${this.cachePrefix}${result.userId}`;
      
      await cacheStrategy.set(cacheKey, {
        ...result,
        cachedAt: Date.now(),
        ttl: 300000 // 5 minut
      });
    }
    
    // Wyczyść queue
    this.userQueue = [];
    
    console.log(`[WORKER] Cache updated with ${this.userQueue.length} user results`);
  }

  async monitorSystemLoad() {
    // Monitoruj obciążenie i dynamicznie dostosowuj
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.systemLoad = {
      memory: memoryUsage.heapUsed / memoryUsage.heapTotal,
      cpu: cpuUsage.user / 1000000, // Convert to seconds
      queueSize: this.userQueue.length,
      activeUsers: await this.getActiveUsersCount()
    };
    
    // Dynamiczna kontrola prędkości
    if (this.systemLoad.memory > 0.8) {
      // Zmniejsz concurrent users
      this.maxConcurrentUsers = Math.max(10, this.maxConcurrentUsers - 5);
      console.log('[WORKER] Reducing concurrent users due to memory pressure');
    } else if (this.systemLoad.memory < 0.5) {
      // Zwiększ concurrent users
      this.maxConcurrentUsers = Math.min(100, this.maxConcurrentUsers + 5);
    }
  }

  calculateNextInterval(processingTime) {
    // Dynamiczny interwał na podstawie obciążenia
    const baseInterval = this.processingInterval;
    
    if (processingTime > 10000) { // 10 seconds
      return baseInterval * 2; // Spowolnij
    } else if (processingTime < 2000) { // 2 seconds
      return Math.max(1000, baseInterval / 2); // Przyspiesz
    }
    
    return baseInterval;
  }

  // Helper functions
  async batchProcess(promises, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch);
      
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null));
    }
    
    return results;
  }

  deduplicateDeals(deals) {
    const seen = new Set();
    return deals.filter(deal => {
      const key = `${deal.id}-${deal.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API endpointy do sprawdzania statusu
  getStatus() {
    return {
      isRunning: this.isRunning,
      systemLoad: this.systemLoad,
      maxConcurrentUsers: this.maxConcurrentUsers,
      processingInterval: this.processingInterval,
      queueSize: this.userQueue.length
    };
  }

  async getUserCachedResults(userId) {
    const cacheKey = `${this.cachePrefix}${userId}`;
    return await cacheStrategy.get(cacheKey);
  }
}

// Global instance
const backgroundWorker = new EchoBackgroundWorker();

module.exports = backgroundWorker;
