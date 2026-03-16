// Independer.nl Parser - Insurance comparison
// Covers: Auto, Zorg, Woning verzekeringen

const cheerio = require('cheerio')

module.exports = {
  name: 'independer.nl',
  category: 'diensten',
  subcategory: 'verzekeringen',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { insuranceType, metadata } = jobData

    switch (insuranceType) {
      case 'auto':
        return this.parseAutoInsurance($, metadata)
      case 'zorg':
        return this.parseHealthInsurance($, metadata)
      case 'woning':
        return this.parseHomeInsurance($, metadata)
      default:
        return this.parseGenericInsurance($, metadata)
    }
  },

  parseAutoInsurance($, metadata) {
    const providers = []

    $('.insurance-result, .product-row, .comparison-item').each((i, el) => {
      const provider = $(el).find('.provider-name, .insurer-name').text().trim()
      const premium = $(el).find('.premium, .price, .monthly-cost').text().trim()
      const coverage = $(el).find('.coverage-type, .dekking').text().trim()
      const deductible = $(el).find('.eigen-risico, .deductible').text().trim()
      const rating = $(el).find('.rating, .score').text().trim()

      if (provider && premium) {
        providers.push({
          provider,
          monthlyPremium: this.parsePrice(premium),
          coverage: coverage || 'WA',
          deductible: this.parsePrice(deductible) || 0,
          rating: parseFloat(rating) || 0,
          features: this.extractFeatures($, el),
          url: $(el).find('a').attr('href')
        })
      }
    })

    providers.sort((a, b) => a.monthlyPremium - b.monthlyPremium)

    return {
      category: 'verzekeringen',
      subcategory: 'auto',
      source: 'independer.nl',
      metadata,
      providers: providers.slice(0, 10),
      scrapedAt: Date.now()
    }
  },

  parseHealthInsurance($, metadata) {
    const providers = []

    $('.health-insurance-result, .zorgverzekering-item').each((i, el) => {
      const provider = $(el).find('.provider-name').text().trim()
      const premium = $(el).find('.premium, .premie').text().trim()
      const deductible = $(el).find('.eigen-risico').text().trim()
      const coverage = $(el).find('.dekking, .coverage').text().trim()
      const rating = $(el).find('.rating').text().trim()

      if (provider && premium) {
        providers.push({
          provider,
          monthlyPremium: this.parsePrice(premium),
          deductible: this.parsePrice(deductible) || 385, // Standard NL deductible
          coverage: coverage || 'Basis',
          rating: parseFloat(rating) || 0,
          features: this.extractFeatures($, el),
          url: $(el).find('a').attr('href')
        })
      }
    })

    providers.sort((a, b) => a.monthlyPremium - b.monthlyPremium)

    return {
      category: 'verzekeringen',
      subcategory: 'zorg',
      source: 'independer.nl',
      metadata,
      providers: providers.slice(0, 10),
      scrapedAt: Date.now()
    }
  },

  parseHomeInsurance($, metadata) {
    const providers = []

    $('.home-insurance-result, .woonverzekering-item').each((i, el) => {
      const provider = $(el).find('.provider-name').text().trim()
      const premium = $(el).find('.premium, .premie').text().trim()
      const coverage = $(el).find('.dekking').text().trim()
      const rating = $(el).find('.rating').text().trim()

      if (provider && premium) {
        providers.push({
          provider,
          monthlyPremium: this.parsePrice(premium),
          coverage: coverage || 'Inboedel',
          rating: parseFloat(rating) || 0,
          features: this.extractFeatures($, el),
          url: $(el).find('a').attr('href')
        })
      }
    })

    providers.sort((a, b) => a.monthlyPremium - b.monthlyPremium)

    return {
      category: 'verzekeringen',
      subcategory: 'woning',
      source: 'independer.nl',
      metadata,
      providers: providers.slice(0, 10),
      scrapedAt: Date.now()
    }
  },

  parseGenericInsurance($, metadata) {
    // Fallback for other insurance types
    return {
      category: 'verzekeringen',
      source: 'independer.nl',
      providers: [],
      scrapedAt: Date.now()
    }
  },

  extractFeatures($, element) {
    const features = []
    $(element).find('.feature, .voordeel, .kenmerk').each((i, el) => {
      const feature = $(el).text().trim()
      if (feature) features.push(feature)
    })
    return features
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/per maand|\/maand|p\/m/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }
}
