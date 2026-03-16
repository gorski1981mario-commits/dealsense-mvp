// Geldshop.nl Parser - Personal loans comparison
// Finance category - Leningen

const cheerio = require('cheerio')

module.exports = {
  name: 'geldshop.nl',
  category: 'finance',
  subcategory: 'leningen',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { loanAmount, duration } = jobData.metadata || {}

    return this.parseLoanOffers($, loanAmount, duration)
  },

  parseLoanOffers($, loanAmount, duration) {
    const providers = []

    $('.loan-offer, .lening-aanbod, .krediet-item').each((i, el) => {
      const provider = $(el).find('.provider-name, .aanbieder').text().trim()
      const interestRate = $(el).find('.interest-rate, .rente').text().trim()
      const monthlyPayment = $(el).find('.monthly-payment, .maandbedrag').text().trim()
      const totalCost = $(el).find('.total-cost, .totale-kosten').text().trim()
      const apr = $(el).find('.apr, .jkp').text().trim() // Jaarkostenpercentage
      const rating = $(el).find('.rating, .score').text().trim()

      if (provider && interestRate) {
        providers.push({
          provider,
          interestRate: this.parseRate(interestRate),
          apr: this.parseRate(apr),
          monthlyPayment: this.parsePrice(monthlyPayment),
          totalCost: this.parsePrice(totalCost),
          rating: parseFloat(rating) || 0,
          loanAmount: loanAmount || 0,
          duration: duration || 60, // months
          url: $(el).find('a').attr('href')
        })
      }
    })

    // Sort by APR (lowest first)
    providers.sort((a, b) => a.apr - b.apr)

    return {
      category: 'finance',
      subcategory: 'leningen',
      source: 'geldshop.nl',
      loanAmount,
      duration,
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
  }
}
