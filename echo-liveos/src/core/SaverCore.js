/**
 * SAVERCORE - Maksymalnie zoptymalizowany pod koszty i szybkość
 * 
 * ARCHITEKTURA:
 * 1. Router (Llama3-8B/Qwen2-7B) - decyduje intent użytkownika
 * 2. Cache Check - sprawdza PRZED wysłaniem do modelu
 * 3. Specialist Model - ekspert w danej dziedzinie
 * 4. Cache Result - zapisuje odpowiedź
 * 
 * ZERO:
 * - Swarmów
 * - Momentum
 * - Chaos
 * - Fotosyntezy
 * 
 * TYLKO:
 * - Router + Specialist
 * - Cache (mocny nacisk)
 * - Timeout + Fallback
 * - 1 GPU lub CPU
 */

const crypto = require('crypto');

/**
 * CACHE LAYER - Sprawdza PRZED wysłaniem do modelu
 */
class SaverCache {
  constructor(maxSize = 10000, ttl = 3600000) {  // 10k entries, 1h TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;  // Time to live in ms
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generuj cache key z message
   */
  generateKey(message, intent = null) {
    const normalized = message.toLowerCase().trim();
    const keyString = intent ? `${intent}:${normalized}` : normalized;
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  /**
   * Pobierz z cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Sprawdź TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    
    // LRU: move to end
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  /**
   * Zapisz do cache
   */
  set(key, value) {
    const entry = {
      value: value,
      timestamp: Date.now()
    };
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, entry);
    
    // LRU eviction
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }

  /**
   * Clear
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * ROUTER - Mały, szybki model (Llama3-8B/Qwen2-7B)
 * Decyduje co użytkownik chce zrobić
 */
class Router {
  constructor(config = {}) {
    this.modelName = config.modelName || 'llama3-8b';
    this.timeout = config.timeout || 2000;  // 2s timeout
    
    // Intent categories
    this.intents = [
      'products',      // Produkty
      'vacation',      // Wakacje
      'insurance',     // Ubezpieczenia
      'telecom',       // Telekom
      'energy',        // Energia
      'mortgage',      // Hipoteka
      'loan',          // Pożyczka
      'creditcard',    // Karta kredytowa
      'subscriptions', // Subskrypcje
      'general'        // Ogólne pytania
    ];
  }

  /**
   * Detect intent - SZYBKIE keyword matching (fallback)
   */
  detectIntentFast(message) {
    const lower = message.toLowerCase();
    
    // Keywords dla każdego intent
    const keywords = {
      products: ['produkt', 'koop', 'kopen', 'scanner', 'prijs', 'cena', 'price', 'kost', 'wat kost', 'iphone', 'samsung', 'tv', 'dyson', 'sony', 'koptelefoon', 'telefoon', 'laptop', 'tablet', 'stofzuiger', 'vergelijk'],
      vacation: ['vakantie', 'reis', 'hotel', 'vlucht', 'wakacje', 'urlop', 'barcelona', 'spanje', 'griekenland', 'bestemming'],
      insurance: ['verzekering', 'ubezpieczenie', 'polis', 'schade', 'autoverzekering'],
      telecom: ['mobiel', 'abonnement', 'telefon', 'sim', 'data', 'bellen'],
      energy: ['energie', 'stroom', 'gas', 'energia', 'prąd', 'contract'],
      mortgage: ['hypotheek', 'huis', 'woning', 'hipoteka', 'dom'],
      loan: ['lening', 'krediet', 'pożyczka', 'loan'],
      creditcard: ['creditcard', 'karta', 'card'],
      subscriptions: ['abonnement', 'subskrypcja', 'subscription'],
      general: ['werkt', 'hoe werkt', 'strategie', 'help', 'dealsense', 'pakket', 'plus', 'pro', 'finance', 'verschil', 'wat is', 'leg uit', 'uitleg']
    };
    
    // Sprawdź keywords
    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => lower.includes(word))) {
        return {
          intent: intent,
          confidence: 0.8,
          method: 'keyword'
        };
      }
    }
    
