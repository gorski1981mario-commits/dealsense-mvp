// AI Ranking 4.0 - DealSense Scoring Engine
// 3-layer AI scoring + Quantum boosting for niszowe shops
// Strategy: Niszowe shops = best deals (prioritize), Giganci = baseline comparison

const SHOP_TIERS = {
  // Giganci - higher prices, use as baseline
  giganci: ['bol.com', 'coolblue.nl', 'mediamarkt.nl', 'amazon.nl', 'wehkamp.nl', 'zalando.nl'],
  
  // Niszowe - best deals, prioritize these
  niszowe: [
    'alternate.nl', 'azerty.nl', 'megekko.nl', 'paradigit.nl', 'informatique.nl',
    'witgoedhandel.nl', 'electronicavoorjou.nl', 'budgetplan.nl',
    'ikea.nl', 'kwantum.nl', 'xenos.nl', 'decathlon.nl', 'sportdirect.com',
    // ... all other small/medium shops
  ]
}

const PRICING_WEIGHTS = {
  // Niszowe shops get bonus for being cheaper
  niszowe: {
    priceWeight: 0.50,      // 50% weight on price
    savingsBonus: 0.20,     // 20% bonus for savings vs giganci
    trustWeight: 0.15,      // 15% on trust/reviews
    availabilityWeight: 0.15 // 15% on stock/shipping
  },
  
  // Giganci - baseline, no bonus
  giganci: {
    priceWeight: 0.40,
    savingsBonus: 0.0,      // No bonus
    trustWeight: 0.30,      // Higher trust weight
    availabilityWeight: 0.30
  }
}

class AIRanking {
  constructor() {
    this.shopTiers = SHOP_TIERS
    this.weights = PRICING_WEIGHTS
  }

  /**
   * Main ranking function - scores all offers and returns top 3
   * @param {Array} offers - All offers from crawler
   * @param {Object} userPreferences - User filter preferences (price/quality/best)
   * @returns {Array} Top 3 ranked offers with scores
   */
  rank(offers, userPreferences = {}) {
    if (!offers || offers.length === 0) return []

    // Step 1: Calculate baseline (average price from giganci)
    const baseline = this.calculateBaseline(offers)

    // Step 2: Score each offer using 3-layer AI
    const scoredOffers = offers.map(offer => ({
      ...offer,
      scores: this.calculateScores(offer, baseline, userPreferences),
      tier: this.getShopTier(offer.seller || offer.source)
    }))

    // Step 3: Apply quantum boosting for niszowe shops
    const boostedOffers = this.applyQuantumBoost(scoredOffers)

    // Step 4: Calculate final composite score
    const rankedOffers = boostedOffers.map(offer => ({
      ...offer,
      finalScore: this.calculateFinalScore(offer, userPreferences)
    }))

    // Step 5: Sort by final score and return top 3
    const sorted = rankedOffers.sort((a, b) => b.finalScore - a.finalScore)
    
    return sorted.slice(0, 3).map((offer, index) => ({
      ...offer,
      rank: index + 1,
      badge: index === 0 ? 'BESTE DEAL' : null,
      savings: baseline.avgPrice > 0 ? 
        Math.round(((baseline.avgPrice - offer.price) / baseline.avgPrice) * 100) : 0
    }))
  }

  /**
   * Calculate baseline from giganci prices
   */
  calculateBaseline(offers) {
    const giganciOffers = offers.filter(o => 
      this.shopTiers.giganci.includes((o.seller || o.source).toLowerCase())
    )

    if (giganciOffers.length === 0) {
      // No giganci, use all offers
      const prices = offers.map(o => o.price || o.prices?.monthlyTotal || 0).filter(p => p > 0)
      return {
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length || 0,
        minPrice: Math.min(...prices) || 0,
        maxPrice: Math.max(...prices) || 0
      }
    }

    const prices = giganciOffers.map(o => o.price || o.prices?.monthlyTotal || 0).filter(p => p > 0)
    return {
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length || 0,
      minPrice: Math.min(...prices) || 0,
      maxPrice: Math.max(...prices) || 0,
      hasGiganci: true
    }
  }

  /**
   * Get shop tier (niszowe or giganci)
   */
  getShopTier(shopName) {
    const name = (shopName || '').toLowerCase()
    
    if (this.shopTiers.giganci.some(g => name.includes(g))) {
      return 'giganci'
    }
    
    return 'niszowe' // Default to niszowe for better deals
  }

  /**
   * Calculate 3-layer AI scores
   * Layer 1: Price Analysis
   * Layer 2: Trust & Quality
   * Layer 3: Availability & Service
   */
  calculateScores(offer, baseline, userPreferences) {
    const price = offer.price || offer.prices?.monthlyTotal || 0
    const tier = this.getShopTier(offer.seller || offer.source)
    const weights = this.weights[tier]

    // Layer 1: Price Score (0-100)
    const priceScore = this.calculatePriceScore(price, baseline, tier)

    // Layer 2: Trust Score (0-100)
    const trustScore = this.calculateTrustScore(offer)

    // Layer 3: Availability Score (0-100)
    const availabilityScore = this.calculateAvailabilityScore(offer)

    return {
      price: priceScore,
      trust: trustScore,
      availability: availabilityScore,
      weights
    }
  }

