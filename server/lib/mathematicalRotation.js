"use strict";

/**
 * MATHEMATICAL ROTATION ENGINE
 * 
 * ENTERPRISE-LEVEL PROBABILISTIC ROTATION
 * 
 * ALGORYTM:
 * 1. FINAL SCORE (RANKING): Ri = 0.4·Si + 0.2·Ci + 0.2·Pi + 0.1·Ti + 0.1·Fi
 * 2. LOCK NAJLEPSZEGO: i* = arg max Ri (jeśli Ci* > 0.9)
 * 3. ROTATION SCORE: R'i = Ri · (1 - α·Hu,i) · (1 + β log(1 + t))
 * 4. PROBABILISTIC SELECTION: Pi = R'i / Σj R'j
 * 5. HARD CONSTRAINT: Ci > 0.85 ∧ Ti > 0.7
 * 6. MEMORY BLOCK: if Hu,i > k w 24h → R'i = 0
 * 7. SEGMENT ROTATION: R''i = R'i · wsegment
 * 8. FINAL SELECTION: TOP1 = max Ri (locked), TOP2-TOPN = sampling z R''i
 * 9. STABILITY CONDITION: |R'i^t - R'i^(t-1)| < ε
 */

/**
 * In-memory storage dla user history i previous scores
 */
const userHistory = new Map(); // userId_productName → {shops: [...], timestamps: [...], previousScores: {...}}

/**
 * Parametry algorytmu
 */
const PARAMS = {
  // Wagi Final Score
  WEIGHT_DEALSCORE: 0.4,
  WEIGHT_CONFIDENCE: 0.2,
  WEIGHT_PRICE: 0.2,
  WEIGHT_TRUST: 0.1,
  WEIGHT_FRESHNESS: 0.1,
  
  // Rotation Score
  ALPHA: 0.2,  // Kara za powtarzalność
  BETA: 0.1,   // Boost świeżości
  
  // Hard Constraints
  MIN_CONFIDENCE: 0.85,
  MIN_TRUST: 0.7,
  
  // Memory Block
  MAX_VIEWS_24H: 2,  // k = 2
  
  // Segment Weights
  WEIGHT_CORE: 1.0,
  WEIGHT_ALT: 0.8,
  WEIGHT_NICHE: 0.6,
  WEIGHT_EXPLORE: 0.4,
  
  // Stability
  EPSILON: 0.05,  // Max zmiana rotation score
  
  // Lock TOP1
  MIN_CONFIDENCE_LOCK: 0.9
};

/**
 * 1. FINAL SCORE (RANKING)
 * Ri = 0.4·Si + 0.2·Ci + 0.2·Pi + 0.1·Ti + 0.1·Fi
 */
function calculateFinalScore(offer) {
  const dealScore = offer._dealScore?.dealScore || 0;  // Si
  const confidence = offer._canonical?.matchScore / 100 || 0;  // Ci (0-1)
  const priceAdvantage = offer._dealScore?.savingsPercent / 100 || 0;  // Pi (0-1)
  const trustScore = offer._dealScore?.trustScore / 100 || 0;  // Ti (0-1)
  const freshness = offer._dealScore?.isFresh ? 1.0 : 0.0;  // Fi (0-1)
  
  const Ri = 
    PARAMS.WEIGHT_DEALSCORE * dealScore +
    PARAMS.WEIGHT_CONFIDENCE * confidence +
    PARAMS.WEIGHT_PRICE * priceAdvantage +
    PARAMS.WEIGHT_TRUST * trustScore +
    PARAMS.WEIGHT_FRESHNESS * freshness;
  
  return {
    Ri,
    Si: dealScore,
    Ci: confidence,
    Pi: priceAdvantage,
    Ti: trustScore,
    Fi: freshness
  };
}

/**
 * Pobierz historię usera dla produktu
 */
