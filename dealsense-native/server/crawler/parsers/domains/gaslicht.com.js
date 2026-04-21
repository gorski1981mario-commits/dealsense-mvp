// Gaslicht.com Parser - Energy comparison (Stroom + Gas)
// One of the most popular energy comparison sites in NL

const cheerio = require('cheerio')

module.exports = {
  name: 'gaslicht.com',
  category: 'diensten',
  subcategory: 'energie',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { postalCode, consumption } = jobData.metadata || {}

    return this.parseEnergyOffers($, postalCode, consumption)
  },

  parseEnergyOffers($, postalCode, consumption) {
    const providers = []

    // Parse energy offers table
    $('.energy-offer, .provider-row, .comparison-row').each((i, el) => {
      const provider = $(el).find('.provider-name, .supplier-name').text().trim()
      const contractType = $(el).find('.contract-type').text().trim()
      
      // Electricity price
      const electricityPrice = $(el).find('.electricity-price, .stroom-price').text().trim()
      
      // Gas price
      const gasPrice = $(el).find('.gas-price').text().trim()
      
      // Total monthly cost
      const monthlyCost = $(el).find('.monthly-cost, .total-price').text().trim()
      
      // Contract details
      const contractLength = $(el).find('.contract-length').text().trim()
      const greenEnergy = $(el).find('.green-energy, .duurzaam').length > 0
      const rating = $(el).find('.rating, .score').text().trim()

      if (provider && monthlyCost) {
        providers.push({
          provider,
          contractType: contractType || 'variabel',
          prices: {
            electricity: this.parsePrice(electricityPrice),
            gas: this.parsePrice(gasPrice),
            monthlyTotal: this.parsePrice(monthlyCost)
          },
          contract: {
            length: this.parseContractLength(contractLength),
            greenEnergy,
            fixedRate: contractType?.toLowerCase().includes('vast')
          },
          rating: parseFloat(rating) || 0,
          url: $(el).find('a').attr('href')
        })
      }
    })

    // Sort by monthly cost (cheapest first)
    providers.sort((a, b) => a.prices.monthlyTotal - b.prices.monthlyTotal)

    return {
      category: 'energie',
      source: 'gaslicht.com',
      postalCode,
      consumption,
      providers: providers.slice(0, 10), // Top 10 offers
      scrapedAt: Date.now()
    }
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
  },

  parseContractLength(lengthStr) {
    if (!lengthStr) return 0
    
    const match = lengthStr.match(/(\d+)\s*(jaar|maand|month|year)/i)
    if (!match) return 0

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    if (unit.includes('jaar') || unit.includes('year')) {
      return value * 12 // Convert to months
    }

    return value
  }
}