  /**
   * Layer 1: Price Score
   * Niszowe shops get bonus for being cheaper than baseline
   */
  calculatePriceScore(price, baseline, tier) {
    if (!price || price <= 0) return 0

    const { avgPrice, minPrice } = baseline

    // Calculate savings vs baseline
    const savings = avgPrice > 0 ? ((avgPrice - price) / avgPrice) : 0

    // Base score: inverse of price (cheaper = higher score)
    let score = 100

    if (avgPrice > 0) {
      // Score based on distance from average
      const deviation = (price - avgPrice) / avgPrice
      score = Math.max(0, 100 - (deviation * 100))
    }

    // Bonus for niszowe shops with good savings
    if (tier === 'niszowe' && savings > 0) {
      const savingsBonus = savings * 100 * 0.5 // Up to 50 bonus points
      score += savingsBonus
    }

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Layer 2: Trust Score
   * Based on reviews, ratings, seller reputation
   */
  calculateTrustScore(offer) {
    let score = 50 // Base trust score

    // Rating contribution (0-5 stars -> 0-40 points)
    if (offer.rating) {
      score += (offer.rating / 5) * 40
    }

    // Reviews contribution (more reviews = more trust, up to 20 points)
    if (offer.reviews) {
      const reviewScore = Math.min(20, Math.log10(offer.reviews + 1) * 5)
      score += reviewScore
    }

    // Known reliable shops get bonus
    const tier = this.getShopTier(offer.seller || offer.source)
    if (tier === 'giganci') {
      score += 10 // Giganci are known/trusted
    }

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Layer 3: Availability Score
   * Stock, shipping, delivery time
   */
  calculateAvailabilityScore(offer) {
    let score = 0

    // In stock = 50 points
    if (offer.inStock !== false) {
      score += 50
    }

    // Free/cheap shipping = 30 points
    const shipping = offer.shipping || 0
    if (shipping === 0) {
      score += 30
    } else if (shipping < 5) {
      score += 20
    } else if (shipping < 10) {
      score += 10
    }

    // Fast delivery bonus (if available)
    if (offer.deliveryDays && offer.deliveryDays <= 2) {
      score += 20
    } else if (offer.deliveryDays && offer.deliveryDays <= 5) {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Apply Quantum Boosting for niszowe shops
   * Amplifies scores for shops with best price/quality ratio
   */
  applyQuantumBoost(offers) {
    // Find best niszowe offer
    const niszowe = offers.filter(o => o.tier === 'niszowe')
    if (niszowe.length === 0) return offers

    // Calculate quantum factor based on price advantage
    return offers.map(offer => {
      if (offer.tier !== 'niszowe') return offer

      // Boost factor: 1.0 - 1.5x based on price advantage
      const priceScore = offer.scores.price
      const quantumBoost = 1.0 + (priceScore / 100) * 0.5

      return {
        ...offer,
        scores: {
          ...offer.scores,
          price: offer.scores.price * quantumBoost,
          quantumBoost
        }
      }
    })
  }

  /**
   * Calculate final composite score
   * Combines all layers with user preference weights
   */
  calculateFinalScore(offer, userPreferences) {
    const { scores, tier } = offer
    const weights = scores.weights

    // Base composite score
    let finalScore = 
      (scores.price * weights.priceWeight) +
      (scores.trust * weights.trustWeight) +
      (scores.availability * weights.availabilityWeight)

    // Apply user preference modifier
    const preference = userPreferences.filter || 'best'
    
    if (preference === 'price') {
      // Boost price score
      finalScore = finalScore * 0.7 + scores.price * 0.3
    } else if (preference === 'quality') {
      // Boost trust score
      finalScore = finalScore * 0.7 + scores.trust * 0.3
    }
    // 'best' uses balanced weights (no change)

    // Niszowe bonus if significant savings
    if (tier === 'niszowe' && scores.price > 80) {
      finalScore *= 1.1 // 10% bonus for great niszowe deals
    }

    return Math.min(100, Math.max(0, finalScore))
  }

  /**
   * Get explanation for ranking
   */
  getExplanation(offer) {
    const { scores, tier, savings } = offer

    const reasons = []

    if (tier === 'niszowe' && savings > 10) {
      reasons.push(`${savings}% goedkoper dan gemiddeld`)
    }

    if (scores.price > 80) {
      reasons.push('Uitstekende prijs')
    }

    if (scores.trust > 80) {
      reasons.push('Hoge betrouwbaarheid')
    }

    if (scores.availability > 80) {
      reasons.push('Direct leverbaar')
    }

    if (scores.quantumBoost) {
      reasons.push('AI-geboost (beste deal)')
    }

    return reasons.join(' • ')
  }
}

module.exports = new AIRanking()
