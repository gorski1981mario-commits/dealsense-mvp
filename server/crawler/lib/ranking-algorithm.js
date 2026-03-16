// Ranking Algorithm - Select TOP 3 offers
// Filters scams, ranks by price + rating + reviews

class RankingAlgorithm {
  /**
   * Rank product offers and return TOP 3
   */
  rankProducts(offers, options = {}) {
    const {
      minRating = 4.0,
      minReviews = 0,
      maxPrice = Infinity,
      weights = { price: 0.6, rating: 0.2, reviews: 0.2 }
    } = options

    // Step 1: Filter scams and invalid offers
    const filtered = offers.filter(offer => {
      // Must have price
      if (!offer.price || offer.price <= 0) return false

      // Must be in stock (if specified)
      if (offer.inStock === false) return false

      // Scam filter: rating too low
      if (offer.rating && offer.rating < minRating) return false

      // Price too high
      if (offer.price > maxPrice) return false

      return true
    })

    // Step 2: Calculate score for each offer
    const scored = filtered.map(offer => {
      // Price score (lower is better, normalized)
      const minPrice = Math.min(...filtered.map(o => o.price))
      const priceScore = minPrice / offer.price

      // Rating score (0-5 scale, normalized to 0-1)
      const ratingScore = (offer.rating || 4.0) / 5.0

      // Reviews score (logarithmic, normalized)
      const reviewsScore = offer.reviews > 0
        ? Math.log10(offer.reviews + 1) / 4 // log10(10000) ≈ 4
        : 0.1

      // Combined score
      const score = 
        priceScore * weights.price +
        ratingScore * weights.rating +
        reviewsScore * weights.reviews

      return {
        ...offer,
        _score: score,
        _priceScore: priceScore,
        _ratingScore: ratingScore,
        _reviewsScore: reviewsScore
      }
    })

    // Step 3: Sort by score (highest first)
    scored.sort((a, b) => b._score - a._score)

    // Step 4: Return TOP 3
    return scored.slice(0, 3).map(offer => {
      // Remove internal scores from output
      const { _score, _priceScore, _ratingScore, _reviewsScore, ...clean } = offer
      return clean
    })
  }

  /**
   * Rank energy providers
   */
  rankEnergy(providers, options = {}) {
    const {
      preferGreen = false,
      preferFixed = false,
      maxMonthly = Infinity
    } = options

    const filtered = providers.filter(p => {
      if (!p.monthlyPrice || p.monthlyPrice <= 0) return false
      if (p.monthlyPrice > maxMonthly) return false
      return true
    })

    const scored = filtered.map(provider => {
      let score = 0

      // Price score (lower is better)
      const minPrice = Math.min(...filtered.map(p => p.monthlyPrice))
      score += (minPrice / provider.monthlyPrice) * 0.7

      // Green energy bonus
      if (preferGreen && provider.greenEnergy) {
        score += 0.2
      }

      // Fixed contract bonus
      if (preferFixed && provider.contractType?.includes('vast')) {
        score += 0.1
      }

      return { ...provider, _score: score }
    })

    scored.sort((a, b) => b._score - a._score)

    return scored.slice(0, 3).map(({ _score, ...provider }) => provider)
  }

  /**
   * Rank insurance offers
   */
  rankInsurance(providers, options = {}) {
    const {
      preferLowDeductible = true,
      maxMonthly = Infinity
    } = options

    const filtered = providers.filter(p => {
      if (!p.monthlyPremium || p.monthlyPremium <= 0) return false
      if (p.monthlyPremium > maxMonthly) return false
      return true
    })

    const scored = filtered.map(provider => {
      let score = 0

      // Price score
      const minPrice = Math.min(...filtered.map(p => p.monthlyPremium))
      score += (minPrice / provider.monthlyPremium) * 0.6

      // Rating score
      if (provider.rating) {
        score += (provider.rating / 5.0) * 0.3
      }

      // Low deductible bonus
      if (preferLowDeductible && provider.deductible) {
        const maxDeductible = Math.max(...filtered.map(p => p.deductible || 0))
        score += (1 - provider.deductible / maxDeductible) * 0.1
      }

      return { ...provider, _score: score }
    })

    scored.sort((a, b) => b._score - a._score)

    return scored.slice(0, 3).map(({ _score, ...provider }) => provider)
  }
}

module.exports = { RankingAlgorithm }
