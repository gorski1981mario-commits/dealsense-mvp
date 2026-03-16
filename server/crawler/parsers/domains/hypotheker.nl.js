// Hypotheker.nl Parser - Mortgage comparison
// Finance category - Hypotheken

const cheerio = require('cheerio')

module.exports = {
  name: 'hypotheker.nl',
  category: 'finance',
  subcategory: 'hypotheken',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { loanAmount, duration } = jobData.metadata || {}

    return this.parseMortgageOffers($, loanAmount, duration)
  },

  parseMortgageOffers($, loanAmount, duration) {
    const providers = []

    $('.mortgage-offer, .hypotheek-aanbod, .rente-item').each((i, el) => {
      const provider = $(el).find('.provider-name, .aanbieder, .bank-name').text().trim()
      const interestRate = $(el).find('.interest-rate, .rente').text().trim()
      const monthlyPayment = $(el).find('.monthly-payment, .maandbedrag').text().trim()
      const fixedPeriod = $(el).find('.fixed-period, .rentevast').text().trim()
      const mortgageType = $(el).find('.type, .hypotheekvorm').text().trim()
      const nhg = $(el).find('.nhg').length > 0

      if (provider && interestRate) {
        providers.push({
          provider,
          interestRate: this.parseRate(interestRate),
          monthlyPayment: this.parsePrice(monthlyPayment),
          fixedPeriod: this.parsePeriod(fixedPeriod),
          mortgageType: mortgageType || 'Annuïteit',
          nhg, // Nationale Hypotheek Garantie
          totalCost: this.calculateTotalCost(
            this.parsePrice(monthlyPayment),
            duration || 360 // 30 years default
          ),
          url: $(el).find('a').attr('href')
        })
      }
    })

    // Sort by interest rate (lowest first)
    providers.sort((a, b) => a.interestRate - b.interestRate)

    return {
      category: 'finance',
      subcategory: 'hypotheken',
      source: 'hypotheker.nl',
      loanAmount,
      duration: duration || 360,
      providers: providers.slice(0, 10),
      scrapedAt: Date.now()
    }
  },

  parseRate(rateStr) {
    if (!rateStr) return 0
    
    const cleaned = rateStr
      .replace(/%/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim()

    const rate = parseFloat(cleaned)
    return isNaN(rate) ? 0 : rate
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

  parsePeriod(periodStr) {
    if (!periodStr) return 0
    
    const match = periodStr.match(/(\d+)\s*(jaar|year)/i)
    return match ? parseInt(match[1]) : 0
  },

  calculateTotalCost(monthlyPayment, months) {
    return monthlyPayment * months
  }
}