function getUserHistory(userId, productName) {
  const key = `${userId}_${productName}`;
  
  if (!userHistory.has(key)) {
    userHistory.set(key, {
      shops: [],
      timestamps: [],
      previousScores: {}
    });
  }
  
  return userHistory.get(key);
}

/**
 * Oblicz Hu,i - ile razy user widział ten deal w ostatnich 24h
 */
function calculateViewCount24h(userId, productName, seller) {
  const history = getUserHistory(userId, productName);
  const now = Date.now();
  const hours24 = 24 * 60 * 60 * 1000;
  
  let count = 0;
  for (let i = 0; i < history.shops.length; i++) {
    if (history.shops[i] === seller) {
      const timestamp = history.timestamps[i];
      if (now - timestamp < hours24) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Oblicz t - czas od ostatniego pokazania (w godzinach)
 */
function calculateTimeSinceLastView(userId, productName, seller) {
  const history = getUserHistory(userId, productName);
  const now = Date.now();
  
  let lastViewTime = 0;
  for (let i = history.shops.length - 1; i >= 0; i--) {
    if (history.shops[i] === seller) {
      lastViewTime = history.timestamps[i];
      break;
    }
  }
  
  if (lastViewTime === 0) {
    return 24; // Nigdy nie widział → 24h
  }
  
  const hours = (now - lastViewTime) / (60 * 60 * 1000);
  return Math.max(0, hours);
}

/**
 * 3. ROTATION SCORE
 * R'i = Ri · (1 - α·Hu,i) · (1 + β log(1 + t))
 */
function calculateRotationScore(Ri, userId, productName, seller) {
  const Hui = calculateViewCount24h(userId, productName, seller);
  const t = calculateTimeSinceLastView(userId, productName, seller);
  
  // Kara za powtarzalność
  const penaltyFactor = 1 - PARAMS.ALPHA * Hui;
  
  // Boost świeżości
  const freshnessFactor = 1 + PARAMS.BETA * Math.log(1 + t);
  
  const Ri_prime = Ri * Math.max(0, penaltyFactor) * freshnessFactor;
  
  return {
    Ri_prime,
    Hui,
    t,
    penaltyFactor,
    freshnessFactor
  };
}

/**
 * 5. HARD CONSTRAINT (JAKOŚĆ)
 * Deal istnieje tylko jeśli: Ci > 0.85 ∧ Ti > 0.7
 */
function passesHardConstraint(offer, finalScore) {
  const Ci = finalScore.Ci;
  const Ti = finalScore.Ti;
  
  return Ci >= PARAMS.MIN_CONFIDENCE && Ti >= PARAMS.MIN_TRUST;
}

/**
 * 6. MEMORY BLOCK (ANTI-PATTERN)
 * if Hu,i > k w czasie 24h → R'i = 0
 */
function isMemoryBlocked(userId, productName, seller) {
  const Hui = calculateViewCount24h(userId, productName, seller);
  return Hui >= PARAMS.MAX_VIEWS_24H;
}

/**
 * Określ segment deala
 */
function determineSegment(offer, allOffers) {
  const dealScore = offer._dealScore?.dealScore || 0;
  const isNiche = offer._dealScore?.isNiche || false;
  
  // Sortuj wszystkie oferty po dealScore
  const sorted = allOffers.slice().sort((a, b) => {
    const scoreA = a._dealScore?.dealScore || 0;
    const scoreB = b._dealScore?.dealScore || 0;
    return scoreB - scoreA;
  });
  
  const rank = sorted.findIndex(o => o === offer);
  const topPercent = rank / sorted.length;
  
  if (topPercent < 0.2) return 'core';      // Top 20%
  if (topPercent < 0.5) return 'alt';       // 20-50%
  if (isNiche) return 'niche';              // Niszowe
  return 'explore';                         // Reszta
}

/**
 * 7. SEGMENT ROTATION
 * R''i = R'i · wsegment
 */
function applySegmentWeight(Ri_prime, segment) {
  const weights = {
    'core': PARAMS.WEIGHT_CORE,
    'alt': PARAMS.WEIGHT_ALT,
    'niche': PARAMS.WEIGHT_NICHE,
    'explore': PARAMS.WEIGHT_EXPLORE
  };
  
  const weight = weights[segment] || 1.0;
  return Ri_prime * weight;
}

/**
 * 4. PROBABILISTIC SELECTION
 * Pi = R'i / Σj R'j
 */
function calculateProbabilities(offers, rotationScores) {
  const sum = rotationScores.reduce((acc, score) => acc + score, 0);
  
  if (sum === 0) {
    // Wszystkie scores = 0 → uniform probability
    return offers.map(() => 1.0 / offers.length);
  }
  
  return rotationScores.map(score => score / sum);
}

/**
 * Weighted random sampling
 */
function weightedSample(offers, probabilities, count) {
  const selected = [];
  const available = offers.map((o, i) => ({ offer: o, prob: probabilities[i] }));
  
  for (let i = 0; i < count && available.length > 0; i++) {
    // Normalizuj prawdopodobieństwa
    const totalProb = available.reduce((sum, item) => sum + item.prob, 0);
    const normalizedProbs = available.map(item => item.prob / totalProb);
    
    // Losuj
    let random = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;
    
    for (let j = 0; j < normalizedProbs.length; j++) {
      cumulative += normalizedProbs[j];
      if (random <= cumulative) {
        selectedIndex = j;
        break;
      }
    }
    
    // Dodaj do wyniku i usuń z available
    selected.push(available[selectedIndex].offer);
    available.splice(selectedIndex, 1);
  }
  
  return selected;
}

/**
 * 9. STABILITY CONDITION
 * |R'i^t - R'i^(t-1)| < ε
 */
function checkStability(userId, productName, seller, currentScore) {
  const history = getUserHistory(userId, productName);
  const previousScore = history.previousScores[seller] || currentScore;
  
  const delta = Math.abs(currentScore - previousScore);
  const isStable = delta < PARAMS.EPSILON;
  
  // Zapisz current score jako previous
  history.previousScores[seller] = currentScore;
  
  return {
    isStable,
    delta,
    previousScore,
    currentScore
  };
}

/**
 * Zapisz które sklepy user zobaczył
 */
function trackViews(userId, productName, offers) {
  const history = getUserHistory(userId, productName);
  const now = Date.now();
  
  offers.forEach(offer => {
    const seller = offer.seller || '';
    if (seller) {
      history.shops.push(seller);
      history.timestamps.push(now);
    }
  });
  
  // Ogranicz do ostatnich 100 wpisów
  if (history.shops.length > 100) {
    history.shops = history.shops.slice(-100);
    history.timestamps = history.timestamps.slice(-100);
  }
}

/**
 * GŁÓWNA FUNKCJA - MATHEMATICAL ROTATION
 * 
 * @param {Array} offers - Oferty z _dealScore i _canonical
 * @param {Object} options - Opcje
 * @returns {Array} Zrotowane oferty
 */
function rotateMathematical(offers, options = {}) {
  const {
    userId = 'anonymous',
    productName = '',
    maxResults = 3
  } = options;
  
  if (!Array.isArray(offers) || offers.length === 0) return [];
  if (!userId || !productName) return offers.slice(0, maxResults); // Fallback
  
  // 1. Oblicz FINAL SCORE dla wszystkich ofert
  const offersWithScores = offers.map(offer => {
    const finalScore = calculateFinalScore(offer);
    return {
      ...offer,
      _finalScore: finalScore
    };
  });
  
  // 5. HARD CONSTRAINT - filtruj oferty
  const validOffers = offersWithScores.filter(offer => 
    passesHardConstraint(offer, offer._finalScore)
  );
  
  if (validOffers.length === 0) {
    return []; // Brak ofert spełniających hard constraints
  }
  
  // 2. LOCK NAJLEPSZEGO DEALA
  const sorted = validOffers.slice().sort((a, b) => 
    b._finalScore.Ri - a._finalScore.Ri
  );
  
  const bestOffer = sorted[0];
  const shouldLockTop1 = bestOffer._finalScore.Ci >= PARAMS.MIN_CONFIDENCE_LOCK;
  
  // 3. ROTATION SCORE dla pozostałych
  const offersWithRotation = validOffers.map(offer => {
    const seller = offer.seller || '';
    const Ri = offer._finalScore.Ri;
    
    // 6. MEMORY BLOCK
    if (isMemoryBlocked(userId, productName, seller)) {
      return {
        ...offer,
        _rotationScore: {
          Ri_prime: 0,
          Ri_double_prime: 0,
          blocked: true
        }
      };
    }
    
    // 3. ROTATION SCORE
    const rotation = calculateRotationScore(Ri, userId, productName, seller);
    
    // 7. SEGMENT ROTATION
    const segment = determineSegment(offer, validOffers);
    const Ri_double_prime = applySegmentWeight(rotation.Ri_prime, segment);
    
    // 9. STABILITY CONDITION
    const stability = checkStability(userId, productName, seller, Ri_double_prime);
    
    return {
      ...offer,
      _rotationScore: {
        ...rotation,
        Ri_double_prime,
        segment,
        stability,
        blocked: false
      }
    };
  });
  
  // Filtruj zablokowane
  const unblocked = offersWithRotation.filter(o => !o._rotationScore.blocked);
  
  if (unblocked.length === 0) {
    return shouldLockTop1 ? [bestOffer] : [];
  }
  
  // 8. FINAL SELECTION
  const result = [];
  
  // TOP1 (locked jeśli confidence > 0.9)
  if (shouldLockTop1) {
    result.push({
      ...bestOffer,
      _position: 'TOP1_LOCKED'
    });
  }
  
  // TOP2-TOPN (probabilistic selection)
  const remainingCount = maxResults - result.length;
  if (remainingCount > 0) {
    const candidates = shouldLockTop1 
      ? unblocked.filter(o => o !== bestOffer)
      : unblocked;
    
    const rotationScores = candidates.map(o => o._rotationScore.Ri_double_prime);
    const probabilities = calculateProbabilities(candidates, rotationScores);
    
    const selected = weightedSample(candidates, probabilities, remainingCount);
    selected.forEach((offer, i) => {
      result.push({
        ...offer,
        _position: `TOP${result.length + 1}_PROBABILISTIC`
      });
    });
  }
  
  // Track views
  trackViews(userId, productName, result);
  
  return result;
}

/**
 * Pobierz statystyki rotacji
 */
function getRotationStats(offers) {
  if (!Array.isArray(offers) || offers.length === 0) return {};
  
  const stats = {
    total: offers.length,
    locked: 0,
    probabilistic: 0,
    segments: {
      core: 0,
      alt: 0,
      niche: 0,
      explore: 0
    }
  };
  
  offers.forEach(offer => {
    if (offer._position?.includes('LOCKED')) {
      stats.locked++;
    } else if (offer._position?.includes('PROBABILISTIC')) {
      stats.probabilistic++;
    }
    
    const segment = offer._rotationScore?.segment;
    if (segment && stats.segments[segment] !== undefined) {
      stats.segments[segment]++;
    }
  });
  
  return stats;
}

/**
 * Wyczyść historię usera
 */
function clearHistory(userId, productName = null) {
  if (productName) {
    const key = `${userId}_${productName}`;
    userHistory.delete(key);
  } else {
    // Wyczyść wszystkie produkty dla tego usera
    const keysToDelete = [];
    for (const key of userHistory.keys()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => userHistory.delete(key));
  }
}

module.exports = {
  rotateMathematical,
  getRotationStats,
  clearHistory,
  PARAMS
};