    return {
      intent: 'general',
      confidence: 0.5,
      method: 'default'
    };
  }

  /**
   * Route message - decyduje intent
   */
  async route(message) {
    const startTime = Date.now();
    
    try {
      // SZYBKIE keyword matching (zamiast LLM dla prostych przypadków)
      const result = this.detectIntentFast(message);
      
      const processingTime = Date.now() - startTime;
      
      return {
        intent: result.intent,
        confidence: result.confidence,
        method: result.method,
        processingTime: processingTime
      };
      
    } catch (error) {
      console.error('Router error:', error.message);
      
      // Fallback - general intent
      return {
        intent: 'general',
        confidence: 0.3,
        method: 'fallback',
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }
}

/**
 * SPECIALIST - Ekspert w danej dziedzinie
 */
class Specialist {
  constructor(domain, config = {}) {
    this.domain = domain;
    this.modelName = config.modelName || 'llama3-8b';
    this.timeout = config.timeout || 5000;  // 5s timeout
    
    // Domain-specific knowledge
    this.knowledge = this.loadKnowledge(domain);
  }

  /**
   * Load domain knowledge
   */
  loadKnowledge(domain) {
    const knowledge = {
      products: {
        expertise: 'Product comparison, price analysis, scanner usage',
        keywords: ['prijs', 'product', 'scanner', 'barcode', 'vergelijk']
      },
      vacation: {
        expertise: 'Vacation packages, hotels, flights, travel deals',
        keywords: ['vakantie', 'hotel', 'vlucht', 'reis', 'bestemming']
      },
      insurance: {
        expertise: 'Insurance policies, coverage, claims, comparison',
        keywords: ['verzekering', 'polis', 'schade', 'dekking', 'premie']
      },
      telecom: {
        expertise: 'Phone plans, internet, mobile subscriptions',
        keywords: ['telefoon', 'internet', 'mobiel', 'abonnement', 'data']
      },
      energy: {
        expertise: 'Energy contracts, electricity, gas, comparison',
        keywords: ['energie', 'stroom', 'gas', 'contract', 'tarief']
      },
      mortgage: {
        expertise: 'Mortgage rates, home loans, refinancing',
        keywords: ['hypotheek', 'rente', 'huis', 'lening', 'aflossen']
      },
      loan: {
        expertise: 'Personal loans, credit, interest rates',
        keywords: ['lening', 'krediet', 'rente', 'aflossen', 'maandlast']
      },
      creditcard: {
        expertise: 'Credit cards, rewards, interest rates',
        keywords: ['creditcard', 'rente', 'limiet', 'voordelen']
      },
      subscriptions: {
        expertise: 'Subscription management, cancellation, comparison',
        keywords: ['abonnement', 'opzeggen', 'kosten', 'maandelijks']
      },
      general: {
        expertise: 'General DealSense help, app usage, features',
        keywords: ['help', 'hoe', 'wat', 'waarom', 'app']
      }
    };
    
    return knowledge[domain] || knowledge.general;
  }

  /**
   * Search products - REAL DATA from Google Shopping API
   */
  async searchProducts(message) {
    try {
      // Extract product name from message
      const productName = this.extractProductName(message);
      
      if (!productName) {
        return this.generateResponseSimple(message);
      }
      
      console.log(`[Specialist] Searching products: "${productName}"`);
      
      // Call backend API
      const response = await fetch('/api/echo/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'products',
          query: productName
        })
      });
      
      if (!response.ok) {
        throw new Error('API error');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.offers || data.offers.length === 0) {
        return `Ik heb geen aanbiedingen gevonden voor "${productName}". Probeer de barcode te scannen voor betere resultaten.`;
      }
      
      // Format response with real prices
      const topOffers = data.offers.slice(0, 3);
      const prices = topOffers.map(o => `€${o.price.toFixed(2)}`).join(', ');
      const shops = topOffers.map(o => o.seller || o.shop).join(', ');
      
      return `Ik heb ${data.count} aanbiedingen gevonden voor "${productName}"!\n\nTOP 3 prijzen: ${prices}\nWinkels: ${shops}\n\nScan de barcode in de app voor meer details en directe links.`;
      
    } catch (error) {
      console.error('[Specialist] Products search error:', error.message);
      return this.generateResponseSimple(message);
    }
  }
  
  /**
   * Search vacation - REAL DATA from Google Hotels + Flights API
   */
  async searchVacation(message) {
    try {
      // Extract destination from message
      const destination = this.extractDestination(message);
      
      if (!destination) {
        return this.generateResponseSimple(message);
      }
      
      console.log(`[Specialist] Searching vacation: "${destination}"`);
      
      // Call backend API
      const response = await fetch('/api/echo/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'vacation',
          query: destination,
          destination: destination,
          adults: 2
        })
      });
      
      if (!response.ok) {
        throw new Error('API error');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.offers || data.offers.length === 0) {
        return `Ik heb geen vakantieaanbiedingen gevonden voor ${destination}. Gebruik de Vakantie Configurator in de app voor meer opties.`;
      }
      
      // Format response with real prices
      const topOffer = data.offers[0];
      const savings = data.savings ? `€${data.savings.toFixed(0)} besparing` : '';
      
      return `Ik heb vakantieaanbiedingen gevonden voor ${destination}!\n\nBeste deal: €${topOffer.price.toFixed(0)} ${savings ? `(${savings})` : ''}\n\nGebruik de Vakantie Configurator in de app voor volledige details en boeken.`;
      
    } catch (error) {
      console.error('[Specialist] Vacation search error:', error.message);
      return this.generateResponseSimple(message);
    }
  }
  
  /**
   * Extract product name from message
   */
  extractProductName(message) {
    const lower = message.toLowerCase();
    
    // Remove common words
    const stopWords = ['wat', 'kost', 'deze', 'die', 'een', 'de', 'het', 'prijs', 'van'];
    const words = lower.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);
    
    if (words.length === 0) return null;
    
    return words.join(' ');
  }
  
  /**
   * Extract destination from message
   */
  extractDestination(message) {
    const lower = message.toLowerCase();
    
    // Common destinations
    const destinations = [
      'spanje', 'turkije', 'griekenland', 'italië', 'frankrijk', 'portugal',
      'barcelona', 'madrid', 'istanbul', 'athene', 'rome', 'parijs', 'lissabon',
      'antalya', 'alicante', 'malaga', 'kreta', 'rhodos', 'tenerife', 'ibiza'
    ];
    
    for (const dest of destinations) {
      if (lower.includes(dest)) {
        return dest.charAt(0).toUpperCase() + dest.slice(1);
      }
    }
    
    // Extract from "naar X" pattern
    const naarMatch = lower.match(/naar\s+(\w+)/);
    if (naarMatch) {
      return naarMatch[1].charAt(0).toUpperCase() + naarMatch[1].slice(1);
    }
    
    return null;
  }
  
  /**
   * Generate response - PROSTY template-based (fallback)
   */
  generateResponseSimple(message) {
    const lower = message.toLowerCase();
    
    // Template responses per domain
    const templates = {
      products: {
        default: 'Ik help je graag met productvergelijking. Scan de barcode met de DealSense scanner of zoek het product handmatig.',
        price: 'Om de beste prijs te vinden, scan de barcode of voer de productnaam in. Ik vergelijk dan alle beschikbare aanbiedingen.',
        scanner: 'Open de DealSense app, tik op het scanner-icoon, en richt je camera op de barcode. De app vindt automatisch de beste deals.'
      },
      vacation: {
        default: 'Ik help je graag met vakantiedeals. Waar wil je naartoe en wanneer?',
        hotel: 'Ik kan hotels voor je vergelijken. Geef me de bestemming en data, dan zoek ik de beste deals.',
        flight: 'Voor vluchten heb ik de beste prijsvergelijkers. Wat is je vertrek- en aankomstlocatie?'
      },
      insurance: {
        default: 'Ik help je graag met verzekeringen. Welk type verzekering zoek je?',
        auto: 'Voor autoverzekering kan ik verschillende aanbieders vergelijken. Heb je al een offerte?',
        health: 'Voor zorgverzekering vergelijk ik de beste opties. Wat is je huidige situatie?'
      },
      general: {
        default: 'Ik ben ECHO, je DealSense assistent. Ik help met producten, vakantie, verzekeringen en meer. Waar kan ik je mee helpen?',
        help: 'DealSense helpt je geld besparen door prijzen te vergelijken. Gebruik de scanner voor producten of vraag me naar deals.',
        app: 'De DealSense app heeft een scanner, configurators voor verschillende diensten, en ik als je persoonlijke assistent.'
      }
    };
    
    const domainTemplates = templates[this.domain] || templates.general;
    
    // Match keywords
    for (const [key, template] of Object.entries(domainTemplates)) {
      if (key !== 'default' && lower.includes(key)) {
        return template;
      }
    }
    
    return domainTemplates.default;
  }

  /**
   * Process message
   */
  async process(message) {
    const startTime = Date.now();
    
    try {
      let response;
      let method;
      
      // PRODUCTS - Use real data from Google Shopping API
      if (this.domain === 'products') {
        response = await this.searchProducts(message);
        method = 'real_data';
      }
      // VACATION - Use real data from Google Hotels + Flights API
      else if (this.domain === 'vacation') {
        response = await this.searchVacation(message);
        method = 'real_data';
      }
      // OTHER DOMAINS - Use template responses
      else {
        response = this.generateResponseSimple(message);
        method = 'template';
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        response: response,
        domain: this.domain,
        method: method,
        processingTime: processingTime
      };
      
    } catch (error) {
      console.error(`Specialist (${this.domain}) error:`, error.message);
      
      // Fallback
      return {
        response: 'Sorry, ik kan je vraag nu niet beantwoorden. Probeer het opnieuw of neem contact op met support.',
        domain: this.domain,
        method: 'fallback',
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }
}

/**
 * SAVERCORE - Main system
 */
class SaverCore {
  constructor(config = {}) {
    // CACHE - Mocny nacisk!
    this.cache = new SaverCache(
      config.cacheSize || 10000,
      config.cacheTTL || 3600000  // 1h
    );
    
    // ROUTER - Mały, szybki
    this.router = new Router({
      modelName: config.routerModel || 'llama3-8b',
      timeout: config.routerTimeout || 2000
    });
    
    // SPECIALISTS - Po jednym dla każdej dziedziny
    this.specialists = {};
    const domains = [
      'products', 'vacation', 'insurance', 'telecom', 'energy',
      'mortgage', 'loan', 'creditcard', 'subscriptions', 'general'
    ];
    
    for (const domain of domains) {
      this.specialists[domain] = new Specialist(domain, {
        modelName: config.specialistModel || 'llama3-8b',
        timeout: config.specialistTimeout || 5000
      });
    }
    
    // METRICS
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      routerCalls: 0,
      specialistCalls: 0,
      errors: 0,
      fallbacks: 0,
      averageResponseTime: 0
    };
    
    // CONFIG
    this.enableCache = config.enableCache !== false;
    this.timeout = config.timeout || 10000;  // 10s total timeout
  }

  /**
   * PROCESS - Główna funkcja
   */
  async process(message, context = {}) {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      console.log('💾 SaverCore PROCESS - Starting...');
      console.log(`   Message: "${message}"`);
      
      // 1. CACHE CHECK - Sprawdź PRZED wysłaniem do modelu
      if (this.enableCache) {
        const cacheKey = this.cache.generateKey(message);
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
          console.log('   ✅ CACHE HIT - Instant response!');
          this.metrics.cacheHits++;
          
          return {
            ...cached,
            cached: true,
            processingTime: Date.now() - startTime
          };
        }
        
        console.log('   ❌ CACHE MISS - Processing...');
        this.metrics.cacheMisses++;
      }
      
      // 2. ROUTER - Decyduje intent
      console.log('   🔀 ROUTER - Detecting intent...');
      const routingResult = await this.router.route(message);
      this.metrics.routerCalls++;
      
      console.log(`   🔀 Intent: ${routingResult.intent} (confidence: ${routingResult.confidence.toFixed(2)})`);
      
      // 3. SPECIALIST - Przetwarza message
      console.log(`   🎯 SPECIALIST (${routingResult.intent}) - Processing...`);
      const specialist = this.specialists[routingResult.intent] || this.specialists.general;
      const specialistResult = await specialist.process(message);
      this.metrics.specialistCalls++;
      
      console.log(`   🎯 Response generated (${specialistResult.method})`);
      
      // 4. CACHE RESULT - Zapisz odpowiedź
      const response = {
        response: specialistResult.response,
        intent: routingResult.intent,
        confidence: routingResult.confidence,
        domain: specialistResult.domain,
        method: specialistResult.method,
        cached: false
      };
      
      if (this.enableCache) {
        const cacheKey = this.cache.generateKey(message, routingResult.intent);
        this.cache.set(cacheKey, response);
        console.log('   💾 CACHED result');
      }
      
      const processingTime = Date.now() - startTime;
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + processingTime) / 
        this.metrics.totalRequests;
      
      console.log(`   ✅ SaverCore completed in ${processingTime}ms\n`);
      
      return {
        ...response,
        processingTime: processingTime
      };
      
    } catch (error) {
      console.error('❌ SaverCore error:', error.message);
      this.metrics.errors++;
      
      // FALLBACK - Prosty response
      return this.fallback(message, error);
    }
  }

  /**
   * FALLBACK - Prosty, niezawodny
   */
  fallback(message, error) {
    console.log('   🔄 FALLBACK - Simple response...');
    this.metrics.fallbacks++;
    
    return {
      response: 'Sorry, ik kan je vraag nu niet beantwoorden. Probeer het opnieuw of neem contact op met support.',
      intent: 'general',
      confidence: 0.1,
      domain: 'general',
      method: 'fallback',
      cached: false,
      error: error.message,
      processingTime: 0
    };
  }

  /**
   * GET STATUS
   */
  getStatus() {
    const cacheStats = this.cache.getStats();
    
    return {
      metrics: {
        ...this.metrics,
        cacheStats: cacheStats
      },
      router: {
        model: this.router.modelName,
        timeout: this.router.timeout
      },
      specialists: Object.keys(this.specialists).length,
      cache: {
        enabled: this.enableCache,
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        hitRate: cacheStats.hitRate
      }
    };
  }

  /**
   * CLEAR CACHE
   */
  clearCache() {
    this.cache.clear();
    console.log('💾 Cache cleared');
  }

  /**
   * RESET METRICS
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      routerCalls: 0,
      specialistCalls: 0,
      errors: 0,
      fallbacks: 0,
      averageResponseTime: 0
    };
    console.log('📊 Metrics reset');
  }
}

module.exports = { SaverCore, Router, Specialist, SaverCache };
